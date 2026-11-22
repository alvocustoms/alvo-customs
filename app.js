
const IS_ADMIN=!!document.getElementById("adminPage");
const FB="https://www.gstatic.com/firebasejs/11.0.2/";
const imp=(r,s)=>IS_ADMIN?import(FB+s):import(r).catch(()=>import(FB+s));
let M1,M2,M3;
try{[M1,M2,M3]=await Promise.all([imp("./rest.js","firebase-app.js"),imp("./rest.js","firebase-firestore.js"),IS_ADMIN?import(FB+"firebase-auth.js"):{}])}
catch(e){document.querySelectorAll("#featuredRow,#productGrid,#projectGrid").forEach(x=>{x.innerHTML='<div class="empty">Could not load ('+e.message+'). Please reload.</div>'});throw e}
const {initializeApp}=M1;
const {getFirestore,collection,addDoc,getDocs,doc,deleteDoc,updateDoc,getDoc,setDoc,serverTimestamp,query,orderBy}=M2;
const {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged}=M3;

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",
  authDomain: "alvocustoms-c4952.firebaseapp.com",
  projectId: "alvocustoms-c4952",
  storageBucket: "alvocustoms-c4952.firebasestorage.app",
  messagingSenderId: "717785800659",
  appId: "1:717785800659:web:86c2445cbce63a24275926",
  measurementId: "G-H1RW1SZ7K5"
};
const OWNER_EMAIL="alvo.customs@gmail.com";
let WHATSAPP="919664056178";
const DEFAULTS={announce:"Custom label water bottles · Made for your brand",heroLine1:"Your name.",heroLine2:"On every bottle.",heroText:"Premium custom-label packaged water for weddings, hotels, restaurants and events. You bring the brand, we bottle it beautifully.",phone:"+91 96640 56178",whatsapp:"919664056178",email:"alvo.customs@gmail.com",instagram:"alvocustoms",youtube:"alvocustoms"};
const byNew=(a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0);
const url=(v,base)=>/^https?:/.test(v)?v:base+String(v).replace(/^@/,"");
function applySettings(s){
 const d={...DEFAULTS};Object.keys(s||{}).forEach(k=>{if(s[k])d[k]=s[k]});
 document.querySelectorAll("[data-s]").forEach(el=>{const v=d[el.dataset.s];if(v)el.textContent=v});
 const digits=String(d.whatsapp).replace(/\D/g,"");if(digits)WHATSAPP=digits;
 const L=n=>document.querySelectorAll('[data-link="'+n+'"]');
 L("wa").forEach(a=>a.href="https://wa.me/"+WHATSAPP);
 L("tel").forEach(a=>a.href="tel:+"+WHATSAPP);
 L("mail").forEach(a=>a.href="mailto:"+d.email);
 L("ig").forEach(a=>a.href=url(d.instagram,"https://instagram.com/"));
 L("yt").forEach(a=>a.href=url(d.youtube,"https://youtube.com/@"));
FILM=d.filmVideo||"";try{renderFilm()}catch(e){}
 const hv=document.querySelector(".hero-img");
 if(hv&&d.heroVideo){const v=String(d.heroVideo).replace(/["<>]/g,""),ym=v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
  hv.style.cssText="position:relative;overflow:hidden";
  hv.innerHTML=ym?`<iframe src="https://www.youtube.com/embed/${ym[1]}?autoplay=1&mute=1&loop=1&playlist=${ym[1]}&controls=0&playsinline=1&rel=0" allow="autoplay" style="position:absolute;inset:-2%;width:104%;height:104%;border:0;pointer-events:none"></iframe>`:`<video src="${v}" autoplay muted loop playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>`}
 if(d.heroImage)document.documentElement.style.setProperty("--hero-img",'url("'+d.heroImage+'")');
 const an=document.getElementById("announce");if(an){an.textContent=d.announce||"";an.hidden=!d.announce}
}
async function loadSettings(){try{const s=await getDoc(doc(db,"settings","site"));const d=s.exists()?s.data():{};try{localStorage.setItem("alvoS",JSON.stringify(d))}catch(e){}return d}catch(e){console.error(e);return {}}}
/* ===================================== */
const app=initializeApp(firebaseConfig);
const auth=IS_ADMIN?getAuth(app):null;
const db=getFirestore(app);
const provider=IS_ADMIN?new GoogleAuthProvider():null;

let products=[],projects=[],currentUser=null,cart=[];
try{cart=JSON.parse(localStorage.getItem("alvoCart")||"[]")}catch(e){}

const $=id=>document.getElementById(id)||document.createElement("div");
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const safe=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const msg=s=>alert(s);

function owner(){
 if(!currentUser||currentUser.email.toLowerCase()!==OWNER_EMAIL.toLowerCase())throw Error("Admin access denied.");
}
function showTab(id){

["productsAdmin","ordersAdmin","enquiriesAdmin","projectsAdmin","siteAdmin","settingsAdmin"].forEach(x=>$(x).hidden=x!==id);
}
function closeModal(id){$(id).classList.remove("show")}
function openCart(){$("cartModal").classList.add("show")}
function updateCount(){$("cartCount").textContent=cart.reduce((s,x)=>s+x.qty,0);try{localStorage.setItem("alvoCart",JSON.stringify(cart))}catch(e){}}
function total(){return cart.reduce((s,x)=>s+x.price*x.qty,0)}

function renderCart(){
 $("cartItems").innerHTML=cart.length?cart.map(x=>`
 <div class="cartrow">
  <div><b>${safe(x.name)}</b><br><small>${money(x.price)} each</small>
  <br><button class="smallbtn" onclick="removeItem('${x.id}')">Remove</button></div>
  <div><button class="smallbtn" onclick="changeQty('${x.id}',-1)">−</button>
  ${x.qty} <button class="smallbtn" onclick="changeQty('${x.id}',1)">+</button></div>
 </div>`).join(""):'<div class="empty">Your cart is empty.</div>';
 $("cartTotal").textContent=money(total());
}
function addToCart(id,silent){
 const q=Math.max(1,parseInt(document.getElementById("q_"+id)?.value)||1);
 const p=products.find(x=>x.id===id);
 if(!p||!p.active)return msg("Product unavailable.");
 const item=cart.find(x=>x.id===id);
 if(item)item.qty+=q;
 else cart.push({id:p.id,name:p.name,price:Number(p.price),qty:q});
 updateCount();renderCart();if(!silent)toast("Added to cart ✓");
}
function buyNow(id){addToCart(id,true);openCart()}
function changeQty(id,n){
 const x=cart.find(x=>x.id===id);if(!x)return;
 x.qty+=n;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);
 updateCount();renderCart();
try{const cu=JSON.parse(localStorage.getItem("alvoUser")||"null"),cf=$("checkoutForm");if(cu&&cf.elements)["name","business","phone","address"].forEach(k=>{if(cf.elements[k]&&cu[k])cf.elements[k].value=cu[k]})}catch(e){}
if(location.hash==="#bag")openCart();
}
function removeItem(id){cart=cart.filter(x=>x.id!==id);updateCount();renderCart()}
function openCheckout(){
 if(!cart.length)return msg("Your cart is empty.");
 closeModal("cartModal");$("checkoutModal").classList.add("show");
}

let curCat="All",catSet=false;
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
const pcard=p=>`<article class="card">
 <div class="product-image" onclick="openProduct('${p.id}')"><span class="ribbon">Sample Design</span>${p.video?'<span class="vbadge">▶ Video</span>':""}<img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" decoding="async" onerror="this.src='https://placehold.co/600x450/0c1a24/6fe3ea?text=ALVO'"></div>
 <div class="card-body"><small class="gold">${safe(p.category||"Custom")}${p.size?" · "+safe(p.size):""}</small>
  <h3 onclick="openProduct('${p.id}')">${safe(p.name)}</h3>
  <div class="price">${money(p.price)} <small class="muted" style="font-size:12px;font-weight:400">/ bottle</small></div>
  <div class="card-actions"><button class="btn outline" onclick="openProduct('${p.id}')">View Details</button><button class="btn" onclick="addToCart('${p.id}')">Add</button></div></div></article>`;
const PAL=["#d6162b","#1f9d3a","#1c6fe0","#e8981a","#7a2ee0","#0f8f8a"];
const postcard=(p,i)=>`<article class="card poster" style="--pc:${safe(p.color||PAL[i%PAL.length])}"><h3 onclick="openProduct('${p.id}')">${safe(p.name)}</h3><div class="product-image" onclick="openProduct('${p.id}')"><span class="ribbon">Sample Design</span>${p.video?'<span class="vbadge">▶ Video</span>':""}<img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" decoding="async"></div><div class="pfoot"><span class="price">${money(p.price)}</span><button class="plus" aria-label="Add to bag" onclick="addToCart('${p.id}')">+</button></div></article>`;
let rackCat="All",FILM="";
function setRack(c){rackCat=c;renderRack()}
function renderRack(){
 const act=products.filter(p=>p.active===true);
 const cats=[...new Set(act.map(p=>p.category||"Custom"))];
 const list=(rackCat==="All"?act:act.filter(p=>(p.category||"Custom")===rackCat)).slice(0,24);
 $("rackChips").innerHTML=cats.length>1?["All",...cats].map(c=>`<button class="chip${c===rackCat?" on":""}" onclick="setRack('${safe(c)}')">${safe(c)}</button>`).join(""):"";
 $("rackIn").innerHTML=list.map((p,i)=>`<div class="hang" style="animation-delay:-${(i%5)*.9}s" onclick="openProduct('${p.id}')"><i class="hook"></i><div class="hbody"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" decoding="async"><b>${safe(p.name)}</b><span>${money(p.price)}</span></div></div>`).join("");
 $("rack").hidden=!act.length;
}
function mvid(v){v=String(v).replace(/["<>]/g,"");const m=v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);return m?`<iframe src="https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1&loop=1&playlist=${m[1]}&controls=0&playsinline=1&rel=0" allow="autoplay" loading="lazy"></iframe>`:`<video src="${v}" autoplay muted loop playsinline></video>`}
function renderFilm(){
 const fm=$("film"),act=products.filter(p=>p.active===true);
 const pv=act.find(p=>p.video&&!String(p.video).startsWith("fs:")),v=FILM||(pv&&pv.video);
 if(!v){fm.hidden=true;return}
 const imgs=[...act.map(p=>p.image),...projects.map(p=>p.image)].filter(Boolean).slice(0,12);
 const col=a=>a.length?`<div class="ftrack">${[...a,...a].map(s=>`<img src="${safe(s)}" alt="" loading="lazy" decoding="async">`).join("")}</div>`:"";
 if(fm.dataset.v!==v){$("filmMid").innerHTML=mvid(v);fm.dataset.v=v}
 $("filmL").innerHTML=col(imgs.filter((_,i)=>i%2===0));$("filmR").innerHTML=col(imgs.filter((_,i)=>i%2===1));
 fm.hidden=false;
}
function renderProducts(){
 const act=products.filter(p=>p.active===true);
 const list=curCat==="All"?act:act.filter(p=>(p.category||"Custom")===curCat);
 $("productGrid").innerHTML=list.map(pcard).join("")||'<div class="empty">No products in this category yet.</div>';
 const cats=[...new Set(act.map(p=>p.category||"Custom"))];
 $("chips").innerHTML=cats.length>1?["All",...cats].map(c=>`<button class="chip${c===curCat?" on":""}" onclick="setCat('${safe(c)}')">${safe(c)}</button>`).join(""):"";
 const feat=act.filter(p=>p.featured===true);
 $("featuredRow").innerHTML=(feat.length?feat:act.slice(0,6)).map((p,i)=>postcard(p,i)).join("")||'<div class="empty">New products coming soon.</div>';
 const mo=act.filter(p=>p.video);
 $("reelRow").innerHTML=mo.map(p=>`<article class="reel" onclick="openProduct('${p.id}')">${/\.(mp4|webm)(\?|$)/i.test(p.video)?`<video data-reel src="${safe(p.video)}" poster="${safe(p.image)}" muted loop playsinline preload="none"></video>`:`<img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" decoding="async"><span class="pl">▶</span>`}<div class="reel-info"><b>${safe(p.name)}</b><span>${money(p.price)}</span></div></article>`).join("");
 $("motion").hidden=!mo.length;
 renderRack();renderFilm();
}
function setCat(c){curCat=c;renderProducts()}
async function loadProducts(){
 try{
  if(!IS_ADMIN&&!products.length){try{const ca=sessionStorage.getItem("alvoP");if(ca){products=JSON.parse(ca);if(!catSet){catSet=true;const q=new URLSearchParams(location.search).get("cat");if(q)curCat=q}renderProducts()}}catch(e){}}
  const snap=await getDocs(collection(db,"products"));
  products=snap.docs.map(d=>({id:d.id,...d.data()})).sort(byNew);
  if(!catSet){catSet=true;const q=new URLSearchParams(location.search).get("cat");if(q)curCat=q}
  if(!IS_ADMIN)try{sessionStorage.setItem("alvoP",JSON.stringify(products))}catch(e){}
  renderProducts();renderAdminProducts();
 }catch(e){console.error(e);$("productGrid").innerHTML=$("featuredRow").innerHTML='<div class="empty">Products could not be loaded ('+safe(e.message)+'). Please reload.</div>'}
}
const stageImg=p=>`<div class="product-image pm-img"><span class="ribbon">Sample Design</span><img src="${safe(p.image)}" alt="${safe(p.name)}"></div>`;
function stageVid(p){
 const v=String(p.video||""),m=v.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
 if(v.startsWith("fs:"))return `<div class="vwrap"><video id="fsVid" poster="${safe(p.image)}" controls playsinline muted></video><div class="vload" id="fsLoad">Loading video…</div></div>`;
 if(m)return `<div class="vwrap"><iframe src="https://www.youtube.com/embed/${m[1]}?rel=0&playsinline=1&autoplay=1&mute=1&loop=1&playlist=${m[1]}" allow="accelerometer;encrypted-media;picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
 return `<div class="vwrap"><video src="${safe(v)}" poster="${safe(p.image)}" controls autoplay muted loop playsinline preload="metadata"></video></div>`;
}
function pmShow(id,kind,btn){
 const p=products.find(x=>x.id===id);if(!p)return;
 $("pmStage").innerHTML=kind==="vid"?stageVid(p):stageImg(p);
 if(kind==="vid"&&String(p.video).startsWith("fs:"))playFs(p.video);
 btn.parentNode.querySelectorAll(".chip").forEach(c=>c.classList.remove("on"));btn.classList.add("on");
}
function openProduct(id){
 const p=products.find(x=>x.id===id);if(!p)return;
 $("pmBody").innerHTML=`<div class="pm-grid"><div><div id="pmStage">${p.video?stageVid(p):stageImg(p)}</div>${p.video?`<div class="chips" style="margin:12px 0 0;justify-content:flex-start"><button class="chip${p.video?"":" on"}" onclick="pmShow('${p.id}','img',this)">Photo</button><button class="chip on" onclick="pmShow('${p.id}','vid',this)">▶ Video</button></div>`:""}</div>
 <div><small class="gold">${safe(p.category||"Custom")}${p.size?" · "+safe(p.size):""}</small><h2 style="font-size:30px;margin:4px 0">${safe(p.name)}</h2>
 <div class="price" style="font-size:26px">${money(p.price)} <small class="muted" style="font-size:13px;font-weight:400">/ bottle, incl. GST</small></div>
 <p class="muted">${safe(p.description||"")}</p>
 ${p.details?`<p class="muted" style="white-space:pre-line;margin-top:8px">${safe(p.details)}</p>`:""}
 <ul class="spec"><li>This is a <b>sample design</b>. Your final label is made with your own logo and details.</li><li>Design is shared for your approval before production.</li><li>Bulk pricing on request.</li></ul>
 <div class="buyrow"><label class="muted" for="q_${p.id}">Qty</label><input class="qty" id="q_${p.id}" type="number" min="1" value="1" inputmode="numeric"></div>
 <div class="card-actions"><button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button><button class="btn outline" onclick="buyNow('${p.id}');closeModal('productModal')">Buy Now</button></div>
 <button class="btn outline" style="width:100%;margin-top:10px" onclick="enquireProduct('${p.id}')">Customise on WhatsApp</button></div></div>`;
 $("productModal").classList.add("show");
 if(String(p.video||"").startsWith("fs:"))playFs(p.video);
}
function enquireProduct(id){const p=products.find(x=>x.id===id);window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent("Hi ALVO CUSTOMS, I want a custom label for: "+(p?p.name:"")+". Please share details."),"_blank")}

async function loadProjects(){
 try{
  const snap=await getDocs(collection(db,"clients"));
  projects=snap.docs.map(d=>({id:d.id,...d.data()})).sort(byNew);
  const card=p=>`<article class="card"><img class="project-image" loading="lazy" decoding="async" src="${safe(p.image)}" alt="${safe(p.name)}">
   <div class="card-body"><h3>${safe(p.name)}</h3><p>${safe(p.description||"")}</p></div></article>`;
  $("projectGrid").innerHTML=projects.map(card).join("")||'<div class="empty">Our projects will appear here.</div>';
  $("projectRow").innerHTML=projects.slice(0,8).map(card).join("");
  $("workTeaser").hidden=!projects.length;renderFilm();
  renderAdminProjects();
 }catch(e){console.error(e)}
}

async function placeOrder(data){
 let u=null;try{u=JSON.parse(localStorage.getItem("alvoUser")||"null")}catch(e){}
 if(u&&u.uid&&!IS_ADMIN){
  try{
   const [A,F,Au]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-firestore.js"),import(FB+"firebase-auth.js")]);
   const ap=A.getApps().find(x=>x.name==="cust")||A.initializeApp(firebaseConfig,"cust");
   const au=Au.getAuth(ap);await au.authStateReady();
   if(au.currentUser&&au.currentUser.uid===u.uid){
    return await F.addDoc(F.collection(F.getFirestore(ap),"orders"),{...data,uid:u.uid,email:au.currentUser.email||"",createdAt:F.serverTimestamp()});
   }
  }catch(e){console.error(e)}
 }
 return addDoc(collection(db,"orders"),{...data,createdAt:serverTimestamp()});
}
$("checkoutForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!cart.length)return msg("Cart is empty.");
 const f=new FormData(e.target);
 const customer={name:f.get("name").trim(),business:f.get("business").trim(),phone:f.get("phone").trim(),address:f.get("address").trim(),note:f.get("note").trim()};
 const items=cart.map(x=>({productId:x.id,name:x.name,price:x.price,quantity:x.qty}));
 const amount=total(),button=e.target.querySelector("button[type=submit]");

button.disabled=true;button.textContent="Saving order...";
 try{
  const result=await placeOrder({...customer,items,total:amount,status:"New"});
  let textMsg=`ALVO CUSTOMS ORDER\nOrder ID: ${result.id}\nName: ${customer.name}\nBusiness: ${customer.business}\nPhone: ${customer.phone}\nAddress: ${customer.address}\n\n`;
  items.forEach((x,i)=>textMsg+=`${i+1}. ${x.name} x ${x.quantity} = ${money(x.price*x.quantity)}\n`);
  textMsg+=`\nTOTAL: ${money(amount)}\nNote: ${customer.note}`;
  cart=[];updateCount();renderCart();e.target.reset();closeModal("checkoutModal");
  window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(textMsg),"_blank");
  msg("Order saved. Please press Send in WhatsApp to confirm.");
 }catch(err){console.error(err);msg("Order could not be saved. Please try again.")}
 finally{button.disabled=false;button.textContent="Place Order on WhatsApp"}
});

$("enquiryForm").addEventListener("submit",e=>{
 e.preventDefault();const f=new FormData(e.target);
 addDoc(collection(db,"enquiries"),{name:f.get("name"),business:f.get("business"),phone:f.get("phone"),qty:f.get("qty"),message:f.get("message"),createdAt:serverTimestamp()}).catch(console.error);
 const textMsg=`ALVO CUSTOMS ENQUIRY\nName: ${f.get("name")}\nBusiness: ${f.get("business")}\nPhone: ${f.get("phone")}\nQuantity: ${f.get("qty")}\nRequirement: ${f.get("message")}`;
 window.open("https://wa.me/"+WHATSAPP+"?text="+encodeURIComponent(textMsg),"_blank");
});

async function adminSignIn(){
 try{
  const result=await signInWithPopup(auth,provider);
  if(result.user.email.toLowerCase()!==OWNER_EMAIL.toLowerCase()){
   await signOut(auth);msg("This Gmail is not authorized.");return;
  }
 }catch(e){msg("Login failed: "+e.message)}
}
async function adminSignOut(){await signOut(auth);location.hash="";location.reload()}

const isAdminPage=!!document.getElementById("adminPage");
if(IS_ADMIN)onAuthStateChanged(auth,async user=>{
 currentUser=user;
 if(!isAdminPage)return;
 const isAdmin=!!user&&user.email.toLowerCase()===OWNER_EMAIL.toLowerCase();
 $("adminLogin").style.display=isAdmin?"none":"block";
 $("adminDashboard").style.display=isAdmin?"block":"none";
 if(isAdmin){
  const s=await loadSettings(),f=$("siteForm");
  Object.keys(s).forEach(k=>{if(f.elements[k]&&f.elements[k].type!=="file")f.elements[k].value=s[k]});
  await Promise.all([loadProducts(),loadProjects(),loadOrders(),loadEnquiries()]);
 }
});

async function uploadImage(file,folder){
 owner();
 if(!file||!file.type.startsWith("image/"))throw Error("Select a valid image.");
 if(file.size>12*1024*1024)throw Error("Image must be under 12 MB.");
 const u=URL.createObjectURL(file);
 const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error("Could not read image."));i.src=u});
 const hero=folder==="settings",maxW=hero?1200:640,cap=hero?260000:110000;
 const sc=Math.min(1,maxW/img.width);
 let c=document.createElement("canvas");
 c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
 const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
 for(let t=0;t<4;t++){
  for(const q of [.72,.6,.5,.4]){const out=c.toDataURL("image/jpeg",q);if(out.length<=cap)return out}
  const c2=document.createElement("canvas");c2.width=Math.round(c.width*.8);c2.height=Math.round(c.height*.8);c2.getContext("2d").drawImage(c,0,0,c2.width,c2.height);c=c2;
 }
 throw Error("Image is too detailed. Try a smaller photo.");
}

async function uploadVideo(file){
 owner();
 if(!file.type.startsWith("video/"))throw Error("Select a video file.");
 if(file.size>7*1024*1024)throw Error("Video must be under 7 MB. Trim it, or use a YouTube link.");
 const buf=new Uint8Array(await file.arrayBuffer()),CH=600*1024,id="v"+Date.now(),n=Math.ceil(buf.length/CH);
 for(let i=0;i<n;i++){
  const part=buf.subarray(i*CH,(i+1)*CH);let s="";
  for(let k=0;k<part.length;k+=8192)s+=String.fromCharCode.apply(null,part.subarray(k,k+8192));
  await setDoc(doc(db,"videos",id+"_"+i),{n,i,type:file.type,data:btoa(s)});
  toast("Uploading video "+(i+1)+"/"+n);
 }
 return "fs:"+id+":"+n+":"+file.type;
}
const fsCache={};
async function playFs(v){
 const el=document.getElementById("fsVid"),ld=document.getElementById("fsLoad");if(!el)return;
 try{
  if(!fsCache[v]){
   const [,id,n,...t]=v.split(":");
   const snaps=await Promise.all(Array.from({length:+n},(_,i)=>getDoc(doc(db,"videos",id+"_"+i))));
   const parts=snaps.map(s=>Uint8Array.from(atob(s.data().data),ch=>ch.charCodeAt(0)));
   fsCache[v]=URL.createObjectURL(new Blob(parts,{type:t.join(":")}));
  }
  el.src=fsCache[v];ld.remove();el.play().catch(()=>{});
 }catch(e){console.error(e);ld.textContent="Video could not be loaded."}
}
$("productForm").addEventListener("submit",async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector("button[type=submit]");
 button.disabled=true;
 try{
  owner();const f=new FormData(form),id=f.get("id");
  const name=f.get("name").trim(),price=Number(f.get("price"));
  if(!name||!Number.isFinite(price)||price<0)throw Error("Enter a valid name and price.");
  const file=f.get("image");let image=f.get("imageUrl").trim();
  if(file&&file.size)image=await uploadImage(file,"products");
  else if(id&&!image)image=products.find(p=>p.id===id)?.image||"";
  if(!image)throw Error("Add an image URL or upload an image.");
  let vid=f.get("video").trim();if(vid&&!/^(https?:\/\/|fs:|[\w\-.\/]+\.(mp4|webm)$)/i.test(vid))throw Error("Video link must be a YouTube/https link or a .mp4 file name.");const vf=f.get("videoFile");if(vf&&vf.size)vid=await uploadVideo(vf);const data={name,price,video:vid,size:f.get("size").trim(),color:(f.get("color")==="#6e1f38"?"":f.get("color")),category:f.get("category"),details:f.get("details").trim(),featured:f.get("featured")==="true",description:f.get("description").trim(),image,active:f.get("active")==="true",updatedAt:serverTimestamp()};
  if(id)await updateDoc(doc(db,"products",id),data);
  else await addDoc(collection(db,"products"),{...data,createdAt:serverTimestamp()});
  form.reset();form.elements.id.value="";await loadProducts();msg("Product saved.");
 }catch(err){console.error(err);msg(err.message)}
 finally{button.disabled=false}
});

function renderAdminProducts(){
 $("adminProductList").innerHTML=products.map(p=>`
 <div class="adminrow"><img src="${safe(p.image)}"><div class="grow"><b>${safe(p.name)}</b><br><small>${money(p.price)} · ${p.active?"Active":"Draft"}</small></div>
 <button class="smallbtn" onclick="editProduct('${p.id}')">Edit</button><button class="smallbtn" onclick="deleteProduct('${p.id}')">Delete</button></div>`).join("")||'<p class="notice">No products yet.</p>';
}
function editProduct(id){
 owner();const p=products.find(x=>x.id===id);if(!p)return;
 const f=$("productForm");f.elements.id.value=p.id;f.elements.name.value=p.name;f.elements.price.value=p.price;f.elements.description.value=p.description||"";f.elements.imageUrl.value=p.image||"";f.elements.active.value=String(p.active===true);f.elements.size.value=p.size||"";f.elements.color.value=p.color||"#6e1f38";f.elements.video.value=p.video||"";f.elements.category.value=p.category||"Classic";f.elements.details.value=p.details||"";f.elements.featured.value=String(p.featured===true);f.scrollIntoView({behavior:"smooth"});
}
function resetProductForm(){$("productForm").reset();$("productForm").elements.id.value=""}
async function deleteProduct(id){
 try{owner();if(!confirm("Delete this product?"))return;await deleteDoc(doc(db,"products",id));await loadProducts();msg("Product deleted.")}catch(e){msg(e.message)}
}


async function loadOrders(){
 try{
  owner();const snap=await getDocs(query(collection(db,"orders"),orderBy("createdAt","desc")));
  $("adminOrders").innerHTML=snap.docs.map(d=>{
   const o=d.data();
   return `<div class="panel" style="padding:15px;margin-top:12px">
   <b>Order #${safe(d.id)}</b> <span class="gold">${money(o.total)}</span>
   <p>${safe(o.name)} · ${safe(o.business||"")} · ${safe(o.phone)}</p>
   <p class="notice">${safe(o.address||"")}</p>
   <p>${(o.items||[]).map(x=>safe(x.name)+" × "+Number(x.quantity)).join("<br>")}</p>
   <p>Status: ${safe(o.status||"New")}</p>
   <button class="smallbtn" onclick="updateOrder('${d.id}','Processing')">Processing</button>
   <button class="smallbtn" onclick="updateOrder('${d.id}','Completed')">Completed</button>
   <button class="smallbtn" onclick="delItem('orders','${d.id}')">Delete</button>
   </div>`;
  }).join("")||'<p class="notice">No orders yet.</p>';
 }catch(e){console.error(e);$("adminOrders").textContent="Could not load orders."}
}
async function updateOrder(id,status){
 try{owner();await updateDoc(doc(db,"orders",id),{status,updatedAt:serverTimestamp()});await loadOrders();msg("Order updated.")}catch(e){msg(e.message)}

}

$("projectForm").addEventListener("submit",async e=>{
 e.preventDefault();const form=e.target,button=form.querySelector("button");
 button.disabled=true;
 try{
  owner();const f=new FormData(form),file=f.get("image");
  const image=await uploadImage(file,"clients");
  await addDoc(collection(db,"clients"),{name:f.get("name").trim(),description:f.get("description").trim(),image,createdAt:serverTimestamp()});
  form.reset();await loadProjects();msg("Project uploaded.");
 }catch(err){msg(err.message)}
 finally{button.disabled=false}
});
function renderAdminProjects(){
 $("adminProjectList").innerHTML=projects.map(p=>`
 <div class="adminrow"><img src="${safe(p.image)}"><div class="grow"><b>${safe(p.name)}</b><br><small>${safe(p.description||"")}</small></div><button class="smallbtn" onclick="deleteProject('${p.id}')">Delete</button></div>`).join("")||'<p class="notice">No projects yet.</p>';
}
async function deleteProject(id){
 try{owner();if(!confirm("Delete this project?"))return;await
deleteDoc(doc(db,"clients",id));await loadProjects();msg("Project deleted.")}catch(e){msg(e.message)}
}

async function loadEnquiries(){
 try{
  owner();const snap=await getDocs(query(collection(db,"enquiries"),orderBy("createdAt","desc")));
  $("adminEnquiries").innerHTML=snap.docs.map(d=>{const e=d.data();
   return `<div class="panel" style="padding:15px;margin-top:12px"><b>${safe(e.name)}</b> · ${safe(e.business||"")}
   <p><a class="gold" href="tel:${safe(e.phone)}">${safe(e.phone)}</a> · ${safe(e.qty||"")}</p>
   <p>${safe(e.message)}</p>
   <button class="smallbtn" onclick="delItem('enquiries','${d.id}')">Delete</button></div>`}).join("")||'<p class="notice">No enquiries yet.</p>';
 }catch(e){console.error(e);$("adminEnquiries").textContent="Could not load enquiries."}
}
async function delItem(col,id){
 try{owner();if(!confirm("Delete permanently?"))return;await deleteDoc(doc(db,col,id));if(col==="orders")await loadOrders();else await loadEnquiries()}catch(e){msg(e.message)}
}
$("siteForm").addEventListener("submit",async e=>{
 e.preventDefault();const form=e.target,b=form.querySelector("button");b.disabled=true;
 try{
  owner();const f=new FormData(form),data={};
  ["announce","heroLine1","heroLine2","heroText","heroVideo","filmVideo","phone","whatsapp","email","instagram","youtube"].forEach(k=>data[k]=String(f.get(k)||"").trim());
  const file=f.get("heroFile");if(file&&file.size)data.heroImage=await uploadImage(file,"settings");
  if(f.get("clearHero"))data.heroImage="";
  await setDoc(doc(db,"settings","site"),data,{merge:true});msg("Site updated. Refresh the website to see changes.");
 }catch(err){msg(err.message)}finally{b.disabled=false}
});

async function exportBackup(){
 try{
  owner();
  const [p,o,c]=await Promise.all([getDocs(collection(db,"products")),getDocs(collection(db,"orders")),getDocs(collection(db,"clients"))]);
  const data={exportedAt:new Date().toISOString(),products:p.docs.map(d=>({id:d.id,...d.data()})),orders:o.docs.map(d=>({id:d.id,...d.data()})),projects:c.docs.map(d=>({id:d.id,...d.data()}))};
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
  const a=document.createElement("a");a.href=url;a.download="ALVO-CUSTOMS-BACKUP.json";a.click();URL.revokeObjectURL(url);
 }catch(e){msg(e.message)}
}

$("year").textContent=new Date().getFullYear();

Object.assign(window,{
openCart,closeModal,openProduct,pmShow,setCat,setRack,enquireProduct,openCheckout,addToCart,buyNow,changeQty,removeItem,
 adminSignIn,adminSignOut,showTab,editProduct,resetProductForm,
 deleteProduct,updateOrder,delItem,deleteProject,exportBackup
});

updateCount();renderCart();
try{applySettings(JSON.parse(localStorage.getItem("alvoS")||"{}"))}catch(e){}
loadSettings().then(applySettings);
if(!isAdminPage){
 if(document.getElementById("productGrid")||document.getElementById("featuredRow"))loadProducts();
 if(document.getElementById("projectGrid")||document.getElementById("projectRow"))loadProjects();
}
