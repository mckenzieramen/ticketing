(()=>{'use strict';
// Keep the Ticket Records viewport completely stable while controls update.
const getScroll=()=>document.querySelector('.records-panel .table-scroll');
let lock=null,raf=0;
function capture(){const sc=getScroll();if(!sc)return;lock={top:sc.scrollTop,left:sc.scrollLeft,pageX:window.scrollX,pageY:window.scrollY,until:performance.now()+700};}
function hold(){if(!lock)return;const sc=getScroll();if(sc){if(Math.abs(sc.scrollTop-lock.top)>0)sc.scrollTop=lock.top;if(Math.abs(sc.scrollLeft-lock.left)>0)sc.scrollLeft=lock.left;}if(Math.abs(window.scrollY-lock.pageY)>1||Math.abs(window.scrollX-lock.pageX)>1)window.scrollTo(lock.pageX,lock.pageY);if(performance.now()<lock.until)raf=requestAnimationFrame(hold);else{lock=null;raf=0;}}
function startHold(){capture();if(!raf)raf=requestAnimationFrame(hold);}
// Call attempts and inline status updates can trigger several render/sync events.
// Preserve both the inner table scroll and the page scroll across that burst.
document.addEventListener('pointerdown',e=>{if(e.target.closest?.('.records-panel .attempt-count,.records-panel .attempt-minus,.records-panel .ticket-status-select'))startHold();},true);
document.addEventListener('click',e=>{if(e.target.closest?.('.records-panel .attempt-count,.records-panel .attempt-minus'))startHold();},true);
document.addEventListener('change',e=>{if(e.target.closest?.('.records-panel .ticket-status-select'))startHold();},true);
['ticket-record-saved','ticket-ui-updated','ticket-data-updated','call-attempt-updated','ticket-records-rendered'].forEach(name=>window.addEventListener(name,()=>{if(lock){lock.until=Math.max(lock.until,performance.now()+220);if(!raf)raf=requestAnimationFrame(hold);}}));
// Prevent browser anchoring from moving the table when a row is patched/re-rendered.
const style=document.createElement('style');style.textContent='.records-panel,.records-panel .table-scroll,.records-panel table,.records-panel tbody,.records-panel tr{overflow-anchor:none!important}.records-panel .attempt-wrap{min-width:118px!important}.records-panel .attempt-count{width:84px!important;min-width:84px!important;max-width:84px!important}.records-panel .attempt-minus{flex:0 0 26px!important}';document.head.appendChild(style);
})();