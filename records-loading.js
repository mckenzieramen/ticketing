(()=>{'use strict';
const panel=document.querySelector('.records-panel'),state=document.getElementById('recordsLoading');
if(!panel||!state)return;
let generation=0;
function start(){generation++;panel.classList.add('records-loading');panel.classList.remove('records-load-error');panel.setAttribute('aria-busy','true');state.innerHTML='<span class="records-spinner" aria-hidden="true"></span><strong>Loading records…</strong><small>Please wait while your tickets are prepared.</small>'}
function ready(){const current=generation;requestAnimationFrame(()=>{if(current!==generation)return;try{const list=JSON.parse(localStorage.getItem('premiumTicketTracker.v1')||'[]');window.instantRenderTicketRecords?.(list);requestAnimationFrame(()=>{if(current!==generation)return;panel.classList.remove('records-loading','records-load-error');panel.setAttribute('aria-busy','false');window.dispatchEvent(new CustomEvent('ticket-records-ready'))})}catch{fail()}})}
function fail(){generation++;panel.classList.remove('records-loading');panel.classList.add('records-load-error');panel.setAttribute('aria-busy','false');state.innerHTML='<strong>Unable to load records</strong><small>Please check your connection and try again.</small><button type="button">Try again</button>';state.querySelector('button').onclick=()=>location.reload()}
window.TicketRecordsLoading={start,ready,fail};
})();
