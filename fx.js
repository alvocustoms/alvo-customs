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
 var lio=("IntersectionObserver" in window)?new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){if(!e.target.getAttribute("src"))e.target.src=e.target.dataset.src;lio.unobserve(e.target)}})},{threshold:.2}):null;
 function lazy(f){if(lio&&!f.dataset.lz){f.dataset.lz=1;lio.observe(f)}}
 document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".snd");if(!b)return;e.preventDefault();e.stopPropagation();
  var box=b.parentNode,v=box.querySelector("video"),f=box.querySelector("iframe"),on=b.dataset.on!=="1";
  if(v){v.muted=!on;if(on){var p=v.play();if(p&&p.catch)p.catch(function(){})}}
  if(f&&f.contentWindow)f.contentWindow.postMessage(JSON.stringify({event:"command",func:on?"unMute":"mute",args:[]}),"*");
  b.dataset.on=on?"1":"";b.textContent=on?"🔊":"🔇"},true);
 function reel(v){if(vio&&!v.dataset.vo){v.dataset.vo=1;vio.observe(v)}}
 function scan(n){if(n.matches&&n.matches(SEL))add(n);if(n.querySelectorAll){n.querySelectorAll(SEL).forEach(add);n.querySelectorAll("video[data-reel]").forEach(reel);n.querySelectorAll("iframe[data-lazy]").forEach(lazy)}if(n.matches&&n.matches("iframe[data-lazy]"))lazy(n)}
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
 function initTry(){
  var n=document.getElementById("tryName");if(!n)return;
  var T=[["Burgundy","#6e1f38","#f5f2ed","#d9c08a"],["Emerald","#0f5b45","#f5f2ed","#e6d39a"],["Navy","#14305c","#f5f2ed","#d9c08a"],["Ivory","#f4eddc","#1d1418","#8a6a2a"],["Black","#17131a","#f5f2ed","#d9c08a"],["Rose","#b3425f","#ffffff","#f6dcb8"]];
  var cur=0,size="500 ml",sw=document.getElementById("trySw"),g=function(i){return document.getElementById(i)};
  T.forEach(function(t,i){var b=document.createElement("button");b.type="button";b.className="swb"+(i?"":" on");b.style.background=t[1];b.title=t[0];b.setAttribute("aria-label",t[0]);
   b.onclick=function(){cur=i;[].forEach.call(sw.children,function(x,j){x.classList.toggle("on",j===i)});draw()};sw.appendChild(b)});
  function draw(){var t=T[cur],nm=(n.value||"YOUR NAME").toUpperCase(),tg=(g("tryTag").value||"YOUR LABEL").toUpperCase();
   ["lbA1","lbA2","lbCap"].forEach(function(i){g(i).setAttribute("fill",t[3])});g("lbBg").setAttribute("fill",t[1]);g("lbBrand").setAttribute("fill",t[3]);
   var e=g("lbName");e.textContent=nm;e.setAttribute("fill",t[2]);e.setAttribute("font-size",Math.max(6,Math.min(13,100/nm.length)).toFixed(1));
   var q=g("lbTag");q.textContent=tg;q.setAttribute("fill",t[3]);q.setAttribute("font-size",Math.max(3.4,Math.min(5.4,(72/tg.length-1.2)/.68)).toFixed(1))}
  n.oninput=g("tryTag").oninput=draw;
  [].forEach.call(g("trySize").children,function(b){b.onclick=function(){size=b.dataset.v;[].forEach.call(g("trySize").children,function(x){x.classList.toggle("on",x===b)})}});
  g("tryGo").onclick=function(){var w=document.querySelector("a.float"),base=w?w.href.split("?")[0]:"https://wa.me/919664056178";
   window.open(base+"?text="+encodeURIComponent("Hi ALVO CUSTOMS, I designed a label on your website.\nName: "+n.value+"\nTagline: "+g("tryTag").value+"\nColour: "+T[cur][0]+"\nSize: "+size+"\nPlease share the next steps."),"_blank")};
  draw();
 }
 initTry();
})();
