(()=>{'use strict';
const input=document.getElementById('stampedTime'),stampBtn=document.getElementById('stampBtn');
if(!input)return;
input.readOnly=false;input.placeholder='YYYY-MM-DD HH:mm:ss';input.setAttribute('autocomplete','off');input.setAttribute('inputmode','numeric');input.setAttribute('aria-label','Stamped Time in PH Time. Each press captures a new time immediately.');
// Asia/Manila is UTC+8 year-round. Avoid Intl formatting work on every stamp.
const pad=n=>String(n).padStart(2,'0');
function phStamp(epoch){const d=new Date(epoch+28800000);return `${d.getUTCFullYear()}-${pad(d.getUTCMonth()+1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`}
let lastPhysicalStamp=0,noticeTimer=0;
function notice(value){let n=document.getElementById('instantStampNotice');if(!n){n=document.createElement('div');n.id='instantStampNotice';n.setAttribute('role','status');Object.assign(n.style,{position:'fixed',top:'18px',left:'50%',transform:'translateX(-50%)',zIndex:'1000000',background:'#0f7a4d',color:'#fff',padding:'10px 16px',borderRadius:'10px',font:'700 13px Inter,system-ui,sans-serif',boxShadow:'0 10px 28px rgba(0,0,0,.18)',pointerEvents:'none',whiteSpace:'nowrap'});document.body.appendChild(n)}n.textContent=`✓ STAMPED · ${value} PH`;n.style.display='block';clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{n.style.display='none'},650)}
function stamp(){const epoch=Date.now(),value=phStamp(epoch);input.value=value;input.dataset.preciseEpoch=String(epoch);notice(value);
 // Anything heavier happens after the value is already painted.
 requestAnimationFrame(()=>{if(typeof window.calculatePickup==='function')window.calculatePickup();input.dispatchEvent(new CustomEvent('ticket-stamped',{bubbles:true,detail:{value,epoch}}))});return value}
function physicalStamp(e){const now=performance.now();if(now-lastPhysicalStamp<250)return;lastPhysicalStamp=now;e.preventDefault();e.stopImmediatePropagation();stamp()}
window.instantTicketStamp=stamp;window.clearTicketStampDraft=()=>{};
if(stampBtn){
 // pointerdown fires before click, so the timestamp appears at the instant the button is pressed.
 stampBtn.addEventListener('pointerdown',physicalStamp,{capture:true});
 stampBtn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation()},{capture:true});
 stampBtn.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();stamp()}},{capture:true});
}
document.addEventListener('keydown',e=>{if(!e.ctrlKey||e.altKey||e.metaKey||e.code!=='Space'||e.repeat)return;e.preventDefault();stamp()},{capture:true});
function normalize(){const v=input.value.trim();if(!v){if(typeof window.calculatePickup==='function')window.calculatePickup();return}const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);if(m)input.value=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;if(typeof window.calculatePickup==='function')window.calculatePickup()}
input.addEventListener('change',normalize);input.addEventListener('blur',normalize);input.addEventListener('paste',()=>setTimeout(normalize,0),{passive:true});
})();