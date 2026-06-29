#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════╗
║  ND-LOGGER — Log Collection Server for Nexus Dominion  ║
║  DDD: LogEntry (entity) → LogBuffer (aggregate)        ║
║       → LogServer (application) → JSONL file (infra)   ║
╚══════════════════════════════════════════════════════════╝

Receives console logs from the game via HTTP POST /log.
Buffers in memory, flushes to JSONL file with rotation.

Usage:
  python3 log_server.py                  # foreground
  python3 log_server.py --daemon         # background, writes PID file
  make log-server                        # via Makefile
"""

import json
import os
import sys
import time
import signal
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from datetime import datetime, timezone

# ─── DOMAIN: Entities ───

class LogEntry:
    """Single log entry from the game."""
    __slots__ = ('level', 'msg', 'stack', 'ts', 'line', 'file', 'game_day', 'game_tick')

    def __init__(self, data: dict):
        self.level = data.get('level', 'info')
        self.msg = data.get('msg', '')
        self.stack = data.get('stack', '')
        self.ts = data.get('ts', int(time.time() * 1000))
        self.line = data.get('line', 0)
        self.file = data.get('file', '')
        self.game_day = data.get('game_day', 0)
        self.game_tick = data.get('game_tick', 0)

    def to_dict(self) -> dict:
        return {
            'level': self.level,
            'msg': self.msg,
            'stack': self.stack,
            'ts': self.ts,
            'line': self.line,
            'file': self.file,
            'game_day': self.game_day,
            'game_tick': self.game_tick,
            'received_at': datetime.now(timezone.utc).isoformat()
        }

    def is_error(self) -> bool:
        return self.level in ('error', 'uncaught_exception', 'crash')


# ─── DOMAIN: Aggregate ───

class LogBuffer:
    """Ring buffer that auto-flushes to file."""

    def __init__(self, filepath: str, max_size: int = 2 * 1024 * 1024,
                 rotation_count: int = 3, buffer_size: int = 10):
        self.filepath = Path(filepath)
        self.max_size = max_size
        self.rotation_count = rotation_count
        self.buffer_size = buffer_size
        self._buffer: list[LogEntry] = []
        self._lock = threading.Lock()
        self._total_entries = 0
        self._error_count = 0
        self._last_flush = time.time()
        self.filepath.parent.mkdir(parents=True, exist_ok=True)

    def append(self, entry: LogEntry):
        """Add entry to buffer. Returns True if flushed."""
        with self._lock:
            self._buffer.append(entry)
            self._total_entries += 1
            if entry.is_error():
                self._error_count += 1

        if len(self._buffer) >= self.buffer_size:
            self.flush()
            return True
        return False

    def flush(self):
        """Write buffer to file. Thread-safe."""
        with self._lock:
            if not self._buffer:
                return
            entries = self._buffer[:]
            self._buffer.clear()
            self._last_flush = time.time()

        self._rotate_if_needed()
        try:
            with open(self.filepath, 'a') as f:
                for entry in entries:
                    f.write(json.dumps(entry.to_dict(), ensure_ascii=False) + '\n')
        except Exception as e:
            print(f'[LOG-SERVER] Flush error: {e}', file=sys.stderr)

    def _rotate_if_needed(self):
        """Rotate log file if it exceeds max_size."""
        if not self.filepath.exists():
            return
        size = self.filepath.stat().st_size
        if size < self.max_size:
            return

        # Rotate: nd-runtime.log → nd-runtime.1.log → nd-runtime.2.log
        for i in range(self.rotation_count - 1, 0, -1):
            old = self.filepath.with_suffix(f'.{i}.log')
            new = self.filepath.with_suffix(f'.{i + 1}.log')
            if old.exists():
                if new.exists():
                    new.unlink()
                old.rename(new)

        # Rotate current to .1
        rot1 = self.filepath.with_suffix('.1.log')
        if rot1.exists():
            rot1.unlink()
        self.filepath.rename(rot1)

    @property
    def stats(self) -> dict:
        with self._lock:
            return {
                'total_entries': self._total_entries,
                'error_count': self._error_count,
                'buffered': len(self._buffer),
                'last_flush': self._last_flush,
                'file_size': self.filepath.stat().st_size if self.filepath.exists() else 0,
                'filepath': str(self.filepath)
            }

    def force_flush(self):
        """Force flush regardless of buffer size."""
        self.flush()


# ─── APPLICATION: HTTP Server ───

class LogRequestHandler(BaseHTTPRequestHandler):
    """HTTP handler for log collection endpoints."""
    buffer: LogBuffer = None  # Set by server

    def log_message(self, format, *args):
        """Suppress default HTTP logging to stderr."""
        pass

    def _send_json(self, code: int, data: dict):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_OPTIONS(self):
        """CORS preflight."""
        self._send_json(200, {'ok': True})

    def do_GET(self):
        """GET /health — server status."""
        if self.path == '/health':
            stats = self.buffer.stats
            stats['status'] = 'ok'
            stats['uptime'] = time.time() - start_time
            self._send_json(200, stats)
        else:
            self._send_json(404, {'error': 'not found'})

    def do_POST(self):
        """POST /log — receive log entries. POST /flush — force flush."""
        if self.path == '/log':
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_json(400, {'error': 'empty body'})
                return

            body = self.rfile.read(content_length)
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self._send_json(400, {'error': 'invalid json'})
                return

            # Support batch: array of entries
            entries = data if isinstance(data, list) else [data]
            count = 0
            for entry_data in entries:
                try:
                    entry = LogEntry(entry_data)
                    self.buffer.append(entry)
                    count += 1
                except Exception:
                    pass  # Skip malformed entries

            self._send_json(200, {'ok': True, 'received': count})

        elif self.path == '/flush':
            self.buffer.force_flush()
            self._send_json(200, {'ok': True, 'flushed': True})

        else:
            self._send_json(404, {'error': 'not found'})


# ─── INFRASTRUCTURE: Server Lifecycle ───

start_time = time.time()


def run_server(port: int = 8099, log_file: str = None, daemon: bool = False):
    """Start the log collection server."""
    if log_file is None:
        home = Path.home()
        log_file = str(home / 'nexus-dominion' / '5.0_logs' / 'nd-runtime.log')

    buffer = LogBuffer(filepath=log_file)
    LogRequestHandler.buffer = buffer

    server = HTTPServer(('127.0.0.1', port), LogRequestHandler)

    # PID file
    pid_file = Path.home() / 'nexus-dominion' / 'server' / 'log_server.pid'
    pid_file.parent.mkdir(parents=True, exist_ok=True)
    pid_file.write_text(str(os.getpid()))

    # Auto-flush thread
    def auto_flush():
        while True:
            time.sleep(5)
            try:
                buffer.flush()
            except Exception:
                pass

    flush_thread = threading.Thread(target=auto_flush, daemon=True)
    flush_thread.start()

    # Graceful shutdown
    def shutdown(signum, frame):
        print(f'\n[LOG-SERVER] Shutting down... ({buffer.stats["total_entries"]} entries)')
        buffer.force_flush()
        pid_file.unlink(missing_ok=True)
        server.shutdown()

    signal.signal(signal.SIGINT, shutdown)
    signal.signal(signal.SIGTERM, shutdown)

    mode = 'daemon' if daemon else 'foreground'
    print(f'[LOG-SERVER] Started on http://127.0.0.1:{port} ({mode})')
    print(f'[LOG-SERVER] Logging to: {log_file}')
    print(f'[LOG-SERVER] PID: {os.getpid()}')

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        shutdown(None, None)


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='ND-Logger Server')
    parser.add_argument('--port', type=int, default=8099)
    parser.add_argument('--log-file', type=str, default=None)
    parser.add_argument('--daemon', action='store_true')
    args = parser.parse_args()
    run_server(port=args.port, log_file=args.log_file, daemon=args.daemon)
