(()=>{'use strict';
if(window.ticketPremiumExperienceReady)return;window.ticketPremiumExperienceReady=true;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let viewGeneration=0;
function changeView(view){if(reduced)return;const generation=++viewGeneration;[...document.querySelectorAll('main.container>.premium-view-section:not(.premium-view-hidden),.workspace-grid:not(.premium-view-hidden)')].filter((el,index,list)=>!list.some(parent=>parent!==el&&parent.contains(el))).forEach(el=>{el.classList.remove('premium-section-enter');requestAnimationFrame(()=>{if(generation===viewGeneration)el.classList.add('premium-section-enter')})})}
changeView(document.documentElement.dataset.trackerView||'dashboard');
// Replay metric counters on each tab opening without touching ticket identifiers or stored data.
const running=new WeakMap();let counterFrame=0,waitingForData=true;
function animateCounters(){if(reduced)return;document.querySelectorAll('#statsGrid .stat strong,#dashboardAttendanceMetrics .attendance-metric-card strong,.metric strong,.last5-metric b,.pickup-result strong').forEach(el=>{if(!el.getClientRects().length)return;const previous=running.get(el);const final=previous&&el.textContent===previous.last?previous.final:el.textContent;const match=final.match(/^(\d+(?:\.\d+)?)(.*)$/);if(!match)return;const target=Number(match[1]),decimals=(match[1].split('.')[1]||'').length,suffix=match[2],run={final,last:final};running.set(el,run);const start=performance.now();function step(time){if(!el.isConnected||running.get(el)!==run)return;if(!el.getClientRects().length){if(el.textContent===run.last)el.textContent=final;running.delete(el);return;}if(el.textContent!==run.last){running.delete(el);return}const progress=Math.min(1,(time-start)/550);run.last=progress===1?final:(target*(1-Math.pow(1-progress,3))).toFixed(decimals)+suffix;el.textContent=run.last;if(progress<1)requestAnimationFrame(step);else running.delete(el)}requestAnimationFrame(step)})}
function queueCounters(){cancelAnimationFrame(counterFrame);counterFrame=requestAnimationFrame(()=>{counterFrame=requestAnimationFrame(animateCounters)})}
window.addEventListener('tracker-view-changed',e=>{changeView(e.detail?.view);waitingForData=true;queueCounters()});
window.addEventListener('ticket-live-sync',()=>{if(waitingForData){waitingForData=false;queueCounters()}});
queueCounters();
let recordsFrame=0;
function revealRecords(){if(reduced)return;const panel=document.querySelector('.records-panel'),table=panel?.querySelector('.table-scroll');if(!table||panel.getAttribute('aria-busy')==='true'||document.documentElement.dataset.trackerView!=='tickets')return;cancelAnimationFrame(recordsFrame);table.classList.remove('premium-records-reveal');recordsFrame=requestAnimationFrame(()=>{recordsFrame=requestAnimationFrame(()=>{if(document.documentElement.dataset.trackerView==='tickets')table.classList.add('premium-records-reveal')})})}
window.addEventListener('ticket-records-ready',revealRecords);
window.addEventListener('tracker-view-changed',e=>{if(e.detail?.view==='tickets')revealRecords()});
document.addEventListener('click',e=>{if(reduced)return;const button=e.target.closest('button');if(!button||button.disabled)return;button.classList.remove('premium-button-pulse');requestAnimationFrame(()=>button.classList.add('premium-button-pulse'))});
document.addEventListener('animationend',e=>{if(e.animationName==='premium-records-in')e.target.classList.remove('premium-records-reveal');if(e.animationName==='premium-press')e.target.classList.remove('premium-button-pulse');if(e.animationName==='premium-enter')e.target.classList.remove('premium-section-enter')});
})();
