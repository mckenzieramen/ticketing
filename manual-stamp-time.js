(()=>{'use strict';
const input=document.getElementById('stampedTime');
if(!input)return;
input.readOnly=false;
input.placeholder='YYYY-MM-DD HH:mm:ss';
input.setAttribute('autocomplete','off');
input.setAttribute('inputmode','numeric');
input.setAttribute('aria-label','Stamped Time in PH Time. Press STAMP TIME for immediate capture or enter manually.');
const pad=n=>String(n).padStart(2,'0');
const instantStamp=()=>{const d=new Date();input.value=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;input.dataset.preciseEpoch=String(d.getTime());if(typeof window.calculatePickup==='function')window.calculatePickup();};
const stampBtn=document.getElementById('stampBtn');
if(stampBtn){
 stampBtn.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;instantStamp();stampBtn.dataset.instantStamped='1';},{capture:true});
 stampBtn.addEventListener('click',e=>{if(stampBtn.dataset.instantStamped==='1'){e.preventDefault();e.stopImmediatePropagation();delete stampBtn.dataset.instantStamped;}},{capture:true});
 stampBtn.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&!e.repeat){instantStamp();stampBtn.dataset.keyboardStamped='1';}},{capture:true});
 stampBtn.addEventListener('click',e=>{if(stampBtn.dataset.keyboardStamped==='1'){e.preventDefault();e.stopImmediatePropagation();delete stampBtn.dataset.keyboardStamped;}},{capture:true});
}
const normalize=()=>{
 const v=input.value.trim();
 if(!v)return;
 const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
 if(m)input.value=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
 if(typeof window.calculatePickup==='function')window.calculatePickup();
};
input.addEventListener('input',()=>{delete input.dataset.preciseEpoch;if(typeof window.calculatePickup==='function')window.calculatePickup()});
input.addEventListener('blur',normalize);
input.addEventListener('paste',()=>setTimeout(normalize,0));
})();