import {getApps,getApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import {getFirestore,doc,getDoc,getDocs,collection,setDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';
const KEY='premiumTicketTracker.v1';
const parse=v=>{try{const x=typeof v==='string'?JSON.parse(v):v;return Array.isArray(x)?x:[]}catch{return[]}};
const mergeTickets=(a,b)=>{const out=[],seen=new Set();for(const t of [...a,...b]){if(!t||typeof t!=='object')continue;const k=String(t.id||t.number||JSON.stringify(t));if(seen.has(k))continue;seen.add(k);out.push(t)}return out};
async function recover(user){
 const app=getApps().length?getApp():null;if(!app)return;
 const db=getFirestore(app),ref=doc(db,'users',user.uid,'data','appState');
 const canonicalSnap=await getDoc(ref),canonical=canonicalSnap.exists()?(canonicalSnap.data()?.values||{}):{};
 const current=parse(canonical[KEY]);
 let legacy={};try{const snap=await getDocs(collection(db,'users',user.uid,'localBackup'));snap.forEach(d=>{const x=d.data();if(x?.key)legacy[x.key]=x.raw})}catch(e){console.warn('Legacy recovery read unavailable',e)}
 const old=parse(legacy[KEY]);
 const recovered=mergeTickets(current,old);
 if(recovered.length>current.length){
   const values={...legacy,...canonical,[KEY]:JSON.stringify(recovered)};
   await setDoc(ref,{values,ownerUid:user.uid,ownerEmail:user.email||null,updatedAt:serverTimestamp(),schemaVersion:13,recoveryApplied:true},{merge:false});
   console.info(`Recovered ${recovered.length-current.length} ticket record(s) from Firebase backup.`);
   window.dispatchEvent(new CustomEvent('ticket-live-sync',{detail:{reason:'firebase-recovery'}}));
 }
}
const auth=()=>{try{return getAuth(getApp())}catch{return null}};
let done=false;const start=()=>{const a=auth();if(!a)return setTimeout(start,200);onAuthStateChanged(a,u=>{if(u&&!done){done=true;recover(u).catch(e=>console.error('Firebase recovery failed',e))}})};start();
