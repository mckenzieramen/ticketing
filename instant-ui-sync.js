(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let last='';
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function sync(reason='instant-ui',force=false){
  const raw=localStorage.getItem(KEY)||'[]';
  if(!force&&raw===last)return;
  last=raw;
  const tickets=read();
  // Update the visible table in the same task as the data change. Do not wait
  // for Firebase or another animation frame before showing the user's edit.
  if(typeof window.instantRenderTicketRecords==='function')window.instantRenderTicketRecords(tickets);
  window.dispatchEvent(new CustomEvent('ticket-ui-updated',{detail:{tickets,source:'instant-ui-sync',reason}}));
}
window.ticketInstantUISync=(reason='manual')=>sync(reason,true);
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key===KEY||e.detail?.key==='*')sync('memory-write')});
window.addEventListener('ticket-live-sync',e=>sync(e.detail?.reason||'live-sync'));
window.addEventListener('ticket-record-saved',e=>{
  if(e.detail?.source==='instant-ui-sync')return;
  sync(e.detail?.reason||'record-saved',true);
});
window.addEventListener('call-attempt-updated',()=>sync('call-attempt',true));
window.addEventListener('pageshow',()=>sync('pageshow',true));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')sync('visible',true)});
queueMicrotask(()=>sync('boot',true));
})();