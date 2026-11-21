export const OWNER_EMAIL = "alvo.customs@gmail.com";
export const money = value => new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Number(value)||0);
export const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const qs = (s, root=document) => root.querySelector(s);
export const qsa = (s, root=document) => [...root.querySelectorAll(s)];
export const toast = message => {
  let el=document.querySelector("#toast");
  if(!el){el=document.createElement("div");el.id="toast";el.className="toast";document.body.append(el);}
  el.textContent=message;el.classList.add("show");clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>el.classList.remove("show"),3200);
};
export const getCart = () => {try{return JSON.parse(localStorage.getItem("alvo_cart")||"[]")}catch{return []}};
export const saveCart = cart => {localStorage.setItem("alvo_cart",JSON.stringify(cart));updateCartCount()};
export const updateCartCount = () => {const n=getCart().reduce((s,x)=>s+(Number(x.quantity)||0),0);qsa("[data-cart-count]").forEach(e=>e.textContent=n)};
export const addCart = p => {const cart=getCart();const found=cart.find(x=>x.id===p.id);if(found)found.quantity++;else cart.push({id:p.id,name:p.name,price:Number(p.price)||0,image:p.image||"",quantity:1});saveCart(cart);toast("Added to your enquiry cart")};
export const categoryLabel = s => String(s||"Custom").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
