(()=>{'use strict';
const KEY='premiumTicketTracker.v1',TERMINAL=new Set(['Solved','Closed','Merged']);
const SELECTOR='#ticketTableBody .ticket-status-select, #recentTicketsList .ticket-status-select';
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function storedStatus(select){const id=String(select?.dataset?.id||'');const t=read().find(x=>String(x.id)===id);return String(t?.status||select?.dataset?.previousStatus||select?.value||'').trim()}
function decorate(select){
  if(!select)return;
  const status=storedStatus(select),locked=TERMINAL.has(status);
  select.disabled=false;
  select.classList.toggle('terminal-status-locked',locked);
  select.dataset.previousStatus=status;
  if(locked){
    select.setAttribute('title','Completed ticket. You can change it, but confirmation is required.');
    select.setAttribute('aria-label',`${status} completed status. Confirmation required to change.`);
  }else select.removeAttribute('title');
}
function apply(){document.querySelectorAll(SELECTOR).forEach(decorate)}
function ensureStyle(){if(document.getElementById('terminalStatusLockStyle'))return;const s=document.createElement('style');s.id='terminalStatusLockStyle';s.textContent=`.ticket-status-select.terminal-status-locked{background:#eef1f4!important;border-color:#c8d0d8!important;color:#7a8794!important;cursor:pointer!important;opacity:.86!important;filter:grayscale(.4)!important}.ticket-status-select.terminal-status-locked:hover,.ticket-status-select.terminal-status-locked:focus{opacity:1!important;border-color:#8e9ba8!important;box-shadow:0 0 0 2px rgba(100,116,139,.12)!important}.ticket-status-control:has(.terminal-status-locked) .solved-countdown{opacity:.72}`;document.head.appendChild(s)}
ensureStyle();apply();
let frame=0;const schedule=()=>{if(frame)return;frame=requestAnimationFrame(()=>{frame=0;apply()})};
const observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
['ticket-records-rendered','ticket-record-saved','ticket-data-updated','ticket-ui-updated','ticket-live-sync','tracker-view-changed'].forEach(name=>window.addEventListener(name,schedule));
// Capture before the All Tickets and Recent 5 renderers so a cancelled change never reaches their save handlers.
document.addEventListener('change',e=>{
  const s=e.target.closest?.(SELECTOR);if(!s)return;
  const old=storedStatus(s),next=String(s.value||'').trim();
  if(TERMINAL.has(old)&&old!==next){
    const ok=window.confirm(`This ticket is already ${old}. Are you sure you want to change the status to ${next}?`);
    if(!ok){e.preventDefault();e.stopImmediatePropagation();s.value=old;decorate(s);return}
  }
  s.dataset.previousStatus=next;
  requestAnimationFrame(()=>decorate(s));
},true);
})();