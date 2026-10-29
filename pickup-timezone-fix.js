(()=>{'use strict';
const stamp=document.getElementById('stampedTime'),answer=document.getElementById('answerTime'),box=document.getElementById('pickupResult');
if(!stamp||!answer||!box)return;
const TARGET=20;
function parts(v,suffix){const clean=String(v||'').trim().replace(suffix,'').trim();const m=clean.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return null;return m.slice(1).map(Number)}
function parsePH(v){const p=parts(v,/\s*(?:PH|PHT|PH\s*Time)\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h-8,mi,s)}
function parseUTC(v){const p=parts(v,/\s*UTC\s*$/i);if(!p)return null;const [y,mo,d,h,mi,s]=p;return Date.UTC(y,mo-1,d,h,mi,s)}
function renderWaiting(){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Press STAMP TIME in PH time, then paste System / Answer Time in UTC.</em></div></div>'}
function calculate(){
 const stampUTC=parsePH(stamp.value),systemUTC=parseUTC(answer.value);
 if(stampUTC==null||systemUTC==null){renderWaiting();return null}
 // The two fields come from different clocks/time zones. Convert the PH stamp to UTC,
 // then measure the elapsed gap between the two captured instants. Either source may be
 // recorded a few seconds before the other, so direction must not make a valid pickup invalid.
 const sec=Math.round(Math.abs(stampUTC-systemUTC)/1000);
 const ok=sec<=TARGET;
 box.className='pickup-result '+(ok?'':'late');
 box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>PH stamp normalized to UTC automatically · Target: ≤ ${TARGET} seconds</em></div></div>`;
 return sec;
}
window.calculatePickup=calculate;
['input','change','blur'].forEach(ev=>{stamp.addEventListener(ev,calculate,{passive:true});answer.addEventListener(ev,calculate,{passive:true})});
stamp.addEventListener('paste',()=>setTimeout(calculate,0));answer.addEventListener('paste',()=>setTimeout(calculate,0));
queueMicrotask(calculate);
})();