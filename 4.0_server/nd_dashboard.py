#!/usr/bin/env python3
"""ND Dashboard — Log aggregator + metric viewer (Hermes Agent-ready)"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from collections import Counter

LOG_FILE = Path(os.path.expanduser("~/nexus-dominion/5.0_logs/nd-runtime.log"))
CURSOR_FILE = Path(os.path.expanduser("~/nexus-dominion/5.0_logs/.monitor_cursor.json"))

def load_cursor():
    if CURSOR_FILE.exists():
        return json.loads(CURSOR_FILE.read_text())
    return {"last_seen": 0, "total_entries_seen": 0, "last_check": "never"}

def save_cursor(cursor):
    CURSOR_FILE.parent.mkdir(parents=True, exist_ok=True)
    CURSOR_FILE.write_text(json.dumps(cursor, indent=2))

def parse_logs():
    if not LOG_FILE.exists():
        return []
    entries = []
    for line in LOG_FILE.read_text().strip().split("\n"):
        if not line.strip():
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries

def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "dashboard"
    entries = parse_logs()
    
    if not entries:
        print("📭 No log entries yet. Start the game to generate logs.")
        return
    
    # Categorize
    errors = [e for e in entries if e.get("level") == "uncaught_exception"]
    logs = [e for e in entries if e.get("level") == "log"]
    warns = [e for e in entries if e.get("level") == "warn"]
    
    # Error grouping
    error_groups = Counter()
    for e in errors:
        msg = e.get("msg", "")
        # Extract error type
        if "is not defined" in msg:
            name = msg.split("is not defined")[0].strip().split()[-1]
            error_groups[f"ReferenceError: {name} is not defined"] += 1
        elif "TypeError" in msg:
            error_groups[msg[:80]] += 1
        else:
            error_groups[msg[:80]] += 1
    
    # Day range
    days = [e.get("game_day", 0) for e in entries if e.get("game_day", 0) > 0]
    day_range = f"D{min(days)}-D{max(days)}" if days else "N/A"
    
    print("=" * 60)
    print("📊 ND DASHBOARD — Log Analysis")
    print("=" * 60)
    print(f"  📁 File: {LOG_FILE}")
    print(f"  📏 Size: {LOG_FILE.stat().st_size:,} bytes")
    print(f"  📋 Total: {len(entries)} entries")
    print(f"  🗓️  Range: {day_range}")
    print()
    
    # Metrics
    print(f"┌{'─'*56}┐")
    print(f"│ {'METRIC':<30} {'VALUE':>12} {'TREND':>12} │")
    print(f"├{'─'*56}┤")
    
    total = len(entries)
    e_pct = len(errors)/total*100 if total else 0
    trend = "🔴 CRITICAL" if e_pct > 10 else "🟡 WARNING" if e_pct > 3 else "🟢 OK"
    print(f"│ {'Errors':<30} {len(errors):>6} ({e_pct:5.1f}%) {trend:>12} │")
    
    w_pct = len(warns)/total*100 if total else 0
    trend = "🟡 WARNING" if w_pct > 10 else "🟢 OK"
    print(f"│ {'Warnings':<30} {len(warns):>6} ({w_pct:5.1f}%) {trend:>12} │")
    
    l_pct = len(logs)/total*100 if total else 0
    print(f"│ {'Info logs':<30} {len(logs):>6} ({l_pct:5.1f}%) {'🟢 OK':>12} │")
    
    # Unique error types
    unique_errors = len(error_groups)
    trend = "🔴 FRAGMENTED" if unique_errors > 5 else "🟡" if unique_errors > 2 else "🟢"
    print(f"│ {'Unique error types':<30} {unique_errors:>6} {trend:>12} │")
    
    # Crash rate (errors per game day)
    if days:
        crash_rate = len(errors) / max(1, max(days) - min(days))
        trend = "🔴 HIGH" if crash_rate > 2 else "🟡" if crash_rate > 0.5 else "🟢 LOW"
        print(f"│ {'Crash rate (per day)':<30} {crash_rate:>8.1f} {trend:>12} │")
    
    # Convergence: are errors decreasing?
    if len(entries) > 10:
        first_half = len([e for e in entries[:len(entries)//2] if e.get("level")=="uncaught_exception"])
        second_half = len([e for e in entries[len(entries)//2:] if e.get("level")=="uncaught_exception"])
        if second_half < first_half:
            print(f"│ {'Error convergence':<30} {'DECREASING':>12} {'🟢 ✓':>12} │")
        elif second_half > first_half:
            print(f"│ {'Error convergence':<30} {'INCREASING':>12} {'🔴 ✗':>12} │")
        else:
            print(f"│ {'Error convergence':<30} {'STABLE':>12} {'🟡 ~':>12} │")
    
    print(f"└{'─'*56}┘")
    print()
    
    # Error detail
    if error_groups:
        print("🔴 TOP ERRORS:")
        for msg, count in error_groups.most_common(5):
            bar = "█" * min(40, count)
            print(f"  [{count:>4}x] {msg}")
            print(f"         {bar}")
        print()
    
    # Recent activity
    print("🕐 RECENT (last 5):")
    for e in entries[-5:]:
        ts = e.get("ts", 0)
        try:
            dt = datetime.fromtimestamp(ts/1000, tz=timezone.utc).strftime("%H:%M:%S")
        except:
            dt = "??:??:??"
        lvl = e.get("level", "?")[:4].upper()
        msg = e.get("msg", "")[:100]
        icon = "🔴" if lvl.startswith("UNC") else "🟡" if lvl.startswith("WAR") else "🔵"
        day = e.get("game_day", "?")
        print(f"  {icon} [{dt}] D{day} | {msg}")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
