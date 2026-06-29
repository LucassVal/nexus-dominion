// ═══════════════════════════════════════════════
//  ND-INSPECTOR — Custom Eruda Plugin for Nexus Dominion
//  Game state inspector: Player, World, Economy, Combat, AI
// ═══════════════════════════════════════════════

eruda.add({
  name: 'ND-Inspect',
  init($el) {
    this._$el = $el;
    this._buildUI();
    this._refresh();
  },
  show() {
    this._$el.show();
    this._refresh();
  },
  hide() {
    this._$el.hide();
  },
  destroy() {},

  _buildUI() {
    this._$el.html(`
      <div style="padding:8px;font-family:monospace;font-size:11px;color:#c0c8d4;overflow-y:auto;max-height:100%">
        <div id="nd-insp-player"></div>
        <div id="nd-insp-world"></div>
        <div id="nd-insp-econ"></div>
        <div id="nd-insp-combat"></div>
        <div id="nd-insp-ai"></div>
        <div id="nd-insp-cheats" style="margin-top:10px;border-top:1px solid #333;padding-top:8px"></div>
      </div>
    `);
  },

  _refresh() {
    if (typeof G === 'undefined' || !G || !G.player) {
      this._$el.find('#nd-insp-player').html('<div style="color:#ff4757">Game not loaded</div>');
      return;
    }
    const p = G.player;
    const nc = G.cities ? G.cities.find(c => {
      try { return Math.hypot(p.x - c.x, p.y - c.y) < 70; } catch(e) { return false; }
    }) : null;
    const hpPct = Math.max(0, p.hp / p.mhp * 100);
    const hpColor = hpPct > 50 ? '#2ed573' : hpPct > 25 ? '#ffd700' : '#ff4757';
    const wep = p.eq && p.eq.weapon && GI ? (GI[p.eq.weapon] ? GI[p.eq.weapon].n : '?') : 'None';
    const arm = p.eq && p.eq.armor && GI ? (GI[p.eq.armor] ? GI[p.eq.armor].n : '?') : 'None';
    const wDur = p.eq && p.eq._wDur != null ? p.eq._wDur : '-';
    const aDur = p.eq && p.eq._aDur != null ? p.eq._aDur : '-';

    // Player
    this._$el.find('#nd-insp-player').html(`
      <div style="color:#00d4ff;font-weight:bold;margin-bottom:4px">👤 PLAYER — ${p.role ? p.role.toUpperCase() : '?'}</div>
      <div style="display:flex;align-items:center;gap:4px;margin:2px 0">
        <span>HP</span>
        <div style="flex:1;height:8px;background:#222;border-radius:4px"><div style="width:${hpPct}%;height:100%;background:${hpColor};border-radius:4px"></div></div>
        <span style="color:${hpColor}">${Math.max(0,Math.floor(p.hp))}/${p.mhp}</span>
      </div>
      <div style="margin:2px 0">💰 Gold: <span style="color:#ffd700">$${typeof fmt === 'function' ? fmt(p.gold) : p.gold}</span> | Lvl: ${p.lvl} | XP: ${p.xp}/${p.lvl*100}</div>
      <div style="margin:2px 0">⚔️ ${wep} [${wDur}] | 🛡️ ${arm} [${aDur}] | 💍 ${p.eq && p.eq.accessory && GI && GI[p.eq.accessory] ? GI[p.eq.accessory].n : 'None'}</div>
      <div style="margin:2px 0">🎯 Skills: ${p.skills ? Object.entries(p.skills).map(([k,v]) => k[0].toUpperCase()+k.slice(1)+':'+v).join(' ') : 'none'}</div>
      <div style="margin:2px 0">📍 (${Math.floor(p.x)},${Math.floor(p.y)}) | Camping: ${p.camping ? 'Yes' : 'No'} | Moving: ${p.moving ? 'Yes' : 'No'}</div>
    `);

    // World
    const w = G.weather || {};
    this._$el.find('#nd-insp-world').html(`
      <div style="color:#00d4ff;font-weight:bold;margin:8px 0 4px">🌍 WORLD</div>
      <div style="margin:2px 0">Day: ${G.day} | Seed: ${G.seed} | Tick: ${G.tick}</div>
      <div style="margin:2px 0">Weather: ${w.type || 'clear'} (${w.intensity ? w.intensity.toFixed(1) : '0'}) | Events: ${G.evts ? G.evts.length : 0}</div>
      <div style="margin:2px 0">Near: ${nc ? nc.name + ' (' + (G.countries && G.countries[nc.cIdx] ? G.countries[nc.cIdx].name : '?') + ')' : 'wilderness'}</div>
      <div style="margin:2px 0">Visited: ${p.vis ? p.vis.length : 0} cities | Countries: ${G.countries ? G.countries.length : 0}</div>
      <div style="margin:2px 0">Hour: ${Math.floor((G.day*4+G.tick)%24)}h | Night: ${(() => { const h = (G.day*4+G.tick)%24; return h < 6 || h > 20 ? 'Yes' : 'No'; })()}</div>
    `);

    // Economy
    const inv = p.caravan ? (p.caravan.goods || []) : (p.inv || []);
    const cap = p.caravan ? p.caravan.cap : 30;
    const used = inv.reduce((s, x) => { const g = GI ? GI[x.id] : null; return s + (g ? (g.w || 1) : 1) * x.qty; }, 0);
    this._$el.find('#nd-insp-econ').html(`
      <div style="color:#00d4ff;font-weight:bold;margin:8px 0 4px">💰 ECONOMY</div>
      <div style="margin:2px 0">Inventory: ${used}/${cap} wt | Items: ${inv.length} | Caravan: ${p.caravan ? 'Yes (guards:' + (p.caravan.guards || 0) + ')' : 'No'}</div>
      ${nc ? `<div style="margin:2px 0">Market: ${nc.name} | Tax: ${G.countries && G.countries[nc.cIdx] ? G.countries[nc.cIdx].tax : '?'}%</div>` : '<div style="margin:2px 0;color:#5a6a80">No city nearby</div>'}
      <div style="margin:2px 0">Companies: ${p.companies ? p.companies.length : 0} | Stocks: ${p.portfolio ? Object.keys(p.portfolio).length : 0}</div>
      <div style="margin:2px 0">Trades: ${p.trades || 0} | Enemies defeated: ${p.edef || 0}</div>
    `);

    // Combat
    const cbt = G.cbt;
    this._$el.find('#nd-insp-combat').html(`
      <div style="color:#00d4ff;font-weight:bold;margin:8px 0 4px">⚔️ COMBAT</div>
      ${cbt ? `<div style="margin:2px 0">Active: vs ${cbt.enemy ? cbt.enemy.n : '?'} (HP:${cbt.enemy ? Math.max(0,cbt.enemy.hp) : '?'}/${cbt.enemy ? cbt.enemy.mhp : '?'})</div>
      <div style="margin:2px 0">Your turn: ${cbt.pt ? 'Yes' : 'No'} | Ability CD: ${p.abilityCd || 0}</div>` : '<div style="margin:2px 0;color:#5a6a80">No active combat</div>'}
      <div style="margin:2px 0">Bounty: $${p.bounty || 0} | Joined army: ${p.joinedArmy || 'None'}</div>
    `);

    // AI
    this._$el.find('#nd-insp-ai').html(`
      <div style="color:#00d4ff;font-weight:bold;margin:8px 0 4px">🤖 AI STATE</div>
      <div style="margin:2px 0">Traders: ${G.aiTraders ? G.aiTraders.length : 0} | Bandits: ${G.bandits ? G.bandits.length : 0}</div>
      <div style="margin:2px 0">Wars active: ${G.countries ? G.countries.filter(c => c.atWar && c.atWar.length > 0).length : 0} countries</div>
      <div style="margin:2px 0">Next event: Day ${G.nextEventDay || '?'} | Companies: ${G.comps ? G.comps.length : 0}</div>
    `);

    // Cheats
    this._$el.find('#nd-insp-cheats').html(`
      <div style="color:#ffd700;font-weight:bold;margin-bottom:4px">🛠️ DEV CHEATS (use com cautela)</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        <button onclick="G.player.gold+=10000;updateUI()" style="padding:3px 8px;background:#302010;color:#ffd700;border:1px solid #604020;border-radius:4px;font-size:9px;cursor:pointer">+10K 💰</button>
        <button onclick="G.player.gold+=100000;updateUI()" style="padding:3px 8px;background:#302010;color:#ffd700;border:1px solid #604020;border-radius:4px;font-size:9px;cursor:pointer">+100K 💰</button>
        <button onclick="G.player.hp=G.player.mhp;updateUI()" style="padding:3px 8px;background:#102030;color:#00d4ff;border:1px solid #204060;border-radius:4px;font-size:9px;cursor:pointer">Heal ❤️</button>
        <button onclick="G.player.gold+=50000;G.player.mhp+=20;G.player.hp=G.player.mhp;G.player.lvl+=3;G.player.sp+=3;updateUI()" style="padding:3px 8px;background:#102020;color:#2ed573;border:1px solid #204040;border-radius:4px;font-size:9px;cursor:pointer">+3 Lvls ⭐</button>
        <button onclick="if(G.cities&&G.cities.length>0){const c=G.cities[Math.floor(Math.random()*G.cities.length)];G.player.x=c.x;G.player.y=c.y;G.player.path=[];G.player.moving=false;updateUI()}" style="padding:3px 8px;background:#201030;color:#c080ff;border:1px solid #402060;border-radius:4px;font-size:9px;cursor:pointer">Teleport 🌀</button>
        <button onclick="G.player.abilityCd=0;updateUI()" style="padding:3px 8px;background:#302020;color:#ffaa00;border:1px solid #604020;border-radius:4px;font-size:9px;cursor:pointer">Reset CD ⚡</button>
      </div>
    `);
  }
});
