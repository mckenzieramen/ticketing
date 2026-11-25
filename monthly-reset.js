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
style.textContent+=`
.cutoff-nav-tools{display:flex;align-items:center;gap:6px;margin-left:auto;padding-left:8px}
.cutoff-nav-tools button{border:1px solid #d7e3ee;border-radius:8px;padding:8px 10px;background:#fff;color:#34546f;font:800 10px Inter,sans-serif;white-space:nowrap;cursor:pointer}
.cutoff-nav-tools .cutoff-nav-reset{background:#176fbd;border-color:#176fbd;color:#fff}
.cutoff-nav-tools button:hover{filter:brightness(.97)}
.archive-manager-card{width:min(540px,calc(100vw - 32px))}
.archive-manager-list{display:grid;gap:8px;margin-top:16px;max-height:38vh;overflow:auto}
.archive-manager-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border:1px solid #e4ebf3;border-radius:10px;background:#f9fbfd;font:650 12px Inter,sans-serif;color:#355169}
.archive-manager-row button{border:0;border-radius:8px;padding:7px 10px;background:#fff0ef;color:#b42330;font:800 11px Inter,sans-serif;cursor:pointer}
.archive-manager-status{min-height:18px;margin-top:10px!important;color:#64788c!important;font-size:11px!important}
.archive-manager-retry[hidden]{display:none!important}
@media(max-width:700px){.cutoff-nav-tools{gap:4px;padding-left:4px}.cutoff-nav-tools button{padding:7px 8px;font-size:9px}}
`;
const head=document.querySelector('.records-head .filters');if(!head)return;
const tools=document.createElement('div');tools.className='month-tools';tools.innerHTML=`<span class="month-chip">${monthName(current)}</span><button type="button" class="month-reset-btn${newMonth?' attention':''}">${newMonth?'New Month · Reset':'Reset Month'}</button>`;head.prepend(tools);
const modal=document.createElement('div');modal.className='mrm-backdrop';modal.innerHTML=`<div class="mrm-card" role="dialog" aria-modal="true"><div class="mrm-icon">↻</div><h2>Start a fresh month?</h2><p>Solved, Closed, and Merged tickets are archived for this cutoff. Open, Pending, and On Hold tickets stay in All Tickets for the next period.</p><div class="mrm-summary"><div class="mrm-row"><span>Period to archive</span><strong>${monthName(active)}</strong></div><div class="mrm-row"><span>New period</span><strong>${monthName(current)}</strong></div><div class="mrm-row"><span>Tickets to archive</span><strong id="mrmCount">0</strong></div><div class="mrm-row"><span>Tickets to carry forward</span><strong id="mrmCarryCount">0</strong></div></div><div class="reset-period-preview"><dl></dl><h3>Tickets moving to next period</h3><ul></ul></div><div class="mrm-note">Your records are saved to the monthly archive in Firebase.</div><div class="mrm-actions"><button type="button" class="mrm-cancel">Cancel</button><button type="button" class="mrm-confirm">Archive & Reset</button></div></div>`;document.body.appendChild(modal);
const archiveManager=document.createElement('div');archiveManager.className='mrm-backdrop archive-manager-backdrop';archiveManager.innerHTML=`<div class="mrm-card archive-manager-card" role="dialog" aria-modal="true"><div class="mrm-icon">▤</div><h2>Manage archived cutoffs</h2><p>Delete an archived cutoff only if you no longer need its saved ticket and attendance records. Current tickets will stay unchanged.</p><div class="archive-manager-list"></div><p class="archive-manager-status" role="status"></p><div class="mrm-actions"><button type="button" class="mrm-cancel archive-manager-close">Done</button><button type="button" class="mrm-confirm archive-manager-retry" hidden>Retry Save</button></div></div>`;document.body.appendChild(archiveManager);
const read=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}};
function open(){
  const period=activePeriod(archiveData());
  const tickets=uniqueTickets(period.tickets);
  const completed=tickets.filter(isArchiveable);
  const carryForward=tickets.filter(ticket=>!isArchiveable(ticket));
  modal.querySelector('#mrmCount').textContent=completed.length;
  modal.querySelector('#mrmCarryCount').textContent=carryForward.length;
  modal.querySelector('.mrm-row strong').textContent=rangeLabel(period.start,period.end);
  renderResetPreview(period,completed,carryForward);
  modal.classList.add('open');
}
function close(){if(!pendingReset)modal.classList.remove('open')}
tools.querySelector('button').addEventListener('click',open);modal.querySelector('.mrm-cancel').addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close()});document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
const list=value=>Array.isArray(value)?value:[];
const archiveData=()=>read(ARCHIVE_KEY,{})||{};
let pendingArchiveDelete=false;
function renderArchiveManager(){
  const listEl=archiveManager.querySelector('.archive-manager-list');
  const entries=Object.entries(archiveData()).filter(([,archive])=>archive&&typeof archive==='object').sort(([,a],[,b])=>String(b.archivedAt||'').localeCompare(String(a.archivedAt||'')));
  listEl.replaceChildren();
  if(!entries.length){const empty=document.createElement('div');empty.className='archive-empty';empty.textContent='No archived cutoffs yet.';listEl.append(empty);return}
  for(const [key,archive] of entries){
    const row=document.createElement('div');row.className='archive-manager-row';
    const label=document.createElement('span');
    const start=dayOf(archive.periodStart),end=dayOf(archive.periodEnd);
    const range=start&&end?rangeLabel(start,end):monthName(key.slice(0,7));
    label.textContent=`${range} · ${list(archive.tickets).length} archived tickets`;
    const button=document.createElement('button');button.type='button';button.textContent='Delete';button.dataset.archiveDelete=key;
    row.append(label,button);listEl.append(row)
  }
}
function openArchiveManager(){renderArchiveManager();archiveManager.querySelector('.archive-manager-status').textContent='';archiveManager.querySelector('.archive-manager-retry').hidden=true;archiveManager.classList.add('open')}
function closeArchiveManager(){if(!pendingArchiveDelete)archiveManager.classList.remove('open')}
archiveManager.querySelector('.archive-manager-close').addEventListener('click',closeArchiveManager);
archiveManager.addEventListener('click',e=>{
  if(e.target===archiveManager)closeArchiveManager();
  const button=e.target.closest('[data-archive-delete]');if(!button||pendingArchiveDelete)return;
  const key=button.dataset.archiveDelete,archives=archiveData(),archive=archives[key];if(!archive)return;
  const count=list(archive.tickets).length;
  if(!window.confirm(`Permanently delete ${rangeLabel(dayOf(archive.periodStart)||dayOf(archive.archivedAt),dayOf(archive.periodEnd)||resetDay(archive.archivedAt))} with ${count} archived tickets? Current tickets will not be affected.`))return;
  delete archives[key];localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archives));
  pendingArchiveDelete=true;archiveManager.querySelector('.archive-manager-status').textContent='Saving archive deletion to Firebase…';
  void window.FirebaseTicketPersistence?.retrySave();
});
window.addEventListener('ticket-cloud-save',event=>{
  if(!pendingArchiveDelete)return;
  if(event.detail?.phase==='saved'){pendingArchiveDelete=false;location.reload()}
  else if(event.detail?.phase==='error'){archiveManager.querySelector('.archive-manager-status').textContent='Could not save to Firebase. Try again.';archiveManager.querySelector('.archive-manager-retry').hidden=false}
});
archiveManager.querySelector('.archive-manager-retry').addEventListener('click',()=>{if(pendingArchiveDelete)void window.FirebaseTicketPersistence?.retrySave()});
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
const archiveStatuses=new Set(['solved','closed','merged']);
const isArchiveable=ticket=>archiveStatuses.has(String(ticket.status||'').trim().toLowerCase());
const ticketDay=ticket=>dayOf(ticket?.creation)||dayOf(ticket?.stampedTime);
const ticketPeriodDay=ticket=>dayOf(ticket?.carriedIntoPeriod)||ticketDay(ticket);
function carryForwardTickets(tickets,nextStart){
  return tickets.map(ticket=>({
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
function currentPeriodTickets(){
  const period=activePeriod(archiveData());
  const within=day=>day&&day>=period.start&&day<=period.end;
  return uniqueTickets(period.tickets.filter(ticket=>within(ticketPeriodDay(ticket))));
}
window.ticketDashboardDataset=currentPeriodTickets;
window.dispatchEvent(new CustomEvent('ticket-period-data-updated'));
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
  const archivedTickets=tickets.filter(isArchiveable);
  const carryForward=tickets.filter(ticket=>!isArchiveable(ticket));
  pendingReset={archiveKey,archivedAt};
  archives[archiveKey]={
    archivedAt,periodStart:period.start,periodEnd:period.end,periodStartInferred:period.inferred,
    tickets:archivedTickets,attendance:[...new Set(period.attendance)]
  };
  localStorage.setItem(ARCHIVE_KEY,JSON.stringify(archives));
  localStorage.setItem(TICKET_KEY,JSON.stringify(carryForwardTickets(carryForward,period.end)));
  localStorage.setItem(ATTENDANCE_KEY,'[]');
  localStorage.setItem(PERIOD_START_KEY,period.end);
  localStorage.setItem(MONTH_KEY,period.end.slice(0,7));
  void window.FirebaseTicketPersistence.retrySave();
});
window.addEventListener('ticket-cloud-save',event=>{
  if(!pendingReset||event.detail?.archivedAt!==pendingReset.archivedAt)return;
  if(event.detail.phase==='saved'){
    try{sessionStorage.removeItem('ticketing.summaryPeriodAfterReset')}catch{}
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
<p class="records-period-comparison" hidden></p><div class="records-month-grid" aria-live="polite"></div><p data-month-status></p>`;
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
.records-period-comparison{margin:0 0 10px!important}
.records-month-stat .period-delta{font-weight:700;color:#445d52}
.records-head .follow-up-filter{display:inline-flex;align-items:center;gap:5px;font-size:12px;white-space:nowrap}
.records-head .follow-up-filter input{width:auto;min-width:0;margin:0;accent-color:#a72335}
.mrm-card{max-height:calc(100dvh - 32px);overflow:auto}
.reset-period-preview{margin:0 0 12px;font-size:12px;color:#43574f}
.reset-period-preview dl{display:grid;grid-template-columns:1fr auto;gap:4px 12px;margin:0 0 8px}
.reset-period-preview dd{margin:0;font-weight:700}
.reset-period-preview h3{font-size:12px;margin:0 0 4px}
.reset-period-preview ul{margin:0;padding-left:18px;max-height:110px;overflow:auto}
.records-panel [data-metric-tone="good"]{--metric-text:#166044;--metric-surface:#e9f7ee;--metric-border:#9acfb1}
.records-panel [data-metric-tone="warning"]{--metric-text:#9a4a0d;--metric-surface:#fff3e6;--metric-border:#e9b681}
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
  // Always reopen on the new active cutoff after a reset; historical periods remain selectable.
  sessionStorage.removeItem('ticketing.summaryPeriodAfterReset');
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
const attemptCount=ticket=>Math.max(1,Array.isArray(ticket.callAttemptHistory)?ticket.callAttemptHistory.length:0,Number(ticket.callAttempts)||0);
const closeDays=ticket=>{
  const start=Date.parse(String(ticket.creation||'').replace(' ','T'));
  const end=Date.parse(String(ticket.closedTime||'').replace(' ','T'));
  return end>=start?(end-start)/86400000:null;
};
const statuses=['Open','Pending','On Hold','Solved','Closed','Merged'];
const formatDate=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'Asia/Manila'});
const pickupTone=rate=>rate===null?'neutral':rate>=90?'good':rate>=75?'warning':'critical';
function pickupPerformance(avg){if(!Number.isFinite(avg)||avg<0)return null;if(avg<=1)return 100;return Math.max(0,Math.min(100,100-avg/2))}
function periodMetrics(period){
  const within=day=>day&&day>=period.start&&day<=period.end;
  const rows=uniqueTickets(period.tickets.filter(ticket=>within(ticketPeriodDay(ticket))));
  const days=new Set(period.attendance.filter(within)).size;
  const carried=rows.filter(ticket=>ticket.carriedIntoPeriod).length;
  const metricRows=rows;
  const inbound=metricRows.filter(ticket=>callType(ticket,'Inbound'));
  const pickups=validPickups(inbound);
  const averagePickup=pickups.length&&inbound.length?Number((pickups.reduce((total,seconds)=>total+seconds,0)/inbound.length).toFixed(2)):null;
  const passed=pickups.filter(seconds=>seconds<=20).length;
  const attempts=rows.reduce((total,ticket)=>total+attemptCount(ticket),0);
  const closingTimes=rows.map(closeDays).filter(value=>value!==null);
  const averageClose=mean(closingTimes,2);
  const rate=averagePickup===null?null:pickupPerformance(averagePickup);
  return {rows,days,carried,inboundCount:inbound.length,pickups,passed,averagePickup,attempts,closingTimes,averageClose,rate};
}
function renderResetPreview(period,archived,carried){
  const {rows,rate,attempts,days,averageClose}=periodMetrics({...period,tickets:archived});
  const details=[['Solved + Closed + Merged to archive',rows.length],
    ['Pickup rate',rate===null?'—':rate.toFixed(2)+'%'],['Call attempts',attempts],
    ['Days present',days],['Avg. closing time',averageClose===null?'—':averageClose+' days']];
  const preview=modal.querySelector('.reset-period-preview');
  preview.querySelector('dl').replaceChildren(...details.flatMap(([label,value])=>{
    const term=document.createElement('dt'),detail=document.createElement('dd');
    term.textContent=label;
    detail.textContent=value;
    return [term,detail];
  }));
  preview.querySelector('ul').replaceChildren(...(carried.length?carried:[null]).map(ticket=>{
    const item=document.createElement('li');
    item.textContent=ticket?`#${ticket.number||ticket.id} · ${ticket.status||'Open'}`:'No tickets to carry forward.';
    return item;
  }));
}
function formatDelta(value,previous,places,suffix){
  if(value==null||previous==null)return null;
  const delta=Number((value-previous).toFixed(places));
  if(!delta)return 'No change';
  return `${delta>0?'↑':'↓'} ${Math.abs(delta).toFixed(places)}${suffix}`;
}
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
  const {rows,days,carried,inboundCount,pickups,passed,averagePickup,attempts,closingTimes,averageClose,rate}=periodMetrics({...period,currentOnly:selected==='active'});
  const previous=[...periods.values()][[...periods.keys()].indexOf(selected)+1];
  const previousMetrics=previous?periodMetrics(previous):null;
  const comparison=summary.querySelector('.records-period-comparison');
  comparison.hidden=!previous;
  comparison.textContent=previous?'Compared with '+rangeLabel(previous.start,previous.end):'';
  const range=rangeLabel(period.start,period.end);
  summary.querySelector('[data-month-range]').textContent=period.inferred?`${range} · Start based on first available record`:range;
  const tone=good=>good==null?'neutral':good?'good':'critical';
  const metrics=[
    ['Total tickets',rows.length,`${rows.filter(ticket=>callType(ticket,'Inbound')).length} inbound · ${rows.filter(ticket=>callType(ticket,'Outbound')).length} outbound · ${carried} carried forward`],
    ['Pickup performance',rate===null?'—':`${rate.toFixed(2)}%`,averagePickup!==null?`${averagePickup} sec average across ${inboundCount} existing inbound calls · 75% is passing`:'No valid inbound pickup times · 20 sec = 90% goal',pickupTone(rate)],
    ['Avg. pickup',averagePickup!==null?`${averagePickup} sec`:'—','20 sec target',tone(averagePickup!==null?averagePickup<=20:null)],
    ['Call attempts',attempts,'Recorded on tickets in this period'],
    ['Attendance',`${days} ${days===1?'day':'days'}`,'Unique days marked present'],
    ['Tickets / attendance',days?(rows.length/days).toFixed(2):'—','Tickets per day present'],
    ['Attempts / attendance',days?(attempts/days).toFixed(2):'—','Attempts per day present'],
    ['Avg. closing time',averageClose===null?'—':`${averageClose} days`,'1.5 days target',tone(averageClose===null?null:closingTimes.reduce((sum,value)=>sum+value,0)/closingTimes.length<=1.5)]
  ];
  if(!grid.children.length){
    grid.innerHTML=metrics.map(([label])=>`<div class="records-month-stat"><span>${label}</span><strong><span aria-hidden="true" data-summary-count></span><span class="count-announcement"></span></strong><small></small><small class="period-delta" hidden></small></div>`).join('');
    statusLine.innerHTML=statuses.map(status=>`<span>${status} <span aria-hidden="true" data-summary-count></span><span class="count-announcement"></span></span>`).join(' · ');
  }
  const deltas=previousMetrics?[
    formatDelta(rows.length,previousMetrics.rows.length,0,' tickets'),
    formatDelta(rate,previousMetrics.rate,2,' percentage points'),
    formatDelta(averagePickup,previousMetrics.averagePickup,1,' sec'),
    formatDelta(attempts,previousMetrics.attempts,0,' attempts'),
    formatDelta(days,previousMetrics.days,0,' days'),
    formatDelta(days?rows.length/days:null,previousMetrics.days?previousMetrics.rows.length/previousMetrics.days:null,2,' tickets/day'),
    formatDelta(days?attempts/days:null,previousMetrics.days?previousMetrics.attempts/previousMetrics.days:null,2,' attempts/day'),
    formatDelta(averageClose,previousMetrics.averageClose,2,' days')
  ]:[];
  metrics.forEach(([,value,detail,metricTone='neutral'],index)=>{
    const card=grid.children[index];
    const [,number,note,deltaLabel]=card.children;
    if(card.dataset.metricTone!==metricTone)card.dataset.metricTone=metricTone;
    updateCount(number.firstElementChild,value);
    if(note.textContent!==detail)note.textContent=detail;
    const delta=deltas[index];
    deltaLabel.hidden=!delta;
    if(deltaLabel.textContent!==(delta||''))deltaLabel.textContent=delta||'';
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
function applyCurrentPeriodTableFilter(){
  const body=document.getElementById('ticketTableBody'),empty=document.getElementById('emptyState');
  if(!body)return;
  const rows=[...body.querySelectorAll('tr[data-ticket-id]')];
  const period=activePeriod(archiveData());
  const within=day=>day&&day>=period.start&&day<=period.end;
  const currentIds=new Set(uniqueTickets(period.tickets.filter(ticket=>within(ticketPeriodDay(ticket)))).map(ticket=>String(ticket.id)));
  rows.forEach(row=>row.hidden=!currentIds.has(String(row.dataset.ticketId)));
  const visible=rows.some(row=>!row.hidden);
  if(empty){
    if(!visible){empty.textContent='No tickets in the current period.';empty.style.display='block'}
    else empty.style.display='none';
  }
}
function scheduleCurrentPeriodTableFilter(){requestAnimationFrame(applyCurrentPeriodTableFilter)}
select.addEventListener('change',()=>{resetPeriod='';renderSummary();scheduleCurrentPeriodTableFilter()});
for(const name of ['firebase-memory-write','ticket-live-sync','ticket-data-updated','call-attempt-updated','attendance-updated','tracker-view-changed'])window.addEventListener(name,scheduleSummary);
window.addEventListener('ticket-records-rendered',scheduleCurrentPeriodTableFilter);
window.addEventListener('ticket-record-saved',scheduleCurrentPeriodTableFilter);
window.addEventListener('ticket-live-sync',scheduleCurrentPeriodTableFilter);
function installDashboardCutoffTools(){
  const nav=document.querySelector('main.container>.premium-tabs');
  if(!nav||nav.querySelector('.cutoff-nav-tools'))return;
  const controls=document.createElement('div');controls.className='cutoff-nav-tools';
  controls.innerHTML='<button type="button" class="cutoff-nav-reset">Reset cutoff</button><button type="button" class="cutoff-nav-archives">Delete archive</button>';
  controls.querySelector('.cutoff-nav-reset').addEventListener('click',open);
  controls.querySelector('.cutoff-nav-archives').addEventListener('click',openArchiveManager);
  nav.append(controls)
}
installDashboardCutoffTools();
const main=document.querySelector('main.container');
if(main)new MutationObserver(installDashboardCutoffTools).observe(main,{childList:true});
renderSummary();scheduleCurrentPeriodTableFilter();
})();
