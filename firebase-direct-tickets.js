import {getApps,getApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,collection,doc,getDocs,setDoc,deleteDoc,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const KEY='premiumTicketTracker.v1';
const parse=raw=>{try{const x=JSON.parse(raw||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const ticketId=t=>String(t?.id||t?.number||t?.ticketNumber||'').trim();
const terminal=s=>['Solved','Closed','Merged'].includes(String(s||''));
let db=null,user=null,unsub=null,hydrated=false,writing=false;

function publish(list,reason){
  const clean=Array.isArray(list)?list:[];
  window.FirebaseOnlyMemory?.set(KEY,JSON.stringify(clean));
  window.setTicketStateFromFirebase?.(clean);
  window.dispatchEvent(new CustomEvent('ticket-live-sync',{detail:{reason,tickets:clean}}));
}
function mergePreferCurrent(remote,local){
  const map=new Map();
  for(const t of remote){const id=ticketId(t);if(id)map.set(id,t)}
  for(const t of local){const id=ticketId(t);if(!id)continue;const old=map.get(id);if(!old){map.set(id,t);continue}
    const next={...old,...t};
    if(terminal(old.status)&&!terminal(t.status)) next.status=old.status;
    map.set(id,next);
  }
  return [...map.values()];
}
async function migrateLegacy(){
  const col=collection(db,'users',user.uid,'tickets');
  const existing=await getDocs(col);
  const remote=[];existing.forEach(s=>remote.push(s.data()));
  const local=parse(localStorage.getItem(KEY));
  const merged=mergePreferCurrent(remote,local);
  if(!existing.empty||!merged.length)return;
  writing=true;
  try{for(const t of merged){const id=ticketId(t);if(id)await setDoc(doc(col,id),{...t,id,updatedAt:serverTimestamp()},{merge:true})}}finally{writing=false}
}
async function start(u){
  user=u;db=getFirestore(getApp());
  await migrateLegacy();
  if(unsub)unsub();
  unsub=onSnapshot(collection(db,'users',u.uid,'tickets'),snap=>{
    const list=[];snap.forEach(s=>list.push(s.data()));
    list.sort((a,b)=>String(b.creation||'').localeCompare(String(a.creation||'')));
    hydrated=true;window.__firebaseTicketHydrated=true;publish(list,'firestore-direct');
  },e=>console.error('Direct ticket sync failed',e));
}
async function upsert(ticket){
  if(!user||!db||!hydrated||!ticket)return false;const id=ticketId(ticket);if(!id)return false;
  const current=parse(localStorage.getItem(KEY)).find(t=>ticketId(t)===id);
  const safe={...ticket,id};if(current&&terminal(current.status)&&!terminal(safe.status))safe.status=current.status;
  await setDoc(doc(db,'users',user.uid,'tickets',id),{...safe,updatedAt:serverTimestamp()},{merge:true});return true;
}
async function remove(ticket){if(!user||!db||!hydrated)return false;const id=typeof ticket==='string'?ticket:ticketId(ticket);if(!id)return false;await deleteDoc(doc(db,'users',user.uid,'tickets',id));return true}
window.FirebaseDirectTickets={upsert,remove,isReady:()=>hydrated};
window.addEventListener('ticket-record-saved',e=>{const list=e.detail?.tickets;if(!Array.isArray(list)||!hydrated)return;const current=parse(localStorage.getItem(KEY));const currentIds=new Set(current.map(ticketId));for(const t of list)void upsert(t);for(const t of current){if(!list.some(x=>ticketId(x)===ticketId(t))&&currentIds.has(ticketId(t)))void remove(t)}});
window.addEventListener('firebase-memory-write',e=>{if(e.detail?.key!==KEY||!hydrated||writing)return;const list=parse(localStorage.getItem(KEY));for(const t of list)void upsert(t)});
const wait=()=>{try{const a=getAuth(getApp());onAuthStateChanged(a,u=>{if(u)start(u).catch(console.error);else{hydrated=false;window.__firebaseTicketHydrated=false;if(unsub){unsub();unsub=null}}})}catch{setTimeout(wait,150)}};wait();
