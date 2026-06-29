#!/usr/bin/env python3
"""Nexus Dominion v4 — Quality Gate & Linter
Validates the single HTML file for syntax, structure, size, and game logic.
"""

import re
import sys

HTML_FILE = "nexus-dominion.html"
MAX_SIZE_KB = 200

def check_html_structure(content):
    errors = []
    # Check DOCTYPE
    if '<!DOCTYPE html>' not in content[:50]:
        errors.append("MISSING DOCTYPE")
    # Check closing tags
    tags = ['html', 'head', 'body', 'script', 'style', 'canvas']
    for tag in tags:
        opens = len(re.findall(f'<{tag}[ >]', content))
        closes = len(re.findall(f'</{tag}>', content))
        if opens != closes:
            errors.append(f"TAG MISMATCH: <{tag}> open={opens} close={closes}")
    # Check no external deps
    if re.search(r'(src|href)=["\']https?://', content):
        errors.append("EXTERNAL DEPENDENCY FOUND (should be self-contained)")
    return errors

def check_css(content):
    warnings = []
    css_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    if not css_match:
        warnings.append("No <style> block found")
        return warnings
    css = css_match.group(1)
    # Check for duplicate rules
    selectors = re.findall(r'([.#]?\w[\w-]*(?:\s*[,>+~]\s*[.#]?\w[\w-]*)*)\s*\{', css)
    seen = {}
    for s in selectors:
        s = s.strip()
        if s in seen:
            warnings.append(f"DUPLICATE CSS: {s} (lines {seen[s]} and again)")
        else:
            seen[s] = "?"
    # Check for common CSS issues
    if '!important' in css:
        warnings.append("!important found in CSS (avoid)")
    return warnings

def check_js(content):
    warnings = []
    js_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
    if not js_match:
        return ["No <script> block found"]
    js = js_match.group(1)
    # Basic syntax checks
    lines = js.split('\n')
    brace_count = 0
    paren_count = 0
    for i, line in enumerate(lines, 1):
        brace_count += line.count('{') - line.count('}')
        paren_count += line.count('(') - line.count(')')
    if brace_count != 0:
        warnings.append(f"BRACE MISMATCH: {brace_count} (should be 0)")
    if paren_count != 0:
        warnings.append(f"PAREN MISMATCH: {paren_count} (should be 0)")
    # Check for console.log (shouldn't ship with)
    if 'console.log' in js:
        warnings.append("console.log found (remove for production)")
    # Check for common issues
    if 'var ' in js:
        warnings.append("'var' found — prefer 'let' or 'const'")
    return warnings

def check_game_structures(content):
    """Verify key game objects exist."""
    checks = {
        'const GD=': 'Goods catalog',
        'const EN=': 'Enemy definitions',
        'GI[': 'Goods index lookup',
        'function genTerrain': 'Terrain generator',
        'function gameTick': 'Game tick loop',
        'function saveGame': 'Save function',
        'function loadGame': 'Load function',
        'function startCombat': 'Combat system',
        'function countryAI': 'Country AI',
        'localStorage.setItem': 'Persistence',
        'requestAnimationFrame': 'Render loop',
    }
    missing = []
    for pattern, desc in checks.items():
        if pattern not in content:
            missing.append(f"MISSING: {desc} ({pattern})")
    return missing

def check_save_roundtrip(content):
    """Simulate save/load by checking JSON structure references."""
    # Ensure saveGame serializes all needed state
    save_keys = ['player', 'cities', 'countries', 'bandits', 'aiTraders', 'day', 'seed']
    found = []
    for key in save_keys:
        if key in content:
            found.append(key)
    missing = [k for k in save_keys if k not in found]
    return missing

def main():
    try:
        with open(HTML_FILE, 'r') as f:
            content = f.read()
    except FileNotFoundError:
        print(f"FAIL: {HTML_FILE} not found")
        sys.exit(1)

    size_kb = len(content) / 1024
    all_ok = True

    print(f"{'='*60}")
    print(f"QUALITY GATE: {HTML_FILE}")
    print(f"{'='*60}")
    print(f"Size: {size_kb:.1f} KB (limit: {MAX_SIZE_KB} KB)")

    if size_kb > MAX_SIZE_KB:
        print(f"❌ FAIL: File too large ({size_kb:.1f} > {MAX_SIZE_KB} KB)")
        all_ok = False
    else:
        print("✅ PASS: Size OK")

    # HTML structure
    html_errs = check_html_structure(content)
    if html_errs:
        print(f"❌ HTML: {len(html_errs)} issues")
        for e in html_errs: print(f"   - {e}")
        all_ok = False
    else:
        print("✅ HTML: Structure OK")

    # CSS
    css_warns = check_css(content)
    if css_warns:
        print(f"⚠️  CSS: {len(css_warns)} warnings")
        for w in css_warns: print(f"   - {w}")
    else:
        print("✅ CSS: Clean")

    # JS
    js_warns = check_js(content)
    if js_warns:
        print(f"⚠️  JS: {len(js_warns)} warnings")
        for w in js_warns: print(f"   - {w}")
    else:
        print("✅ JS: Clean")

    # Game structures
    struct_missing = check_game_structures(content)
    if struct_missing:
        print(f"❌ GAME STRUCTURES: {len(struct_missing)} missing")
        for m in struct_missing: print(f"   - {m}")
        all_ok = False
    else:
        print("✅ GAME STRUCTURES: All present")

    # Save roundtrip
    save_missing = check_save_roundtrip(content)
    if save_missing:
        print(f"⚠️  SAVE: Missing keys: {save_missing}")
    else:
        print("✅ SAVE: All keys present")

    # Goods count
    goods_count = len(re.findall(r"id:'(\w+)',\s*name:'", content))
    print(f"📦 Goods catalog: {goods_count} items found")

    print(f"{'='*60}")
    if all_ok:
        print("✅ ALL GATES PASSED")
        sys.exit(0)
    else:
        print("❌ SOME GATES FAILED")
        sys.exit(1)

if __name__ == '__main__':
    main()
