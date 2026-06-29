#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════╗
║  ND-MONITOR — Log Reader for Hermes Agent               ║
║  Reads nd-runtime.log and reports new errors            ║
╚══════════════════════════════════════════════════════════╝

Usage:
  python3 monitor_logs.py              # show new errors since last run
  python3 monitor_logs.py --all        # show ALL errors
  python3 monitor_logs.py --tail 50    # show last 50 log entries
  python3 monitor_logs.py --watch      # tail -f mode (follow)
  python3 monitor_logs.py --stats      # show stats only

For Hermes: reads cursor from ~/.hermes/log_cursor.json to only show new entries.
"""

import json
import time
from pathlib import Path
from datetime import datetime, timezone

# ─── Configuration ───
LOG_FILE = Path.home() / 'nexus-dominion' / '5.0_logs' / 'nd-runtime.log'
CURSOR_FILE = Path.home() / '.hermes' / 'log_cursor.json'
LEVEL_COLORS = {
    'error': '\033[91m',        # red
    'warn': '\033[93m',          # yellow
    'uncaught_exception': '\033[91;1m',  # bold red
    'unhandled_rejection': '\033[91m',    # red
    'info': '\033[94m',          # blue
    'debug': '\033[90m',         # gray
    'reset': '\033[0m'
}

# ─── Domain ───

def read_cursor() -> dict:
    """Read last read position from cursor file."""
    if CURSOR_FILE.exists():
        try:
            return json.loads(CURSOR_FILE.read_text())
        except (json.JSONDecodeError, KeyError):
            pass
    return {'last_byte': 0, 'last_check': None, 'total_entries_seen': 0}


def write_cursor(data: dict):
    """Write cursor position."""
    CURSOR_FILE.parent.mkdir(parents=True, exist_ok=True)
    CURSOR_FILE.write_text(json.dumps(data))


def read_entries(from_byte: int = 0) -> list[dict]:
    """Read log entries from file, optionally starting at byte offset."""
    if not LOG_FILE.exists():
        return [], 0

    try:
        with open(LOG_FILE, 'r') as f:
            if from_byte > 0:
                f.seek(from_byte)
            lines = f.readlines()
            # Update cursor
            new_pos = f.tell()
    except Exception:
        return [], 0

    entries = []
    for line in lines:
        line = line.strip()
        if not line:
            continue
        try:
            entry = json.loads(line)
            entries.append(entry)
        except json.JSONDecodeError:
            pass

    return entries, new_pos


def format_entry(entry: dict, verbose: bool = False) -> str:
    """Format a single log entry for terminal output."""
    ts = entry.get('ts', 0)
    if ts:
        time_str = datetime.fromtimestamp(ts / 1000).strftime('%H:%M:%S')
    else:
        time_str = '--:--:--'

    level = entry.get('level', 'info')
    color = LEVEL_COLORS.get(level, '')
    reset = LEVEL_COLORS['reset']

    game_info = ''
    if entry.get('game_day'):
        game_info = f' [D{entry["game_day"]} T{entry.get("game_tick", 0)}]'

    msg = entry.get('msg', '')[:200]
    line_no = entry.get('line', '')
    line_str = f' L{line_no}' if line_no else ''

    output = f'{color}{time_str} {level.upper():<20}{reset}{game_info}{line_str} {msg}'

    if verbose and entry.get('stack'):
        stack = entry['stack'][:500]
        output += f'\n  {LEVEL_COLORS["debug"]}{stack}{reset}'

    return output


def count_by_level(entries: list[dict]) -> dict:
    """Count entries by level."""
    counts = {}
    for e in entries:
        level = e.get('level', 'info')
        counts[level] = counts.get(level, 0) + 1
    return counts


# ─── Commands ───

def cmd_new():
    """Show new entries since last check."""
    cursor = read_cursor()
    entries, new_pos = read_entries(from_byte=cursor.get('last_byte', 0))

    if not entries:
        print(f'[ND-MONITOR] No new entries. ({cursor.get("total_entries_seen", 0)} total seen)')
        return

    errors = [e for e in entries if e.get('level') in ('error', 'uncaught_exception', 'unhandled_rejection')]
    warnings = [e for e in entries if e.get('level') == 'warn']

    print(f'[ND-MONITOR] {len(entries)} new entries ({len(errors)} errors, {len(warnings)} warnings) since {cursor.get("last_check", "first run")}')
    print()

    # Show errors first (most important)
    if errors:
        print(f'=== {len(errors)} ERRORS ===')
        for e in errors:
            print(format_entry(e, verbose=True))
        print()

    if warnings:
        print(f'=== {len(warnings)} WARNINGS ===')
        for e in warnings:
            print(format_entry(e, verbose=False))
        print()

    # Show count of other levels
    counts = count_by_level(entries)
    other = {k: v for k, v in counts.items() if k not in ('error', 'warn', 'uncaught_exception', 'unhandled_rejection')}
    if other:
        others_str = ', '.join(f'{k}: {v}' for k, v in sorted(other.items()))
        print(f'Other: {others_str}')

    # Update cursor
    cursor['last_byte'] = new_pos
    cursor['last_check'] = datetime.now(timezone.utc).isoformat()
    cursor['total_entries_seen'] = cursor.get('total_entries_seen', 0) + len(entries)
    write_cursor(cursor)


def cmd_all():
    """Show all entries in the log file."""
    entries, _ = read_entries()
    if not entries:
        print('[ND-MONITOR] No log entries found.')
        return

    counts = count_by_level(entries)
    print(f'[ND-MONITOR] {len(entries)} total entries:')
    for level, count in sorted(counts.items()):
        print(f'  {level}: {count}')
    print()

    for e in entries:
        print(format_entry(e, verbose=e.get('level') in ('error', 'uncaught_exception')))


def cmd_tail(n: int = 50):
    """Show last N entries."""
    entries, _ = read_entries()
    if not entries:
        print('[ND-MONITOR] No log entries found.')
        return

    for e in entries[-n:]:
        print(format_entry(e, verbose=e.get('level') in ('error', 'uncaught_exception')))


def cmd_watch():
    """Follow mode — keep reading new entries."""
    cursor = read_cursor()
    print('[ND-MONITOR] Watching for new entries... (Ctrl+C to stop)')
    try:
        while True:
            entries, new_pos = read_entries(from_byte=cursor.get('last_byte', 0))
            for e in entries:
                print(format_entry(e, verbose=e.get('level') in ('error', 'uncaught_exception')))
            if entries:
                cursor['last_byte'] = new_pos
                cursor['last_check'] = datetime.now(timezone.utc).isoformat()
                cursor['total_entries_seen'] = cursor.get('total_entries_seen', 0) + len(entries)
                write_cursor(cursor)
            time.sleep(2)
    except KeyboardInterrupt:
        print('\n[ND-MONITOR] Stopped.')


def cmd_stats():
    """Show log file statistics."""
    if not LOG_FILE.exists():
        print(f'[ND-MONITOR] No log file at {LOG_FILE}')
        return

    size = LOG_FILE.stat().st_size
    entries, _ = read_entries()
    counts = count_by_level(entries)
    cursor = read_cursor()

    print(f'[ND-MONITOR] Log file: {LOG_FILE}')
    print(f'  Size: {size:,} bytes ({size/1024:.1f} KB)')
    print(f'  Total entries: {len(entries)}')
    print(f'  Seen by Hermes: {cursor.get("total_entries_seen", 0)}')
    print(f'  Last check: {cursor.get("last_check", "never")}')
    print('  Levels:')
    for level, count in sorted(counts.items()):
        print(f'    {level}: {count}')


# ─── Main ───
if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='ND-Log Monitor for Hermes Agent')
    parser.add_argument('--all', action='store_true', help='Show all entries')
    parser.add_argument('--tail', type=int, default=0, help='Show last N entries')
    parser.add_argument('--watch', action='store_true', help='Follow mode (tail -f)')
    parser.add_argument('--stats', action='store_true', help='Show statistics only')
    args = parser.parse_args()

    if args.all:
        cmd_all()
    elif args.tail > 0:
        cmd_tail(args.tail)
    elif args.watch:
        cmd_watch()
    elif args.stats:
        cmd_stats()
    else:
        cmd_new()  # Default: show new since last check
