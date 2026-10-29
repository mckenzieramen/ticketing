(()=>{'use strict';
function sourceTable(){return document.querySelector('.records-panel .table-scroll table')}
function ensure(){const workspace=document.querySelector('.workspace-grid');if(!workspace)return null;let panel=document.getElementById('recentTicketsPanel');if(panel)return panel;panel=document.createElement('article');panel.id='recentTicketsPanel';panel.className='panel recent-tickets-panel';panel.innerHTML='<div class="records-head recent-records-head"><div class="panel-title flat"><span>☷</span> Inbound & Outbound Recent Tickets <small>Latest 5 · Live from Ticket Records</small></div></div><div class="table-scroll recent-records-scroll"><table id="recentTicketsTable"><thead></thead><tbody id="recentTicketsList"></tbody></table></div>';
workspace.appendChild(panel);
const style=document.createElement('style');style.textContent=`.recent-tickets-panel{grid-column:1/-1;min-width:0}.recent-records-head{padding-bottom:0}.recent-records-head .panel-title small{margin-left:8px;color:#71859a;font-size:9px;font-weight:800}.recent-records-scroll{width:100%;overflow-x:auto}.recent-records-scroll table{width:100%;min-width:1080px}.recent-records-scroll tbody tr{display:table-row!important}.recent-records-scroll .recent-empty{text-align:center;padding:18px;color:#8190a0}.recent-records-scroll button{touch-action:manipulation}`;document.head.appendChild(style);
panel.addEventListener('click',e=>{const attempt=e.target.closest('.attempt-count,.attempt-minus');if(!attempt)return;const row=attempt.closest('tr'),number=String(row?.children[1]?.textContent||'').trim();if(!number)return;const sourceRow=[...document.querySelectorAll('#ticketTableBody tr')].find(r=>String(r.children[1]?.textContent||'').trim()===number);const sourceBtn=sourceRow?.querySelector(attempt.classList.contains('attempt-minus')?'.attempt-minus':'.attempt-count');if(sourceBtn&&!sourceBtn.disabled)sourceBtn.click()});
return panel}
let rendering=false;
function render(){if(rendering)return;rendering=true;try{const panel=ensure(),src=sourceTable();if(!panel||!src)return;const dst=panel.querySelector('#recentTicketsTable'),head=dst.querySelector('thead'),body=dst.querySelector('tbody');const srcHead=src.querySelector('thead');if(srcHead&&head.innerHTML!==srcHead.innerHTML)head.innerHTML=srcHead.innerHTML;const rows=[...src.querySelectorAll('tbody#ticketTableBody > tr')].slice(0,5);if(!rows.length){const cols=Math.max(1,srcHead?.querySelectorAll('th').length||1);body.innerHTML=`<tr><td colspan="${cols}" class="recent-empty">No recent inbound or outbound tickets yet.</td></tr>`;return}const html=rows.map(r=>{const c=r.cloneNode(true);c.removeAttribute('style');c.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));return c.outerHTML}).join('');if(body.innerHTML!==html)body.innerHTML=html}finally{rendering=false}}
// The source ticket table is rendered synchronously by app.js, so mirror it synchronously too.
// This removes the old two-animation-frame delay after Save Ticket / Save Stamp.
function syncNow(){render()}
const srcBody=document.getElementById('ticketTableBody');if(srcBody)new MutationObserver(syncNow).observe(srcBody,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
render();
window.addEventListener('ticket-data-updated',syncNow);
window.addEventListener('ticket-live-sync',syncNow);
window.addEventListener('call-attempt-updated',syncNow);
window.addEventListener('tracker-view-changed',e=>{if(e.detail?.view==='calls')syncNow()});
window.addEventListener('storage',syncNow);
// Capture saves at the UI boundary as a final no-delay fallback. The app submit/click handler
// runs in the same event turn; a microtask mirrors the completed source render immediately.
document.addEventListener('submit',e=>{if(e.target?.id==='ticketForm')queueMicrotask(syncNow)},true);
document.addEventListener('click',e=>{if(e.target.closest?.('#saveStampBtn'))queueMicrotask(syncNow)},true);
})();