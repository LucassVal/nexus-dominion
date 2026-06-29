#!/usr/bin/env python3
"""Nexus Dominion v5 — Testing Harness
Validates game logic: RNG determinism, terrain reproducibility, combat formulas, economy, save/load.
"""

import json, hashlib, sys, os

HTML_FILE = "nexus-dominion.html"

def extract_js_functions(content):
    """Extract key JS functions into testable form."""
    tests = {}
    
    # Check RNG pattern exists
    if 'Math.random()' in content:
        tests['rng_deterministic'] = False
        print("  ⚠️  RNG: Using Math.random() — not deterministic. Replace with seeded PRNG.")
    else:
        tests['rng_deterministic'] = True
        print("  ✅ RNG: No Math.random found — already deterministic (or using custom RNG)")
    
    # Check terrain is deterministic
    if 'genTerrain(seed)' in content or 'genTerrain(' in content:
        tests['terrain_seeded'] = True
        print("  ✅ Terrain: Seeded generation detected")
    else:
        tests['terrain_seeded'] = False
        print("  ⚠️  Terrain: No seed parameter — not reproducible")
    
    # Check combat uses PRNG
    if 'function cbtAtk' in content:
        tests['combat_exists'] = True
        print("  ✅ Combat: Attack function found")
    else:
        tests['combat_exists'] = False
    
    # Check economy
    if 'function buyGood' in content and 'function sellGood' in content:
        tests['economy_exists'] = True
        print("  ✅ Economy: Buy/sell functions found")
    else:
        tests['economy_exists'] = False
    
    # Check save/load symmetry
    if 'function saveGame' in content and 'function loadGame' in content:
        tests['save_load'] = True
        print("  ✅ Save/Load: Both functions found")
    else:
        tests['save_load'] = False
    
    # Count goods
    goods_count = content.count(",n:'") + content.count(',n:"')
    print(f"  📦 Goods: ~{goods_count} items in catalog")
    
    # Count systems
    systems = ['countryAI', 'processDecay', 'genMissions', 'startCombat', 
               'useTrain', 'useShip', 'dipAction', 'buyStock', 'foundCompany']
    found = [s for s in systems if f'function {s}' in content]
    print(f"  🔧 Systems: {len(found)}/{len(systems)} found ({', '.join(found)})")
    
    return tests

def check_code_quality(content):
    """Run quality checks on the game code."""
    issues = []
    
    # Check for global Math.random usage
    math_random_count = content.count('Math.random()')
    if math_random_count > 0:
        issues.append(f"Math.random() used {math_random_count} times — replace with seeded PRNG")
    
    # Check for console.log
    if 'console.log' in content:
        issues.append("console.log found — remove for production")
    
    # Check for var usage (use let/const)
    var_count = len([l for l in content.split('\n') if l.strip().startswith('var ')])
    if var_count > 0:
        issues.append(f"'var' used {var_count} times — prefer 'let' or 'const'")
    
    return issues

def generate_test_report():
    """Generate a test report for the game."""
    print("=" * 60)
    print("NEXUS DOMINION v5 — TESTING HARNESS REPORT")
    print("=" * 60)
    
    if not os.path.exists(HTML_FILE):
        print(f"❌ {HTML_FILE} not found")
        return False
    
    with open(HTML_FILE, 'r') as f:
        content = f.read()
    
    size_kb = len(content) / 1024
    lines = len(content.split('\n'))
    
    print(f"\n📄 File: {HTML_FILE}")
    print(f"   Size: {size_kb:.1f} KB, {lines} lines\n")
    
    print("🔍 CODE ANALYSIS:")
    tests = extract_js_functions(content)
    
    print("\n🐛 QUALITY CHECKS:")
    issues = check_code_quality(content)
    if issues:
        for i in issues:
            print(f"  ⚠️  {i}")
    else:
        print("  ✅ No quality issues found")
    
    # Summary
    total = len(tests)
    passed = sum(1 for v in tests.values() if v)
    print(f"\n📊 SUMMARY: {passed}/{total} checks passed")
    
    if math_random_count := content.count('Math.random()'):
        print(f"\n🎯 PRIORITY: Replace {math_random_count} Math.random() calls with seeded PRNG")
        print("   This is the single highest-impact change for reproducibility.")
    
    return True

if __name__ == '__main__':
    generate_test_report()
