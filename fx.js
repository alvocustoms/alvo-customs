(function(){
 var SEL=".heading,.feature,.step,.card,.tile,.story>*,.contact-grid>*,.ctaband .container,.fgrid>*";
 var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 var io=("IntersectionObserver" in window)?new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.08}):null;
 if(!io)document.documentElement.classList.remove("js");
 function add(el){
  if(!io||el.dataset.fx)return;el.dataset.fx=1;
  if(el.parentNode&&el.parentNode.classList&&el.parentNode.classList.contains("row"))return;
  el.classList.add("reveal");io.observe(el)}
 var vio=("IntersectionObserver" in window)?new IntersectionObserver(function(en){en.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.5}):null;
 function reel(v){if(vio&&!v.dataset.vo){v.dataset.vo=1;vio.observe(v)}}
 function scan(n){if(n.matches&&n.matches(SEL))add(n);if(n.querySelectorAll){n.querySelectorAll(SEL).forEach(add);n.querySelectorAll("video[data-reel]").forEach(reel)}}
 function carousel(row){
  if(row.dataset.car)return;row.dataset.car=1;
  var paused=false,vis=true,tick=0,hold;
  var w=document.createElement("div");w.className="carwrap";row.parentNode.insertBefore(w,row);w.appendChild(row);
  function cards(){return [].filter.call(row.children,function(k){return k.classList.contains("card")})}
  function upd(){tick=0;var c=row.getBoundingClientRect(),mid=c.left+c.width/2;
   cards().forEach(function(k){var r=k.getBoundingClientRect(),o=(r.left+r.width/2-mid)/(c.width*.55),d=Math.min(1,Math.abs(o));
    k.style.transform="scale("+(1-.2*d).toFixed(3)+") rotateY("+(-Math.max(-1,Math.min(1,o))*26).toFixed(1)+"deg)";k.style.opacity=(1-.55*d).toFixed(3)})}
  row.addEventListener("scroll",function(){if(!tick)tick=requestAnimationFrame(upd)},{passive:true});
  function go(dir){var k=cards();if(k.length<2)return;
   var mid=row.scrollLeft+row.clientWidth/2,i=0,best=1e9;
   k.forEach(function(x,j){var d=Math.abs(x.offsetLeft+x.offsetWidth/2-mid);if(d<best){best=d;i=j}});
   var n=k[(i+dir+k.length)%k.length];row.scrollTo({left:n.offsetLeft+n.offsetWidth/2-row.clientWidth/2,behavior:"smooth"})}
  function pause(){paused=true;clearTimeout(hold);hold=setTimeout(function(){paused=false},4000)}
  [["‹",-1],["›",1]].forEach(function(a,i){var b=document.createElement("button");b.className="car-btn "+(i?"r":"l");b.textContent=a[0];b.setAttribute("aria-label",i?"Next":"Previous");
   b.addEventListener("click",function(){pause();go(a[1])});w.appendChild(b)});
  ["touchstart","mouseenter"].forEach(function(e){row.addEventListener(e,pause,{passive:true})});
  if("IntersectionObserver" in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe(row);
  if(!reduce)setInterval(function(){if(!paused&&vis&&!document.hidden)go(1)},3000);
  new MutationObserver(function(){requestAnimationFrame(upd)}).observe(row,{childList:true});upd();
 }
 scan(document.body);
 document.querySelectorAll(".row").forEach(carousel);
 new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(document.body,{childList:true,subtree:true});
})();
