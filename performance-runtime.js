(()=>{'use strict';
const TICKET_KEY='premiumTicketTracker.v1';
const nativeSetInterval=window.setInterval.bind(window);
const nativeSetItem=Storage.prototype.setItem;
let nextSolvedDue=Infinity;
function parseLocal(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(!m)return NaN;return new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]).getTime()}
function refreshNextDue(){nextSolvedDue=Infinity;try{const rows=JSON.parse(localStorage.getItem(TICKET_KEY)||'[]');for(const t of rows){if(t?.status!=='Solved'||!t.expectedClose)continue;const due=parseLocal(t.expectedClose);if(Number.isFinite(due)&&due<nextSolvedDue)nextSolvedDue=due}}catch{nextSolvedDue=Infinity}}
refreshNextDue();
Storage.prototype.setItem=function(k,v){nativeSetItem.call(this,k,v);if(this===localStorage&&String(k)===TICKET_KEY)refreshNextDue()};
window.setInterval=function(callback,delay,...args){if(delay===1000&&typeof callback==='function'&&callback.name==='tickClock'){
  return nativeSetInterval(()=>{const d=new Date(),date=document.getElementById('todayDate'),clock=document.getElementById('currentTime');if(date)date.textContent=d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});if(clock)clock.textContent=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit',second:'2-digit'});if(Date.now()>=nextSolvedDue){callback(...args);refreshNextDue()}},1000)
}return nativeSetInterval(callback,delay,...args)};
})();