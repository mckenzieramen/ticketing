(()=>{'use strict';
const TERMINAL=new Set(['Solved','Closed','Merged']);
function lockSelect(select){
  if(!select)return;
  const status=String(select.value||'').trim();
  const locked=TERMINAL.has(status);
  select.disabled=locked;
  select.classList.toggle('terminal-status-locked',locked);
  if(locked){
    select.setAttribute('title','Completed status is locked. Use Edit if you intentionally need to change this ticket.');
    select.setAttribute('aria-label',`${status} status locked. Use Edit to change intentionally.`);
  }else{
    select.removeAttribute('title');
  }
}
function apply(){
  document.querySelectorAll('#ticketTableBody .ticket-status-select, #recentTicketsList .ticket-status-select').forEach(lockSelect);
}
function ensureStyle(){
  if(document.getElementById('terminalStatusLockStyle'))return;
  const s=document.createElement('style');
  s.id='terminalStatusLockStyle';
  s.textContent=`.ticket-status-select.terminal-status-locked:disabled{background:#eef1f4!important;border-color:#c8d0d8!important;color:#7a8794!important;cursor:not-allowed!important;opacity:.82!important;filter:grayscale(.45)!important}.ticket-status-control:has(.terminal-status-locked) .solved-countdown{opacity:.72}`;
  document.head.appendChild(s);
}
ensureStyle();apply();
const observer=new MutationObserver(()=>apply());
observer.observe(document.body,{childList:true,subtree:true});
['ticket-records-rendered','ticket-record-saved','ticket-data-updated','ticket-ui-updated','ticket-live-sync','tracker-view-changed'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(apply)));
document.addEventListener('change',e=>{
  const s=e.target.closest?.('#ticketTableBody .ticket-status-select, #recentTicketsList .ticket-status-select');
  if(s)requestAnimationFrame(()=>lockSelect(s));
},true);
})();