# Nexus Dominion DevTools — Eruda Integration

## Ativacao (5 metodos)

| Metodo | Como |
|---|---|
| **Triple-tap** | 3 toques rapidos no canto superior direito (60x60px) |
| **Teclado** | Ctrl+Shift+D |
| **URL** | Adicionar `?eruda=true` na URL |
| **localStorage** | `localStorage.setItem('nd_dev','1')` + reload |
| **Console** | `ndDev()` |

## Funcionalidades

| Ferramenta | O que faz |
|---|---|
| **Console** | JavaScript console (log, error, warn, info) |
| **Elements** | DOM inspector (ver/editar HTML) |
| **Network** | Monitor de requests HTTP (XHR/Fetch) |
| **Resources** | localStorage, sessionStorage, cookies |
| **Sources** | Viewer de codigo fonte (HTML/JS/CSS) |
| **Info** | URL, user agent, device info |
| **Monitor** | FPS + uso de memoria em tempo real |
| **Timing** | Performance e resource timing |
| **ND-Inspect** | 🔥 Game state inspector customizado |

## ND-Inspect — Game State Inspector

Painel customizado com 5 secoes:

| Secao | Conteudo |
|---|---|
| **Player** | HP (barra), gold, level, XP, equipamento (durability), skills, posicao |
| **World** | Dia, seed, clima, hora, cidade proxima, paises |
| **Economy** | Inventario (peso/cap), precos do mercado, empresas, stocks |
| **Combat** | Combate ativo (HP inimigo), cooldown de ability, bounty |
| **AI** | Traders ativos, bandits, guerras, eventos |

### Cheats (DEV only)

| Botao | Efeito |
|---|---|
| +10K 💰 | Adiciona 10.000 gold |
| +100K 💰 | Adiciona 100.000 gold |
| Heal ❤️ | HP = max HP |
| +3 Lvls ⭐ | +3 levels, +3 skill points, +60 max HP |
| Teleport 🌀 | Teletransporta para cidade aleatoria |
| Reset CD ⚡ | Zera cooldown de abilities |

## Estrutura de arquivos

```
nexus-dominion/
  ├── index.html              ← Abrir este no navegador
  └── devtools/
      ├── loader.js           ← Loader condicional (triple-tap, Ctrl+Shift+D)
      ├── eruda.min.js        ← Eruda core (~500KB)
      ├── eruda-monitor.js    ← FPS + memory plugin (~57KB)
      ├── eruda-timing.js     ← Performance timing (~53KB)
      └── nd-inspector.js     ← Game state inspector (~8KB)
```

## Performance

- Eruda so carrega quando ativado (zero overhead em gameplay normal)
- Total offline: ~620KB (so baixar 1x)
- Separado do codigo do jogo: zero impacto no save/load
- Pode ser removido completamente deletando a tag `<script src="./devtools/loader.js">`

## Comandos uteis

```bash
# Abrir com DevTools
termux-open /storage/emulated/0/Download/nexus-dominion/index.html

# Servir localmente (para debugging remoto)
cd ~/nexus-dominion && python3 -m http.server 8080

# Verificar sintaxe JS
cd ~/nexus-dominion && python3 -c "
import re
with open('index.html') as f:
    h = f.read()
m = re.search(r'<script>(.*?)</script>', h, re.DOTALL)
with open('/tmp/check.js','w') as f: f.write(m.group(1))
" && node --check /tmp/check.js
```
