(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1';
const ATTENDANCE_KEY='premiumTicketTracker.attendance.v1';
const ARCHIVE_KEY='premiumTicketTracker.monthlyArchives.v1';
const MONTH_KEY='premiumTicketTracker.activeMonth.v1';
const PERIOD_START_KEY='premiumTicketTracker.periodStart.v1';
const monthName=key=>{const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleDateString('en-US',{month:'long',year:'numeric'})};
const phDate=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'});
const today=()=>phDate.format(new Date());
const current=today().slice(0,7);
const activeMonth=()=>localStorage.getItem(MONTH_KEY)||current;
const active=activeMonth();
const newMonth=active!==current;
const style=document.createElement('style');style.textContent=`.month-tools{display:flex;align-items:center;gap:8px}.month-chip{border:1px solid #dbe6f1;background:#f8fbff;color:#456078;border-radius:9px;padding:7px 10px;font:700 11px Inter,sans-serif;white-space:nowrap}.month-reset-btn{border:1px solid #dbe6f1;background:#fff;color:#34506a;border-radius:9px;padding:7px 11px;font:750 11px Inter,sans-serif;cursor:pointer;transition:.15s ease}.month-reset-btn:hover{background:#f4f8fc;border-color:#cbd9e7}.month-reset-btn.attention{background:#fff7ed;border-color:#fed7aa;color:#b45309}.mrm-backdrop{position:fixed;inset:0;z-index:2147483646;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(4,15,31,.58);backdrop-filter:blur(8px);opacity:0;visibility:hidden;pointer-events:none;transition:.2s}.mrm-backdrop.open{opacity:1;visibility:visible;pointer-events:auto}.mrm-card{width:min(460px,calc(100vw - 32px));background:#fff;border:1px solid #e1e9f2;border-radius:22px;padding:26px;box-shadow:0 30px 90px rgba(3,24,51,.3);font-family:Inter,sans-serif;transform:translateY(12px) scale(.97);transition:.2s}.mrm-backdrop.open .mrm-card{transform:none}.mrm-icon{width:50px;height:50px;border-radius:15px;display:grid;place-items:center;background:#edf6ff;color:#1677d2;font-size:23px;font-weight:800}.mrm-card h2{margin:15px 0 7px;color:#102a43;font-size:20px}.mrm-card p{margin:0;color:#66788c;font-size:13px;line-height:1.6}.mrm-summary{margin:18px 0;padding:13px 14px;border:1px solid #e4ebf3;border-radius:12px;background:#f8fafc;display:grid;gap:8px}.mrm-row{display:flex;justify-content:space-between;gap:14px;font-size:12px;color:#5d7186}.mrm-row strong{color:#173b57}.mrm-note{padding:10px 12px;border-radius:10px;background:#effaf4;color:#24734a;font:600 11px/1.5 Inter,sans-serif}.mrm-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:20px}.mrm-actions button{border:0;border-radius:11px;padding:12px 15px;font:750 13px Inter,sans-serif;cursor:pointer}.mrm-cancel{background:#eef3f8;color:#334e68}.mrm-confirm{background:linear-gradient(135deg,#147ee8,#075fbd);color:#fff;box-shadow:0 9px 20px rgba(20,126,232,.22)}`;document.head.appendChild(style);
const head=document.querySelector('.records-head .filters');if(!head)return;
const tools=document.createElement('div');tools.className='month-tools';tools.innerHTML=`<span class="month-chip">${monthName(current)}</span><button type="button" class="month-reset-btn${newMonth?' attention':''}">${newMonth?'New Month · Reset':'Reset Month'}</button>`;head.prepend(tools);
const modal=document.createElement('div');modal.className='mrm-backdrop';modal.innerHTML=`<div class="mrm-card" role="dialog" aria-modal="true"><div class="mrm-icon">↻</div><h2>Start a fresh month?</h2><p>Your current tickets and attendance are archived. Unresolved tickets stay in All Tickets for the next period.</p><div class="mrm-summary"><div class="mrm-row"><span>Period to archive</span><strong>${monthName(active)}</strong></div><div class="mrm-row"><span>New period</span><strong>${monthName(current)}</strong></div><div class="mrm-row"><span>Tickets to archive</span><strong id="mrmCount">0</strong></div><div class="mrm-row"><span>Tickets to carry forward</span><strong id="mrmCarryCount">0</strong></div></div><div class="mrm-note">Your records are saved to the monthly archive in Firebase.</div><div class="mrm-actions"><button type="button" class="mrm-cancel">Cancel</button><button type="button" class="mrm-confirm">Archive & Reset</button></div></div>`;document.body.appendChild(modal);
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}};
function open(){
  const period=activePeriod(archiveData());
  const tickets=uniqueTickets(period.tickets);
  modal.querySelector('#mrmCount').textContent=tickets.length;
  modal.querySelector('#mrmCarryCount').textContent=tickets.filter(isUnresolved).length;
  modal.querySelector('.mrm-row strong').textContent=rangeLabel(period.start,period.end);
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
const terminalStatuses=new Set(['solved','closed','merged']);
const isUnresolved=ticket=>!terminalStatuses.has(String(ticket.status||'').trim().toLowerCase());
const ticketDay=ticket=>dayOf(ticket?.creation)||dayOf(ticket?.stampedTime);
const ticketPeriodDay=ticket=>dayOf(ticket?.carriedIntoPeriod)||ticketDay(ticket);
function carryUnresolved(tickets,nextStart){
  return tickets.filter(isUnresolved).map(ticket=>({
    ...ticket,
    carriedIntoPeriod:nextStart,
    carriedAttemptBaseline:attemptCount(ticket)
  }));
}
function resetDay(timestamp){
  const date=new Date(timestamp||'');
  return Number.isNaN(date.getTime())?'':phDate.format(date);
}
function firstRecordDay(tickets,attendance,end){
  return [...tickets.map(ticketDay),...attendance].filter(day=>day&&day<=end).sort()[0]||'';
}
function activePeriod(archives){
  const tickets=list(read(TICKET_KEY,[]));
  const attendance=attendanceDays(read(ATTENDANCE_KEY,[]));
  const end=today();
  const savedStart=dayOf(localStorage.getItem(PERIOD_START_KEY));
  const previousReset=savedStart&&savedStart<=end?savedStart:Object.values(archives).map(archive=>resetDay(archive?.archivedAt)).filter(day=>day&&day<=end).sort().at(-1);
  return {start:previousReset||firstRecordDay(tickets,attendance,end)||end,end,tickets,attendance,inferred:!previousReset};
}
function archivedPeriod(archive){
  const tickets=list(archive.tickets);
  const attendance=attendanceDays(archive.attendance);
  const end=dayOf(archive.periodEnd)||resetDay(archive.archivedAt);
  const recordedStart=dayOf(archive.periodStart);
  return {start:recordedStart||firstRecordDay(tickets,attendance,end)||end,end,tickets,attendance,inferred:archive.periodStartInferred??!recordedStart};
}
function rangeLabel(start,end){
  return formatDate.formatRange(new Date(start+'T00:00:00+08:00'),new Date(end+'T00:00:00+08:00'));
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
  const archives=archiveData();
  const period=activePeriod(archives);
  const archivedAt=new Date().toISOString();
  const archiveKey=period.start.slice(0,7)+'-'+archivedAt;
  const tickets=uniqueTickets(period.tickets);
  pendingReset={archiveKey,archivedAt};
  archives[archiveKey]={
    archivedAt,periodStart:period.start,periodEnd:period.end,periodStartInferred:period.inferred,
    tickets,attendance:[...new Set(period.attendance)]
  };
  localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archives));
  localStorage.setItem(TICKET_KEY,JSON.stringify(carryUnresolved(tickets,period.end)));
  localStorage.setItem(ATTENDANCE_KEY,'[]');
  localStorage.setItem(PERIOD_START_KEY,period.end);
  localStorage.setItem(MONTH_KEY,period.end.slice(0,7));
});
window.addEventListener('ticket-cloud-save',event=>{
  if(!pendingReset||event.detail?.archivedAt!==pendingReset.archivedAt)return;
  if(event.detail.phase==='saved'){
    try{sessionStorage.setItem('ticketing.summaryPeriodAfterReset',pendingReset.archiveKey)}catch{}
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
summary.innerHTML=`<div class="records-month-heading"><div><h3 id="recordsMonthTitle">Period Summary</h3><p data-month-range></p></div><label>Period <select aria-label="Summary period"></select></label></div>
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
.records-month-stat strong,.records-month-stat strong span{color:inherit;font-size:17px;font-variant-numeric:tabular-nums}
.records-month-summary .count-announcement{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
.records-month-summary [data-month-status]{font-variant-numeric:tabular-nums}
.records-month-summary [data-month-status]{margin-top:10px}
.records-loading .records-month-summary{display:none}
.records-panel [data-metric-tone="good"]{--metric-text:#166044;--metric-surface:#e9f7ee;--metric-border:#9acfb1}
.records-panel [data-metric-tone="critical"]{--metric-text:#a72335;--metric-surface:#fff0f1;--metric-border:#e8a5ae}
.records-panel .records-month-stat[data-metric-tone]:not([data-metric-tone="neutral"]){background:var(--metric-surface);border-color:var(--metric-border)}
.records-panel .records-month-stat[data-metric-tone] strong{color:var(--metric-text,inherit)}
.records-panel .pickup-pill[data-metric-tone],.records-panel .record-closing-badge[data-metric-tone]{display:inline-block;padding:3px 7px;border-radius:6px;background:var(--metric-surface)!important;color:var(--metric-text)!important}
.records-panel tr[data-record-tone="critical"] td:first-child{box-shadow:inset 3px 0 #bc3547}
.records-panel tr[data-record-tone="good"] td:first-child{box-shadow:inset 3px 0 #358361}
.records-panel .record-follow-up{display:block;margin-top:3px;color:#a72335;font-size:10px;font-weight:700}
.records-panel .record-follow-up[hidden]{display:none!important}
`;
const select=summary.querySelector('select');
let resetPeriod='';
try{
  resetPeriod=sessionStorage.getItem('ticketing.summaryPeriodAfterReset')||'';
  sessionStorage.removeItem('ticketing.summaryMonthAfterReset');
}catch{}
const grid=summary.querySelector('.records-month-grid');
const statusLine=summary.querySelector('[data-month-status]');
const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
const pendingCounts=new Set();
const countFrames=new WeakMap();
let summaryVisible=false;
function countUp(element){
  pendingCounts.delete(element);
  cancelAnimationFrame(countFrames.get(element)||0);
  const target=element.dataset.countTarget;
  const match=target.match(/^(\d+)(?:\.(\d+))?(.*)$/);
  if(!summaryVisible||motionPreference.matches||!match||Number(match[1]+'.'+(match[2]||'0'))===0){
    element.textContent=target;
    return;
  }
  const digits=match[2]?.length||0;
  const actual=Number(match[1]+'.'+(match[2]||'0'));
  const suffix=match[3];
  let start;
  element.textContent=(0).toFixed(digits)+suffix;
  function tick(time){
    start??=time;
    const progress=Math.min(1,(time-start)/800);
    const eased=1-Math.pow(1-progress,3);
    const display=actual*eased;
    element.textContent=progress===1?target:(digits?display.toFixed(digits):String(Math.floor(display)))+suffix;
    if(progress<1&&summaryVisible&&!motionPreference.matches)countFrames.set(element,requestAnimationFrame(tick));
    else{element.textContent=target;countFrames.delete(element);}
  }
  countFrames.set(element,requestAnimationFrame(tick));
}
function updateCount(element,value){
  const next=String(value);
  if(element.dataset.countTarget===next)return;
  element.dataset.countTarget=next;
  element.nextElementSibling.textContent=next;
  if(summaryVisible)countUp(element);
  else{
    cancelAnimationFrame(countFrames.get(element)||0);
    countFrames.delete(element);
    element.textContent=next;
    pendingCounts.add(element);
  }
}
if(typeof IntersectionObserver==='function'){
  new IntersectionObserver(([entry])=>{
    summaryVisible=entry.isIntersecting;
    if(summaryVisible)pendingCounts.forEach(countUp);
  }).observe(summary);
}else summaryVisible=true;
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
const formatDate=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Manila'});
function renderSummary(){
  const archives=archiveData();
  const periods=new Map([['active',activePeriod(archives)]]);
  const archived=Object.entries(archives).filter(([,archive])=>archive&&typeof archive==='object')
    .sort(([,a],[,b])=>String(b.archivedAt||'').localeCompare(String(a.archivedAt||'')));
  for(const [key,archive] of archived){
    const period=archivedPeriod(archive);
    if(period.start&&period.end&&period.start<=period.end)periods.set(key,period);
  }
  const selected=periods.has(resetPeriod)?resetPeriod:periods.has(select.value)?select.value:'active';
  if(selected===resetPeriod)resetPeriod='';
  const options=[...periods].map(([key,period])=>[key,key==='active'?'Current period':rangeLabel(period.start,period.end)]);
  if(JSON.stringify([...select.options].map(option=>[option.value,option.text]))!==JSON.stringify(options)){
    select.replaceChildren(...options.map(([key,label])=>new Option(label,key)));
  }
  select.value=selected;
  const period=periods.get(selected);
  const within=day=>day&&day>=period.start&&day<=period.end;
  const rows=uniqueTickets(period.tickets.filter(ticket=>within(ticketPeriodDay(ticket))));
  const days=new Set(period.attendance.filter(within)).size;
  const carried=rows.filter(ticket=>ticket.carriedIntoPeriod).length;
  const pickups=validPickups(rows.filter(ticket=>!ticket.carriedIntoPeriod));
  const passed=pickups.filter(seconds=>seconds<=20).length;
  const attempts=rows.reduce((total,ticket)=>total+Math.max(0,attemptCount(ticket)-(Number(ticket.carriedAttemptBaseline)||0)),0);
  const closingTimes=rows.map(closeDays).filter(value=>value!==null);
  const averageClose=mean(closingTimes,2);
  const range=rangeLabel(period.start,period.end);
  summary.querySelector('[data-month-range]').textContent=period.inferred?`${range} · Start based on first available record`:range;
  const rate=pickups.length?passed/pickups.length*100:null;
  const tone=good=>good==null?'neutral':good?'good':'critical';
  const metrics=[
    ['Total tickets',rows.length,`${rows.filter(ticket=>callType(ticket,'Inbound')).length} inbound · ${rows.filter(ticket=>callType(ticket,'Outbound')).length} outbound · ${carried} carried forward`],
    ['Pickup rate',pickups.length?`${(passed/pickups.length*100).toFixed(2)}%`:'—',`${passed}/${pickups.length} valid inbound pickups ≤ 20s · 90% goal`,tone(rate===null?null:rate>=90)],
    ['Avg. pickup',pickups.length?`${mean(pickups)} sec`:'—','20 sec target',tone(pickups.length?pickups.reduce((sum,seconds)=>sum+seconds,0)/pickups.length<=20:null)],
    ['Call attempts',attempts,'Recorded on tickets in this period'],
    ['Attendance',`${days} ${days===1?'day':'days'}`,'Unique days marked present'],
    ['Tickets / attendance',days?(rows.length/days).toFixed(2):'—','Tickets per day present'],
    ['Attempts / attendance',days?(attempts/days).toFixed(2):'—','Attempts per day present'],
    ['Avg. closing time',averageClose===null?'—':`${averageClose} days`,'1.5 days target',tone(averageClose===null?null:closingTimes.reduce((sum,value)=>sum+value,0)/closingTimes.length<=1.5)]
  ];
  if(!grid.children.length){
    grid.innerHTML=metrics.map(([label])=>`<div class="records-month-stat"><span>${label}</span><strong><span aria-hidden="true" data-summary-count></span><span class="count-announcement"></span></strong><small></small></div>`).join('');
    statusLine.innerHTML=statuses.map(status=>`<span>${status} <span aria-hidden="true" data-summary-count></span><span class="count-announcement"></span></span>`).join(' · ');
  }
  metrics.forEach(([,value,detail,metricTone='neutral'],index)=>{
    const card=grid.children[index];
    const [,number,note]=card.children;
    if(card.dataset.metricTone!==metricTone)card.dataset.metricTone=metricTone;
    updateCount(number.firstElementChild,value);
    if(note.textContent!==detail)note.textContent=detail;
  });
  [...statusLine.children].forEach((item,index)=>{
    updateCount(item.firstElementChild,rows.filter(ticket=>ticket.status===statuses[index]).length);
  });
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
select.addEventListener('change',()=>{resetPeriod='';renderSummary()});
for(const name of ['firebase-memory-write','ticket-live-sync','ticket-data-updated','call-attempt-updated','attendance-updated','tracker-view-changed'])window.addEventListener(name,scheduleSummary);
renderSummary();
})();
