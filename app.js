/* ALVO CUSTOMS - public site (no Firebase SDK, uses Firestore REST) */
const CFG={apiKey:"AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",projectId:"alvocustoms-c4952"};
const API="https://firestore.googleapis.com/v1/projects/"+CFG.projectId+"/databases/(default)/documents";
const $=id=>document.getElementById(id)||document.createElement("div");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const PAGE=document.body.dataset.page||"";
let WA="919664056178";
const DEF={announce:"",heroTitle1:"Give every bottle",heroTitle2:"an identity.",heroText:"Premium custom-label packaged drinking water for weddings, hotels, restaurants, businesses and events. Your name, your logo, your design on every bottle.",phone:"+91 96640 56178",whatsapp:"919664056178",email:"alvo.customs@gmail.com",instagram:"alvocustoms",address:"",aboutText:"ALVO CUSTOMS is a custom-branded packaged drinking water brand. We help hotels, restaurants, wedding planners, businesses and families put their own name and design on every bottle they serve.",visionText:"To make every bottle a statement of identity, so that the water on your table carries your brand, your story and your moment."};

/* ---------- Firestore REST ---------- */
const enc=v=>{if(v==null)return{nullValue:null};if(v&&v.__ts)return{timestampValue:new Date().toISOString()};if(typeof v==="string")return{stringValue:v};if(typeof v==="boolean")return{booleanValue:v};if(typeof v==="number")return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};if(Array.isArray(v))return{arrayValue:{values:v.map(enc)}};return{mapValue:{fields:fields(v)}}};
const fields=o=>Object.fromEntries(Object.entries(o).filter(([,x])=>x!==undefined).map(([k,x])=>[k,enc(x)]));
const dec=v=>{if("stringValue"in v)return v.stringValue;if("integerValue"in v)return Number(v.integerValue);if("doubleValue"in v)return v.doubleValue;if("booleanValue"in v)return v.booleanValue;if("timestampValue"in v)return{seconds:Math.floor(Date.parse(v.timestampValue)/1000)};if("arrayValue"in v)return(v.arrayValue.values||[]).map(dec);if("mapValue"in v)return obj(v.mapValue.fields||{});return null};
const obj=f=>Object.fromEntries(Object.entries(f).map(([k,x])=>[k,dec(x)]));
async function call(url,opt){const r=await fetch(url,{...opt,signal:AbortSignal.timeout?AbortSignal.timeout(15000):undefined});if(r.status===404)return null;if(!r.ok)throw Error("Server error "+r.status);return r.json()}
const idOf=d=>d.name.split("/").pop();
async function list(col){const out=[];let tok="";do{const j=await call(`${API}/${col}?pageSize=300&key=${CFG.apiKey}${tok?"&pageToken="+encodeURIComponent(tok):""}`);if(!j)break;(j.documents||[]).forEach(d=>out.push({id:idOf(d),...obj(d.fields||{})}));tok=j.nextPageToken||""}while(tok);return out}
async function get(col,id){const j=await call(`${API}/${col}/${id}?key=${CFG.apiKey}`);return j?{id:idOf(j),...obj(j.fields||{})}:null}
function add(col,data,id){return call(`${API}/${col}?key=${CFG.apiKey}${id?"&documentId="+id:""}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:fields({...data,createdAt:{__ts:1}})})})}

/* ---------- data cache (instant repeat visits) ---------- */
const D={products:[],editions:[],reels:[],clients:[]};
const byNew=(a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0);
const byOrd=(a,b)=>(Number(a.order)||0)-(Number(b.order)||0)||byNew(a,b);
async function load(col,done){
 let c=null;try{c=JSON.parse(sessionStorage.getItem("alvo_"+col))}catch(e){}
 if(c){D[col]=c;done()}
 try{const l=await list(col);D[col]=l;try{sessionStorage.setItem("alvo_"+col,JSON.stringify(l))}catch(e){}done()}
 catch(e){console.error(e);if(!c)done(e)}
}

/* ---------- site settings ---------- */
function apply(s){
 const d={...DEF};Object.keys(s||{}).forEach(k=>{if(s[k])d[k]=s[k]});
 document.querySelectorAll("[data-s]").forEach(e=>{const v=d[e.dataset.s];if(v)e.textContent=v});
 const dg=String(d.whatsapp).replace(/\D/g,"");if(dg)WA=dg;
 const L=n=>document.querySelectorAll('[data-link="'+n+'"]');
 L("wa").forEach(a=>a.href="https://wa.me/"+WA);L("tel").forEach(a=>a.href="tel:+"+WA);L("mail").forEach(a=>a.href="mailto:"+d.email);
 L("ig").forEach(a=>a.href=/^https?:/.test(d.instagram)?d.instagram:"https://instagram.com/"+String(d.instagram).replace(/^@/,""));
 const an=document.getElementById("announce");if(an){an.textContent=d.announce||"";an.hidden=!d.announce}
 const ha=document.getElementById("heroArt");if(ha&&d.heroImage&&ha.dataset.img!==d.heroImage){ha.dataset.img=d.heroImage;ha.innerHTML=`<img src="${esc(d.heroImage)}" alt="ALVO CUSTOMS bottles">`}
}

/* ---------- video helpers ---------- */
const YTR=/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/;
const SND='<button class="snd" type="button" aria-label="Sound on/off">🔇</button>';
const isMp4=v=>/\.(mp4|webm)(\?|$)/i.test(v);
function bg(v,poster){
 v=String(v||"").replace(/["<>]/g,"");if(!v||v.startsWith("fs:"))return "";
 const m=v.match(YTR);
 if(m)return `<iframe data-lazy data-src="https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}&controls=0&playsinline=1&rel=0&enablejsapi=1" allow="autoplay" tabindex="-1"></iframe>${SND}`;
 if(isMp4(v))return `<video data-reel src="${v}"${poster?` poster="${esc(poster)}"`:""} muted loop playsinline preload="none"></video>${SND}`;
 return "";
}
function player(v,poster){
 v=String(v||"").replace(/["<>]/g,"");
 if(v.startsWith("fs:"))return `<video id="fsVid" poster="${esc(poster||"")}" controls playsinline muted></video><div class="pl" id="fsLoad" style="pointer-events:none">⏳</div>`;
 const m=v.match(YTR);
 if(m)return `<iframe src="https://www.youtube.com/embed/${m[1]}?rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${m[1]}&enablejsapi=1" allow="autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe>${SND}`;
 const ig=v.match(/instagram\.com\/(?:reels?|p|tv)\/([\w-]+)/);if(ig)return `<iframe src="https://www.instagram.com/reel/${ig[1]}/embed/" allowfullscreen></iframe>`;
 const dr=v.match(/drive\.google\.com\/file\/d\/([\w-]+)/);if(dr)return `<iframe src="https://drive.google.com/file/d/${dr[1]}/preview" allow="autoplay" allowfullscreen></iframe>`;
 return `<video src="${v}" poster="${esc(poster||"")}" controls autoplay muted loop playsinline></video>${SND}`;
}
const fsCache={};
async function fsLoad(v){
 const el=document.getElementById("fsVid"),ld=document.getElementById("fsLoad");if(!el)return;
 try{
  if(!fsCache[v]){
   const [,id,n,...t]=v.split(":");
   const parts=await Promise.all(Array.from({length:+n},(_,i)=>get("videos",id+"_"+i)));
   fsCache[v]=URL.createObjectURL(new Blob(parts.map(p=>Uint8Array.from(atob(p.data),c=>c.charCodeAt(0))),{type:t.join(":")}));
  }
  el.src=fsCache[v];ld.remove();el.play().catch(()=>{});
 }catch(e){console.error(e);ld.textContent="Video could not be loaded";ld.style.cssText="pointer-events:none;width:auto;border-radius:10px;padding:8px 12px;font-size:12px"}
}
function modal(html){
 let m=document.getElementById("mdl");
 if(!m){m=document.createElement("div");m.id="mdl";m.className="overlay";m.innerHTML='<div class="modal"><button class="close" aria-label="Close">×</button><div id="mdlb"></div></div>';document.body.appendChild(m);
  m.onclick=e=>{if(e.target===m||e.target.classList.contains("close")){m.classList.remove("show");document.getElementById("mdlb").innerHTML=""}}}
 document.getElementById("mdlb").innerHTML=html;m.classList.add("show");
}
function openVideo(v,title,poster){modal(`<div class="vw">${player(v,poster)}</div><p style="margin-top:10px;font-weight:600">${esc(title||"")}</p>`);if(String(v).startsWith("fs:"))fsLoad(v)}
function openImg(src,title,desc){modal(`<img class="big" src="${esc(src)}" alt="${esc(title)}"><h3 style="margin:12px 0 4px">${esc(title)}</h3><p class="muted">${esc(desc||"")}</p>`)}
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2200)}

