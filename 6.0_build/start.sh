#!/data/data/com.termux/files/usr/bin/bash
# ═══════════════════════════════════════════════
#  ND-DEV — Start Nexus Dominion with DevTools
#  Usage: bash start.sh
# ═══════════════════════════════════════════════
set -e

DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_DIR="$DIR/logs"
SERVER_PID_FILE="$DIR/server/log_server.pid"
PORT=8099

echo "=== Nexus Dominion DevTools ==="

# ─── Start log server (if not running) ───
if [ -f "$SERVER_PID_FILE" ] && kill -0 "$(cat "$SERVER_PID_FILE")" 2>/dev/null; then
    echo "[OK] Log server already running (PID: $(cat "$SERVER_PID_FILE"))"
else
    echo "[START] Starting log server on :$PORT..."
    python3 "$DIR/4.0_server/log_server.py" --port "$PORT" &
    sleep 1

    # Health check
    for i in $(seq 1 10); do
        if curl -s "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; then
            echo "[OK] Log server healthy"
            break
        fi
        sleep 0.5
    done
fi

# ─── Open game ───
HTML_FILE="$DIR/index.html"
if [ -f "$HTML_FILE" ]; then
    echo "[OPEN] Opening $HTML_FILE"
    termux-open "$HTML_FILE" 2>/dev/null || echo "[WARN] Could not auto-open. Open manually: $HTML_FILE"
else
    echo "[WARN] index.html not found at $HTML_FILE"
fi

# ─── Start log monitor (optional) ───
echo ""
echo "=== Commands ==="
echo "  Logs:    python3 $DIR/server/monitor_logs.py"
echo "  Watch:   python3 $DIR/server/monitor_logs.py --watch"
echo "  Stop:    kill \$(cat $SERVER_PID_FILE)"
echo "  Status:  curl http://127.0.0.1:$PORT/health"
echo ""
echo "Log file: $LOG_DIR/nd-runtime.log"
