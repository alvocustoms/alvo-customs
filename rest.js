// Lightweight Firestore REST client for public pages (no Firebase SDK needed)
const enc=v=>{
 if(v===null||v===undefined)return {nullValue:null};
 if(v&&v.__ts)return {timestampValue:new Date().toISOString()};
 if(typeof v==="string")return {stringValue:v};
 if(typeof v==="boolean")return {booleanValue:v};
 if(typeof v==="number")return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};
 if(Array.isArray(v))return {arrayValue:{values:v.map(enc)}};
 return {mapValue:{fields:fields(v)}};
};
const fields=o=>Object.fromEntries(Object.entries(o).filter(([,x])=>x!==undefined).map(([k,x])=>[k,enc(x)]));
const dec=v=>{
 if("stringValue" in v)return v.stringValue;
 if("integerValue" in v)return Number(v.integerValue);
 if("doubleValue" in v)return v.doubleValue;
 if("booleanValue" in v)return v.booleanValue;
 if("timestampValue" in v)return {seconds:Math.floor(Date.parse(v.timestampValue)/1000)};
 if("arrayValue" in v)return (v.arrayValue.values||[]).map(dec);
 if("mapValue" in v)return obj(v.mapValue.fields||{});
 return null;
};
const obj=f=>Object.fromEntries(Object.entries(f).map(([k,x])=>[k,dec(x)]));
const wrap=d=>({id:d.name.split("/").pop(),data:()=>obj(d.fields||{}),exists:()=>true});
async function call(url,opt){
 const r=await fetch(url,{...opt,signal:AbortSignal.timeout?AbortSignal.timeout(15000):undefined});
 if(r.status===404)return null;
 if(!r.ok)throw Error("Server error "+r.status);
 return r.json();
}
export const initializeApp=c=>c;
export const getFirestore=app=>({p:"https://firestore.googleapis.com/v1/projects/"+app.projectId+"/databases/(default)/documents",k:app.apiKey});
export const collection=(db,path)=>({db,path});
export const doc=(db,...p)=>({db,path:p.join("/")});
export const serverTimestamp=()=>({__ts:1});
export const query=c=>c;
export const orderBy=()=>0;
export async function getDocs(c){
 const out=[];let tok="";
 do{
  const j=await call(c.db.p+"/"+c.path+"?pageSize=300&key="+c.db.k+(tok?"&pageToken="+encodeURIComponent(tok):""));
  if(!j)break;
  (j.documents||[]).forEach(d=>out.push(wrap(d)));
  tok=j.nextPageToken||"";
 }while(tok);
 return {docs:out,size:out.length,forEach:f=>out.forEach(f)};
}
export async function getDoc(r){
 const j=await call(r.db.p+"/"+r.path+"?key="+r.db.k);
 return j?wrap(j):{exists:()=>false,data:()=>({}),id:""};
}
export async function addDoc(c,data){
 const j=await call(c.db.p+"/"+c.path+"?key="+c.db.k,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fields:fields(data)})});
 return {id:j.name.split("/").pop()};
}
const no=()=>{throw Error("Admin only")};
export const setDoc=no,updateDoc=no,deleteDoc=no;
