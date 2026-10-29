(()=>{'use strict';
const IDLE_MS=5*60*1000;
let timer=0;
function arm(){clearTimeout(timer);timer=setTimeout(()=>{if(document.visibilityState==='visible')location.reload();else arm()},IDLE_MS)}
function isActiveControl(target){return !!target?.closest?.('.premium-tabs button[data-view], .status-pill, .inline-status, .inline-status-menu, .status-menu, select, button, input, textarea, [role="button"], [data-status], [data-view]')}
function activity(e){if(e?.type==='tracker-view-changed'||e?.type==='ticket-data-updated'||e?.type==='call-attempt-updated'||isActiveControl(e?.target))arm()}
window.addEventListener('tracker-view-changed',activity);
window.addEventListener('ticket-data-updated',activity);
window.addEventListener('call-attempt-updated',activity);
document.addEventListener('pointerdown',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('change',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('input',e=>{if(isActiveControl(e.target))activity(e)},{passive:true});
document.addEventListener('keydown',e=>{if(isActiveControl(e.target))activity(e)});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')arm()});
arm();
})();