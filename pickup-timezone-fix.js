(()=>{'use strict';
const stamp=document.getElementById('stampedTime'),answer=document.getElementById('answerTime'),box=document.getElementById('pickupResult');
if(!stamp||!answer||!box)return;
const TARGET=20;
function parsePH(v){const m=String(v||'').trim().replace(/\s*PH\s*Time$/i,'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return null;return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4]-8,+m[5],+m[6]));}
function parseUTC(v){const m=String(v||'').trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\s*UTC)?$/i);if(!m)return null;return new Date(Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]));}
function calculate(){
 const ph=parsePH(stamp.value),utc=parseUTC(answer.value);
 if(!ph||!utc){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Enter the PH answer stamp and UTC call time.</em></div></div>';return null}
 // OWL System / Answer Time is the call/ring time in UTC. STAMP TIME is pressed when the call is answered in PH time.
 // Pickup duration = answer stamp - call time, after both values are normalized to the same instant/time zone.
 const sec=Math.round((ph.getTime()-utc.getTime())/1000);
 if(sec<0){
   box.className='pickup-result late';
   box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Invalid timestamp order</strong><em>The stamped answer time is earlier than the call time after UTC → PH conversion.</em></div></div>';
   return null;
 }
 const ok=sec<=TARGET;
 box.className='pickup-result '+(ok?'':'late');
 box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>UTC call time converted to PH automatically · Target: ≤ ${TARGET} seconds</em></div></div>`;
 return sec;
}
window.calculatePickup=calculate;
['input','change','blur'].forEach(ev=>{stamp.addEventListener(ev,calculate);answer.addEventListener(ev,calculate)});
answer.addEventListener('paste',()=>setTimeout(calculate,0));stamp.addEventListener('paste',()=>setTimeout(calculate,0));
setTimeout(calculate,0);
})();