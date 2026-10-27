(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
const statuses=['Open','Pending','On Hold','Solved','Closed','Merged'];
const colors={Open:'#39a7e8',Pending:'#f7b916','On Hold':'#ef4c4c',Solved:'#16b86c',Closed:'#728296',Merged:'#7c3aed'};
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const parse=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null};
function life(t,status){const now=fmt(new Date());let solvedTime=t.solvedTime||'',expectedClose=t.expectedClose||'',closedTime=t.closedTime||'',closeReason=t.closeReason||'';
 if(status==='Solved'&&t.status!=='Solved'){solvedTime=now;const d=parse(now);expectedClose=fmt(new Date(d.getTime()+86400000));closedTime='';closeReason=''}
 if(status==='Closed'&&t.status!=='Closed'){closedTime=now;expectedClose='';closeReason='Manually Closed'}
 if(status==='Merged'){closedTime=now;expectedClose='';closeReason='Merged'}
 if(!['Solved','Merged','Closed'].includes(status)&&t.status!=='Closed'){solvedTime='';expectedClose='';closedTime='';closeReason=''}
 return{solvedTime,expectedClose,closedTime,closeReason};}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}}
function saveStatus(number,status){const data=read(),item=data.find(x=>String(x.number).trim()===number);if(!item)return;Object.assign(item,{status,...life(item,status)});localStorage.setItem(KEY,JSON.stringify(data));location.reload()}
function closeMenus(except){document.querySelectorAll('.status-popover.open').forEach(x=>{if(x!==except)x.classList.remove('open')})}
function enhance(){document.querySelectorAll('#ticketTableBody tr').forEach(row=>{const cell=row.children[4];if(!cell||cell.querySelector('.click-status'))return;const number=row.children[1]?.textContent.trim(),t=read().find(x=>String(x.number).trim()===number);if(!t)return;
 const wrap=document.createElement('div');wrap.className='click-status';
 const btn=document.createElement('button');btn.type='button';btn.className='status-pill status-click-btn';btn.style.background=colors[t.status]||'#728296';btn.innerHTML=`<span>${t.status}</span><i>⌄</i>`;btn.setAttribute('aria-label',`Change status for ticket ${number}`);
 const menu=document.createElement('div');menu.className='status-popover';menu.innerHTML=statuses.map(s=>`<button type="button" data-status="${s}" class="status-option${s===t.status?' active':''}"><b style="background:${colors[s]||'#728296'}"></b><span>${s}</span>${s===t.status?'<i>✓</i>':''}</button>`).join('');
 btn.addEventListener('click',e=>{e.stopPropagation();const opening=!menu.classList.contains('open');closeMenus(menu);menu.classList.toggle('open',opening)});
 menu.addEventListener('click',e=>{const option=e.target.closest('[data-status]');if(!option)return;e.stopPropagation();saveStatus(number,option.dataset.status)});
 wrap.append(btn,menu);cell.innerHTML='';cell.appendChild(wrap);
 });}
document.addEventListener('click',()=>closeMenus());
const style=document.createElement('style');style.textContent=`.click-status{position:relative;display:inline-block}.status-click-btn{border:0;display:inline-flex;align-items:center;gap:5px;cursor:pointer;font:700 11px Inter,sans-serif;padding:5px 8px;border-radius:6px;white-space:nowrap}.status-click-btn i{font-style:normal;font-size:10px;opacity:.85}.status-popover{display:none;position:absolute;z-index:9999;top:calc(100% + 6px);left:50%;transform:translateX(-50%);min-width:132px;padding:5px;background:#fff;border:1px solid #e2e8f0;border-radius:9px;box-shadow:0 10px 28px rgba(15,35,60,.16)}.status-popover.open{display:block}.status-option{width:100%;border:0;background:transparent;display:grid;grid-template-columns:10px 1fr 14px;align-items:center;gap:8px;padding:7px 8px;border-radius:6px;text-align:left;font:600 12px Inter,sans-serif;color:#334155;cursor:pointer}.status-option:hover{background:#f3f6fa}.status-option.active{background:#f7f9fc}.status-option b{width:8px;height:8px;border-radius:50%}.status-option i{font-style:normal;color:#168a55;font-weight:800}`;document.head.appendChild(style);
const body=document.getElementById('ticketTableBody');if(body)new MutationObserver(enhance).observe(body,{childList:true,subtree:true});enhance();
})();