(()=>{'use strict';
// Firebase-only persistence bridge. Application data lives in RAM while the page is open;
// Firestore is the only permanent application database. Nothing below is written to Web Storage.
const exact=new Set(['premiumTicketTracker.v1','premiumTicketTracker.attendance.v1','premiumTicketTracker.monthlyArchives.v1','premiumTicketTracker.activeMonth.v1','premiumTicketTracker.ownerUid.v1','premiumTicketTracker.ownerEmail.v1']);
const prefixes=['premiumTicketTracker.'];
const memory=new Map();
const native={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,clear:Storage.prototype.clear,key:Storage.prototype.key};
const isAppKey=k=>{k=String(k);return exact.has(k)||prefixes.some(p=>k.startsWith(p))};
const isLocal=s=>s===window.localStorage;
Storage.prototype.getItem=function(k){if(isLocal(this)&&isAppKey(k))return memory.has(String(k))?memory.get(String(k)):null;return native.get.call(this,k)};
Storage.prototype.setItem=function(k,v){if(isLocal(this)&&isAppKey(k)){memory.set(String(k),String(v));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.set.call(this,k,v)};
Storage.prototype.removeItem=function(k){if(isLocal(this)&&isAppKey(k)){memory.delete(String(k));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.remove.call(this,k)};
Storage.prototype.clear=function(){if(isLocal(this)){for(const k of [...memory.keys()])memory.delete(k);window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:'*'}}));return}return native.clear.call(this)};
window.FirebaseOnlyMemory={get:k=>memory.get(k)??null,set:(k,v)=>memory.set(String(k),String(v)),remove:k=>memory.delete(String(k)),entries:()=>Object.fromEntries(memory),isApplicationKey:isAppKey};
})();