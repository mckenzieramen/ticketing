(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');if(!btn)return;
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const cleanUTC=v=>String(v||'').trim().replace(/\s*UTC\s*$/i,'').replace('T',' ');
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const write=t=>{localStorage.setItem(KEY,JSON.stringify(t));window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets:t,source:'inbound-flex-save'}}))};
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)};
function life(t,status,now){if(status==='Solved'&&t?.status!=='Solved'){const d=new Date(Date.now()+86400000);return{solvedTime:now,expectedClose:fmt(d),closedTime:'',closeReason:''}}if(status==='Merged')return{solvedTime:t?.solvedTime||'',expectedClose:'',closedTime:now,closeReason:'Merged'};if(status==='Closed')return{solvedTime:t?.solvedTime||'',expectedClose:'',closedTime:t?.closedTime||now,closeReason:t?.closeReason||'Closed manually'};if(!['Solved','Merged'].includes(status))return{solvedTime:'',expectedClose:'',closedTime:'',closeReason:''};return{solvedTime:t?.solvedTime||'',expectedClose:t?.expectedClose||'',closedTime:t?.closedTime||'',closeReason:t?.closeReason||''}}
function clear(){['stampTicket','answerTime','stampedTime'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});const s=document.getElementById('stampStatus');if(s)s.value='Open';const box=document.getElementById('pickupResult');if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>You can save Ticket Number / Status even without Stamp Time.</em></div></div>'}}
btn.addEventListener('click',e=>{
 const number=(document.getElementById('stampTicket')?.value||'').trim();
 const stamped=(document.getElementById('stampedTime')?.value||'').trim();
 const answerRaw=(document.getElementById('answerTime')?.value||'').trim();
 const status=document.getElementById('stampStatus')?.value||'Open';
 // This handler owns any save that contains non-stamp information. A stamp-only save is handled by stamp-only-save.js.
 if(!number&&!answerRaw&&status==='Open')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!number){toast('Enter Ticket Number to save the inbound information.');return}
 let tickets=read();let t=tickets.find(x=>String(x.number||'').toLowerCase()===number.toLowerCase());
 if(t&&t.callType!=='Inbound Call'){toast('This ticket already exists as an Outbound Call.');return}
 const now=fmt(new Date()),answerUTC=answerRaw?cleanUTC(answerRaw):'';
 let pickup=null;
 if(stamped&&answerRaw&&typeof window.calculatePickup==='function'){
   const sec=window.calculatePickup();
   if(sec!==null&&Number.isFinite(Number(sec)))pickup=Number(sec);
 }
 const lifecycle=life(t,status,now);
 const creation=t?.creation||answerUTC||stamped||now;
 if(!t){t={id:crypto.randomUUID(),number,callType:'Inbound Call',creation,status,...lifecycle,pickupSeconds:pickup,stampedTime:stamped,answerTime:answerUTC,stampOnly:false};tickets.unshift(t)}
 else{Object.assign(t,{number,callType:'Inbound Call',status,...lifecycle,stampedTime:stamped||t.stampedTime||'',answerTime:answerUTC||t.answerTime||'',pickupSeconds:pickup??t.pickupSeconds??null,stampOnly:false});if(!t.creation)t.creation=creation}
 write(tickets);clear();
 if(stamped&&answerRaw&&pickup!==null)toast('Inbound information and pickup time saved.');
 else if(stamped)toast('Inbound information saved with Stamp Time. Answer Time can be added later.');
 else if(answerRaw)toast('Inbound information saved with Answer Time. Stamp Time can be added later.');
 else toast('Inbound information saved without Stamp Time.');
},true);
})();