(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
function read(){try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function sync(reason='live-sync'){
  const latest=read();
  try{tickets=latest}catch(e){console.warn('Ticket state bridge could not update app state',e);return}
  try{render()}catch{}
  window.dispatchEvent(new CustomEvent('ticket-state-bridge-synced',{detail:{reason,count:latest.length}}));
}
['ticket-live-sync','ticket-record-saved','ticket-data-updated'].forEach(name=>window.addEventListener(name,()=>sync(name)));
window.addEventListener('firebase-data-saved',()=>sync('firebase-data-saved'));
window.syncTicketAppState=sync;
})();