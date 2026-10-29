(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
let frame=0,last='';
const readRaw=()=>localStorage.getItem(KEY)||'[]';
function emit(reason){const raw=readRaw();if(raw===last&&reason!=='force')return;last=raw;window.dispatchEvent(new CustomEvent('ticket-live-sync',{detail:{reason}}));window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{source:'live-page-sync',reason}}))}
function schedule(reason='change'){cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>emit(reason))}
last=readRaw();
// Same-page localStorage writes do not fire the native storage event, so bridge them to the live UI.
const nativeSet=Storage.prototype.setItem,nativeRemove=Storage.prototype.removeItem,nativeClear=Storage.prototype.clear;
Storage.prototype.setItem=function(k,v){const before=k===KEY?readRaw():null;const out=nativeSet.apply(this,arguments);if(k===KEY&&String(v)!==before)schedule('ticket-save');return out};
Storage.prototype.removeItem=function(k){const had=k===KEY&&localStorage.getItem(KEY)!==null;const out=nativeRemove.apply(this,arguments);if(had)schedule('ticket-remove');return out};
Storage.prototype.clear=function(){const had=localStorage.getItem(KEY)!==null;const out=nativeClear.apply(this,arguments);if(had)schedule('ticket-clear');return out};
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)schedule('remote-storage')});
window.addEventListener('pageshow',()=>schedule('force'));
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')schedule('force')});
// Forms/buttons may render before persistence completes; verify once on the next frame.
document.addEventListener('submit',e=>{if(e.target?.id==='ticketForm')requestAnimationFrame(()=>schedule('form-save'))},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#saveStampBtn,.action-btn,.attempt-count,.attempt-minus,.status-click-btn,[data-ticket-status]'))requestAnimationFrame(()=>schedule('ticket-action'))},true);
})();