(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const getTickets=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const style=document.createElement('style');style.textContent=`.inbound-stamp-pill{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:7px;background:#eef6ff;color:#174b78;border:1px solid #cfe3f7;font-weight:800;white-space:nowrap}.inbound-stamp-pill::before{content:'◷';color:#1477e8;font-size:11px}.pickup-pill.pickup-good{background:#dcfce7!important;color:#137a45;border:1px solid #b7efce}.pickup-pill.pickup-warn{background:#fff4d6!important;color:#9a6500;border:1px solid #f8dda0}.pickup-pill.pickup-late{background:#ffe2e0!important;color:#b42318;border:1px solid #ffc9c5}.pickup-pill.pickup-empty{background:#eef2f6!important;color:#718096;border:1px solid #dde5ed}`;document.head.appendChild(style);
let queued=false;
function apply(){queued=false;const body=document.getElementById('ticketTableBody');if(!body)return;const tickets=getTickets(),byNumber=new Map(tickets.map(t=>[String(t.number||'').trim(),t]));body.querySelectorAll('tr').forEach(row=>{const cells=row.cells;if(!cells||cells.length<6)return;const number=(cells[1]?.textContent||'').trim(),ticket=byNumber.get(number);if(!ticket)return;
 const solvedCell=cells[5];if(ticket.callType==='Inbound Call'&&ticket.stampedTime){solvedCell.innerHTML=`<span class="inbound-stamp-pill">${String(ticket.stampedTime).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</span>`;solvedCell.dataset.inboundStamp='1';solvedCell.title='Inbound stamped time'}else if(solvedCell.dataset.inboundStamp==='1'){solvedCell.textContent=ticket.solvedTime||'—';delete solvedCell.dataset.inboundStamp;solvedCell.removeAttribute('title')}
 row.querySelectorAll('.pickup-pill').forEach(p=>{p.classList.remove('pickup-good','pickup-warn','pickup-late','pickup-empty');const sec=Number(ticket.pickupSeconds);if(ticket.pickupSeconds==null||!Number.isFinite(sec))p.classList.add('pickup-empty');else if(sec<=20)p.classList.add('pickup-good');else if(sec<=30)p.classList.add('pickup-warn');else p.classList.add('pickup-late')});
 })}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}
const body=document.getElementById('ticketTableBody');if(body)new MutationObserver(schedule).observe(body,{childList:true,subtree:true});
window.addEventListener('ticket-data-updated',schedule);window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)schedule()});schedule();
})();
