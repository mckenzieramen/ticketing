(()=>{'use strict';
const IDLE_MS=5*60*1000;
let timer=0;
function arm(){clearTimeout(timer);timer=setTimeout(()=>{if(document.visibilityState==='visible')location.reload();else arm()},IDLE_MS)}
function navigationActivity(e){if(e?.type==='tracker-view-changed'||e?.target?.closest?.('.premium-tabs button[data-view]'))arm()}
window.addEventListener('tracker-view-changed',navigationActivity);
document.addEventListener('pointerdown',e=>{if(e.target.closest('.premium-tabs button[data-view]'))navigationActivity(e)},{passive:true});
document.addEventListener('keydown',e=>{if(e.target.closest?.('.premium-tabs button[data-view]'))navigationActivity(e)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')arm()});
arm();
})();