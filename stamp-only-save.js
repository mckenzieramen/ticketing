(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');
if(!btn)return;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)};
const sync=t=>{localStorage.setItem(KEY,JSON.stringify(t));window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets:t,source:'stamp-only-save'}}));};
const clear=()=>{const ids=['stampTicket','answerTime','stampedTime'];ids.forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});const st=document.getElementById('stampStatus');if(st)st.value='Open';const box=document.getElementById('pickupResult');if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Stamp now, save immediately, then edit the record later.</em></div></div>'}};
btn.addEventListener('click',e=>{
 const number=(document.getElementById('stampTicket')?.value||'').trim();
 const stamped=(document.getElementById('stampedTime')?.value||'').trim();
 const answer=(document.getElementById('answerTime')?.value||'').trim();
 if(number||!stamped||answer)return;
 e.preventDefault();e.stopImmediatePropagation();
 const tickets=read();
 const record={id:crypto.randomUUID(),number:'',callType:'Inbound Call',creation:'',status:'Open',solvedTime:'',expectedClose:'',closedTime:'',closeReason:'',pickupSeconds:null,stampedTime:stamped,answerTime:'',stampOnly:true,stampSavedAt:new Date().toISOString()};
 tickets.unshift(record);sync(tickets);clear();toast('Stamp saved. Add the ticket details later using Edit.');
},true);

// Make stamp-only records easy to complete later while preserving the original stamp.
const previousEdit=window.editTicket;
window.editTicket=id=>{
 const t=read().find(x=>x.id===id);
 if(t&&t.callType==='Inbound Call'){
   const num=document.getElementById('stampTicket'),stamp=document.getElementById('stampedTime'),answer=document.getElementById('answerTime'),status=document.getElementById('stampStatus');
   if(num)num.value=t.number||'';if(stamp)stamp.value=t.stampedTime||'';if(answer)answer.value=t.answerTime||'';if(status)status.value=t.status==='Closed'?'Solved':(t.status||'Open');
   window.__editingStampRecordId=id;
   btn.textContent='▣   Update Inbound Ticket';
   window.scrollTo({top:0,behavior:'smooth'});toast(t.stampOnly?'Saved stamp loaded. Complete the ticket details.':'Inbound ticket loaded for editing.');return;
 }
 if(typeof previousEdit==='function')previousEdit(id);
};

// When completing a saved stamp, update that exact record instead of creating a duplicate.
btn.addEventListener('click',e=>{
 const id=window.__editingStampRecordId;if(!id)return;
 const number=(document.getElementById('stampTicket')?.value||'').trim();if(!number)return;
 const stamped=(document.getElementById('stampedTime')?.value||'').trim();
 const answer=(document.getElementById('answerTime')?.value||'').trim();
 e.preventDefault();e.stopImmediatePropagation();
 let tickets=read(),t=tickets.find(x=>x.id===id);if(!t)return;
 if(tickets.some(x=>x.id!==id&&String(x.number||'').toLowerCase()===number.toLowerCase())){toast('Ticket number already exists.');return}
 const status=document.getElementById('stampStatus')?.value||'Open';
 t.number=number;t.status=status;t.callType='Inbound Call';t.stampedTime=stamped||t.stampedTime;t.answerTime=answer.replace(/\s*UTC\s*$/i,'').replace('T',' ');t.creation=t.answerTime||t.creation||t.stampedTime;t.stampOnly=false;
 if(stamped&&answer&&typeof window.calculatePickup==='function'){const sec=window.calculatePickup();if(sec!==null&&Number.isFinite(Number(sec)))t.pickupSeconds=Number(sec)}
 sync(tickets);window.__editingStampRecordId=null;btn.textContent='▣   Save Inbound Ticket';clear();toast('Saved stamp updated with ticket details.');
},true);
})();