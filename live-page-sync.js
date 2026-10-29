(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let frame=0,last='';
const readRaw=()=>localStorage.getItem(KEY)||'[]';
function emit(reason,force=false){const raw=readRaw();if(!force&&raw===last)return;last=raw;window.dispatchEvent(new CustomEvent('ticket-live-sync',{detail:{reason}}));window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{source:'live-page-sync',reason}}))}
function immediate(reason='change'){if(frame){cancelAnimationFrame(frame);frame=0}emit(reason,true)}
function schedule(reason='change'){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;emit(reason,false)})}
last=readRaw();
// Bridge same-page ticket persistence directly to every live UI section.
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
Storage.prototype.setItem=function(k,v){const isTicket=this===localStorage&&String(k)===KEY;const before=isTicket?readRaw():null;const out=nativeSet.apply(this,arguments);if(isTicket&&String(v)!==before)immediate('ticket-save');return out};
Storage.prototype.removeItem=function(k){const isTicket=this===localStorage&&String(k)===KEY,had=isTicket&&readRaw()!=='[]';const out=nativeRemove.apply(this,arguments);if(had)immediate('ticket-remove');return out};
Storage.prototype.clear=function(){const had=this===localStorage&&localStorage.getItem(KEY)!==null;const out=nativeClear.apply(this,arguments);if(had)immediate('ticket-clear');return out};
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key===KEY||e.detail?.key==='*')immediate('firebase-memory-write')});
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)immediate('remote-storage')});
window.addEventListener('pageshow',()=>immediate('pageshow'));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')immediate('visible')});
// Fallback for handlers that mutate memory/DOM before persistence; run after the current handler, not after a visible delay.
document.addEventListener('submit',e=>{if(e.target?.id==='ticketForm')queueMicrotask(()=>immediate('form-save'))},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#saveStampBtn,.action-btn,.attempt-count,.attempt-minus,.status-click-btn,[data-ticket-status]'))queueMicrotask(()=>schedule('ticket-action'))},true);
})();