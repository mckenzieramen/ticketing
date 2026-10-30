(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');
if(!btn)return;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const validTime=v=>/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/.test(String(v||'').trim().replace(/\s*UTC\s*$/i,''));
const cleanUTC=v=>String(v||'').trim().replace(/\s*UTC\s*$/i,'').replace('T',' ');
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)};
const sync=t=>{localStorage.setItem(KEY,JSON.stringify(t));window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets:t,source:'stamp-editor'}}));window.dispatchEvent(new CustomEvent('ticket-data-updated',{detail:{source:'stamp-editor'}}));};
function lifecycle(t,status){const now=fmt(new Date());let solvedTime=t.solvedTime||'',expectedClose=t.expectedClose||'',closedTime=t.closedTime||'',closeReason=t.closeReason||'';if(status==='Solved'&&t.status!=='Solved'){solvedTime=now;expectedClose=fmt(new Date(Date.now()+86400000));closedTime='';closeReason=''}else if(status==='Merged'){closedTime=now;expectedClose='';closeReason='Merged'}else if(status==='Closed'){closedTime=closedTime||now;expectedClose='';closeReason=closeReason||'Closed manually'}else if(!['Solved','Merged','Closed'].includes(status)){solvedTime='';expectedClose='';closedTime='';closeReason=''}return{solvedTime,expectedClose,closedTime,closeReason}}
const resetPickup=()=>{const box=document.getElementById('pickupResult');if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Add Answer Time when available to calculate pickup seconds.</em></div></div>'}};
const clear=()=>{['stampTicket','answerTime','stampedTime'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});const st=document.getElementById('stampStatus');if(st)st.value='Open';resetPickup();window.__editingStampRecordId=null;btn.textContent='▣   Save Stamp / Inbound Ticket';btn.dataset.mode='new';};

// Quick queue save: Stamp Time alone can be saved immediately.
btn.addEventListener('click',e=>{if(window.__editingStampRecordId)return;const number=(document.getElementById('stampTicket')?.value||'').trim(),stamped=(document.getElementById('stampedTime')?.value||'').trim(),answer=(document.getElementById('answerTime')?.value||'').trim();if(number||answer||!stamped)return;e.preventDefault();e.stopImmediatePropagation();if(!validTime(stamped)){toast('Check the Stamp Time format.');return}const tickets=read();tickets.unshift({id:crypto.randomUUID(),number:'',callType:'Inbound Call',creation:stamped,status:'Open',solvedTime:'',expectedClose:'',closedTime:'',closeReason:'',pickupSeconds:null,stampedTime:stamped,answerTime:'',stampOnly:true,stampSavedAt:new Date().toISOString()});sync(tickets);clear();toast('Stamp saved. Use the pen icon in History to complete it later.');},true);

// History pen icon: load the SAME record into the inbound editor with every field editable.
const previousEdit=window.editTicket;
window.editTicket=id=>{const t=read().find(x=>x.id===id);if(t&&t.callType==='Inbound Call'){
 const num=document.getElementById('stampTicket'),stamp=document.getElementById('stampedTime'),answer=document.getElementById('answerTime'),status=document.getElementById('stampStatus');
 if(num){num.value=t.number||'';num.disabled=false;num.readOnly=false}
 if(stamp){stamp.value=t.stampedTime||t.creation||'';stamp.disabled=false;stamp.readOnly=false}
 if(answer){answer.value=t.answerTime||'';answer.disabled=false;answer.readOnly=false}
 if(status){status.disabled=false;status.value=['Open','Pending','On Hold','Solved','Closed','Merged'].includes(t.status)?t.status:'Open'}
 window.__editingStampRecordId=id;btn.dataset.mode='edit';btn.textContent='✓   Save Changes';
 if(t.answerTime&&typeof window.calculatePickup==='function')window.calculatePickup();else resetPickup();
 document.querySelector('.stamp-panel')?.scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(()=>{(num&&!num.value?num:answer&&!answer.value?answer:status)?.focus?.()},350);
 toast('History record opened. Add missing details or change the Status, then Save Changes.');return}
 if(typeof previousEdit==='function')previousEdit(id)};

// Edit/update is always partial. Missing Ticket Number or Answer Time never blocks Status/Stamp edits.
btn.addEventListener('click',e=>{const id=window.__editingStampRecordId;if(!id)return;e.preventDefault();e.stopImmediatePropagation();const number=(document.getElementById('stampTicket')?.value||'').trim(),stamped=(document.getElementById('stampedTime')?.value||'').trim(),answerRaw=(document.getElementById('answerTime')?.value||'').trim(),status=document.getElementById('stampStatus')?.value||'Open';if(!stamped||!validTime(stamped)){toast('Stamp Time is required: YYYY-MM-DD HH:mm:ss.');return}if(answerRaw&&!validTime(answerRaw)){toast('Check the Answer Time format.');return}let tickets=read(),t=tickets.find(x=>x.id===id);if(!t)return;if(number&&tickets.some(x=>x.id!==id&&String(x.number||'').toLowerCase()===number.toLowerCase())){toast('Ticket number already exists.');return}
 const oldStatus=t.status||'Open';
 t.number=number;t.callType='Inbound Call';t.stampedTime=stamped;t.creation=t.creation||stamped;t.answerTime=answerRaw?cleanUTC(answerRaw):'';
 Object.assign(t,lifecycle(t,status));t.status=status;
 if(answerRaw&&typeof window.calculatePickup==='function'){const sec=window.calculatePickup();if(sec===null||!Number.isFinite(Number(sec))){toast('Check Stamp Time and Answer Time. Pickup seconds could not be calculated.');return}t.pickupSeconds=Number(sec)}else t.pickupSeconds=null;
 // A record remains editable from History whether complete or incomplete.
 t.stampOnly=!(number&&answerRaw);t.lastEditedAt=new Date().toISOString();sync(tickets);
 const msg=t.pickupSeconds==null?`Saved changes · Status: ${status}`:`Saved changes · Pickup: ${t.pickupSeconds} sec · Status: ${status}`;
 clear();toast(msg+(oldStatus!==status?` (${oldStatus} → ${status})`:''));
},true);
})();