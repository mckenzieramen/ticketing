(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let viewGeneration=0;
function changeView(view){if(reduced)return;const generation=++viewGeneration;document.querySelectorAll('main.container>.premium-view-section:not(.premium-view-hidden),.workspace-grid:not(.premium-view-hidden)').forEach(el=>{el.classList.remove('premium-section-enter');requestAnimationFrame(()=>{if(generation===viewGeneration)el.classList.add('premium-section-enter')})})}
window.addEventListener('tracker-view-changed',e=>changeView(e.detail?.view));
changeView(document.documentElement.dataset.trackerView||'dashboard');
// Animate only the initial dashboard counts. Later updates remain immediate and accurate.
let animated=false;
function animateCounters(){if(animated||reduced||document.documentElement.dataset.trackerView!=='dashboard')return;const items=[...document.querySelectorAll('#statsGrid .stat strong')];if(!items.length||!items.some(el=>Number(el.textContent)>0))return;animated=true;items.forEach(el=>{const target=Number(el.textContent);if(!Number.isFinite(target)||target<=0)return;const start=performance.now();function step(time){if(!el.isConnected)return;const progress=Math.min(1,(time-start)/500);el.textContent=String(Math.round(target*(1-Math.pow(1-progress,3))));if(progress<1)requestAnimationFrame(step);else el.textContent=String(target)}requestAnimationFrame(step)})}
['ticket-live-sync','ticket-records-rendered','tracker-view-changed'].forEach(name=>window.addEventListener(name,()=>requestAnimationFrame(animateCounters)));requestAnimationFrame(animateCounters);
document.addEventListener('click',e=>{if(reduced)return;const button=e.target.closest('button');if(!button||button.disabled)return;button.classList.remove('premium-button-pulse');requestAnimationFrame(()=>button.classList.add('premium-button-pulse'))});
document.addEventListener('animationend',e=>{if(e.animationName==='premium-press')e.target.classList.remove('premium-button-pulse');if(e.animationName==='premium-enter')e.target.classList.remove('premium-section-enter')});
})();
