(()=>{'use strict';
const date=document.getElementById('todayDate'),clock=document.getElementById('currentTime');if(!date&&!clock)return;
let lastSecond=-1;
function paint(){const now=new Date(),sec=Math.floor(now.getTime()/1000);if(sec===lastSecond)return;lastSecond=sec;if(date)date.textContent=now.toLocaleDateString('en-US',{timeZone:'Asia/Manila',month:'long',day:'numeric',year:'numeric'});if(clock)clock.textContent=now.toLocaleTimeString('en-US',{timeZone:'Asia/Manila',hour:'numeric',minute:'2-digit',second:'2-digit'});}
function schedule(){paint();const delay=1000-(Date.now()%1000)+8;setTimeout(schedule,delay)}
document.addEventListener('visibilitychange',()=>{if(!document.hidden){lastSecond=-1;paint()}});window.addEventListener('focus',()=>{lastSecond=-1;paint()});schedule();
})();