/* ---------- cards ---------- */
function pcard(p){
 const off=p.available===false;
 return `<article class="card"><a class="pimg" href="product.html?id=${p.id}">${off?'<span class="badge off">Unavailable</span>':p.featured?'<span class="badge">Featured</span>':""}<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" decoding="async"></a>
<div class="pb">${p.edition?`<span class="tag">${esc(p.edition)}</span>`:""}<h3>${esc(p.name)}</h3>
<div class="meta">${esc(p.size||"")}${p.size&&p.bottlesPerBox?" · ":""}${p.bottlesPerBox?esc(p.bottlesPerBox)+" bottles per box":""}</div>
<div class="price">${money(p.boxPrice)} <small>/ box</small></div>
<a class="btn aq sm" href="product.html?id=${p.id}">Select Product</a></div></article>`;
}
const gitem=(c,i)=>`<div class="gi" data-i="${i}"><img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy" decoding="async"><div><b>${esc(c.name)}</b><span>${esc(c.category||c.description||"")}</span></div></div>`;
function gallery(el,items){el.innerHTML=items.map(gitem).join("")||'<div class="empty">Our projects will appear here soon.</div>';el.onclick=e=>{const g=e.target.closest(".gi");if(!g)return;const c=items[+g.dataset.i];openImg(c.image,c.name,[c.category,c.description].filter(Boolean).join(" · "))}}

