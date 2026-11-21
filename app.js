
import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {getFirestore,collection,addDoc,getDocs,doc,deleteDoc,updateDoc,getDoc,setDoc,serverTimestamp,query,orderBy} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

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
const DEFAULTS={announce:"",heroLine1:"MAKE WATER YOUR",heroLine2:"IDENTITY.",heroText:"Premium custom-label packaged drinking water bottle solutions for hotels, restaurants, events and businesses.",phone:"+91 96640 56178",whatsapp:"919664056178",email:"alvo.customs@gmail.com",instagram:"alvocustoms",youtube:"alvocustoms"};
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
 if(d.heroImage)document.documentElement.style.setProperty("--hero-img",'url("'+d.heroImage+'")');
 const an=document.getElementById("announce");if(an){an.textContent=d.announce||"";an.hidden=!d.announce}
}
async function loadSettings(){try{const s=await getDoc(doc(db,"settings","site"));return s.exists()?s.data():{}}catch(e){console.error(e);return {}}}
/* ===================================== */
const app=initializeApp(firebaseConfig);
const auth=getAuth(app);
const db=getFirestore(app);
const provider=new GoogleAuthProvider();

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
 updateCount();renderCart();if(!silent)msg("Added to cart!");
}
function buyNow(id){addToCart(id,true);openCart()}
function changeQty(id,n){
 const x=cart.find(x=>x.id===id);if(!x)return;
 x.qty+=n;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);
 updateCount();renderCart();
}
function removeItem(id){cart=cart.filter(x=>x.id!==id);updateCount();renderCart()}
function openCheckout(){
 if(!cart.length)return msg("Your cart is empty.");
 closeModal("cartModal");$("checkoutModal").classList.add("show");
}

async function loadProducts(){
 try{
  const snap=await getDocs(collection(db,"products"));
  products=snap.docs.map(d=>({id:d.id,...d.data()})).sort(byNew);
  const act=products.filter(p=>p.active===true);
  const card=p=>`
 <article class="card">
    <div class="product-image"><img src="${safe(p.image)}" alt="${safe(p.name)}" loading="lazy" onerror="this.src='https://placehold.co/600x400/182530/d7b779?text=ALVO'"></div>
    <div class="card-body"><h3>${safe(p.name)}${p.size?` <small class="gold">· ${safe(p.size)}</small>`:""}</h3><p>${safe(p.description||"")}</p>
     <div class="price">${money(p.price)} <small class="muted" style="font-size:12px;font-weight:normal">/ bottle, incl. GST</small></div>
     <div class="moq">Custom label orders: bulk pricing on request</div>
     <div class="buyrow"><label class="muted" style="font-size:12px" for="q_${p.id}">Qty</label><input class="qty" id="q_${p.id}" type="number" min="1" value="1" inputmode="numeric"></div>
     <div class="card-actions"><button class="btn" onclick="addToCart('${p.id}')">Add to Cart</button><button class="btn outline" onclick="buyNow('${p.id}')">Buy Now</button></div>
    </div>
   </article>`;
  $("productGrid").innerHTML=act.map(card).join("")||'<div class="empty">New products coming soon.</div>';
  const feat=act.filter(p=>p.featured===true);
  $("featuredRow").innerHTML=(feat.length?feat:act.slice(0,6)).map(card).join("")||'<div class="empty">New products coming soon.</div>';
  renderAdminProducts();
 }catch(e){console.error(e);$("productGrid").innerHTML=$("featuredRow").innerHTML='<div class="empty">Products could not be loaded. Please try again.</div>'}
}

async function loadProjects(){
 try{
  const snap=await getDocs(collection(db,"clients"));
  projects=snap.docs.map(d=>({id:d.id,...d.data()})).sort(byNew);
  const card=p=>`<article class="card"><img class="project-image" loading="lazy" src="${safe(p.image)}" alt="${safe(p.name)}">
   <div class="card-body"><h3>${safe(p.name)}</h3><p>${safe(p.description||"")}</p></div></article>`;
  $("projectGrid").innerHTML=projects.map(card).join("")||'<div class="empty">Our projects will appear here.</div>';
  $("projectRow").innerHTML=projects.slice(0,8).map(card).join("");
  $("workTeaser").hidden=!projects.length;
  renderAdminProjects();
 }catch(e){console.error(e)}
}

$("checkoutForm").addEventListener("submit",async e=>{
 e.preventDefault();if(!cart.length)return msg("Cart is empty.");
 const f=new FormData(e.target);
 const customer={name:f.get("name").trim(),business:f.get("business").trim(),phone:f.get("phone").trim(),address:f.get("address").trim(),note:f.get("note").trim()};
 const items=cart.map(x=>({productId:x.id,name:x.name,price:x.price,quantity:x.qty}));
 const amount=total(),button=e.target.querySelector("button[type=submit]");

button.disabled=true;button.textContent="Saving order...";
 try{
  const result=await addDoc(collection(db,"orders"),{...customer,items,total:amount,status:"New",createdAt:serverTimestamp()});
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
onAuthStateChanged(auth,async user=>{
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
 const hero=folder==="settings",maxW=hero?1400:800,cap=hero?900000:350000;
 const sc=Math.min(1,maxW/img.width),c=document.createElement("canvas");
 c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
 const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
 for(const q of [.78,.65,.5,.4]){const out=c.toDataURL("image/jpeg",q);if(out.length<=cap)return out}
 throw Error("Image is too detailed. Try a smaller photo.");
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
  const data={name,price,size:f.get("size").trim(),featured:f.get("featured")==="true",description:f.get("description").trim(),image,active:f.get("active")==="true",updatedAt:serverTimestamp()};
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
 const f=$("productForm");f.elements.id.value=p.id;f.elements.name.value=p.name;f.elements.price.value=p.price;f.elements.description.value=p.description||"";f.elements.imageUrl.value=p.image||"";f.elements.active.value=String(p.active===true);f.elements.size.value=p.size||"";f.elements.featured.value=String(p.featured===true);f.scrollIntoView({behavior:"smooth"});
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
  ["announce","heroLine1","heroLine2","heroText","phone","whatsapp","email","instagram","youtube"].forEach(k=>data[k]=String(f.get(k)||"").trim());
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
openCart,closeModal,openCheckout,addToCart,buyNow,changeQty,removeItem,
 adminSignIn,adminSignOut,showTab,editProduct,resetProductForm,
 deleteProduct,updateOrder,delItem,deleteProject,exportBackup
});

updateCount();renderCart();
loadSettings().then(applySettings);
if(!isAdminPage){
 if(document.getElementById("productGrid")||document.getElementById("featuredRow"))loadProducts();
 if(document.getElementById("projectGrid")||document.getElementById("projectRow"))loadProjects();
}
