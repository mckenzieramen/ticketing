(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1';
const ATTENDANCE_KEY='premiumTicketTracker.attendance.v1';
const ARCHIVE_KEY='premiumTicketTracker.monthlyArchives.v1';
const MONTH_KEY='premiumTicketTracker.activeMonth.v1';
const pad=n=>String(n).padStart(2,'0');
const monthKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}`;
const monthName=key=>{const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})};
const current=monthKey(new Date());
const activeMonth=()=>localStorage.getItem(MONTH_KEY)||current;
const active=activeMonth();
const newMonth=active!==current;
const style=document.createElement('style');style.textContent=`.month-tools{display:flex;align-items:center;gap:8px}.month-chip{border:1px solid #dbe6f1;background:#f8fbff;color:#456078;border-radius:9px;padding:7px 10px;font:700 11px Inter,sans-serif;white-space:nowrap}.month-reset-btn{border:1px solid #dbe6f1;background:#fff;color:#34506a;border-radius:9px;padding:7px 11px;font:750 11px Inter,sans-serif;cursor:pointer;transition:.15s ease}.month-reset-btn:hover{background:#f4f8fc;border-color:#cbd9e7}.month-reset-btn.attention{background:#fff7ed;border-color:#fed7aa;color:#b45309}.mrm-backdrop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,15,31,.58);backdrop-filter:blur(8px);opacity:0;visibility:hidden;pointer-events:none;transition:.2s}.mrm-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}.mrm-card{width:min(460px,calc(100vw - 32px));background:#fff;border:1px solid #e1e9f2;border-radius:22px;padding:26px;box-shadow:0 30px 90px rgba(3,24,51,.3);font-family:Inter,sans-serif;transform:translateY(12px) scale(.97);transition:.2s}.mrm-backdrop.open .mrm-card{transform:none}.mrm-icon{width:50px;height:50px;border-radius:15px;display:grid;place-items:center;background:#edf6ff;color:#1677d2;font-size:23px;font-weight:800}.mrm-card h2{margin:15px 0 7px;color:#102a43;font-size:20px}.mrm-card p{margin:0;color:#66788c;font-size:13px;line-height:1.6}.mrm-summary{margin:18px 0;padding:13px 14px;border:1px solid #e4ebf3;border-radius:12px;background:#f8fafc;display:grid;gap:8px}.mrm-row{display:flex;justify-content:space-between;gap:14px;font-size:12px;color:#5d7186}.mrm-row strong{color:#173b57}.mrm-note{padding:10px 12px;border-radius:10px;background:#effaf4;color:#24734a;font:600 11px/1.5 Inter,sans-serif}.mrm-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.mrm-actions button{border:0;border-radius:11px;padding:12px 15px;font:750 13px Inter,sans-serif;cursor:pointer}.mrm-cancel{background:#eef3f8;color:#334e68}.mrm-confirm{background:linear-gradient(135deg,#147ee8,#075fbd);color:#fff;box-shadow:0 9px 20px rgba(20,126,232,.22)}`;document.head.appendChild(style);
const head=document.querySelector('.records-head .filters');if(!head)return;
const tools=document.createElement('div');tools.className='month-tools';tools.innerHTML=`<span class="month-chip">${monthName(current)}</span><button type="button" class="month-reset-btn${newMonth?' attention':''}">${newMonth?'New Month · Reset':'Reset Month'}</button>`;head.prepend(tools);
const modal=document.createElement('div');modal.className='mrm-backdrop';modal.innerHTML=`<div class="mrm-card" role="dialog" aria-modal="true"><div class="mrm-icon">↻</div><h2>Start a fresh month?</h2><p>This resets the active Ticket Tracker counters and records for the new month. Your current tickets and attendance are archived first.</p><div class="mrm-summary"><div class="mrm-row"><span>Current period</span><strong>${monthName(active)}</strong></div><div class="mrm-row"><span>New period</span><strong>${monthName(current)}</strong></div><div class="mrm-row"><span>Tickets to archive</span><strong id="mrmCount">0</strong></div></div><div class="mrm-note">Your records are saved to the monthly archive in Firebase.</div><div class="mrm-actions"><button type="button" class="mrm-cancel">Cancel</button><button type="button" class="mrm-confirm">Archive & Reset</button></div></div>`;document.body.appendChild(modal);
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}};
function open(){
  modal.querySelector('#mrmCount').textContent=read(TICKET_KEY,[]).length;
  modal.querySelector('.mrm-row strong').textContent=monthName(activeMonth());
  modal.classList.add('open');
}
function close(){if(!pendingReset)modal.classList.remove('open')}
tools.querySelector('button').addEventListener('click',open);modal.querySelector('.mrm-cancel').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const list=value=>Array.isArray(value)?value:[];
const archiveData=()=>read(ARCHIVE_KEY,{})||{};
const dayOf=value=>{
  const day=String(value??'').slice(0,10);
  return /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/.test(day)?day:'';
};
function attendanceDays(entries){
  const rows=Array.isArray(entries)?entries:Object.entries(entries||{})
    .filter(([,value])=>value).map(([key,value])=>typeof value==='object'?{key,...value}:key);
  return rows.map(row=>dayOf(typeof row==='string'?row:row?.date||row?.day||row?.key||row?.timestamp||row?.time)).filter(Boolean);
}
function uniqueTickets(records){
  const byTicket=new Map();
  for(const ticket of records.filter(Boolean)){
    const number=String(ticket.number||'').trim().toLowerCase();
    const key=number||ticket.id||ticket;
    byTicket.set(key,ticket);
  }
  return [...byTicket.values()];
}
const confirmReset=modal.querySelector('.mrm-confirm');
const resetMessage=modal.querySelector('.mrm-note');
let pendingReset=null;
confirmReset.addEventListener('click',()=>{
  if(!window.FirebaseTicketPersistence){
    resetMessage.textContent='Wait for Firebase to connect, then try again.';
    return;
  }
  confirmReset.disabled=true;
  resetMessage.textContent='Saving the archive to Firebase…';
  if(pendingReset){
    void window.FirebaseTicketPersistence.retrySave();
    return;
  }
  const month=activeMonth(), archives=archiveData(), previous=archives[month];
  const tickets=uniqueTickets([...list(previous?.tickets),...list(read(TICKET_KEY,[]))]);
  const attendance=[...new Set([...attendanceDays(previous?.attendance),...attendanceDays(read(ATTENDANCE_KEY,[]))])];
  const archivedAt=new Date().toISOString();
  pendingReset={month,archivedAt};
  archives[month]={archivedAt,tickets,attendance};
  localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archives));
  localStorage.setItem(TICKET_KEY,'[]');
  localStorage.setItem(ATTENDANCE_KEY,'[]');
  localStorage.setItem(MONTH_KEY,current);
});
window.addEventListener('ticket-cloud-save',event=>{
  if(!pendingReset||event.detail?.archivedAt!==pendingReset.archivedAt)return;
  if(event.detail.phase==='saved'){
    try{sessionStorage.setItem('ticketing.summaryMonthAfterReset',pendingReset.month)}catch{}
    location.reload();
    return;
  }
  if(event.detail.phase==='error'){
    resetMessage.textContent='Firebase could not save the archive. Select Retry Save.';
    confirmReset.textContent='Retry Save';
    confirmReset.disabled=false;
  }
});
const summary=document.createElement('section');
summary.className='records-month-summary';
summary.setAttribute('aria-labelledby','recordsMonthTitle');
summary.innerHTML=`<div class="records-month-heading"><div><h3 id="recordsMonthTitle">Monthly Summary</h3><p data-month-range></p></div><label>Month <select aria-label="Summary month"></select></label></div>
<div class="records-month-grid" aria-live="polite"></div><p data-month-status></p>`;
head.closest('.records-head').after(summary);
style.textContent+=`
.records-month-summary{margin:12px 0 16px;padding:16px;border:1px solid #e5dfd1;border-radius:14px;background:#faf8f2;color:#263c35}
.records-month-heading{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.records-month-heading h3{margin:0 0 4px;font-size:15px}
.records-month-heading label{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700}
.records-month-heading select{padding:7px 10px;border:1px solid #d9d4c6;border-radius:8px;background:white;color:inherit;font:inherit}
.records-month-summary p{margin:0;font-size:12px;color:#586860}
.records-month-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:8px}
.records-month-stat{display:grid;gap:3px;padding:9px 10px;border:1px solid #e9e3d7;border-radius:9px;background:#fff}
.records-month-stat span,.records-month-stat small{font-size:11px;color:#586860}
.records-month-stat strong{font-size:17px;font-variant-numeric:tabular-nums}
.records-month-summary [data-month-status]{margin-top:10px}
.records-loading .records-month-summary{display:none}
`;
const select=summary.querySelector('select');
let resetMonth='';
try{
  resetMonth=sessionStorage.getItem('ticketing.summaryMonthAfterReset')||'';
  sessionStorage.removeItem('ticketing.summaryMonthAfterReset');
}catch{}
const grid=summary.querySelector('.records-month-grid');
const statusLine=summary.querySelector('[data-month-status]');
const callType=(ticket,type)=>[type,type+' Call'].includes(ticket.callType);
const mean=(values,digits=1)=>values.length?(values.reduce((total,value)=>total+value,0)/values.length).toFixed(digits):null;
const validPickups=records=>records.filter(ticket=>callType(ticket,'Inbound')&&ticket.pickupSeconds!=null&&String(ticket.pickupSeconds).trim()!=='')
  .map(ticket=>Number(ticket.pickupSeconds)).filter(seconds=>Number.isFinite(seconds)&&seconds>=0);
