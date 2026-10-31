(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const ACTIVE=new Set(['open','pending','on hold']);
const $=id=>document.getElementById(id);
function getTickets(){try{const raw=window.FirebaseOnlyMemory?.get?.(KEY)??localStorage.getItem(KEY)??'[]';const a=JSON.parse(raw);return Array.isArray(a)?a:[]}catch{return[]}}
function ensure(){const host=document.querySelector('.metric-grid');if(!host||$('ticketsNeedingUpdateMetric'))return;const old=$('closingRecovery')?.parentElement;if(old)old.style.display='none';const box=document.createElement('div');box.className='metric';box.id='ticketsNeedingUpdateMetric';box.innerHTML='<small>Tickets To Chase</small><strong id="ticketsNeedingUpdate">0</strong><em id="ticketsNeedingUpdateSub">Open 0 · Pending 0 · On Hold 0</em>';host.appendChild(box)}
function render(){ensure();const data=getTickets(),c={open:0,pending:0,'on hold':0};for(const t of data){const s=String(t.status||'').trim().toLowerCase();if(ACTIVE.has(s))c[s]++}const total=c.open+c.pending+c['on hold'];const n=$('ticketsNeedingUpdate'),sub=$('ticketsNeedingUpdateSub'),metric=$('ticketsNeedingUpdateMetric');if(n){n.textContent=String(total);n.style.color=total?'#c77a00':'#087a43'}if(sub)sub.textContent=`Open ${c.open} · Pending ${c.pending} · On Hold ${c['on hold']}`;if(metric){const small=metric.querySelector('small');if(small)small.textContent='Tickets To Chase'}}
let f=0;function schedule(){if(f)return;f=requestAnimationFrame(()=>{f=0;render()})}
render();
['ticket-records-rendered','ticket-ui-updated','ticket-data-updated','firebase-memory-write','ticket-live-sync','firebase-data-saved','call-attempt-updated','tracker-view-changed'].forEach(e=>window.addEventListener(e,schedule));
window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)schedule()});
setTimeout(schedule,250);setTimeout(schedule,1000);
})();