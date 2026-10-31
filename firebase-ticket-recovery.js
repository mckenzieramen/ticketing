import { getApps, getApp, initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
import { getFirestore, doc, getDoc, getDocs, collection, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyBYxjcIbOpjx-gaVnbrkI6n22-FahZL3AM',authDomain:'ticket-tracking-system-6b6d5.firebaseapp.com',projectId:'ticket-tracking-system-6b6d5',storageBucket:'ticket-tracking-system-6b6d5.firebasestorage.app',messagingSenderId:'803970589691',appId:'1:803970589691:web:8d4a7ea0bafd1d301c615e'};
const app=getApps().length?getApp():initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const KEY='premiumTicketTracker.v1';
const stateRef=u=>doc(db,'users',u.uid,'data','appState');
const parse=raw=>{try{const v=JSON.parse(raw||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
const stamp=t=>String(t?.lastEditedAt||t?.closedTime||t?.solvedTime||t?.creation||'');
function mergeTickets(current,backup){
  const map=new Map();
  for(const t of backup){const k=String(t?.id||t?.number||'').trim();if(k)map.set(k,t)}
  for(const t of current){const k=String(t?.id||t?.number||'').trim();if(!k)continue;const old=map.get(k);if(!old||stamp(t)>=stamp(old))map.set(k,t)}
  return [...map.values()].sort((a,b)=>String(b.creation||'').localeCompare(String(a.creation||'')));
}
async function recover(user){
  if(!user)return;
  try{
    const canonical=await getDoc(stateRef(user));
    if(!canonical.exists())return;
    const data=canonical.data()||{},values={...(data.values||{})},current=parse(values[KEY]);
    const legacy=await getDocs(collection(db,'users',user.uid,'localBackup'));
    let backup=[];
    legacy.forEach(s=>{const x=s.data();if(x?.key===KEY){const list=parse(x.raw);if(list.length>backup.length)backup=list}});
    if(!backup.length)return;
    const merged=mergeTickets(current,backup);
    if(merged.length<=current.length)return;
    values[KEY]=JSON.stringify(merged);
    await setDoc(stateRef(user),{...data,values,updatedAt:serverTimestamp(),schemaVersion:13},{merge:false});
    console.info(`Recovered ticket history: ${current.length} -> ${merged.length}`);
  }catch(e){console.warn('Ticket history recovery skipped',e)}
}
onAuthStateChanged(auth,user=>{if(user)void recover(user)});
