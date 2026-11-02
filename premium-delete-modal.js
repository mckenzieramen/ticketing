(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const style=document.createElement('style');style.textContent=`
.pdm-backdrop{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,15,31,.58);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .18s ease,visibility .18s ease}.pdm-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}.pdm-card{width:min(430px,calc(100vw - 32px));background:linear-gradient(180deg,#fff 0%,#fbfdff 100%);border:1px solid rgba(219,229,241,.95);border-radius:24px;box-shadow:0 30px 90px rgba(3,24,51,.34),0 8px 30px rgba(3,24,51,.12);padding:28px;transform:translateY(12px) scale(.97);transition:transform .2s cubic-bezier(.2,.8,.2,1);font-family:Inter,sans-serif}.pdm-backdrop.open .pdm-card{transform:none}.pdm-top{display:flex;align-items:flex-start;gap:15px}.pdm-icon{flex:0 0 52px;width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(145deg,#fff2f2,#ffe5e7);color:#e5484d}.pdm-copy{flex:1}.pdm-title{margin:2px 0 0;color:#102a43;font:800 20px/1.25 Inter,sans-serif}.pdm-text{margin:8px 0 0;color:#6b7c93;font:500 13px/1.6 Inter,sans-serif}.pdm-ticket{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding:12px 14px;border:1px solid #e6edf5;border-radius:12px;background:#f7fafe}.pdm-ticket small{color:#7b8da6;font:600 11px Inter,sans-serif}.pdm-ticket strong{color:#183b56;font:800 13px Inter,sans-serif}.pdm-warning{margin-top:12px;padding:10px 12px;border-radius:10px;background:#fff8f0;color:#9a5b13;font:600 11px/1.45 Inter,sans-serif}.pdm-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.pdm-btn{border:0;border-radius:12px;padding:12px 16px;font:700 13px Inter,sans-serif;cursor:pointer}.pdm-btn:disabled{opacity:.65;cursor:wait}.pdm-cancel{background:#eef3f8;color:#334e68}.pdm-delete{background:linear-gradient(135deg,#ef5358,#df3e45);color:#fff}.action-btn.delete{position:relative;z-index:2;cursor:pointer;pointer-events:auto!important}`;
document.head.appendChild(style);

const modal=document.createElement('div');modal.className='pdm-backdrop';modal.innerHTML=`<div class="pdm-card"><div class="pdm-top"><div class="pdm-icon">🗑</div><div class="pdm-copy"><h2 class="pdm-title">Delete this ticket?</h2><p class="pdm-text">You’re about to permanently remove this record from Ticket Tracking.</p></div></div><div class="pdm-ticket"><small>Ticket record</small><strong id="pdmTicket">—</strong></div><div class="pdm-warning">⚠ This action cannot be undone once the ticket is deleted.</div><div class="pdm-actions"><button type="button" class="pdm-btn pdm-cancel">Cancel</button><button type="button" class="pdm-btn pdm-delete">Delete Ticket</button></div></div>`;
document.body.appendChild(modal);

let pendingId=null,pendingNumber='',lastTrigger=null;
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function hide(){modal.classList.remove('open');pendingId=null;pendingNumber='';lastTrigger=null}
function show(id,number,trigger){if(!id)return;pendingId=String(id);pendingNumber=String(number||'');lastTrigger=trigger||null;document.getElementById('pdmTicket').textContent=number?`#${number}`:'Ticket record';modal.classList.add('open')}
function removeRows(id){document.querySelectorAll(`[data-ticket-id="${CSS.escape(String(id))}"]`).forEach(r=>r.remove())}
function exactId(btn){const row=btn.closest('tr');if(row?.dataset.ticketId)return String(row.dataset.ticketId);if(btn.dataset.id)return String(btn.dataset.id);const m=(btn.getAttribute('onclick')||'').match(/deleteTicket\(['"]([^'"]+)['"]\)/);return m?m[1]:''}
function open(btn){const data=read(),id=exactId(btn),row=btn.closest('tr');let t=id?data.find(x=>String(x.id)===id):null;if(!t){const n=String(row?.children?.[1]?.textContent||'').trim(),matches=data.filter(x=>String(x.number||'').trim()===n);if(matches.length===1)t=matches[0]}if(t)show(t.id,t.number,btn)}

modal.querySelector('.pdm-cancel').onclick=hide;
modal.addEventListener('click',e=>{if(e.target===modal)hide()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))hide()});

modal.querySelector('.pdm-delete').addEventListener('click',async()=>{
 if(!pendingId)return;
 const id=String(pendingId),number=pendingNumber,btn=modal.querySelector('.pdm-delete');
 btn.disabled=true;btn.textContent='Deleting…';
 try{
  const before=read(),after=before.filter(x=>String(x.id)!==id);
  if(after.length===before.length)throw new Error('Ticket not found');
  localStorage.setItem(KEY,JSON.stringify(after));
  removeRows(id);
  if(window.FirebaseTicketPersistence?.deleteTicket)await window.FirebaseTicketPersistence.deleteTicket(id);
  window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{type:'delete',id,number}}));
  window.dispatchEvent(new CustomEvent('ticket-record-deleted',{detail:{id,number}}));
  window.dispatchEvent(new Event('call-attempt-updated'));
  hide();
  try{toast('Ticket permanently deleted.')}catch{}
 }catch(e){
  console.error('Ticket delete failed',e);
  try{toast('Delete could not be saved to Firebase. Please retry.')}catch{}
 }finally{btn.disabled=false;btn.textContent='Delete Ticket'}
});

window.deleteTicket=id=>{const t=read().find(x=>String(x.id)===String(id));if(t)show(t.id,t.number)};
document.addEventListener('pointerdown',e=>{const btn=e.target.closest?.('.action-btn.delete');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();open(btn)},true);
document.addEventListener('click',e=>{const btn=e.target.closest?.('.action-btn.delete');if(!btn)return;e.preventDefault();e.stopImmediatePropagation();if(!modal.classList.contains('open'))open(btn)},true);
})();