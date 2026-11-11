(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');if(!btn)return;
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const clean=v=>String(v||'').trim().replace(/\s*UTC\s*$/i,'').replace('T',' ').replace(/\s+/g,' ');
const phToUTC=v=>{let s=clean(v).replace(/^2026-\s*/,'');const m=s.match(/^(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);if(!m)return'';const d=new Date(Date.UTC(2026,+m[1]-1,+m[2],+m[3]-8,+m[4],+m[5]));return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`};
const parseUTC=v=>{const m=clean(v).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);return m?Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null};
const calcPickup=(callUTC,answerUTC)=>{const a=parseUTC(callUTC),b=parseUTC(answerUTC);if(a==null||b==null||b<a)return null;return Math.round((b-a)/1000)};
const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const write=t=>{localStorage.setItem(KEY,JSON.stringify(t));window.dispatchEvent(new CustomEvent('ticket-record-saved',{detail:{tickets:t,source:'inbound-flex-save'}}))};
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1800)};
function life(t,status,now){if(status==='Solved'&&t?.status!=='Solved'){const d=new Date(Date.now()+86400000);return{solvedTime:now,expectedClose:fmt(d),closedTime:'',closeReason:''}}if(status==='Merged')return{solvedTime:t?.solvedTime||'',expectedClose:'',closedTime:now,closeReason:'Merged'};if(status==='Closed')return{solvedTime:t?.solvedTime||'',expectedClose:'',closedTime:t?.closedTime||now,closeReason:t?.closeReason||'Closed manually'};if(!['Solved','Merged'].includes(status))return{solvedTime:'',expectedClose:'',closedTime:'',closeReason:''};return{solvedTime:t?.solvedTime||'',expectedClose:t?.expectedClose||'',closedTime:t?.closedTime||'',closeReason:t?.closeReason||''}}
function clear(){['stampTicket','answerTime'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});const call=document.getElementById('stampedTime');if(call){call.value='2026-';call.dataset.utc=''}const s=document.getElementById('stampStatus');if(s)s.value='Open';const box=document.getElementById('pickupResult');if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Enter PH Time of call and UTC Started at.</em></div></div>'}}
btn.addEventListener('click',e=>{
 const number=(document.getElementById('stampTicket')?.value||'').trim();
 const callInput=(document.getElementById('stampedTime')?.value||'').trim();
 const timeOfCallPH=callInput==='2026-'?'':callInput;
 const answerRaw=(document.getElementById('answerTime')?.value||'').trim();
 const status=document.getElementById('stampStatus')?.value||'Open';
 if(!number&&!timeOfCallPH&&!answerRaw&&status==='Open')return;
 e.preventDefault();e.stopImmediatePropagation();
 if(!number){toast('Enter Ticket Number to save the inbound information.');return}
 let tickets=read();let t=tickets.find(x=>String(x.number||'').toLowerCase()===number.toLowerCase());
 if(t&&t.callType!=='Inbound Call'){toast('This ticket already exists as an Outbound Call.');return}
 const now=fmt(new Date()),answerUTC=answerRaw?clean(answerRaw):'',timeOfCallUTC=timeOfCallPH?phToUTC(timeOfCallPH):'';
 if(timeOfCallPH&&!timeOfCallUTC){toast('Use a valid PH Time of call: 2026-MM-DD HH:mm:ss');return}
 let pickup=null;
 if(timeOfCallUTC&&answerUTC)pickup=calcPickup(timeOfCallUTC,answerUTC);
 const lifecycle=life(t,status,now);
 // Ticket Creation is when the ticket record was saved/created. Time of call is kept separately.
 const ticketCreation=t?.ticketCreation||t?.creation||now;
 if(!t){t={id:crypto.randomUUID(),addedAt:new Date().toISOString(),number,callType:'Inbound Call',creation:now,ticketCreation:now,status,...lifecycle,pickupSeconds:pickup,timeOfCallPH:clean(timeOfCallPH),timeOfCallUTC,answerTime:answerUTC,stampOnly:false};tickets.unshift(t)}
 else{Object.assign(t,{number,callType:'Inbound Call',status,...lifecycle,ticketCreation,creation:ticketCreation,timeOfCallPH:timeOfCallPH?clean(timeOfCallPH):(t.timeOfCallPH||''),timeOfCallUTC:timeOfCallUTC||(t.timeOfCallUTC||''),answerTime:answerUTC||t.answerTime||'',pickupSeconds:pickup??t.pickupSeconds??null,stampOnly:false})}
 write(tickets);clear();
 if(timeOfCallPH&&answerRaw&&pickup!==null)toast(`Inbound saved. Pickup Time: ${pickup} seconds.`);
 else if(timeOfCallPH)toast('Inbound saved. PH Time of call stored separately from Ticket Creation.');
 else toast('Inbound information saved.');
},true);
})();