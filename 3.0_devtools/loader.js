// ═══════════════════════════════════════════════
//  ERUDA DEVTOOLS LOADER v3 — Interceptor + Logs
//  Triple-tap top-right | Ctrl+Shift+D | ?eruda=true
// ═══════════════════════════════════════════════
;(function(){
'use strict';
var DEV=localStorage.getItem('nd_dev')==='1';
var URL=/[?&]eruda=true(&|$)/.test(location.href);
var ACTIVE=false;
var BASE='./devtools/';

function ls(s,cb){var e=document.createElement('script');e.src=s;e.onload=cb||function(){};document.head.appendChild(e);}

function init(){
  if(ACTIVE)return;ACTIVE=true;localStorage.setItem('nd_dev','1');
  ls(BASE+'eruda.min.js',function(){
    ls(BASE+'eruda-monitor.js',function(){
      ls(BASE+'eruda-timing.js',function(){
        eruda.init({tool:['console','elements','network','resources','sources','info'],useShadowDom:false});
        ls(BASE+'nd-inspector.js');
        ls(BASE+'nd-logs.js',function(){console.log('[ND] DevTools ready')});
      });
    });
  });
  toast('🔧 DevTools ON','#0d3b66','#00d4ff');
}

function destroy(){
  if(!ACTIVE)return;ACTIVE=false;localStorage.removeItem('nd_dev');
  try{if(typeof eruda!=='undefined')eruda.destroy()}catch(e){}
  toast('DevTools OFF — reloading...','#301020','#ff4757');
  setTimeout(function(){location.reload()},600);
}

function toast(m,bg,c){
  var e=document.createElement('div');e.textContent=m;
  e.style.cssText='position:fixed;top:10px;right:10px;z-index:99999;background:'+bg+';color:'+c+';padding:8px 14px;border-radius:6px;font-size:11px;font-family:sans-serif;pointer-events:none;animation:ndIn .3s ease';
  document.body.appendChild(e);
  setTimeout(function(){e.style.opacity='0';e.style.transition='opacity .3s'},2000);
  setTimeout(function(){e.remove()},2500);
}

var tc=0,tt=null;
document.addEventListener('click',function(e){
  if(e.clientX<innerWidth-60||e.clientY>60){tc=0;return}
  tc++;if(tt)clearTimeout(tt);
  if(tc>=3){tc=0;ACTIVE?destroy():init()}
  else tt=setTimeout(function(){tc=0},500);
});
document.addEventListener('keydown',function(e){
  if(e.ctrlKey&&e.shiftKey&&e.key==='D'){e.preventDefault();ACTIVE?destroy():init();}
});
window.ndDev=function(){ACTIVE?destroy():init()};
if(DEV||URL)setTimeout(init,500);
var s=document.createElement('style');s.textContent='@keyframes ndIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}';document.head.appendChild(s);
console.log('[ND] Loader ready. Triple-tap top-right, Ctrl+Shift+D, or ndDev().');
})();
