(()=>{'use strict';
const date=document.getElementById('todayDate'),clock=document.getElementById('currentTime');if(!date&&!clock)return;
let lastSecond=-1,lastDate='';
const dateFmt=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'});
const timeFmt=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit',second:'2-digit'});
function paint(force=false){
  const now=new Date(),sec=Math.floor(now.getTime()/1000);
  if(!force&&sec===lastSecond)return;
  lastSecond=sec;
  if(clock)clock.textContent=timeFmt.format(now);
  if(date){const next=dateFmt.format(now);if(force||next!==lastDate){lastDate=next;date.textContent=next}}
}
// Keep the visible clock tied to the browser's paint cycle instead of a 1-second timer.
// This lets the next available frame update the time immediately and avoids the old stop/start feel.
function frame(){paint(false);requestAnimationFrame(frame)}
paint(true);requestAnimationFrame(frame);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastSecond=-1;paint(true)}});
window.addEventListener('focus',()=>{lastSecond=-1;paint(true)});
})();