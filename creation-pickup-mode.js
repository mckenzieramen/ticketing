(()=>{'use strict';
const TARGET=20,KEY='premiumTicketTracker.v1';
const $=id=>document.getElementById(id);
const clean=v=>String(v||'').trim().replace(/\s*UTC\s*$/i,'').replace('T',' ');
function parseUTC(v){const m=clean(v).match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);return m?Date.UTC(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]):null}
function pickup(){const a=parseUTC($('stampedTime')?.value),b=parseUTC($('answerTime')?.value),box=$('pickupResult');if(a==null||b==null){if(box){box.className='pickup-result empty';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for UTC timestamps</strong><em>Paste Time of call and Started at from the call details.</em></div></div>'}return null}const raw=Math.round((b-a)/1000);if(raw<0){box.className='pickup-result late';box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Invalid timestamp order</strong><em>Started at is earlier than Time of call.</em></div></div>';return null}const sec=Math.max(0,raw-60),ok=sec<=TARGET;box.className='pickup-result '+(ok?'':'late');box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?'':'s'} · ${ok?'Within Target':'Over Target'}</strong><em>(Started at − Time of call) − 1 minute · Target: ≤ ${TARGET} seconds</em></div></div>`;return sec}
window.calculatePickup=pickup;
function redesign(){const panel=document.querySelector('.stamp-panel');if(!panel)return;panel.querySelector('.panel-title').innerHTML='<span>◉</span> Inbound Pickup Rate <small style="margin-left:auto;font-weight:600;opacity:.7">UTC</small>';$('stampBtn')?.remove();$('copyStamp')?.remove();const helper=panel.querySelector('.helper.centered');if(helper)helper.textContent='Copy both UTC timestamps directly from the call details below.';const creation=$('stampedTime');if(creation){const label=creation.closest('label');if(label){for(const n of [...label.childNodes])if(n.nodeType===3&&n.textContent.trim())n.textContent='Ticket Creation / Time of call (UTC)';}creation.placeholder='YYYY-MM-DD HH:mm:ss UTC';creation.removeAttribute('readonly')}
const answer=$('answerTime');if(answer){const label=answer.closest('label');if(label){for(const n of [...label.childNodes])if(n.nodeType===3&&n.textContent.trim())n.textContent='Started at / Answer Time (UTC) ';}answer.placeholder='YYYY-MM-DD HH:mm:ss UTC'}
const btn=$('saveStampBtn');if(btn)btn.innerHTML='▣ &nbsp; Save Inbound Ticket';
const box=$('pickupResult');if(box)box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for UTC timestamps</strong><em>Paste Time of call and Started at from the call details.</em></div></div>';
}
function normalize(el){if(!el)return;const v=clean(el.value);if(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v))el.value=v+' UTC';pickup()}
document.addEventListener('input',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')requestAnimationFrame(pickup)},true);
document.addEventListener('change',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')normalize(e.target)},true);
document.addEventListener('paste',e=>{if(e.target?.id==='stampedTime'||e.target?.id==='answerTime')requestAnimationFrame(()=>normalize(e.target))},true);
window.addEventListener('load',redesign,{once:true});if(document.readyState!=='loading')redesign();
})();