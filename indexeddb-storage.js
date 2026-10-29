(()=>{'use strict';
// Legacy filename retained so existing page loading stays stable.
// IndexedDB persistence is intentionally disabled. Firestore is the only permanent application database.
const prefix='premiumTicketTracker.';
const memory=new Map();
const native={get:Storage.prototype.getItem,set:Storage.prototype.setItem,remove:Storage.prototype.removeItem,clear:Storage.prototype.clear,key:Storage.prototype.key};
const isAppKey=k=>String(k).startsWith(prefix),isLocal=s=>s===window.localStorage;
// One-time safe migration: copy the previous browser cache to RAM for this page boot, then erase it from localStorage.
try{const old=[];for(let i=0;i<localStorage.length;i++){const k=native.key.call(localStorage,i);if(k&&isAppKey(k))old.push(k)}for(const k of old){const v=native.get.call(localStorage,k);if(v!==null)memory.set(k,v)}for(const k of old)native.remove.call(localStorage,k)}catch(e){console.warn('Browser cache cleanup skipped',e)}
Storage.prototype.getItem=function(k){if(isLocal(this)&&isAppKey(k))return memory.has(String(k))?memory.get(String(k)):null;return native.get.call(this,k)};
Storage.prototype.setItem=function(k,v){if(isLocal(this)&&isAppKey(k)){memory.set(String(k),String(v));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.set.call(this,k,v)};
Storage.prototype.removeItem=function(k){if(isLocal(this)&&isAppKey(k)){memory.delete(String(k));window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:String(k)}}));return}return native.remove.call(this,k)};
Storage.prototype.clear=function(){if(isLocal(this)){memory.clear();window.dispatchEvent(new CustomEvent('firebase-memory-write',{detail:{key:'*'}}));return}return native.clear.call(this)};
window.FirebaseOnlyMemory={get:k=>memory.get(String(k))??null,set:(k,v)=>memory.set(String(k),String(v)),remove:k=>memory.delete(String(k)),entries:()=>Object.fromEntries(memory),isApplicationKey:isAppKey};
// Compatibility API for old callers: RAM only, never IndexedDB.
window.TicketDB={get:async k=>{const v=memory.get(String(k));if(v==null)return undefined;try{return JSON.parse(v)}catch{return v}},put:async(k,v)=>{memory.set(String(k),typeof v==='string'?v:JSON.stringify(v))},ready:async()=>true,getTickets:async()=>window.TicketDB.get('premiumTicketTracker.v1'),getAttendance:async()=>window.TicketDB.get('premiumTicketTracker.attendance.v1'),getArchives:async()=>window.TicketDB.get('premiumTicketTracker.monthlyArchives.v1')};
window.dispatchEvent(new CustomEvent('indexeddb-storage-ready'));
})();