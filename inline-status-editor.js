(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const statuses=['Open','Pending','On Hold','Solved','Merged'];
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const parse=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null};
function life(t,status){const now=fmt(new Date());let solvedTime=t.solvedTime||'',expectedClose=t.expectedClose||'',closedTime=t.closedTime||'',closeReason=t.closeReason||'';
 if(status==='Solved'&&t.status!=='Solved'){solvedTime=now;const d=parse(now);expectedClose=fmt(new Date(d.getTime()+86400000));closedTime='';closeReason=''}
 if(status==='Merged'){closedTime=now;expectedClose='';closeReason='Merged'}
 if(!['Solved','Merged','Closed'].includes(status)&&t.status!=='Closed'){solvedTime='';expectedClose='';closedTime='';closeReason=''}
 return{solvedTime,expectedClose,closedTime,closeReason};}
function enhance(){document.querySelectorAll('#ticketTableBody tr').forEach(row=>{const cell=row.children[4];if(!cell||cell.querySelector('.inline-status-select'))return;const number=row.children[1]?.textContent.trim();let list=[];try{list=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}const t=list.find(x=>String(x.number).trim()===number);if(!t)return;
 const select=document.createElement('select');select.className='inline-status-select';select.setAttribute('aria-label',`Change status for ticket ${number}`);const opts=t.status==='Closed'?['Closed',...statuses]:statuses;select.innerHTML=opts.map(s=>`<option value="${s}"${s===t.status?' selected':''}>${s}</option>`).join('');cell.innerHTML='';cell.appendChild(select);
 select.addEventListener('change',()=>{let data=[];try{data=JSON.parse(localStorage.getItem(KEY)||'[]')}catch{}const item=data.find(x=>String(x.number).trim()===number);if(!item)return;const status=select.value;Object.assign(item,{status,...life(item,status)});localStorage.setItem(KEY,JSON.stringify(data));location.reload();});});}
const style=document.createElement('style');style.textContent='.inline-status-select{min-width:92px;border:1px solid #d7e0ec;border-radius:7px;padding:6px 24px 6px 8px;font:600 12px Inter,sans-serif;background:#fff;color:#26364d;cursor:pointer;outline:none}.inline-status-select:focus{border-color:#2f80ed;box-shadow:0 0 0 3px rgba(47,128,237,.12)}';document.head.appendChild(style);
const body=document.getElementById('ticketTableBody');if(body)new MutationObserver(enhance).observe(body,{childList:true,subtree:true});enhance();
})();