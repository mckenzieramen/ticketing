(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let frame=0,last='';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function sync(reason='instant-ui'){
  const raw=localStorage.getItem(KEY)||'[]';
  if(raw===last&&reason!=='firebase-hydrate')return;
  last=raw;
  const tickets=read();
  if(frame)cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
    frame=0;
    if(typeof window.instantRenderTicketRecords==='function')window.instantRenderTicketRecords(tickets);
    window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets,source:'instant-ui-sync',reason}}));
    window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{tickets,source:'instant-ui-sync',reason}}));
  });
}
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key===KEY||e.detail?.key==='*')sync('memory-write')});
window.addEventListener('ticket-live-sync',e=>sync(e.detail?.reason||'live-sync'));
window.addEventListener('pageshow',()=>sync('pageshow'));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync('visible')});
queueMicrotask(()=>sync('boot'));
})();