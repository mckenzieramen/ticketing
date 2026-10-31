(()=>{'use strict';
const KEY='premiumTicketTracker.v1';
function syncVisibleTickets(){
  try{
    const raw=localStorage.getItem(KEY);
    const next=JSON.parse(raw||'[]');
    if(!Array.isArray(next))return;
    // app.js keeps the canonical UI array in the shared classic-script global lexical scope.
    tickets=next;
    if(typeof normalizeLegacy==='function')normalizeLegacy();
    if(typeof render==='function')render();
    window.dispatchEvent(new CustomEvent('ticket-data-visible',{detail:{count:next.length}}));
  }catch(e){console.error('Ticket hydration render refresh failed',e)}
}
window.addEventListener('ticket-live-sync',()=>requestAnimationFrame(syncVisibleTickets));
window.addEventListener('firebase-data-saved',()=>requestAnimationFrame(syncVisibleTickets));
})();
