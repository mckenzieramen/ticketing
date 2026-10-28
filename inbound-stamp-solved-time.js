(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const getTickets=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
let queued=false;
function apply(){queued=false;const body=document.getElementById('ticketTableBody');if(!body)return;const tickets=getTickets(),byNumber=new Map(tickets.map(t=>[String(t.number||'').trim(),t]));body.querySelectorAll('tr').forEach(row=>{const cells=row.cells;if(!cells||cells.length<6)return;const number=(cells[1]?.textContent||'').trim(),ticket=byNumber.get(number);if(!ticket)return;const solvedCell=cells[5];if(ticket.callType==='Inbound Call'&&ticket.stampedTime){solvedCell.textContent=ticket.stampedTime;solvedCell.dataset.inboundStamp='1';solvedCell.title='Inbound stamped time'}else if(solvedCell.dataset.inboundStamp==='1'){solvedCell.textContent=ticket.solvedTime||'—';delete solvedCell.dataset.inboundStamp;solvedCell.removeAttribute('title')}})}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}
const body=document.getElementById('ticketTableBody');if(body)new MutationObserver(schedule).observe(body,{childList:true,subtree:true});
window.addEventListener('ticket-data-updated',schedule);window.addEventListener('storage',e=>{if(!e.key||e.key===KEY)schedule()});schedule();
})();
