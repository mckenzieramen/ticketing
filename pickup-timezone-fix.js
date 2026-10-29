(()=>{'use strict';
const TARGET=20;
const getStamp=()=>document.getElementById('stampedTime'),getAnswer=()=>document.getElementById('answerTime'),getBox=()=>document.getElementById('pickupResult');
function parts(v,suffix){const clean=String(v||'').trim().replace(suffix,'').trim();const m=clean.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return null;return m.slice(1).map(Number)}
function parsePH(v){const p=parts(v,/\s*(?:PH|PHT|PH\s*Time)\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h-8,mi,s)}
function parseUTC(v){const p=parts(v,/\s*UTC\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h,mi,s)}
function renderWaiting(box){if(!box)return;if(box.dataset.pickupState==='waiting')return;box.dataset.pickupState='waiting';box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Press STAMP TIME in PH time, then paste System / Answer Time in UTC.</em></div></div>'}
function calculate(){const stamp=getStamp(),answer=getAnswer(),box=getBox();if(!stamp||!answer||!box)return null;const stampUTC=parsePH(stamp.value),systemUTC=parseUTC(answer.value);if(stampUTC==null||systemUTC==null){renderWaiting(box);return null}const sec=Math.round(Math.abs(stampUTC-systemUTC)/1000),ok=sec<=TARGET;const state=`${sec}|${ok}`;if(box.dataset.pickupState!==state){box.dataset.pickupState=state;box.className='pickup-result '+(ok?'':'late');box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>PH stamp normalized to UTC automatically · Target: ≤ ${TARGET} seconds</em></div></div>`}return sec}
window.calculatePickup=calculate;
let frame=0;function schedule(){if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const s=getStamp()?.value.trim()||'',a=getAnswer()?.value.trim()||'';if(s.length>=19&&a.replace(/\s*UTC\s*$/i,'').trim().length>=19)calculate()})}
// Do not rebuild pickup-result on every digit. Native typing/paste gets the main thread first.
document.addEventListener('input',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')schedule()},{passive:true});
document.addEventListener('paste',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')requestAnimationFrame(schedule)},{passive:true});
queueMicrotask(calculate);
})();