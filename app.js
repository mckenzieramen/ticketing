const STORAGE_KEY = "premiumTicketTracker.v1";
const TARGET_SECONDS = 20;
let tickets = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let editingId = null;
let currentStamp = null;

const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2,"0");
function fmtDate(d){
  if(!d || isNaN(d)) return "";
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function parseDate(v){
  if(!v) return null;
  const m = v.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if(!m) return null;
  const d = new Date(+m[1],+m[2]-1,+m[3],+m[4],+m[5],+m[6]);
  return isNaN(d) ? null : d;
}
function duration(ms){
  if(ms == null || ms < 0) return "—";
  let s=Math.floor(ms/1000), d=Math.floor(s/86400); s%=86400;
  let h=Math.floor(s/3600); s%=3600; let m=Math.floor(s/60); s%=60;
  return `${d?d+"d ":""}${h? h+"h ":""}${m?m+"m ":""}${s}s`.trim();
}
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); render(); }
function toast(msg){ const t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function tickClock(){
  const d=new Date();
  $("todayDate").textContent=d.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});
  $("currentTime").textContent=d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",second:"2-digit"});
  autoCloseSolved();
}
setInterval(tickClock,1000); tickClock();

function autoCloseSolved(){
  let changed=false, now=Date.now();
  tickets.forEach(t=>{
    if(t.status==="Solved" && t.expectedClose){
      const due=parseDate(t.expectedClose);
      if(due && now>=due.getTime()){
        t.status="Closed";
        t.closedTime=t.expectedClose;
        changed=true;
      }
    }
  });
  if(changed){localStorage.setItem(STORAGE_KEY,JSON.stringify(tickets));render();}
}

$("ticketForm").addEventListener("submit",e=>{
  e.preventDefault();
  const number=$("ticketNumber").value.trim();
  const creation=parseDate($("ticketCreation").value);
  const status=$("ticketStatus").value;
  if(!creation) return toast("Use timestamp format YYYY-MM-DD HH:mm:ss");
  const existing=tickets.find(t=>t.number.toLowerCase()===number.toLowerCase() && t.id!==editingId);
  if(existing) return toast("Ticket number already exists.");

  let old=editingId?tickets.find(t=>t.id===editingId):null;
  let solvedTime=old?.solvedTime||"", expectedClose=old?.expectedClose||"", closedTime=old?.closedTime||"";
  const now=fmtDate(new Date());

  if(status==="Solved" && old?.status!=="Solved"){
    solvedTime=now;
    expectedClose=fmtDate(new Date(parseDate(solvedTime).getTime()+24*60*60*1000));
    closedTime="";
  }
  if(status==="Closed" && old?.status!=="Closed"){
    closedTime=now;
    if(!solvedTime) solvedTime=now;
    if(!expectedClose) expectedClose=fmtDate(new Date(parseDate(solvedTime).getTime()+24*60*60*1000));
  }
  if(status!=="Solved" && status!=="Closed" && old?.status!=="Closed"){
    solvedTime=""; expectedClose=""; closedTime="";
  }

  const record={
    id:editingId||crypto.randomUUID(), number, callType:$("callType").value,
    creation:fmtDate(creation), status, solvedTime, expectedClose, closedTime,
    pickupSeconds:old?.pickupSeconds??null, stampedTime:old?.stampedTime||"", answerTime:old?.answerTime||""
  };
  if(editingId) tickets=tickets.map(t=>t.id===editingId?record:t); else tickets.unshift(record);
  editingId=null; $("ticketForm").reset(); $("ticketSubmitText").textContent="Save Ticket";
  save(); toast("Ticket saved successfully.");
});

