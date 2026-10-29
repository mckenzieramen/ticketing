(()=>{'use strict';
const main=document.querySelector('main.container');if(!main)return;
const stats=document.getElementById('statsGrid');
const workspace=document.querySelector('.workspace-grid');
const records=document.querySelector('.records-panel');
const analytics=document.querySelector('.analytics-grid');
const dailyPerformance=document.querySelector('.upgrade-section');
if(!workspace||!records||!analytics){document.documentElement.classList.remove('premium-booting');return;}
const cards=[...workspace.children];
const outbound=cards[0],stamp=cards[1],attendance=cards[2];
const recentTickets=document.getElementById('recentTicketsPanel');
const nav=document.createElement('nav');nav.className='premium-tabs';nav.setAttribute('aria-label','Ticket tracker sections');
nav.innerHTML='<button type="button" data-view="dashboard"><span>Dashboard</span></button><button type="button" data-view="calls"><span>Inbound &amp; Outbound</span></button><button type="button" data-view="tickets"><span>All Tickets</span></button><button type="button" data-view="attendance"><span>Attendance</span></button>';
main.insertBefore(nav,stats||main.firstChild);
const sections={dashboard:[stats,analytics],calls:[outbound,stamp,recentTickets].filter(Boolean),tickets:[records],attendance:[attendance,dailyPerformance].filter(Boolean)};
const managed=[stats,analytics,outbound,stamp,recentTickets,records,attendance,dailyPerformance].filter(Boolean);
managed.forEach(el=>el.classList.add('premium-view-section'));
let activeView='',switching=false;
function paintNav(view){nav.querySelectorAll('button[data-view]').forEach(b=>{const active=b.dataset.view===view;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active))})}
function show(view){
 if(!sections[view])view='dashboard';
 if(view===activeView){paintNav(view);return}
 const visible=new Set(sections[view]);
 activeView=view;switching=true;paintNav(view);
 // Update visibility in one synchronous pass so there is no blank frame between tabs.
 for(const el of managed)el.classList.toggle('premium-view-hidden',!visible.has(el));
 const hasWorkspace=[outbound,stamp,recentTickets,attendance].some(el=>el&&visible.has(el));
 workspace.classList.toggle('premium-view-hidden',!hasWorkspace);
 try{sessionStorage.setItem('premiumTicketTracker.activeTab',view)}catch{}
 requestAnimationFrame(()=>{switching=false;window.dispatchEvent(new CustomEvent('tracker-view-changed',{detail:{view}}))});
}
function activate(e){const b=e.target.closest('button[data-view]');if(!b)return;if(e.type==='click'&&e.detail!==0)return;e.preventDefault();e.stopPropagation();show(b.dataset.view)}
// Pointerdown makes mouse/touch navigation feel immediate. Keyboard click remains supported.
nav.addEventListener('pointerdown',activate,{passive:false});
nav.addEventListener('click',activate,{passive:false});
const style=document.createElement('style');style.textContent=`.premium-tabs{display:flex!important;gap:7px;align-items:center;margin:0 0 14px;padding:6px;background:#fff;border:1px solid #dce6ef;border-radius:13px;box-shadow:0 5px 18px rgba(15,54,88,.07);position:sticky;top:8px;z-index:900;visibility:visible!important;opacity:1!important;contain:layout style}.premium-tabs button,.premium-tabs button span{visibility:visible!important;opacity:1!important}.premium-tabs button{display:inline-flex!important;align-items:center;justify-content:center;border:0;background:transparent;color:#5a6f84;padding:9px 15px;border-radius:9px;font:800 12px Inter,sans-serif;cursor:pointer;white-space:nowrap;touch-action:manipulation;user-select:none;min-height:34px;line-height:16px;transition:background-color .11s ease,color .11s ease,box-shadow .11s ease,transform .08s ease}.premium-tabs button:hover{background:#eef5fb;color:#153f63}.premium-tabs button:active{transform:scale(.985)}.premium-tabs button.active{background:#123f69;color:#fff;box-shadow:0 3px 8px rgba(18,63,105,.16)}.premium-tabs button.active span{color:#fff!important}.premium-view-hidden{display:none!important}.premium-view-section:not(.premium-view-hidden){animation:premiumViewIn .10s ease-out both}@keyframes premiumViewIn{from{opacity:.985}to{opacity:1}}.workspace-grid:not(.premium-view-hidden){grid-template-columns:repeat(2,minmax(0,1fr))}.workspace-grid:not(.premium-view-hidden)>.panel:not(.premium-view-hidden):only-child{grid-column:1/-1;width:100%}@media(max-width:700px){.premium-tabs{overflow-x:auto;position:static}.premium-tabs button{flex:0 0 auto;padding:9px 12px}.workspace-grid:not(.premium-view-hidden){grid-template-columns:1fr}}@media(prefers-reduced-motion:reduce){.premium-tabs button,.premium-view-section:not(.premium-view-hidden){transition:none;animation:none}}`;document.head.appendChild(style);
let initial='dashboard';try{let saved=sessionStorage.getItem('premiumTicketTracker.activeTab');if(saved==='stamp')saved='calls';if(sections[saved])initial=saved}catch{}show(initial);
requestAnimationFrame(()=>document.documentElement.classList.remove('premium-booting'));
})();