/* ---------- pages ---------- */
function rHome(e){
 const act=D.products.filter(p=>p.active!==false);
 let eds=D.editions.filter(x=>x.active!==false).sort(byOrd);
 if(!eds.length){const m=new Map();act.forEach(p=>{if(p.edition&&!m.has(p.edition))m.set(p.edition,{name:p.edition,tagline:"",image:p.image})});eds=[...m.values()]}
 $("edRow").innerHTML=eds.map(x=>`<a class="ed" href="products.html?edition=${encodeURIComponent(x.name)}" style="background-image:url('${esc(x.image)}')"><small>Edition</small><h3>${esc(x.name)}</h3><p>${esc(x.tagline||"")}</p></a>`).join("");
 $("edSec").hidden=!eds.length;
 const f=act.filter(p=>p.featured),l=(f.length?f:act).slice(0,8);
 $("featGrid").innerHTML=e?`<div class="empty">Could not load products (${esc(e.message)}). Please reload.</div>`:l.map(pcard).join("");
 $("featSec").hidden=!act.length&&!e;
 const rs=D.reels.filter(r=>r.active!==false).sort(byOrd);
 $("reelRow").innerHTML=rs.map((r,i)=>`<article class="reel" data-i="${i}">${bg(r.video,r.thumb)||`<img src="${esc(r.thumb)}" alt="${esc(r.title)}" loading="lazy"><span class="pl">▶</span>`}<div class="ri">${esc(r.title)}</div></article>`).join("");
 $("reelRow").onclick=ev=>{const a=ev.target.closest(".reel");if(!a)return;const r=rs[+a.dataset.i];openVideo(r.video,r.title,r.thumb)};
 $("reelSec").hidden=!rs.length;
 const w=D.clients.filter(c=>c.active!==false).sort(byNew).slice(0,6);
 gallery($("workGal"),w);$("workSec").hidden=!w.length;
}
let CAT="All";
function rProducts(e){
 const q=new URLSearchParams(location.search).get("edition");
 const act=D.products.filter(p=>p.active!==false);
 const cats=[...new Set(act.map(p=>p.category).filter(Boolean))];
 $("chips").innerHTML=(q?'<a class="chip" href="products.html">All Editions</a>':"")+(cats.length?["All",...cats].map(c=>`<button class="chip${c===CAT?" on":""}" data-c="${esc(c)}">${esc(c)}</button>`).join(""):"");
 let l=act;if(q)l=l.filter(p=>p.edition===q);if(CAT!=="All")l=l.filter(p=>p.category===CAT);
 $("pgrid").innerHTML=e?`<div class="empty">Could not load products (${esc(e.message)}). Please reload.</div>`:(l.map(pcard).join("")||'<div class="empty">No products found.</div>');
 if(q)$("ptitle").textContent=q;
}
$("chips").onclick=e=>{const b=e.target.closest("button[data-c]");if(b){CAT=b.dataset.c;rProducts()}};
function rWork(e){const w=D.clients.filter(c=>c.active!==false).sort(byNew);gallery($("workAll"),w)}

