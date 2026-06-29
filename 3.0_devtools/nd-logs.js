// ═══════════════════════════════════════════════
//  ND-LOGS — Eruda Plugin: Log Viewer
//  Shows real-time logs, server status, download
// ═══════════════════════════════════════════════

eruda.add({
  name: 'ND-Logs',
  init($el) {
    this._$el = $el;
    this._filter = 'all';
    this._autoScroll = true;
    this._logs = [];
    this._maxDisplay = 200;
    this._buildUI();
    this._refresh();
    this._interval = setInterval(() => this._refresh(), 2000);

    // Hook into our interceptor for live feed
    if (window.NDLog) {
      this._origStats = window.NDLog.stats;
    }
  },
  show() { this._$el.show(); this._refresh(); },
  hide() { this._$el.hide(); },
  destroy() { if (this._interval) clearInterval(this._interval); },

  _buildUI() {
    this._$el.html(`
      <div style="display:flex;flex-direction:column;height:100%;font-family:monospace;font-size:10px">
        <div id="ndl-status" style="padding:4px 8px;background:#111;border-bottom:1px solid #222;display:flex;gap:8px;align-items:center;flex-shrink:0"></div>
        <div id="ndl-filters" style="padding:2px 8px;background:#0a0a0a;border-bottom:1px solid #222;display:flex;gap:4px;flex-shrink:0"></div>
        <div id="ndl-loglist" style="flex:1;overflow-y:auto;padding:4px 8px;background:#080808;min-height:0"></div>
        <div id="ndl-actions" style="padding:4px 8px;background:#111;border-top:1px solid #222;display:flex;gap:4px;flex-shrink:0"></div>
      </div>
    `);
  },

  _refresh() {
    var self = this;

    // Status bar
    var stats = window.NDLog ? window.NDLog.stats() : { serverOnline: false, queued: 0, sent: 0, dropped: 0, fallback: 0 };
    this._$el.find('#ndl-status').html(`
      <span style="color:${stats.serverOnline ? '#2ed573' : '#ff4757'}">● ${stats.serverOnline ? 'Connected' : 'Offline'}</span>
      <span style="color:#8899aa">Sent: ${stats.sent}</span>
      <span style="color:#ffd700">Queue: ${stats.queued}</span>
      <span style="color:#ff4757">Dropped: ${stats.dropped}</span>
      <span style="color:#5a6a80">Fallback: ${stats.fallback || 0}</span>
    `);

    // Filters
    var filters = ['all','error','warn','info','log','debug','uncaught_exception','unhandled_rejection'];
    this._$el.find('#ndl-filters').html(
      filters.map(function(f){
        var active = self._filter === f;
        return '<button onclick="eruda.get(\'ND-Logs\')._setFilter(\'' + f + '\')" style="padding:1px 6px;background:' + (active ? '#1a2740' : 'transparent') + ';color:' + (active ? '#00d4ff' : '#8899aa') + ';border:1px solid ' + (active ? '#0d3b66' : '#222') + ';border-radius:3px;font-size:9px;cursor:pointer">' + f + '</button>';
      }).join('')
    );

    // If we have access to fallback, show those logs  
    var fallback = window.NDLog ? window.NDLog.getFallback() : [];
    // In a real impl we'd have a shared log store from interceptor
    // For now, show what we can
    if (fallback.length > 0 && this._logs.length === 0) {
      this._logs = fallback.slice(-this._maxDisplay);
    }

    // Log list
    var filtered = this._logs;
    if (this._filter !== 'all') {
      filtered = filtered.filter(function(l) { return l.level === self._filter; });
    }
    filtered = filtered.slice(-this._maxDisplay);

    var levelColors = { error: '#ff4757', warn: '#ffd700', info: '#8899aa', log: '#c0c8d4', debug: '#5a6a80', uncaught_exception: '#ff0040', unhandled_rejection: '#ff8800' };

    this._$el.find('#ndl-loglist').html(
      filtered.length === 0
        ? '<div style="color:#5a6a80;text-align:center;padding:20px">No logs yet. Interact with the game to generate logs.</div>'
        : filtered.map(function(l){
            var time = l.ts ? new Date(l.ts).toLocaleTimeString() : '--:--:--';
            var color = levelColors[l.level] || '#8899aa';
            var gameInfo = l.game_day ? ' [D' + l.game_day + ']' : '';
            return '<div style="padding:1px 0;border-bottom:1px solid #111;cursor:pointer" onclick="this.querySelector(\'.ndl-stack\').style.display=this.querySelector(\'.ndl-stack\').style.display===\'none\'?\'block\':\'none\'">' +
              '<span style="color:#5a6a80;font-size:9px">' + time + '</span> ' +
              '<span style="color:' + color + ';font-weight:bold">' + (l.level || '?').toUpperCase() + '</span>' +
              '<span style="color:#6a7a90">' + gameInfo + '</span> ' +
              '<span style="color:#c0c8d4">' + (l.msg || '').substring(0, 150) + '</span>' +
              (l.stack ? '<div class="ndl-stack" style="display:none;color:#5a6a80;font-size:9px;padding:2px 0 2px 12px;white-space:pre-wrap">' + l.stack + '</div>' : '') +
              '</div>';
          }).join('')
    );

    // Actions
    this._$el.find('#ndl-actions').html(`
      <button onclick="eruda.get('ND-Logs')._clear()" style="padding:2px 8px;background:#301020;color:#ff4757;border:1px solid #401828;border-radius:4px;font-size:9px;cursor:pointer">Clear</button>
      <button onclick="eruda.get('ND-Logs')._download()" style="padding:2px 8px;background:#102030;color:#00d4ff;border:1px solid #204060;border-radius:4px;font-size:9px;cursor:pointer">Download .log</button>
      <button onclick="eruda.get('ND-Logs')._pauseToggle()" style="padding:2px 8px;background:transparent;color:#8899aa;border:1px solid #222;border-radius:4px;font-size:9px;cursor:pointer">${window.NDLog && window.NDLog._paused ? '▶ Resume' : '⏸ Pause'}</button>
      <button onclick="if(window.NDLog)window.NDLog.flush()" style="padding:2px 8px;background:#202020;color:#8899aa;border:1px solid #333;border-radius:4px;font-size:9px;cursor:pointer">Flush Now</button>
    `);
  },

  _setFilter(f) { this._filter = f; this._refresh(); },
  _clear() { this._logs = []; if (window.NDLog) window.NDLog.clearFallback(); this._refresh(); },
  _pauseToggle() {
    if (window.NDLog) {
      if (window.NDLog._paused) { window.NDLog.resume(); } else { window.NDLog.pause(); }
    }
    this._refresh();
  },
  _download() {
    var text = this._logs.map(function(l){
      return JSON.stringify(l);
    }).join('\n');
    var blob = new Blob([text], {type: 'application/jsonl'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'nd-logs-' + new Date().toISOString().replace(/:/g,'-') + '.jsonl';
    a.click();
    URL.revokeObjectURL(url);
  }
});
