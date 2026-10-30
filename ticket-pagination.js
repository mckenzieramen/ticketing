(()=>{'use strict';
// Large-data pagination is now handled directly by instant-records-render.js.
// Keeping the old pagination observer active caused every ticket row to be created first,
// then hidden afterwards. With hundreds/thousands of records that created avoidable DOM work.
if(window.ticketFastPageRender)return;
const PAGE_SIZE=10;let page=1,scheduled=false,lastSignature='';
const body=()=>document.getElementById('ticketTableBody'),panel=()=>document.querySelector('.records-panel');
function ensure(){const p=panel();if(!p)return null;let nav=document.getElementById('ticketPagination');if(nav)return nav;nav=document.createElement('div');nav.id='ticketPagination';nav.className='ticket-pagination';nav.innerHTML='<span id="ticketPageInfo">Showing 0 tickets</span><div class="ticket-page-actions"><button type="button" class="ticket-page-btn" id="ticketPrev">‹ Previous</button><span class="ticket-page-number" id="ticketPageNumber">Page 1 / 1</span><button type="button" class="ticket-page-btn" id="ticketNext">Next ›</button></div>';p.insertBefore(nav,document.getElementById('emptyState')||null);return nav}
function apply(){const b=body(),nav=ensure();if(!b||!nav)return;const rows=b.rows,total=rows.length,pages=Math.max(1,Math.ceil(total/PAGE_SIZE));page=Math.min(Math.max(page,1),pages);const start=(page-1)*PAGE_SIZE,end=start+PAGE_SIZE,sig=`${total}|${page}`;if(sig===lastSignature)return;lastSignature=sig;for(let i=0;i<total;i++)rows[i].style.display=i>=start&&i<end?'':'none';}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;apply()})}
const b=body();if(!b)return;apply();new MutationObserver(schedule).observe(b,{childList:true});
})();