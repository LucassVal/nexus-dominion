# 🌍 Nexus Dominion — Living World Grand Strategy

> A single-file HTML grand strategy game blending Mount & Blade, Victoria 3, EU5, Civilization, and Anno 1800.

**Play in your browser: open `2.0_src/index.html`**

---

## 🎮 Game Overview

Start as a nobody and shape the world:

| Role | Playstyle |
|------|-----------|
| 🐪 **Merchant** | Trade goods between cities, build caravan empire |
| ⚔️ **Warrior** | Fight bandits, join armies, become a legendary fighter |
| 🛡️ **Mercenary** | Hire troops, fight for gold, build a mercenary company |
| 🏢 **CEO** | Found companies, IPO, hostile takeovers, stock market |
| 🎒 **Wanderer** | Explore the living world, versatile skills |
| 🦹 **Bandit** | Recruit gang, establish hideouts, raid traders |
| 👑 **King** | Rule a kingdom, command armies, forge alliances |

Or **Found Your Own Kingdom** with capital + 5 cities.

---

## 🏗️ Architecture

Single-file vanilla JS (~1900 lines) with DDD architecture:

```
ORC (Orchestrator)
├── WORLD    — terrain generation, globe wrap
├── STATE    — game state, save/load
├── ECONOMY  — trade, companies, stocks, facilities
├── POLITICS — kingdoms, diplomacy, war, factions
├── COMBAT   — battles, enemies, status effects
├── PLAYER   — movement, mounts, skills, inventory
└── RENDER   — 28 canvas layers, camera, minimap
```

---

## ✨ Features

- 🗺️ **Living World**: Dynamic economy, AI traders, bandits, armies
- 🌐 **Globe Wrap**: Pac-Man style warp zones at edges
- 🏛️ **8 Government Types**: Monarchy, Parliament, Theocracy, Technocracy...
- 📊 **Stock Market**: 13 companies, IPOs, takeovers
- 🔬 **Tech Tree**: 10 Institutions + 16 Advances (EU5/Victoria style)
- ⛵ **Naval System**: 5 ship types, trade routes, islands
- 👥 **POP System**: 7 population classes per city
- ⚔️ **War & Peace**: Declare war, sue for peace, vassalage, royal marriage
- 🦹 **Bandit Factions**: Gang territories, hideouts, notoriety
- 💰 **Difficulty Levels**: Easy/Medium/Hard with credit limits
- 📱 **Android Ready**: On-screen error display, triple-tap eruda console

---

## 🚀 Quick Start

```bash
cd nexus-dominion
python3 -m http.server 8100
# Open http://127.0.0.1:8100/2.0_src/index.html
```

---

## 🔧 Dev Tools

```bash
# Test harness
python3 6.0_build/test_harness.py

# Hot reload (watch mode)
python3 6.0_build/test_harness.py --watch

# Log dashboard
python3 4.0_server/nd_dashboard.py
```

---

## 📁 Structure

```
nexus-dominion/
├── 2.0_src/index.html    — Main game (single file)
├── 1.0_specs/            — 28 design specs
├── 3.0_devtools/         — Eruda console + log interceptor
├── 4.0_server/           — Log server + dashboard
├── 5.0_logs/             — Runtime logs
└── 6.0_build/            — Quality tools + test harness
```

---

## 📜 License

MIT — do whatever you want, just keep the attribution.

---

*Built on Android/Termux with Hermes Agent AI*
