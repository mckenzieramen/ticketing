(()=>{'use strict';
if(document.getElementById('trackerSyncHealth'))return;
const host=document.querySelector('.header-right');if(!host)return;
const box=document.createElement('div');box.id='trackerSyncHealth';box.className='tracker-sync-health';box.innerHTML='<span class="sync-dot"></span><div><small>Firebase Sync</small><strong>Checking…</strong><em>Waiting for sync</em></div>';
host.insertBefore(box,host.firstChild);
const s=document.createElement('style');s.textContent=`.tracker-sync-health{display:flex;align-items:center;gap:8px;padding:7px 10px;border:1px solid rgba(255,255,255,.22);border-radius:10px;background:rgba(255,255,255,.08);color:#fff;min-width:126px}.tracker-sync-health .sync-dot{width:8px;height:8px;border-radius:50%;background:#f59e0b;box-shadow:0 0 0 3px rgba(245,158,11,.16)}.tracker-sync-health div{display:flex;flex-direction:column;line-height:1.15}.tracker-sync-health small{font-size:8px;opacity:.72;font-weight:700}.tracker-sync-health strong{font-size:10px}.tracker-sync-health em{font-style:normal;font-size:7px;opacity:.68}.tracker-sync-health.saved .sync-dot{background:#32c875;box-shadow:0 0 0 3px rgba(50,200,117,.16)}.tracker-sync-health.error .sync-dot{background:#ef5358;box-shadow:0 0 0 3px rgba(239,83,88,.16)}@media(max-width:900px){.tracker-sync-health{display:none}}`;document.head.appendChild(s);
const strong=box.querySelector('strong'),em=box.querySelector('em');
function time(){return new Intl.DateTimeFormat('en-PH',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(new Date())}
function state(label,sub,kind=''){box.classList.remove('saved','error');if(kind)box.classList.add(kind);strong.textContent=label;em.textContent=sub}
window.addEventListener('firebase-data-saved',()=>state('Saved ✓','Last synced '+time(),'saved'));
window.addEventListener('ticket-live-sync',()=>state('Firebase Live','Synced '+time(),'saved'));
window.addEventListener('offline',()=>state('Offline','Changes waiting','error'));
window.addEventListener('online',()=>state('Reconnecting…','Internet restored'));
setTimeout(()=>{if(navigator.onLine)state('Firebase Live','Monitoring sync','saved');else state('Offline','Changes waiting','error')},1400);
})();