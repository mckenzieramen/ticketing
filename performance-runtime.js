(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1';
let nextSolvedDue=Infinity,refreshQueued=false,checkTimer=null;
function parseLocal(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return NaN;return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]).getTime()}
function refreshNextDue(){nextSolvedDue=Infinity;try{const rows=JSON.parse(localStorage.getItem(TICKET_KEY)||'[]');for(const t of rows){if(t?.status!=='Solved'||!t.expectedClose)continue;const due=parseLocal(t.expectedClose);if(Number.isFinite(due)&&due<nextSolvedDue)nextSolvedDue=due}}catch{nextSolvedDue=Infinity}}
function queueRefresh(){if(refreshQueued)return;refreshQueued=true;requestAnimationFrame(()=>{refreshQueued=false;refreshNextDue();scheduleDueCheck()})}
function scheduleDueCheck(){if(checkTimer!==null){clearTimeout(checkTimer);checkTimer=null}if(!Number.isFinite(nextSolvedDue))return;const wait=Math.max(250,Math.min(nextSolvedDue-Date.now()+50,2147483000));checkTimer=setTimeout(()=>{checkTimer=null;if(Date.now()>=nextSolvedDue){window.dispatchEvent(new CustomEvent('ticket-solved-due'));refreshNextDue()}scheduleDueCheck()},wait)}
refreshNextDue();scheduleDueCheck();
// Firebase-only mode already owns storage. Do not wrap Storage.prototype again.
// Listen to the app's lightweight change events instead so one save produces one refresh path.
window.addEventListener('ticket-data-updated',queueRefresh);
window.addEventListener('ticket-record-saved',queueRefresh);
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key===TICKET_KEY||e.detail?.key==='*')queueRefresh()});
})();