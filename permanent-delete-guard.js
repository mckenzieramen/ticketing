(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1',DELETED_KEY='premiumTicketTracker.deletedTicketIds.v1';
function deleted(){try{const v=JSON.parse(localStorage.getItem(DELETED_KEY)||'[]');return new Set(Array.isArray(v)?v.map(String):[])}catch{return new Set()}}
function tickets(){try{const v=JSON.parse(localStorage.getItem(TICKET_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function save(s){localStorage.setItem(DELETED_KEY,JSON.stringify([...s]))}
let applying=false;
function apply(reason='delete-guard'){
 if(applying)return false;
 const d=deleted();if(!d.size)return false;
 const before=tickets(),after=before.filter(t=>!d.has(String(t?.id??'')));
 if(after.length===before.length)return false;
 applying=true;try{localStorage.setItem(TICKET_KEY,JSON.stringify(after))}finally{applying=false}
 window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{type:'delete-guard',reason}}));
 return true
}
function remember(id){id=String(id??'');if(!id)return;const d=deleted();d.add(id);save(d);apply('remember')}
window.addEventListener('ticket-record-deleted',e=>remember(e.detail?.id));
window.addEventListener('ticket-live-sync',()=>setTimeout(()=>apply('firebase-live-sync'),0));
window.addEventListener('firebase-data-saved',()=>setTimeout(()=>apply('firebase-data-saved'),0));
window.addEventListener('ticket-data-updated',e=>{if(e.detail?.type!=='delete-guard')setTimeout(()=>apply('ticket-data-updated'),0)});
document.addEventListener('DOMContentLoaded',()=>apply('startup'));
window.PermanentTicketDeleteGuard={remember,apply,deletedIds:()=>[...deleted()]};
})();