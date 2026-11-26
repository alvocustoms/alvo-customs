import {initializeApp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {getFirestore,collection,addDoc,getDocs,doc,getDoc,setDoc,deleteDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import {getAuth,GoogleAuthProvider,signInWithPopup,signOut,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
const firebaseConfig={apiKey:"AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",authDomain:"alvocustoms-c4952.firebaseapp.com",projectId:"alvocustoms-c4952",storageBucket:"alvocustoms-c4952.firebasestorage.app",messagingSenderId:"717785800659",appId:"1:717785800659:web:86c2445cbce63a24275926"};
const OWNER="alvo.customs@gmail.com";
const app=initializeApp(firebaseConfig),db=getFirestore(app),auth=getAuth(app);
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const toast=t=>{const e=document.createElement("div");e.className="toast";e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),2600)};
const owner=()=>{const u=auth.currentUser;if(!u||(u.email||"").toLowerCase()!==OWNER)throw Error("Not authorised")};
const sec=t=>(t&&t.seconds)||0;
const when=o=>{const s=sec(o.createdAt);return s?new Date(s*1000).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}):""};
const wa=p=>{let d=String(p||"").replace(/\D/g,"");if(d.length===10)d="91"+d;return "https://wa.me/"+d};

/* ----- media helpers (images are compressed in the browser and stored in Firestore: free, no Storage plan needed) ----- */
async function compress(file,maxW,cap){
 if(!file||!file.type.startsWith("image/"))throw Error("Select a valid image.");
 const u=URL.createObjectURL(file);
 const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(Error("Could not read image."));i.src=u});
 const sc=Math.min(1,maxW/img.width);let c=document.createElement("canvas");c.width=Math.round(img.width*sc);c.height=Math.round(img.height*sc);
 const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(u);
 for(let t=0;t<4;t++){
  for(const q of [.78,.65,.5,.4]){const o=c.toDataURL("image/jpeg",q);if(o.length<=cap)return o}
  const c2=document.createElement("canvas");c2.width=Math.round(c.width*.8);c2.height=Math.round(c.height*.8);c2.getContext("2d").drawImage(c,0,0,c2.width,c2.height);c=c2;
 }
 throw Error("Image is too detailed. Try a smaller photo.");
}
async function uploadVideo(file){
 if(!file.type.startsWith("video/"))throw Error("Select a video file.");
 if(file.size>7*1024*1024)throw Error("Video must be under 7 MB. Use a YouTube / Drive link for bigger videos.");
 const buf=new Uint8Array(await file.arrayBuffer()),CH=600*1024,id="v"+Date.now(),n=Math.ceil(buf.length/CH);
 for(let i=0;i<n;i++){
  const part=buf.subarray(i*CH,(i+1)*CH);let s="";
  for(let k=0;k<part.length;k+=8192)s+=String.fromCharCode.apply(null,part.subarray(k,k+8192));
  await setDoc(doc(db,"videos",id+"_"+i),{n,i,type:file.type,data:btoa(s)});
  toast("Uploading video "+(i+1)+"/"+n);
 }
 return "fs:"+id+":"+n+":"+file.type;
}

