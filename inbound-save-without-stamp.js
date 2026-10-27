(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const btn=document.getElementById('saveStampBtn');
if(!btn)return;
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const write=t=>localStorage.setItem(KEY,JSON.stringify(t));
const toast=msg=>{const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)};
btn.addEventListener('click',e=>{
 const number=(document.getElementById('stampTicket')?.value||'').trim();
 const stamped=(document.getElementById('stampedTime')?.value||'').trim();
 const answer=(document.getElementById('answerTime')?.value||'').trim();
 if(!number||stamped||answer)return;
 e.preventDefault();e.stopImmediatePropagation();
 let tickets=read();let t=tickets.find(x=>String(x.number||'').toLowerCase()===number.toLowerCase());
 if(t&&t.callType!=='Inbound Call'){toast('This ticket already exists as an Outbound Call.');return}
 const status=document.getElementById('stampStatus')?.value||'Open',now=fmt(new Date());
 if(!t){t={id:crypto.randomUUID(),number,callType:'Inbound Call',creation:now,status,solvedTime:'',expectedClose:'',closedTime:'',closeReason:'',pickupSeconds:null,stampedTime:'',answerTime:''};tickets.unshift(t)}
 else{t.callType='Inbound Call';t.status=status;t.pickupSeconds=null;t.stampedTime='';t.answerTime='';if(!t.creation)t.creation=now}
 if(status==='Solved'){t.solvedTime=now;t.expectedClose=fmt(new Date(Date.now()+86400000));t.closedTime='';t.closeReason=''}
 else if(status==='Merged'){t.closedTime=now;t.expectedClose='';t.closeReason='Merged'}
 write(tickets);
 document.getElementById('stampTicket').value='';document.getElementById('stampStatus').value='Open';
 window.dispatchEvent(new Event('storage'));window.dispatchEvent(new Event('call-attempt-updated'));
 toast('Inbound ticket saved without stamp. Pickup rate not counted.');setTimeout(()=>location.reload(),350);
},true);
})();