const attemptCount=ticket=>Array.isArray(ticket.callAttemptHistory)&&ticket.callAttemptHistory.length?ticket.callAttemptHistory.length:Math.max(0,Number(ticket.callAttempts)||0);
const closeDays=ticket=>{
  const start=Date.parse(String(ticket.creation||'').replace(' ','T'));
  const end=Date.parse(String(ticket.closedTime||'').replace(' ','T'));
  return end>=start?(end-start)/86400000:null;
};
const statuses=['Open','Pending','On Hold','Solved','Closed','Merged'];
const formatDate=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'});
function renderSummary(){
  const archives=archiveData();
  const archived=Object.entries(archives).sort(([a],[b])=>a.localeCompare(b)).map(([,archive])=>archive);
  const tickets=[...archived.flatMap(archive=>list(archive?.tickets)),...list(read(TICKET_KEY,[]))].filter(Boolean);
  const attendance=[...archived.flatMap(archive=>attendanceDays(archive?.attendance)),...attendanceDays(read(ATTENDANCE_KEY,[]))];
  const ticketMonth=ticket=>dayOf(ticket.creation||ticket.stampedTime).slice(0,7);
  const months=[...new Set([current,...Object.keys(archives),...tickets.map(ticketMonth),...attendance.map(day=>day.slice(0,7))])]
    .filter(month=>/^\d{4}-(?:0[1-9]|1[0-2])$/.test(month)).sort().reverse();
  const month=months.includes(resetMonth)?resetMonth:months.includes(select.value)?select.value:current;
  if(month===resetMonth)resetMonth='';
  if([...select.options].map(option=>option.value).join()!==months.join()){
    select.replaceChildren(...months.map(key=>new Option(monthName(key),key)));
  }
  select.value=month;
  const rows=uniqueTickets(tickets.filter(ticket=>ticketMonth(ticket)===month));
  const days=new Set(attendance.filter(day=>day.startsWith(month+'-'))).size;
  const pickups=validPickups(rows);
  const passed=pickups.filter(seconds=>seconds<=20).length;
  const attempts=rows.reduce((total,ticket)=>total+attemptCount(ticket),0);
  const averageClose=mean(rows.map(closeDays).filter(value=>value!==null),2);
  const [year,monthNumber]=month.split('-').map(Number);
  summary.querySelector('[data-month-range]').textContent=formatDate.formatRange(new Date(year,monthNumber-1,1),new Date(year,monthNumber,0));
  const metrics=[
    ['Total tickets',rows.length,`${rows.filter(ticket=>callType(ticket,'Inbound')).length} inbound · ${rows.filter(ticket=>callType(ticket,'Outbound')).length} outbound`],
    ['Pickup rate',pickups.length?`${(passed/pickups.length*100).toFixed(2)}%`:'—',`${passed}/${pickups.length} valid inbound pickups ≤ 20s`],
    ['Avg. pickup',pickups.length?`${mean(pickups)} sec`:'—','Valid inbound pickups'],
    ['Call attempts',attempts,'Recorded on tickets in this month'],
    ['Attendance',`${days} ${days===1?'day':'days'}`,'Unique days marked present'],
    ['Tickets / attendance',days?(rows.length/days).toFixed(2):'—','Tickets per day present'],
    ['Attempts / attendance',days?(attempts/days).toFixed(2):'—','Attempts per day present'],
    ['Avg. closing time',averageClose===null?'—':`${averageClose} days`,'Tickets with a recorded close']
  ];
  const markup=metrics.map(([label,value,detail])=>`<div class="records-month-stat"><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>`).join('');
  if(grid.innerHTML!==markup)grid.innerHTML=markup;
  statusLine.textContent=statuses.map(status=>`${status} ${rows.filter(ticket=>ticket.status===status).length}`).join(' · ');
  const isNewMonth=activeMonth()!==current;
  const resetButton=tools.querySelector('button');
  resetButton.classList.toggle('attention',isNewMonth);
  resetButton.textContent=isNewMonth?'New Month · Reset':'Reset Month';
}
let frame=0;
function scheduleSummary(){
  if(frame)return;
  frame=requestAnimationFrame(()=>{frame=0;renderSummary()});
}
select.addEventListener('change',()=>{resetMonth='';renderSummary()});
for(const name of ['firebase-memory-write','ticket-live-sync','ticket-data-updated','call-attempt-updated','attendance-updated','tracker-view-changed'])window.addEventListener(name,scheduleSummary);
renderSummary();
})();
