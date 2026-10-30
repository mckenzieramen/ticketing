(()=>{'use strict';
const input=document.getElementById('stampedTime');
if(!input)return;
input.readOnly=false;input.placeholder='YYYY-MM-DD HH:mm:ss';input.setAttribute('autocomplete','off');input.setAttribute('inputmode','numeric');input.setAttribute('aria-label','Stamped Time in PH Time. Each click captures a new time immediately.');
const phParts=d=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));
const refreshPickup=()=>{if(typeof window.calculatePickup==='function')window.calculatePickup()};
let noticeTimer=0;
function showStampedNotice(value){let n=document.getElementById('instantStampNotice');if(!n){n=document.createElement('div');n.id='instantStampNotice';n.setAttribute('role','status');Object.assign(n.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%) translateY(-8px)',zIndex:'1000000',background:'#0f7a4d',color:'#fff',padding:'10px 16px',borderRadius:'10px',font:'700 13px Inter,system-ui,sans-serif',boxShadow:'0 10px 28px rgba(0,0,0,.18)',opacity:'0',transition:'opacity .08s ease,transform .08s ease',pointerEvents:'none',whiteSpace:'nowrap'});document.body.appendChild(n)}n.textContent=`✓ STAMPED · ${value} PH`;clearTimeout(noticeTimer);n.style.opacity='1';n.style.transform='translateX(-50%) translateY(0)';noticeTimer=setTimeout(()=>{n.style.opacity='0';n.style.transform='translateX(-50%) translateY(-8px)'},700)}
function instantStamp(){const d=new Date(),p=phParts(d),value=`${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}:${p.second}`;input.value=value;input.dataset.preciseEpoch=String(d.getTime());refreshPickup();showStampedNotice(value);input.dispatchEvent(new CustomEvent('ticket-stamped',{bubbles:true,detail:{value,epoch:d.getTime()}}));return value}
window.instantTicketStamp=instantStamp;
window.clearTicketStampDraft=()=>{};
const stampBtn=document.getElementById('stampBtn');
if(stampBtn){
 // One physical click = exactly one stamp. No pointerdown/mousedown/touchstart duplicate handlers.
 stampBtn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();instantStamp()},{capture:true});
 stampBtn.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();instantStamp()}},{capture:true});
}
document.addEventListener('keydown',e=>{if(!e.ctrlKey||e.altKey||e.metaKey||e.code!=='Space'||e.repeat)return;e.preventDefault();instantStamp()},{capture:true});
const normalize=()=>{const v=input.value.trim();if(!v){refreshPickup();return}const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(m)input.value=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;refreshPickup()};
input.addEventListener('change',normalize);input.addEventListener('blur',normalize);input.addEventListener('paste',()=>setTimeout(normalize,0),{passive:true});
})();