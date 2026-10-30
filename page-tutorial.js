(()=>{'use strict';
const tours={
 dashboard:[
  {target:'.premium-tabs',title:'Page Navigation',text:'Use these tabs to move between Dashboard, Inbound & Outbound, and All Tickets.'},
  {target:'#statsGrid',title:'Dashboard Overview',text:'These cards show your ticket and status totals at a glance.'},
  {target:'#dashboardAttendanceAction, #attendanceBtn',title:'Attendance',text:'Mark your attendance once per workday here.'},
  {target:'#dashboardAttendanceMetrics',title:'Attendance Summary',text:'See your ticket and call-attempt activity compared with recorded attendance.'},
  {target:'.analytics-grid',title:'Performance & Updates',text:'Review pickup and closing performance, Tickets Needing Update, status distribution, and inbound versus outbound totals.'}
 ],
 calls:[
  {target:'.premium-tabs',title:'Inbound & Outbound',text:'This tab is your working area for creating outbound tickets and handling inbound calls.'},
  {target:'#ticketForm',title:'Add / Update Ticket',text:'Add an outbound ticket here. Enter the ticket number and choose its current status.'},
  {target:'.stamp-panel, #stampBtn',title:'Stamp Time',text:'For an inbound call, press Stamp Time to capture the exact current PH time immediately.'},
  {target:'#stampedTime',title:'Stamped Time',text:'The captured PH timestamp appears here and can still be edited when needed.'},
  {target:'#stampTicket',title:'Inbound Ticket Number',text:'Enter the inbound ticket number here when it becomes available.'},
  {target:'#answerTime',title:'Answer Time',text:'Paste the System / Answer Time in UTC here so pickup duration can be calculated.'},
  {target:'#saveStampBtn',title:'Save Inbound Record',text:'Save the inbound ticket information when ready. Stamp Time and Save remain separate actions.'},
  {target:'#recentTicketsPanel',title:'Recent Tickets',text:'Review your latest tickets here, including status, pickup time, call attempts, and actions.'}
 ],
 tickets:[
  {target:'.premium-tabs',title:'All Tickets',text:'This tab contains your complete ticket history.'},
  {target:'.records-head',title:'Search & Filters',text:'Search by ticket number and filter the records by call type or status.'},
  {target:'#ticketTableBody',title:'Ticket History',text:'Review all ticket details here, including creation, status, closing duration, pickup time, and call attempts.'},
  {target:'#statusFilter',title:'Status Filter',text:'Use this filter to quickly find Open, Pending, On Hold, Solved, Closed, or Merged tickets.'},
  {target:'#exportBtn',title:'Export Records',text:'Export your ticket records to CSV when you need a copy for reporting.'}
 ]
};
let view='dashboard',steps=[],i=0,overlay,card,spot;
const q=s=>{for(const x of s.split(',').map(v=>v.trim())){const e=document.querySelector(x);if(e&&e.offsetParent!==null)return e}return null};
const currentView=()=>document.documentElement.dataset.trackerView||document.querySelector('.premium-tabs button.active')?.dataset.view||'dashboard';
function css(){if(document.getElementById('pageTourStyle'))return;const s=document.createElement('style');s.id='pageTourStyle';s.textContent=`#pageTourOverlay{position:fixed;inset:0;z-index:2147483600;pointer-events:none;background:rgba(15,23,42,.54)}#pageTourSpot{position:fixed;z-index:2147483601;border:3px solid #4f7cff;border-radius:14px;box-shadow:0 0 0 5px rgba(79,124,255,.18),0 10px 35px rgba(15,23,42,.22);pointer-events:none;transition:.18s ease}#pageTourCard{position:fixed;z-index:2147483602;width:min(370px,calc(100vw - 28px));background:#fff;border:1px solid #e6ebf3;border-radius:16px;box-shadow:0 20px 60px rgba(15,23,42,.28);padding:17px;pointer-events:auto;font-family:Inter,system-ui,sans-serif}#pageTourCard:before{content:'';position:absolute;width:14px;height:14px;background:#fff;border-left:1px solid #e6ebf3;border-top:1px solid #e6ebf3;transform:rotate(45deg);top:-8px;left:28px}#pageTourCard .tour-label{font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#315efb;margin-bottom:6px}#pageTourCard h3{margin:0 0 7px;font-size:17px;color:#172033}#pageTourCard p{margin:0;color:#64748b;font-size:13px;line-height:1.55}#pageTourCard .tour-foot{display:flex;align-items:center;gap:8px;margin-top:15px}#pageTourCard .tour-count{font-size:11px;font-weight:700;color:#94a3b8;margin-right:auto}#pageTourCard button{border:0;border-radius:9px;padding:8px 12px;font-weight:700;cursor:pointer}#pageTourBack{background:#eef2f7;color:#475569}#pageTourNext{background:#315efb;color:#fff}#pageTourSkip{background:transparent;color:#64748b;padding-left:2px!important}.page-tour-help{position:fixed;right:18px;bottom:18px;z-index:2147483500;width:42px;height:42px;border-radius:50%;border:1px solid #dbe4f0;background:#fff;color:#315efb;font-weight:900;font-size:18px;box-shadow:0 8px 25px rgba(15,23,42,.14);cursor:pointer}`;document.head.appendChild(s)}
function key(v){return 'ticketTrackerTourSeen.'+v+'.v2'}
function end(mark=true){overlay?.remove();spot?.remove();card?.remove();overlay=spot=card=null;if(mark)try{localStorage.setItem(key(view),'1')}catch{}}
function position(el,st){const r=el.getBoundingClientRect(),pad=7;spot.style.left=Math.max(5,r.left-pad)+'px';spot.style.top=Math.max(5,r.top-pad)+'px';spot.style.width=Math.max(1,Math.min(innerWidth-Math.max(5,r.left-pad)-5,r.width+pad*2))+'px';spot.style.height=Math.max(1,Math.min(innerHeight-Math.max(5,r.top-pad)-5,r.height+pad*2))+'px';card.querySelector('.tour-label').textContent=view==='dashboard'?'Dashboard Tutorial':view==='calls'?'Inbound & Outbound Tutorial':'All Tickets Tutorial';card.querySelector('h3').textContent=st.title;card.querySelector('p').textContent=st.text;card.querySelector('.tour-count').textContent=`${i+1} / ${steps.length}`;card.querySelector('#pageTourBack').style.visibility=i?'visible':'hidden';card.querySelector('#pageTourNext').textContent=i===steps.length-1?'Finish':'Next';const cr=card.getBoundingClientRect(),below=r.bottom+18;card.style.left=Math.max(14,Math.min(innerWidth-cr.width-14,r.left))+'px';card.style.top=(below+cr.height<innerHeight?below:Math.max(14,r.top-cr.height-18))+'px'}
function show(){const st=steps[i],el=q(st.target);if(!el){if(i<steps.length-1){i++;return show()}return end()}el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>{if(overlay)position(el,st)},220)}
function start(v=currentView()){end(false);css();view=tours[v]?v:'dashboard';steps=tours[view];i=0;overlay=document.createElement('div');overlay.id='pageTourOverlay';spot=document.createElement('div');spot.id='pageTourSpot';card=document.createElement('div');card.id='pageTourCard';card.innerHTML='<div class="tour-label"></div><h3></h3><p></p><div class="tour-foot"><button id="pageTourSkip">Skip</button><span class="tour-count"></span><button id="pageTourBack">Back</button><button id="pageTourNext">Next</button></div>';document.body.append(overlay,spot,card);card.querySelector('#pageTourSkip').onclick=()=>end(true);card.querySelector('#pageTourBack').onclick=()=>{if(i){i--;show()}};card.querySelector('#pageTourNext').onclick=()=>{if(i>=steps.length-1)return end(true);i++;show()};show()}
function maybeStart(v){if(!tours[v])return;try{if(localStorage.getItem(key(v)))return}catch{}setTimeout(()=>{if(currentView()===v&&!overlay)start(v)},360)}
function help(){css();if(document.getElementById('pageTourHelp'))return;const b=document.createElement('button');b.id='pageTourHelp';b.className='page-tour-help';b.type='button';b.title='Tutorial for this tab';b.setAttribute('aria-label','Open tutorial for this tab');b.textContent='?';b.onclick=()=>start(currentView());document.body.appendChild(b)}
window.startTicketTrackerTutorial=start;
window.addEventListener('tracker-view-changed',e=>{const v=e.detail?.view||currentView();end(false);maybeStart(v)});
window.addEventListener('resize',()=>{if(overlay)show()},{passive:true});
window.addEventListener('load',()=>{help();maybeStart(currentView())},{once:true});
})();