(()=>{'use strict';
const stamp=document.getElementById('stampedTime'),answer=document.getElementById('answerTime'),box=document.getElementById('pickupResult');
if(!stamp||!answer||!box)return;
const TARGET=20;
function parsePH(v){const m=String(v||'').trim().replace(/\s*PH\s*Time$/i,'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return null;return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-8,+m[5],+m[6]);}
function parseUTC(v){const m=String(v||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(!m)return null;return Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]);}
function calculate(){
 const stampUTC=parsePH(stamp.value),systemUTC=parseUTC(answer.value);
 if(stampUTC==null||systemUTC==null){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Stamp PH time, then paste the UTC system / answer time.</em></div></div>';return null}
 // STAMP TIME is the local PH capture. System / Answer Time is UTC.
 // Normalize PH stamp to UTC first. Pickup is the absolute elapsed gap between the two captured instants.
 // This keeps valid near-simultaneous captures from being rejected when the source system records the UTC event just after the local stamp.
 const sec=Math.round(Math.abs(systemUTC-stampUTC)/1000);
 const ok=sec<=TARGET;
 box.className='pickup-result '+(ok?'':'late');
 box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>PH stamp normalized to UTC automatically · Target: ≤ ${TARGET} seconds</em></div></div>`;
 return sec;
}
window.calculatePickup=calculate;
['input','change'].forEach(ev=>{stamp.addEventListener(ev,calculate,{passive:true});answer.addEventListener(ev,calculate,{passive:true})});
answer.addEventListener('paste',()=>queueMicrotask(calculate));stamp.addEventListener('paste',()=>queueMicrotask(calculate));
queueMicrotask(calculate);
})();