$("stampBtn").addEventListener("click",()=>{
  currentStamp=new Date();
  $("stampedTime").value=fmtDate(currentStamp);
  calculatePickup();
  toast("Time stamped.");
});
$("answerTime").addEventListener("input",calculatePickup);
function calculatePickup(){
  const a=parseDate($("stampedTime").value), b=parseDate($("answerTime").value);
  const box=$("pickupResult");
  if(!a||!b){box.className="pickup-result empty";box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Waiting for timestamps</strong><em>Stamp first, then paste the system time.</em></div></div>';return null}
  const sec=Math.round((b-a)/1000);
  if(sec<0){box.className="pickup-result late";box.innerHTML='<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>Invalid timestamp order</strong><em>Answer time is earlier than stamped time.</em></div></div>';return null}
  const ok=sec<=TARGET_SECONDS;
  box.className="pickup-result "+(ok?"":"late");
  box.innerHTML=`<div><span class="bolt">ϟ</span><div><small>Pickup Time</small><strong>${sec} second${sec===1?"":"s"} · ${ok?"Within Target":"Over Target"}</strong><em>Target: ≤ ${TARGET_SECONDS} seconds</em></div></div>`;
  return sec;
}
$("copyStamp").addEventListener("click",async()=>{if(!$("stampedTime").value)return;await navigator.clipboard.writeText($("stampedTime").value);toast("Stamped time copied.");});
$("saveStampBtn").addEventListener("click",()=>{
  const number=$("stampTicket").value.trim(), sec=calculatePickup();
  if(!number) return toast("Enter the ticket number.");
  if(sec===null) return toast("Enter valid stamped and answer timestamps.");
  const t=tickets.find(x=>x.number.toLowerCase()===number.toLowerCase());
  if(!t) return toast("Ticket number not found. Save the ticket first.");
  t.pickupSeconds=sec;t.stampedTime=$("stampedTime").value;t.answerTime=fmtDate(parseDate($("answerTime").value));
  save(); showDetails(t); toast("Pickup time saved to ticket.");
});

function statusColor(s){return {"Open":"#39a7e8","Pending":"#f7b916","On Hold":"#ef4c4c","Solved":"#16b86c","Closed":"#728296"}[s]||"#728296"}
function typeColor(s){return s==="Inbound"?"#13b76a":"#7145e8"}

function render(){
  renderStats(); renderTable(); renderAnalytics();
}
function renderStats(){
  const defs=[
    ["Total Tickets",tickets.length,"▤","#087af6"],
    ["Inbound",tickets.filter(t=>t.callType==="Inbound").length,"↗","#12b76a"],
    ["Outbound",tickets.filter(t=>t.callType==="Outbound").length,"→","#7145e8"],
    ["Open",tickets.filter(t=>t.status==="Open").length,"□","#16a7dc"],
    ["Pending",tickets.filter(t=>t.status==="Pending").length,"◷","#f6b817"],
    ["On Hold",tickets.filter(t=>t.status==="On Hold").length,"Ⅱ","#ef4444"],
    ["Solved",tickets.filter(t=>t.status==="Solved").length,"✓","#10ad65"],
    ["Closed",tickets.filter(t=>t.status==="Closed").length,"▣","#718092"]
  ];
  $("statsGrid").innerHTML=defs.map(x=>`<div class="stat"><div class="stat-icon" style="background:${x[3]}">${x[2]}</div><div><small>${x[0]}</small><strong>${x[1]}</strong></div></div>`).join("");
}
function filteredTickets(){
  const q=$("searchInput").value.trim().toLowerCase(), type=$("typeFilter").value,status=$("statusFilter").value;
  return tickets.filter(t=>(!q||t.number.toLowerCase().includes(q))&&(!type||t.callType===type)&&(!status||t.status===status));
}
function renderTable(){
  const rows=filteredTickets();
  $("emptyState").style.display=rows.length?"none":"block";
  $("ticketTableBody").innerHTML=rows.map((t,i)=>{
    const creation=parseDate(t.creation), closed=parseDate(t.closedTime);
    const dur=creation&&closed?duration(closed-creation):"—";
    const pickup=t.pickupSeconds==null?"—":`${t.pickupSeconds} sec`;
    const pickupBg=t.pickupSeconds==null?"#eef2f6":t.pickupSeconds<=TARGET_SECONDS?"#d9f8e7":"#ffe1df";
    return `<tr>
      <td>${i+1}</td><td><b>${escapeHtml(t.number)}</b></td>
      <td><span class="type-pill" style="background:${typeColor(t.callType)}20;color:${typeColor(t.callType)}">${escapeHtml(t.callType)}</span></td>
      <td>${t.creation}</td><td><span class="status-pill" style="background:${statusColor(t.status)};color:#fff">${escapeHtml(t.status)}</span></td>
      <td>${t.solvedTime||"—"}</td><td>${t.expectedClose||"—"}</td><td>${t.closedTime||"—"}</td><td>${dur}</td>
      <td><span class="pickup-pill" style="background:${pickupBg}">${pickup}</span></td>
      <td><button class="action-btn edit" onclick="editTicket('${t.id}')">✎</button><button class="action-btn view" onclick="viewTicket('${t.id}')">◉</button><button class="action-btn delete" onclick="deleteTicket('${t.id}')">×</button></td>
    </tr>`;
  }).join("");
}
function renderAnalytics(){
  const pickups=tickets.map(t=>t.pickupSeconds).filter(v=>typeof v==="number");
  if(pickups.length){
    const avg=pickups.reduce((a,b)=>a+b,0)/pickups.length, good=pickups.filter(x=>x<=TARGET_SECONDS).length;
    $("avgPickup").textContent=`${avg.toFixed(1)} sec`;$("fastestPickup").textContent=`${Math.min(...pickups)} sec`;$("slowestPickup").textContent=`${Math.max(...pickups)} sec`;
    $("pickupRate").textContent=`${(good/pickups.length*100).toFixed(2)}%`;$("pickupRateSub").textContent=`${good} / ${pickups.length} tickets`;
  }else{
    ["avgPickup","fastestPickup","slowestPickup","pickupRate"].forEach(id=>$(id).textContent="—");$("pickupRateSub").textContent="No stamped tickets";
  }
  const statuses=["Open","Pending","On Hold","Solved","Closed"];
  const max=Math.max(1,...statuses.map(s=>tickets.filter(t=>t.status===s).length));
  $("statusBars").innerHTML=statuses.map(s=>{const n=tickets.filter(t=>t.status===s).length;return `<div class="bar-row"><span>${s}</span><div class="bar"><i style="width:${n/max*100}%;background:${statusColor(s)}"></i></div><b>${n}</b></div>`}).join("");
  const inbound=tickets.filter(t=>t.callType==="Inbound").length,outbound=tickets.filter(t=>t.callType==="Outbound").length,total=inbound+outbound;
  const pct=total?inbound/total*100:50;
  $("ioDonut").style.background=`conic-gradient(#12b76a 0 ${pct}%, #7145e8 ${pct}% 100%)`;
  $("ioTotal").textContent=total;
  $("ioLegend").innerHTML=`<div><i style="background:#12b76a"></i>Inbound — ${inbound}${total?` (${Math.round(inbound/total*100)}%)`:""}</div><div><i style="background:#7145e8"></i>Outbound — ${outbound}${total?` (${Math.round(outbound/total*100)}%)`:""}</div>`;
}
window.editTicket=id=>{
  const t=tickets.find(x=>x.id===id);if(!t)return;
  editingId=id;$("ticketNumber").value=t.number;$("callType").value=t.callType;$("ticketCreation").value=t.creation;$("ticketStatus").value=t.status;
  $("ticketSubmitText").textContent="Update Ticket";window.scrollTo({top:0,behavior:"smooth"});showDetails(t);
};
window.viewTicket=id=>{const t=tickets.find(x=>x.id===id);if(t)showDetails(t)};
window.deleteTicket=id=>{if(confirm("Delete this ticket record?")){tickets=tickets.filter(x=>x.id!==id);save();toast("Ticket deleted.");}};
function showDetails(t){
  const creation=parseDate(t.creation),closed=parseDate(t.closedTime),expected=parseDate(t.expectedClose);
  let until="—";
  if(t.status==="Solved"&&expected){const diff=expected-Date.now();until=diff>0?duration(diff)+" remaining":"Ready to close";}
  const vals=[t.solvedTime||"—",t.expectedClose?`${t.expectedClose}`:"—",t.closedTime||"—",creation&&closed?duration(closed-creation):"—",t.status,until];
  [...$("detailsPanel").querySelectorAll("strong")].forEach((el,i)=>{el.textContent=vals[i]});
  const statusEl=$("detailsPanel").querySelectorAll("strong")[4];statusEl.style.color=statusColor(t.status);
}
["searchInput","typeFilter","statusFilter"].forEach(id=>$(id).addEventListener(id==="searchInput"?"input":"change",renderTable));
$("exportBtn").addEventListener("click",()=>{
  const head=["Ticket Number","Call Type","Ticket Creation","Status","Solved Time","Expected Close Time","Actual Closed Time","Pickup Seconds","Stamped Time","Answer Time"];
  const rows=tickets.map(t=>[t.number,t.callType,t.creation,t.status,t.solvedTime,t.expectedClose,t.closedTime,t.pickupSeconds??"",t.stampedTime,t.answerTime]);
  const csv=[head,...rows].map(r=>r.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`ticket-records-${fmtDate(new Date()).slice(0,10)}.csv`;a.click();URL.revokeObjectURL(a.href);
});
render();