// ═══════════════════════════════════════════════
//  ND-CONSOLE-INTERCEPTOR — Hook all console.* calls
//  Sends to log_server.py via fetch POST /log
//  Load BEFORE game code for complete coverage
// ═══════════════════════════════════════════════
;(function(){
'use strict';

var SERVER = 'http://127.0.0.1:8099';
var BATCH_SIZE = 5;
var BATCH_INTERVAL = 3000;
var MAX_QUEUE = 100;
var FALLBACK_SIZE = 50; // localStorage ring buffer when server offline

var queue = [];
var sent = 0;
var dropped = 0;
var serverOnline = false;
var paused = false;
var fallbackRing = [];
var flushTimer = null;

// ─── Fallback: localStorage ring buffer ───
function loadFallback(){
  try{
    var d = JSON.parse(localStorage.getItem('nd_log_fallback')||'[]');
    if(Array.isArray(d)) fallbackRing = d.slice(-FALLBACK_SIZE);
  }catch(e){ fallbackRing = []; }
}
function saveFallback(entry){
  fallbackRing.push(entry);
  if(fallbackRing.length > FALLBACK_SIZE) fallbackRing.shift();
  try{ localStorage.setItem('nd_log_fallback', JSON.stringify(fallbackRing)); }catch(e){}
}
loadFallback();

// ─── Send batch to server ───
function sendBatch(){
  if(queue.length === 0 || paused) return;
  var batch = queue.splice(0, BATCH_SIZE);
  var payload = JSON.stringify(batch);

  fetch(SERVER + '/log', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: payload,
    keepalive: true
  }).then(function(r){
    if(r.ok){
      serverOnline = true;
      sent += batch.length;
      // Flush fallback ring if any
      if(fallbackRing.length > 0){
        var fb = fallbackRing.splice(0);
        var fbPayload = JSON.stringify(fb);
        fetch(SERVER + '/log', {method:'POST', headers:{'Content-Type':'application/json'}, body:fbPayload, keepalive:true});
        try{ localStorage.removeItem('nd_log_fallback'); }catch(e){}
      }
    }
  }).catch(function(){
    serverOnline = false;
    // Push back to queue front
    queue.unshift.apply(queue, batch);
    // Also save to fallback
    batch.forEach(function(e){ saveFallback(e); });
  });
}

// ─── Periodic flush ───
function startFlush(){
  if(flushTimer) return;
  flushTimer = setInterval(function(){
    if(queue.length > 0 && serverOnline) sendBatch();
  }, BATCH_INTERVAL);
}

// ─── Build log entry ───
function buildEntry(level, args, stack){
  var msg = '';
  try{
    msg = args.map(function(a){
      if(typeof a === 'string') return a;
      if(a instanceof Error) return a.message + '\n' + (a.stack||'');
      try{ return JSON.stringify(a); }catch(e){ return String(a); }
    }).join(' ');
  }catch(e){ msg = '[unstringifiable]'; }

  var entry = {
    level: level,
    msg: msg.substring(0, 2000), // cap at 2000 chars
    stack: (stack || '').substring(0, 1000),
    ts: Date.now(),
    line: 0,
    file: 'nexus-dominion.html'
  };

  // Add game context if available
  try{
    if(typeof G !== 'undefined' && G){
      entry.game_day = G.day || 0;
      entry.game_tick = G.tick || 0;
    }
  }catch(e){}

  // Try to extract line number from stack
  if(stack){
    var m = stack.match(/:(\d+):(\d+)/);
    if(m) entry.line = parseInt(m[1]);
  }

  return entry;
}

// ─── Enqueue entry ───
function enqueue(entry){
  if(paused) return;
  if(queue.length >= MAX_QUEUE){
    dropped++;
    return; // Drop oldest to avoid memory pressure
  }
  queue.push(entry);

  // Immediate send for errors (don't wait for batch)
  if(entry.level === 'error' && serverOnline){
    sendBatch();
  }else if(queue.length >= BATCH_SIZE && serverOnline){
    sendBatch();
  }
}

// ─── Hook console methods ───
var _orig = {};
['log','warn','error','info','debug'].forEach(function(level){
  _orig[level] = console[level];
  console[level] = function(){
    // Call original (so Eruda still sees it)
    try{ _orig[level].apply(console, arguments); }catch(e){}

    // Capture stack trace for errors/warnings
    var stack = '';
    if(level === 'error' || level === 'warn'){
      try{ throw new Error(); }catch(e){ stack = e.stack || ''; }
      // Remove first 2 lines (this function + throw)
      stack = stack.split('\n').slice(2).join('\n');
    }

    // Build and enqueue
    var args = Array.prototype.slice.call(arguments);
    enqueue(buildEntry(level, args, stack));
  };
});

// ─── Also intercept uncaught exceptions ───
var _onerror = window.onerror;
window.onerror = function(msg, file, line, col, error){
  var entry = {
    level: 'uncaught_exception',
    msg: String(msg),
    stack: error ? error.stack : '',
    ts: Date.now(),
    line: line || 0,
    file: file || 'nexus-dominion.html'
  };
  try{ if(typeof G !== 'undefined' && G){ entry.game_day = G.day||0; entry.game_tick = G.tick||0; } }catch(e){}
  enqueue(entry);
  // Also send immediately
  if(serverOnline) sendBatch();

  if(_onerror) return _onerror.apply(this, arguments);
  return false;
};

// ─── Intercept unhandled promise rejections ───
window.addEventListener('unhandledrejection', function(e){
  var entry = {
    level: 'unhandled_rejection',
    msg: e.reason ? (e.reason.message || String(e.reason)) : 'Unhandled rejection',
    stack: e.reason && e.reason.stack ? e.reason.stack : '',
    ts: Date.now(),
    line: 0,
    file: 'nexus-dominion.html'
  };
  try{ if(typeof G !== 'undefined' && G){ entry.game_day = G.day||0; entry.game_tick = G.tick||0; } }catch(e){}
  enqueue(entry);
});

// ─── Health check (periodic) ───
function healthCheck(){
  fetch(SERVER + '/health').then(function(r){
    return r.json();
  }).then(function(d){
    serverOnline = d.status === 'ok';
    if(serverOnline && queue.length > 0) sendBatch();
  }).catch(function(){
    serverOnline = false;
  });
}
// Health check only when explicitly enabled (offline-first by default)
// Call NDLog.enableServer() to start periodic health checks

// ─── Start ───
startFlush();

// ─── Public API ───
window.NDLog = {
  pause: function(){ paused = true; },
  resume: function(){ paused = false; },
  flush: function(){
    while(queue.length > 0 && serverOnline) sendBatch();
    if(serverOnline) fetch(SERVER + '/flush', {method: 'POST'});
  },
  stats: function(){
    return {
      serverOnline: serverOnline,
      queued: queue.length,
      sent: sent,
      dropped: dropped,
      fallback: fallbackRing.length
    };
  },
  getFallback: function(){ return fallbackRing.slice(); },
  clearFallback: function(){
    fallbackRing = [];
    try{ localStorage.removeItem('nd_log_fallback'); }catch(e){}
  },
  enableServer: function(){
    serverOnline = false;
    healthCheck();
    setInterval(healthCheck, 30000);
    console.log('[ND-Interceptor] Server mode enabled, checking ' + SERVER);
  }
};

console.log('[ND-Interceptor] Active. Server: ' + SERVER + ' | Status: checking...');
})();