async function rProduct(){
 const box=$("pd"),id=new URLSearchParams(location.search).get("id");
 const nf=m=>{box.innerHTML=`<div class="empty">${m} <a class="acc" href="products.html">View all products</a></div>`};
 if(!id)return nf("Product not found.");
 let p,m;
 try{[p,m]=await Promise.all([get("products",id),get("productMedia",id).catch(()=>null)])}catch(e){return nf("Could not load this product ("+esc(e.message)+").")}
 if(!p||p.active===false)return nf("This product is not available.");
 document.title=p.name+" | ALVO CUSTOMS";
 const bpb=Number(p.bottlesPerBox)||0,price=Number(p.boxPrice)||0,min=Math.max(1,Number(p.minBoxes)||1),off=p.available===false;
 const items=[...[p.image,...((m&&m.images)||[])].filter(Boolean).map(s=>({t:"i",s})),...((m&&m.videos)||[]).filter(Boolean).map(s=>({t:"v",s}))];
 box.innerHTML=`<div><div class="viewer" id="viewer"></div><div class="vt" id="vt"></div></div>
<div>${p.edition?`<span class="tag">${esc(p.edition)}</span>`:""}<h1 style="font-size:clamp(30px,5vw,44px);margin:6px 0">${esc(p.name)}</h1><p class="muted">${esc(p.description||"")}</p>
<ul class="spec"><li><span>Bottle size</span><b>${esc(p.size||"-")}</b></li><li><span>Bottles per box</span><b>${bpb||"-"}</b></li>${p.design?`<li><span>Design</span><b>${esc(p.design)}</b></li>`:""}<li><span>Minimum order</span><b>${min} box${min>1?"es":""}</b></li><li><span>Availability</span><b>${off?"Currently unavailable":"In stock"}</b></li></ul>
<div class="price" style="font-size:30px">${money(price)} <small>/ box${bpb?` (${bpb} bottles)`:""}</small></div>
<form id="oform" novalidate>
<div class="field"><label>Quantity (boxes)</label><div class="qr"><button type="button" id="qm" aria-label="Less">−</button><input id="qty" type="number" inputmode="numeric" min="${min}" value="${min}"><button type="button" id="qp" aria-label="More">+</button></div></div>
<div class="total"><div><span class="muted" style="font-size:12px">Total amount</span><br><span id="tb" class="muted" style="font-size:13px"></span></div><b id="tot"></b></div>
<div class="field"><label>Your name</label><input id="on" autocomplete="name"><div class="err"></div></div>
<div class="field"><label>Mobile number</label><input id="op" type="tel" inputmode="tel" autocomplete="tel"><div class="err"></div></div>
<div class="field"><label>Delivery location</label><input id="ol" autocomplete="street-address"><div class="err"></div></div>
<div class="field"><label>Required date</label><input id="od" type="date"><div class="err"></div></div>
<button class="btn wa" style="width:100%" ${off?"disabled":""}>${off?"Currently unavailable":"Order on WhatsApp"}</button>
<p class="note">Your order stays <b>Pending Confirmation</b> until ALVO CUSTOMS confirms it with you on WhatsApp.</p><div id="okm"></div></form></div>`;
 const viewer=$("viewer"),vt=$("vt");
 function show(i){const it=items[i];if(!it)return;viewer.innerHTML=it.t==="i"?`<img src="${esc(it.s)}" alt="${esc(p.name)}">`:player(it.s,p.image);if(it.t==="v"&&String(it.s).startsWith("fs:"))fsLoad(it.s);[...vt.children].forEach((b,j)=>b.classList.toggle("on",j===i))}
 vt.innerHTML=items.length>1?items.map((it,i)=>`<button type="button" data-i="${i}" aria-label="Media ${i+1}"><img src="${esc(it.t==="i"?it.s:p.image)}" alt="">${it.t==="v"?"<span>▶</span>":""}</button>`).join(""):"";
 vt.onclick=e=>{const b=e.target.closest("button");if(b)show(+b.dataset.i)};show(0);
 const q=$("qty"),tot=$("tot"),tb=$("tb");
 const boxes=()=>Math.max(min,Math.floor(Number(q.value))||min);
 function upd(){const b=boxes();tot.textContent=money(b*price);tb.textContent=b+" box"+(b>1?"es":"")+(bpb?" · "+(b*bpb)+" bottles":"")}
 $("qm").onclick=()=>{q.value=Math.max(min,boxes()-1);upd()};$("qp").onclick=()=>{q.value=boxes()+1;upd()};q.oninput=upd;q.onchange=()=>{q.value=boxes();upd()};upd();
 $("od").min=new Date().toISOString().slice(0,10);
 const bad=(el,msg)=>{const f=el.closest(".field");f.classList.add("bad");f.querySelector(".err").textContent=msg;return false};
 $("oform").onsubmit=e=>{
  e.preventDefault();if(off)return;
  document.querySelectorAll("#oform .field.bad").forEach(f=>f.classList.remove("bad"));
  const n=$("on").value.trim(),ph=$("op").value.trim(),lo=$("ol").value.trim(),dt=$("od").value;let ok=true;
  if(n.length<2)ok=bad($("on"),"Please enter your name.");
  if(!/^\+?[0-9\s-]{10,15}$/.test(ph))ok=bad($("op"),"Enter a valid mobile number.");
  if(lo.length<3)ok=bad($("ol"),"Please enter the delivery location.");
  if(!dt)ok=bad($("od"),"Please choose the required date.");
  if(!ok)return;
  const b=boxes(),total=b*price,ref="ALV-"+Date.now().toString(36).toUpperCase().slice(-6);
  const msg=`Hello ALVO CUSTOMS, I would like to place an order request.\n\nRef: ${ref}\nProduct: ${p.name}${p.edition?" ("+p.edition+")":""}\nBottle size: ${p.size||"-"}\nBottles per box: ${bpb||"-"}\nBoxes: ${b}${bpb?" ("+(b*bpb)+" bottles)":""}\nPrice per box: ${money(price)}\nTotal: ${money(total)}\n\nName: ${n}\nMobile: ${ph}\nDelivery location: ${lo}\nRequired date: ${dt}\n\nStatus: Pending Confirmation`;
  const url="https://wa.me/"+WA+"?text="+encodeURIComponent(msg);
  const w=window.open(url,"_blank");if(!w)location.href=url;
  add("orders",{ref,productId:p.id,productName:p.name,edition:p.edition||"",size:p.size||"",bottlesPerBox:bpb,boxes:b,totalBottles:b*bpb,boxPrice:price,total,name:n,phone:ph,location:lo,date:dt,status:"Pending Confirmation"},ref).catch(console.error);
  $("okm").innerHTML=`<div class="ok">WhatsApp has opened with your order details (Ref ${ref}). Please press <b>Send</b> in WhatsApp to submit your request.</div>`;
 };
}
function formHandler(id,type,build){
 const f=$(id);if(!f.addEventListener)return;
 f.addEventListener("submit",e=>{
  e.preventDefault();f.querySelectorAll(".field.bad").forEach(x=>x.classList.remove("bad"));
  const v=n=>(f.elements[n]?f.elements[n].value.trim():"");let ok=true;
  const bad=(n,m)=>{const x=f.elements[n].closest(".field");x.classList.add("bad");x.querySelector(".err").textContent=m;ok=false};
  if(v("name").length<2)bad("name","Please enter your name.");
  if(!/^\+?[0-9\s-]{10,15}$/.test(v("phone")))bad("phone","Enter a valid mobile number.");
  if(f.elements.qty&&!v("qty"))bad("qty","Please enter the required quantity.");
  if(f.elements.msg&&v("msg").length<3)bad("msg","Please write a short message.");
  if(!ok)return;
  const data={type,name:v("name"),phone:v("phone"),qty:v("qty"),requirements:v("req"),message:v("msg"),status:"New"};
  const url="https://wa.me/"+WA+"?text="+encodeURIComponent(build(v));
  const w=window.open(url,"_blank");if(!w)location.href=url;
  add("enquiries",data).catch(console.error);toast("WhatsApp opened. Please press Send.");f.reset();
 });
}
formHandler("brandForm","Custom Branding",v=>`Hello ALVO CUSTOMS, I would like custom branding for my bottles.\n\nName: ${v("name")}\nMobile: ${v("phone")}\nRequired quantity: ${v("qty")}\nDesign requirements: ${v("req")||"-"}\nMessage: ${v("msg")}`);
formHandler("contactForm","Contact",v=>`Hello ALVO CUSTOMS,\n\nName: ${v("name")}\nMobile: ${v("phone")}\nMessage: ${v("msg")}`);

/* ---------- boot ---------- */
if(document.getElementById("year"))$("year").textContent=new Date().getFullYear();
$("burger").onclick=()=>$("links").classList.toggle("open");
try{apply(JSON.parse(localStorage.getItem("alvoS")||"{}"))}catch(e){}
get("settings","site").then(s=>{s=s||{};try{localStorage.setItem("alvoS",JSON.stringify(s))}catch(e){}apply(s)}).catch(()=>{});
if(PAGE==="home"){["products","editions","reels","clients"].forEach(c=>load(c,rHome))}
else if(PAGE==="products"){load("products",rProducts)}
else if(PAGE==="product"){rProduct()}
else if(PAGE==="work"){load("clients",rWork)}
