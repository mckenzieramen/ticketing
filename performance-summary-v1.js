(()=>{'use strict';
const $=id=>document.getElementById(id),KEY='premiumTicketTracker.v1',ATTENDANCE_KEY='premiumTicketTracker.attendance.v1',TARGET=20;
const records=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
const attendanceRecords=()=>{try{const v=JSON.parse(localStorage.getItem(ATTENDANCE_KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const parse=v=>{if(!v)return null;const m=String(v).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);return m?new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null};
const dayKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function closingDuration(t){const a=parse(t.creation),b=parse(t.closedTime);return a&&b&&b>=a?(b-a)/86400000:null}
function closingScore(days){if(days==null)return null;if(days<=1.5)return 100;if(days>=3)return 75;return 100-((days-1.5)/(3-1.5))*25}
function markAttendance(){const today=dayKey(new Date()),days=attendanceRecords();if(days.includes(today))return;days.push(today);days.sort();localStorage.setItem(ATTENDANCE_KEY,JSON.stringify(days));update()}
function update(){const t=records(),today=dayKey(new Date()),days=attendanceRecords(),attendance=days.length,todayCount=t.filter(x=>{const d=parse(x.creation);return d&&dayKey(d)===today}).length,inbound=t.filter(x=>x.callType==='Inbound Call'),outbound=t.filter(x=>x.callType==='Outbound Call');
 const set=(id,v)=>{const e=$(id);if(e)e.textContent=v};set('attendanceTotalTickets',t.length);set('attendanceTodayTickets',todayCount);set('attendanceDays',`${attendance} day${attendance===1?'':'s'}`);set('attendanceAvgCalls',attendance?(t.length/attendance).toFixed(2):'0.00');set('attendanceInbound',inbound.length);set('attendanceOutbound',outbound.length);
 const marked=days.includes(today),btn=$('attendanceBtn'),btnText=$('attendanceBtnText'),note=$('attendanceNote');if(btn){btn.disabled=marked;btn.setAttribute('aria-pressed',marked?'true':'false')}if(btnText)btnText.textContent=marked?'Attendance Marked Today':'Mark Attendance Today';if(note)note.textContent=marked?'Today is counted in your attendance.':'Click once per workday to count your attendance.';
 const pickups=inbound.map(x=>x.pickupSeconds).filter(Number.isFinite),good=pickups.filter(x=>x<=TARGET).length;set('avgPickup',pickups.length?`${(pickups.reduce((a,b)=>a+b,0)/pickups.length).toFixed(1)} sec`:'—');set('pickupRate',pickups.length?`${(good/pickups.length*100).toFixed(2)}%`:'—');set('pickupRateSub',pickups.length?`${good} / ${pickups.length} inbound tickets`:'No stamped inbound tickets');
 const closed=t.map(closingDuration).filter(Number.isFinite),avg=closed.length?closed.reduce((a,b)=>a+b,0)/closed.length:null;set('avgClosing',avg==null?'—':`${avg.toFixed(2)} days`);set('avgClosingSub',closed.length?`${closed.length} closed / merged ticket${closed.length===1?'':'s'}`:'No closed tickets yet');
 const rate=closingScore(avg);set('closingRate',rate==null?'—':`${rate.toFixed(2)}%`);set('closingRateSub',avg==null?'1.5d = 100% · 3d = 75%':avg<=1.5?'Excellent · 100% target':avg>=3?'75% · 3 days or more':`${avg.toFixed(2)}d average · ${rate.toFixed(2)}%`);
}
$('attendanceBtn')?.addEventListener('click',markAttendance);
const oldRender=window.renderAnalytics;if(typeof oldRender==='function')window.renderAnalytics=function(){oldRender();update()};
window.showDetails=function(){update()};
const observer=new MutationObserver(update);const table=$('ticketTableBody');if(table)observer.observe(table,{childList:true,subtree:true});
window.addEventListener('storage',update);update();setInterval(update,30000);
})();