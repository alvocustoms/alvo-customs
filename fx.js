(function(){
 var SEL=".heading,.card,.step,.gi,.split>*,.cg>*,.formbox,.pd>*,.fg>*,.info";
 var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
 var has="IntersectionObserver" in window;
 if(!has)document.documentElement.classList.remove("js");
 var rio=has?new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");rio.unobserve(e.target)}})},{threshold:.08}):null;
 function rev(el){if(!rio||el.dataset.fx)return;el.dataset.fx=1;var p=el.parentNode;if(p&&p.classList&&(p.classList.contains("row")||p.classList.contains("reels")))return;el.classList.add("reveal");rio.observe(el)}
 var vio=has?new IntersectionObserver(function(en){en.forEach(function(e){var v=e.target;if(e.isIntersecting){var p=v.play();if(p&&p.catch)p.catch(function(){})}else v.pause()})},{threshold:.5}):null;
 var lio=has?new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){if(!e.target.getAttribute("src"))e.target.src=e.target.dataset.src;lio.unobserve(e.target)}})},{threshold:.2}):null;
 function scan(n){
  if(n.matches&&n.matches(SEL))rev(n);
  if(!n.querySelectorAll)return;
  n.querySelectorAll(SEL).forEach(rev);
  n.querySelectorAll("video[data-reel]").forEach(function(v){if(vio&&!v.dataset.vo){v.dataset.vo=1;vio.observe(v)}});
  n.querySelectorAll("iframe[data-lazy]").forEach(function(f){if(lio&&!f.dataset.lz){f.dataset.lz=1;lio.observe(f)}});
  n.querySelectorAll(".row[data-slide]").forEach(slider);
 }
 function slider(row){
  if(row.dataset.sl)return;row.dataset.sl=1;
  var w=document.createElement("div");w.className="sw";row.parentNode.insertBefore(w,row);w.appendChild(row);
  var paused=false,vis=true,hold;
  function go(d){var k=row.children;if(k.length<2)return;var step=k[0].offsetWidth+18,end=row.scrollWidth-row.clientWidth-4;
   if(d>0&&row.scrollLeft>=end)row.scrollTo({left:0,behavior:"smooth"});else row.scrollTo({left:row.scrollLeft+d*step,behavior:"smooth"})}
  function pause(){paused=true;clearTimeout(hold);hold=setTimeout(function(){paused=false},4000)}
  [["‹",-1,"l"],["›",1,"r"]].forEach(function(a){var b=document.createElement("button");b.className="ab "+a[2];b.type="button";b.textContent=a[0];b.setAttribute("aria-label",a[1]>0?"Next":"Previous");b.addEventListener("click",function(){pause();go(a[1])});w.appendChild(b)});
  ["touchstart","mouseenter"].forEach(function(e){row.addEventListener(e,pause,{passive:true})});
  if(has)new IntersectionObserver(function(en){vis=en[0].isIntersecting}).observe(row);
  if(!reduce)setInterval(function(){if(!paused&&vis&&!document.hidden)go(1)},3500);
 }
 document.addEventListener("click",function(e){
  var b=e.target.closest&&e.target.closest(".snd");if(!b)return;
  e.preventDefault();e.stopPropagation();
  var box=b.parentNode,v=box.querySelector("video"),f=box.querySelector("iframe"),on=b.dataset.on!=="1";
  if(v){v.muted=!on;if(on){var p=v.play();if(p&&p.catch)p.catch(function(){})}}
  if(f&&f.contentWindow)f.contentWindow.postMessage(JSON.stringify({event:"command",func:on?"unMute":"mute",args:[]}),"*");
  b.dataset.on=on?"1":"";b.textContent=on?"🔊":"🔇";
 },true);
 scan(document.body);
 new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(document.body,{childList:true,subtree:true});
})();
