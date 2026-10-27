(()=>{'use strict';
const input=document.getElementById('stampedTime');
if(!input)return;
input.readOnly=false;
input.placeholder='YYYY-MM-DD HH:mm:ss';
input.setAttribute('autocomplete','off');
input.setAttribute('inputmode','numeric');
input.setAttribute('aria-label','Stamped Time in PH Time. Click STAMP TIME or enter manually.');
const normalize=()=>{
 const v=input.value.trim();
 if(!v)return;
 const m=v.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
 if(m)input.value=`${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
 if(typeof window.calculatePickup==='function')window.calculatePickup();
};
input.addEventListener('input',()=>{if(typeof window.calculatePickup==='function')window.calculatePickup()});
input.addEventListener('blur',normalize);
input.addEventListener('paste',()=>setTimeout(normalize,0));
})();