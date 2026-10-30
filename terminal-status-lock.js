(()=>{'use strict';
const TERMINAL=new Set(['Solved','Closed','Merged']);
const SELECTOR='#ticketTableBody .ticket-status-select, #recentTicketsList .ticket-status-select';
function decorate(select){
  if(!select)return;
  const status=String(select.value||'').trim(),locked=TERMINAL.has(status);
  select.disabled=false;
  select.classList.toggle('terminal-status-locked',locked);
  select.dataset.previousStatus=status;
  if(locked){
    select.setAttribute('title','Completed ticket. Changing this status requires confirmation.');
    select.setAttribute('aria-label',`${status} completed status. Confirmation required to change.`);
  }else select.removeAttribute('title');
}
function apply(){document.querySelectorAll(SELECTOR).forEach(decorate)}
function ensureStyle(){if(document.getElementById('terminalStatusLockStyle'))return;const s=document.createElement('style');s.id='terminalStatusLockStyle';s.textContent=`.ticket-status-select.terminal-status-locked{background:#eef1f4!important;border-color:#c8d0d8!important;color:#7a8794!important;cursor:pointer!important;opacity:.86!important;filter:grayscale(.4)!important}.ticket-status-select.terminal-status-locked:hover{opacity:1!important;border-color:#9eabb7!important}.ticket-status-control:has(.terminal-status-locked) .solved-countdown{opacity:.72}`;document.head.appendChild(s)}
ensureStyle();apply();
const observer=new MutationObserver(()=>apply());observer.observe(document.body,{childList:true,subtree:true});
['ticket-records-rendered','ticket-record-saved','ticket-data-updated','ticket-ui-updated','ticket-live-sync','tracker-view-changed'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(apply)));
document.addEventListener('pointerdown',e=>{const s=e.target.closest?.(SELECTOR);if(s)s.dataset.previousStatus=String(s.value||'').trim()},true);
document.addEventListener('change',e=>{const s=e.target.closest?.(SELECTOR);if(!s)return;const old=String(s.dataset.previousStatus||'').trim(),next=String(s.value||'').trim();if(TERMINAL.has(old)&&old!==next){const ok=window.confirm(`This ticket is already ${old}. Are you sure you want to change the status to ${next}?`);if(!ok){e.preventDefault();e.stopImmediatePropagation();s.value=old;decorate(s);return}}s.dataset.previousStatus=next;requestAnimationFrame(()=>decorate(s))},true);
})();