(function(){
 var SEL=".heading,.feature,.step,.card,.tile,.story>*,.contact-grid>*,.ctaband .container,.fgrid>*";
 var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 var io=("IntersectionObserver" in window)?new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.08}):null;
 if(!io)document.documentElement.classList.remove("js");
 function add(el){
  if(!io||el.dataset.fx)return;el.dataset.fx=1;
  if(el.parentNode&&el.parentNode.classList&&el.parentNode.classList.contains("row"))return;
  el.classList.add("reveal");io.observe(el)}
 function scan(n){if(n.matches&&n.matches(SEL))add(n);n.querySelectorAll&&n.querySelectorAll(SEL).forEach(add)}
 function carousel(row){
  if(row.dataset.car)return;row.dataset.car=1;
  var paused=false,vis=true,tick=0;
  function cards(){return [].filter.call(row.children,function(k){return k.classList.contains("card")})}
  function upd(){tick=0;var c=row.getBoundingClientRect(),mid=c.left+c.width/2;
   cards().forEach(function(k){var r=k.getBoundingClientRect(),d=Math.min(1,Math.abs(r.left+r.width/2-mid)/(c.width*.55));k.style.transform="scale("+(1-.18*d).toFixed(3)+")";k.style.opacity=(1-.5*d).toFixed(3)})}
  row.addEventListener("scroll",function(){if(!tick)tick=requestAnimationFrame(upd)},{passive:true});
  function next(){var k=cards();if(k.length<2)return;
   var mid=row.scrollLeft+row.clientWidth/2,i=0,best=1e9;
   k.forEach(function(x,j){var d=Math.abs(x.offsetLeft+x.offsetWidth/2-mid);if(d<best){best=d;i=j}});
   var n=k[(i+1)%k.length];row.scrollTo({left:n.offsetLeft+n.offsetWidth/2-row.clientWidth/2,behavior:"smooth"})}
  ["touchstart","mouseenter"].forEach(function(e){row.addEventListener(e,function(){paused=true},{passive:true})});
  ["touchend","mouseleave"].forEach(function(e){row.addEventListener(e,function(){setTimeout(function(){paused=false},2500)},{passive:true})});
  if("IntersectionObserver" in window)new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe(row);
  if(!reduce)setInterval(function(){if(!paused&&vis&&!document.hidden)next()},3200);
  new MutationObserver(function(){requestAnimationFrame(upd)}).observe(row,{childList:true});upd();
 }
 scan(document.body);
 document.querySelectorAll(".row").forEach(carousel);
 new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(document.body,{childList:true,subtree:true});
})();
