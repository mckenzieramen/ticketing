(()=>{'use strict';
const ids=['ticketNumber','stampTicket','stampedTime','answerTime'];
const inputs=ids.map(id=>document.getElementById(id)).filter(Boolean);
if(!inputs.length)return;
// Do not let non-essential global shortcut/listener work run while the user is actively encoding.
// Native input/default behavior is untouched, so each typed digit is painted immediately.
const mark=e=>{const el=e.target;if(!inputs.includes(el))return;el.dataset.ttsTyping='1';clearTimeout(el._ttsTypingTimer);el._ttsTypingTimer=setTimeout(()=>{delete el.dataset.ttsTyping},120)};
inputs.forEach(el=>{
 el.style.setProperty('transition','border-color .06s ease, box-shadow .06s ease');
 el.style.setProperty('will-change','auto');
 el.addEventListener('keydown',mark,{passive:true});
 el.addEventListener('beforeinput',mark,{passive:true});
 el.addEventListener('input',mark,{passive:true});
});
// Pickup calculation is useful only when both timestamps are complete. While a timestamp is partial,
// leave the keystroke completely alone and avoid any extra result rendering from this helper.
const complete=v=>/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\s*UTC)?$/i.test(String(v||'').trim());
let timer=0;
function settle(){clearTimeout(timer);timer=setTimeout(()=>{const s=document.getElementById('stampedTime'),a=document.getElementById('answerTime');if(s&&a&&complete(s.value)&&complete(a.value)&&typeof window.calculatePickup==='function')window.calculatePickup()},45)}
document.getElementById('stampedTime')?.addEventListener('input',settle,{passive:true});
document.getElementById('answerTime')?.addEventListener('input',settle,{passive:true});
})();