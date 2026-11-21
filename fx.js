(function(){
 var SEL=".heading,.feature,.step,.card,.tile,.story>*,.contact-grid>*,.ctaband .container,.fgrid>*";
 if(!("IntersectionObserver" in window)){document.documentElement.classList.remove("js");return}
 var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.1});
 function add(el){if(!el.dataset.fx){el.dataset.fx=1;el.classList.add("reveal");io.observe(el)}}
 function scan(n){if(n.matches&&n.matches(SEL))add(n);n.querySelectorAll&&n.querySelectorAll(SEL).forEach(add)}
 scan(document.body);
 new MutationObserver(function(m){m.forEach(function(x){x.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n)})})}).observe(document.body,{childList:true,subtree:true});
})();
