(()=>{'use strict';
if(window.ticketPremiumExperienceReady)return;window.ticketPremiumExperienceReady=true;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let viewGeneration=0;
function changeView(view){if(reduced||view==='tickets')return;const generation=++viewGeneration;[...document.querySelectorAll('main.container>.premium-view-section:not(.premium-view-hidden),.workspace-grid:not(.premium-view-hidden)')].filter((el,index,list)=>!list.some(parent=>parent!==el&&parent.contains(el))).forEach(el=>{el.classList.remove('premium-section-enter');requestAnimationFrame(()=>{if(generation===viewGeneration)el.classList.add('premium-section-enter')})})}
changeView(document.documentElement.dataset.trackerView||'dashboard');
// Replay metric counters on each tab opening without touching ticket identifiers or stored data.
const running=new Map();let counterFrame=0,animationFrame=0,waitingForData=true;
function finishAnimations(){cancelAnimationFrame(animationFrame);for(const [el,item] of running){if(el.isConnected&&el.textContent===item.last)el.textContent=item.final;if(item.bar?.isConnected)item.bar.style.width=item.width}running.clear()}
function animateCounters(){if(reduced)return;finishAnimations();const selector='#statsGrid .stat strong,#dashboardAttendanceMetrics .attendance-metric-card strong,.metric strong,.last5-metric b,.pickup-result strong,#statusBars .bar-row>b';
document.querySelectorAll(selector).forEach(el=>{if(!el.getClientRects().length)return;const final=el.textContent,match=final.match(/^(\d+(?:\.\d+)?)(.*)$/);if(!match)return;const bar=el.closest('.bar-row')?.querySelector('.bar>i');const item={final,last:'',target:Number(match[1]),decimals:(match[1].split('.')[1]||'').length,suffix:match[2],bar,width:bar?.style.width||'0%',widthNumber:parseFloat(bar?.style.width)||0};item.last=(0).toFixed(item.decimals)+item.suffix;el.textContent=item.last;if(bar)bar.style.width='0%';running.set(el,item)});
const start=performance.now(),duration=1100;
function step(time){const progress=Math.min(1,Math.max(0,(time-start)/duration)),eased=1-Math.pow(1-progress,3);for(const [el,item] of running){if(!el.isConnected){running.delete(el);continue}if(!el.getClientRects().length){el.textContent=item.final;if(item.bar)item.bar.style.width=item.width;running.delete(el);continue}if(el.textContent!==item.last&&el.textContent!==item.final){if(item.bar)item.bar.style.width=item.width;running.delete(el);continue}item.last=progress===1?item.final:(item.target*eased).toFixed(item.decimals)+item.suffix;el.textContent=item.last;if(item.bar?.isConnected)item.bar.style.width=progress===1?item.width:(item.widthNumber*eased)+'%'}if(progress<1&&running.size)animationFrame=requestAnimationFrame(step);else{running.clear();animationFrame=0}}
animationFrame=requestAnimationFrame(step)}
function queueCounters(){cancelAnimationFrame(counterFrame);counterFrame=requestAnimationFrame(()=>{counterFrame=requestAnimationFrame(()=>{counterFrame=0;animateCounters()})})}
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