/* ----- schemas ----- */
const CATS=["Wedding","Restaurant","Hotel","Corporate","Event","Classic"];
const SCH={
 products:{title:"Products",nm:"name",img:"image",media:"productMedia",fields:[
  {k:"name",l:"Product name",t:"text",req:1},{k:"edition",l:"Edition (e.g. Signature, Wedding Edition)",t:"text"},
  {k:"category",l:"Category",t:"sel",o:CATS},{k:"size",l:"Bottle size (e.g. 500 ml)",t:"text"},{k:"design",l:"Design / label style",t:"text"},
  {k:"description",l:"Description",t:"area"},{k:"bottlesPerBox",l:"Number of bottles per box",t:"num",req:1},
  {k:"boxPrice",l:"Selling price per box (₹)",t:"num",req:1},{k:"minBoxes",l:"Minimum boxes per order",t:"num"},
  {k:"available",l:"Available for ordering",t:"bool",d:1},{k:"featured",l:"Featured on homepage",t:"bool"},{k:"active",l:"Active (visible on website)",t:"bool",d:1},
  {k:"image",l:"Cover image",t:"img",req:1,w:640,c:110000},
  {k:"images",l:"More images (up to 5)",t:"imgs",m:1,w:800,c:150000},
  {k:"videos",l:"Videos: YouTube / Instagram / Google Drive / .mp4 link, one per line",t:"links",m:1}]},
 editions:{title:"Editions",nm:"name",img:"image",fields:[
  {k:"name",l:"Edition name",t:"text",req:1},{k:"tagline",l:"Short tagline",t:"text"},{k:"order",l:"Order (1 = first)",t:"num"},
  {k:"image",l:"Edition image",t:"img",w:700,c:120000},{k:"active",l:"Active",t:"bool",d:1}]},
 reels:{title:"Reels",nm:"title",img:"thumb",fields:[
  {k:"title",l:"Reel title",t:"text",req:1},{k:"video",l:"Video: YouTube / .mp4 / Drive / Instagram link",t:"vid"},
  {k:"thumb",l:"Thumbnail image",t:"img",w:480,c:80000},{k:"order",l:"Order (1 = first)",t:"num"},{k:"active",l:"Active",t:"bool",d:1}]},
 clients:{title:"Projects",nm:"name",img:"image",fields:[
  {k:"name",l:"Project / customer name",t:"text",req:1},{k:"category",l:"Type (e.g. Wedding, Hotel, Corporate)",t:"text"},
  {k:"description",l:"Details",t:"area"},{k:"image",l:"Project image",t:"img",req:1,w:800,c:130000},{k:"active",l:"Active",t:"bool",d:1}]},
 settings:{title:"Site Content",single:1,fields:[
  {k:"announce",l:"Top banner text (leave empty to hide)",t:"text"},{k:"heroTitle1",l:"Hero heading line 1",t:"text"},{k:"heroTitle2",l:"Hero heading line 2",t:"text"},
  {k:"heroText",l:"Hero paragraph",t:"area"},{k:"heroImage",l:"Hero image (replaces the animated bottle)",t:"img",w:900,c:220000},
  {k:"aboutText",l:"About Us text",t:"area"},{k:"visionText",l:"Vision text",t:"area"},
  {k:"phone",l:"Phone (shown on site)",t:"text"},{k:"whatsapp",l:"WhatsApp number, digits only with country code (e.g. 919664056178)",t:"text"},
  {k:"email",l:"Email",t:"text"},{k:"instagram",l:"Instagram handle or link",t:"text"},{k:"address",l:"Business address",t:"area"}]}
};
const STATUS=["Pending Confirmation","Confirmed","Processing","Dispatched","Completed","Cancelled"];
const TABS=[["orders","Orders"],["products","Products"],["editions","Editions"],["reels","Reels"],["clients","Projects"],["enquiries","Enquiries"],["settings","Site Content"],["backup","Backup"]];
let LIST={},cur=null,tab="orders";
const ls=async c=>(await getDocs(collection(db,c))).docs.map(d=>({id:d.id,...d.data()}));

