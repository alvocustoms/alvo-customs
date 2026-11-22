const FB="https://www.gstatic.com/firebasejs/11.0.2/";
const firebaseConfig = {
  apiKey: "AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",
  authDomain: "alvocustoms-c4952.firebaseapp.com",
  projectId: "alvocustoms-c4952",
  storageBucket: "alvocustoms-c4952.firebasestorage.app",
  messagingSenderId: "717785800659",
  appId: "1:717785800659:web:86c2445cbce63a24275926",
  measurementId: "G-H1RW1SZ7K5"
};
const [A,F,U]=await Promise.all([import(FB+"firebase-app.js"),import(FB+"firebase-firestore.js"),import(FB+"firebase-auth.js")]);
const app=A.getApps().find(x=>x.name==="cust")||A.initializeApp(firebaseConfig,"cust");
const db=F.getFirestore(app),auth=U.getAuth(app);
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>"₹"+Number(n||0).toLocaleString("en-IN");
const KEYS=["name","business","phone","address"];
function toast(t){const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
function save(o){try{localStorage.setItem("alvoUser",JSON.stringify(o))}catch(e){}}
const when=o=>{const s=o.createdAt&&o.createdAt.seconds;return s?new Date(s*1000).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}):""};
$("gBtn").onclick=async()=>{try{await U.signInWithPopup(auth,new U.GoogleAuthProvider())}catch(e){$("acctMsg").textContent="Sign-in failed ("+(e.code||e.message)+"). Please try again."}};
$("outBtn").onclick=async()=>{await U.signOut(auth);try{localStorage.removeItem("alvoUser")}catch(e){}};
$("profForm").onsubmit=async e=>{
 e.preventDefault();const u=auth.currentUser;if(!u)return;
 const f=e.target,d={};KEYS.forEach(k=>d[k]=f.elements[k].value.trim());
 try{await F.setDoc(F.doc(db,"customers",u.uid),{...d,email:u.email||"",updatedAt:F.serverTimestamp()},{merge:true});save({uid:u.uid,...d});toast("Details saved ✓")}
 catch(err){console.error(err);toast("Could not save. Try again.")}
};
function reorder(o){
 const cart=(o.items||[]).map(x=>({id:x.productId,name:x.name,price:Number(x.price),qty:Number(x.quantity)}));
 try{localStorage.setItem("alvoCart",JSON.stringify(cart))}catch(e){}
 location.href="products.html#bag";
}
async function loadOrders(u){
 const box=$("orderList");
 try{
  const snap=await F.getDocs(F.query(F.collection(db,"orders"),F.where("uid","==",u.uid)));
  const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>((b.createdAt&&b.createdAt.seconds)||0)-((a.createdAt&&a.createdAt.seconds)||0));
  box.innerHTML=list.map((o,i)=>`<div class="panel" style="padding:18px;margin-bottom:12px">
   <div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><b>${when(o)}</b><span class="gold">${esc(o.status||"New")}</span></div>
   ${(o.items||[]).map(x=>`<p class="muted">${esc(x.name)} × ${esc(x.quantity)}</p>`).join("")}
   <p style="margin:8px 0 12px"><b>${money(o.total)}</b></p><button class="btn outline" data-i="${i}">Order again</button></div>`).join("")||'<div class="empty">No orders yet. Your orders will show here.</div>';
  box.querySelectorAll("[data-i]").forEach(b=>b.onclick=()=>reorder(list[+b.dataset.i]));
 }catch(e){console.error(e);box.innerHTML='<div class="empty">Could not load orders ('+esc(e.code||e.message)+').</div>'}
}
U.onAuthStateChanged(auth,async u=>{
 $("acctOut").hidden=!!u;$("acctIn").hidden=!u;
 if(!u)return;
 $("hi").textContent="Hello, "+(u.displayName||"there");$("em").textContent=u.email||"";
 let p={};try{const s=await F.getDoc(F.doc(db,"customers",u.uid));if(s.exists())p=s.data()}catch(e){console.error(e)}
 const f=$("profForm");KEYS.forEach(k=>f.elements[k].value=p[k]||(k==="name"?u.displayName||"":""));
 const d={};KEYS.forEach(k=>d[k]=f.elements[k].value);save({uid:u.uid,...d});
 loadOrders(u);
});
