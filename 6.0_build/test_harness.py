#!/usr/bin/env python3
"""
ND Test Harness — Automated role testing + hot reload
Usage: python3 ~/nexus-dominion/6.0_build/test_harness.py [--watch]
"""

import http.server
import socketserver
import subprocess
import time
import os
import sys
import json
import re
from pathlib import Path

import os as _os
_PROJECT = Path(_os.path.dirname(_os.path.abspath(__file__))).parent
HTML_FILE = _PROJECT / "2.0_src/index.html"
LOG_FILE = _PROJECT / "5.0_logs/nd-runtime.log"
SERVER_DIR = _PROJECT
PORT = 8100


def validate_js(content):
    """Syntactic check via node --check"""
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
    if not scripts:
        return False, "No script blocks found"
    biggest = max(scripts, key=len)
    
    try:
        result = subprocess.run(
            ['node', '--check', '-'],
            input=biggest, capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            return True, "JS OK"
        else:
            return False, result.stderr[:200]
    except Exception as e:
        return False, str(e)


def check_roles(content):
    """Verify all 7 roles are wired"""
    roles = []
    for m in re.finditer(r"startGame\('(\w+)'\)", content):
        roles.append(m.group(1))
    
    missing = []
    expected = ['merchant', 'warrior', 'mercenary', 'ceo', 'wanderer', 'bandit', 'king']
    for r in expected:
        if r not in roles:
            missing.append(r)
        if f"case'{r}'" not in content and f"case '{r}'" not in content:
            missing.append(f"{r} (no init)")

    return roles, missing


def check_structures(content):
    """Verify key data structures exist"""
    checks = {
        'GOV_TYPES': r'GOV_TYPES\b',
        'FT (facilities)': r'\bFT\b',
        'GD (goods)': r'\bGD\b',
        'EN (enemies)': r'\bEN\b',
        'ORC': r'\bORC\b',
        'GLOBE': r'\bGLOBE\b',
        'LAYERS': r'\bLAYERS\b',
        'INSTITUTIONS': r'INSTITUTIONS\b',
        'ADVANCES': r'ADVANCES\b',
        'SHIPS': r'SHIPS\b',
    }
    results = {}
    for name, pattern in checks.items():
        results[name] = len(re.findall(pattern, content)) > 0
    return results


def read_log():
    """Read and summarize the eruda log"""
    if not LOG_FILE.exists():
        return {"total": 0, "errors": 0, "top": []}
    
    entries = []
    with open(LOG_FILE) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                pass
    
    errs = [e for e in entries if 'exception' in e.get('level', '') or 'error' in e.get('level', '')]
    
    from collections import Counter
    msgs = Counter(e.get('msg', '')[:100] for e in errs)
    
    return {
        "total": len(entries),
        "errors": len(errs),
        "top": msgs.most_common(5)
    }


def run_full_check():
    """Full quality gate"""
    print("=" * 60)
    print("🔍 ND TEST HARNESS")
    print("=" * 60)
    
    if not HTML_FILE.exists():
        print("❌ HTML file not found:", HTML_FILE)
        return False
    
    content = HTML_FILE.read_text()
    all_ok = True
    
    # 1. JS Syntax
    ok, msg = validate_js(content)
    print(f"\n📝 JS Syntax: {'✅' if ok else '❌'} {msg}")
    if not ok:
        all_ok = False
    
    # 2. Roles
    roles, missing = check_roles(content)
    print(f"\n🎮 Roles: {len(roles)} found ({', '.join(roles)})")
    if missing:
        print(f"   ❌ Missing: {missing}")
        all_ok = False
    
    # 3. Structures
    structs = check_structures(content)
    missing_structs = [k for k, v in structs.items() if not v]
    print(f"\n📦 Structures: {sum(structs.values())}/{len(structs)} present")
    if missing_structs:
        print(f"   ❌ Missing: {missing_structs}")
        all_ok = False
    
    # 4. Brace balance
    scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
    if scripts:
        big = max(scripts, key=len)
        opens = big.count('{')
        closes = big.count('}')
        balanced = opens == closes
        print(f"\n🔧 Braces: {opens}/{closes} {'✅' if balanced else '❌ diff=' + str(opens - closes)}")
        if not balanced:
            all_ok = False
    
    # 5. Log
    log = read_log()
    print(f"\n📋 Log: {log['total']} entries, {log['errors']} errors")
    if log['errors'] > 0:
        print(f"   🔴 TOP ERRORS:")
        for msg, count in log['top']:
            print(f"      [{count}x] {msg}")
    
    # 6. File stats
    lines = content.count('\n')
    size = len(content)
    print(f"\n📏 File: {lines} lines, {size:,} bytes")
    
    # 7. Health check steps
    hc_steps = re.findall(r"hc\.step='(\w+)'", content)
    print(f"\n🏥 Health Check: {len(hc_steps)} steps ({' → '.join(hc_steps)})")
    
    print(f"\n{'=' * 60}")
    if all_ok:
        print("✅ ALL CHECKS PASSED")
    else:
        print("❌ SOME CHECKS FAILED")
    print(f"{'=' * 60}")
    
    return all_ok


def watch_mode():
    """Hot reload: watch file changes and auto-restart"""
    last_mtime = HTML_FILE.stat().st_mtime if HTML_FILE.exists() else 0
    
    print(f"👁️  Watching {HTML_FILE}... (Ctrl+C to stop)")
    print(f"🌐 http://127.0.0.1:{PORT}/2.0_src/index.html")
    
    # Start server
    server_proc = subprocess.Popen(
        ['python3', '-m', 'http.server', str(PORT), '--bind', '127.0.0.1'],
        cwd=str(SERVER_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    try:
        while True:
            time.sleep(2)
            if HTML_FILE.exists():
                mtime = HTML_FILE.stat().st_mtime
                if mtime > last_mtime:
                    last_mtime = mtime
                    print(f"\n🔄 File changed at {time.strftime('%H:%M:%S')} — running checks...")
                    run_full_check()
                    print(f"👁️  Watching...")
    except KeyboardInterrupt:
        print("\n🛑 Stopping...")
    finally:
        server_proc.terminate()
        server_proc.wait()


if __name__ == '__main__':
    if '--watch' in sys.argv:
        watch_mode()
    else:
        run_full_check()