/* ----- generic CRUD forms ----- */
function fieldHTML(f,v){
 const L=`<label>${esc(f.l)}</label>`;
 if(f.t==="text")return `<div class="field">${L}<input name="${f.k}" value="${esc(v??"")}"></div>`;
 if(f.t==="num")return `<div class="field">${L}<input name="${f.k}" type="number" step="any" min="0" value="${v??""}"></div>`;
 if(f.t==="area")return `<div class="field">${L}<textarea name="${f.k}">${esc(v??"")}</textarea></div>`;
 if(f.t==="sel")return `<div class="field">${L}<select name="${f.k}"><option value="">-</option>${f.o.map(o=>`<option${o===v?" selected":""}>${esc(o)}</option>`).join("")}</select></div>`;
 if(f.t==="bool")return `<div class="field"><label><input type="checkbox" name="${f.k}" ${v?"checked":""} style="width:auto"> ${esc(f.l)}</label></div>`;
 if(f.t==="img")return `<div class="field">${L}${v?`<div class="thumbs"><div><img src="${esc(v)}" alt=""></div></div>`:""}<input name="${f.k}" type="file" accept="image/*"></div>`;
 if(f.t==="imgs")return `<div class="field">${L}<div class="thumbs" id="th_${f.k}"></div><input name="${f.k}" type="file" accept="image/*" multiple></div>`;
 if(f.t==="links")return `<div class="field">${L}<textarea name="${f.k}" placeholder="https://youtube.com/shorts/...">${esc((v||[]).join("\n"))}</textarea><label style="margin-top:6px">Or upload a short clip (up to 7 MB)</label><input name="${f.k}_file" type="file" accept="video/*"></div>`;
 if(f.t==="vid")return `<div class="field">${L}<input name="${f.k}" value="${esc(v??"")}" placeholder="https://..."><label style="margin-top:6px">Or upload a short clip (up to 7 MB)</label><input name="${f.k}_file" type="file" accept="video/*"></div>`;
 return "";
}
function drawThumbs(){
 (SCH[cur.col].fields||[]).filter(f=>f.t==="imgs").forEach(f=>{
  const el=$("th_"+f.k);if(!el)return;
  el.innerHTML=(cur.media[f.k]||[]).map((s,i)=>`<div><img src="${esc(s)}" alt=""><button type="button" data-rm="${f.k}:${i}" aria-label="Remove">×</button></div>`).join("");
 });
}
function drawForm(){
 const sc=SCH[cur.col];
 $("cf").innerHTML=sc.fields.map(f=>fieldHTML(f,f.m?cur.media[f.k]:(cur.data[f.k]!==undefined?cur.data[f.k]:(f.t==="bool"?!!f.d:"")))).join("")+`<button class="btn">${sc.single?"Save changes":(cur.id?"Update":"Save")}</button>${sc.single?"":' <button type="button" class="btn ghost" id="rs">Clear</button>'}`;
 drawThumbs();$("ft").textContent=sc.single?sc.title:(cur.id?"Edit":"Add new");
 const rs=$("rs");if(rs)rs.onclick=()=>{cur={col:cur.col,id:null,data:{},media:{}};drawForm()};
}
async function saveForm(e){
 e.preventDefault();const form=e.target,btn=form.querySelector("button");btn.disabled=true;
 try{
  owner();const sc=SCH[cur.col],data={},media={};
  for(const f of sc.fields){
   const el=form.elements[f.k];let v;
   if(f.t==="num")v=Number(el.value)||0;
   else if(f.t==="bool")v=el.checked;
   else if(f.t==="img"){const fl=el.files[0];v=fl?await compress(fl,f.w,f.c):(cur.data[f.k]||"")}
   else if(f.t==="imgs"){v=[...(cur.media[f.k]||[])];for(const fl of el.files){if(v.length>=6)break;v.push(await compress(fl,f.w,f.c))}}
   else if(f.t==="links"){v=el.value.split("\n").map(s=>s.trim()).filter(Boolean);const vf=form.elements[f.k+"_file"].files[0];if(vf)v.push(await uploadVideo(vf))}
   else if(f.t==="vid"){v=el.value.trim();const vf=form.elements[f.k+"_file"].files[0];if(vf)v=await uploadVideo(vf)}
   else v=el.value.trim();
   if(f.req&&!v)throw Error("Please fill: "+f.l);
   if(f.t==="links"||f.t==="vid")[].concat(v).forEach(x=>{if(x&&!/^(https?:\/\/|fs:|[\w\-.\/]+\.(mp4|webm)$)/i.test(x))throw Error("Video links must start with https:// or be a .mp4 file name.")});
   (f.m?media:data)[f.k]=v;
  }
  if(sc.single){await setDoc(doc(db,"settings","site"),data,{merge:true})}
  else{
   data.updatedAt=serverTimestamp();let id=cur.id;
   if(id)await setDoc(doc(db,cur.col,id),data,{merge:true});
   else{const r=await addDoc(collection(db,cur.col),{...data,createdAt:serverTimestamp()});id=r.id}
   if(sc.media&&Object.keys(media).length)await setDoc(doc(db,sc.media,id),media,{merge:true});
  }
  toast("Saved ✓");if(sc.single){showTab("settings")}else showTab(cur.col);
 }catch(err){console.error(err);toast(err.message||"Could not save");btn.disabled=false}
}
function rowHTML(col,o){
 const sc=SCH[col],sub=col==="products"?[o.edition,o.size,o.bottlesPerBox?o.bottlesPerBox+" bottles/box":"",o.boxPrice?"₹"+o.boxPrice+"/box":""].filter(Boolean).join(" · "):[o.category,o.tagline,o.video?"video":""].filter(Boolean).join(" · ");
 const flags=[o.active===false?"Hidden":"",o.available===false?"Unavailable":"",o.featured?"Featured":""].filter(Boolean).map(x=>`<span class="stat">${x}</span>`).join(" ");
 return `<div class="arow">${o[sc.img]?`<img src="${esc(o[sc.img])}" alt="">`:""}<div class="g"><b>${esc(o[sc.nm])}</b><small>${esc(sub)}</small>${flags}</div><button class="btn ghost sm" data-ed="${o.id}">Edit</button> <button class="btn sm" style="background:#c0392b;border-color:#c0392b" data-del="${o.id}">Delete</button></div>`;
}
async function showCrud(col){
 const sc=SCH[col];LIST[col]=(await ls(col)).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)||sec(b.createdAt)-sec(a.createdAt));
 cur={col,id:null,data:{},media:{}};
 $("panel").innerHTML=`<div class="panel"><h2 id="ft"></h2><form id="cf"></form></div><div class="panel"><h2>${sc.title} (${LIST[col].length})</h2><div id="lst">${LIST[col].map(o=>rowHTML(col,o)).join("")||'<p class="muted">Nothing here yet.</p>'}</div></div>`;
 drawForm();$("cf").onsubmit=saveForm;
}
async function showSettings(){
 const s=await getDoc(doc(db,"settings","site"));cur={col:"settings",id:"site",data:s.exists()?s.data():{},media:{}};
 $("panel").innerHTML='<div class="panel"><h2 id="ft"></h2><p class="muted">Empty fields use the default text. Changes appear on the website immediately.</p><form id="cf"></form></div>';
 drawForm();$("cf").onsubmit=saveForm;
}
const statusSel=(id,v,opts)=>`<select data-st="${id}" style="padding:8px;border-radius:8px;border:1px solid var(--line)">${opts.map(o=>`<option${o===v?" selected":""}>${o}</option>`).join("")}</select>`;
async function showOrders(){
 const l=(await ls("orders")).sort((a,b)=>sec(b.createdAt)-sec(a.createdAt));
 $("panel").innerHTML=`<div class="panel"><h2>Order requests (${l.length})</h2><p class="muted">${l.filter(o=>o.status==="Pending Confirmation").length} waiting for your confirmation. A request is never confirmed automatically.</p></div>`+(l.map(o=>`<div class="panel" data-o="${o.id}"><b>${esc(o.ref||o.id)}</b> · ${when(o)} <span class="stat">${esc(o.status)}</span>
<p><b>${esc(o.productName)}</b> ${o.size?"("+esc(o.size)+")":""} — ${esc(o.boxes)} boxes${o.totalBottles?" ("+esc(o.totalBottles)+" bottles)":""} · Total ₹${esc(o.total)}</p>
<p>${esc(o.name)} · <a class="acc" href="${wa(o.phone)}" target="_blank" rel="noopener">${esc(o.phone)} (WhatsApp)</a><br>${esc(o.location)} · needed by ${esc(o.date)}</p>
${statusSel(o.id,o.status,STATUS)} <button class="btn sm" style="background:#c0392b;border-color:#c0392b" data-delo="${o.id}">Delete</button></div>`).join("")||'<div class="panel muted">No order requests yet.</div>');
}
async function showEnq(){
 const l=(await ls("enquiries")).sort((a,b)=>sec(b.createdAt)-sec(a.createdAt));
 $("panel").innerHTML=`<div class="panel"><h2>Enquiries (${l.length})</h2></div>`+(l.map(o=>`<div class="panel"><b>${esc(o.type)}</b> · ${when(o)} <span class="stat">${esc(o.status||"New")}</span>
<p>${esc(o.name)} · <a class="acc" href="${wa(o.phone)}" target="_blank" rel="noopener">${esc(o.phone)} (WhatsApp)</a>${o.qty?"<br>Quantity: "+esc(o.qty):""}${o.requirements?"<br>Design: "+esc(o.requirements):""}${o.message?"<br>"+esc(o.message):""}</p>
${statusSel(o.id,o.status||"New",["New","Contacted","Closed"])} <button class="btn sm" style="background:#c0392b;border-color:#c0392b" data-dele="${o.id}">Delete</button></div>`).join("")||'<div class="panel muted">No enquiries yet.</div>');
}
async function showBackup(){
 $("panel").innerHTML='<div class="panel"><h2>Backup</h2><p class="muted">Download all your data (products, editions, reels, projects, orders, enquiries, content) as a file.</p><button class="btn" id="bk">Download backup</button></div>';
 $("bk").onclick=async()=>{const out={};for(const c of ["products","editions","reels","clients","orders","enquiries","settings"])out[c]=await ls(c);
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(out)],{type:"application/json"}));a.download="alvo-backup-"+new Date().toISOString().slice(0,10)+".json";a.click()};
}
async function showTab(t){
 tab=t;$("tabs").innerHTML=TABS.map(([k,l])=>`<button class="${k===t?"on":""}" data-t="${k}">${l}</button>`).join("");
 $("panel").innerHTML='<div class="panel muted">Loading…</div>';
 try{
  if(t==="orders")await showOrders();else if(t==="enquiries")await showEnq();else if(t==="settings")await showSettings();else if(t==="backup")await showBackup();else await showCrud(t);
 }catch(e){console.error(e);$("panel").innerHTML='<div class="panel">Could not load ('+esc(e.code||e.message)+'). Check the Firebase Rules.</div>'}
}
$("tabs").onclick=e=>{const b=e.target.closest("button[data-t]");if(b)showTab(b.dataset.t)};
$("panel").addEventListener("click",async e=>{
 try{
  owner();
  const ed=e.target.closest("[data-ed]"),del=e.target.closest("[data-del]"),rm=e.target.closest("[data-rm]"),dlo=e.target.closest("[data-delo]"),dle=e.target.closest("[data-dele]");
  if(rm){const [k,i]=rm.dataset.rm.split(":");cur.media[k].splice(+i,1);drawThumbs()}
  if(ed){const o=LIST[cur.col].find(x=>x.id===ed.dataset.ed),sc=SCH[cur.col];let media={};
   if(sc.media){const m=await getDoc(doc(db,sc.media,o.id));if(m.exists())media=m.data()}
   cur={col:cur.col,id:o.id,data:o,media};drawForm();window.scrollTo({top:0,behavior:"smooth"})}
  if(del&&confirm("Delete permanently?")){const sc=SCH[cur.col];await deleteDoc(doc(db,cur.col,del.dataset.del));if(sc.media)await deleteDoc(doc(db,sc.media,del.dataset.del)).catch(()=>{});showTab(cur.col)}
  if(dlo&&confirm("Delete this order request?")){await deleteDoc(doc(db,"orders",dlo.dataset.delo));showTab("orders")}
  if(dle&&confirm("Delete this enquiry?")){await deleteDoc(doc(db,"enquiries",dle.dataset.dele));showTab("enquiries")}
 }catch(err){console.error(err);toast(err.message)}
});
$("panel").addEventListener("change",async e=>{
 const s=e.target.closest("select[data-st]");if(!s)return;
 try{owner();await updateDoc(doc(db,tab==="orders"?"orders":"enquiries",s.dataset.st),{status:s.value});toast("Status updated ✓");showTab(tab)}catch(err){toast(err.message)}
});
$("gbtn").onclick=async()=>{try{const r=await signInWithPopup(auth,new GoogleAuthProvider());if((r.user.email||"").toLowerCase()!==OWNER){await signOut(auth);$("lmsg").textContent="This Google account is not authorised."}}catch(e){$("lmsg").textContent="Sign-in failed ("+(e.code||e.message)+")"}};
$("sout").onclick=()=>signOut(auth);
onAuthStateChanged(auth,u=>{const ok=!!u&&(u.email||"").toLowerCase()===OWNER;$("login").hidden=ok;$("dash").hidden=!ok;if(ok)showTab(tab)});
