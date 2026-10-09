(function(){
function fallback(t){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0;top:0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(a)}
document.querySelectorAll('.share').forEach(function(box){
var url=box.getAttribute('data-url'),title=box.getAttribute('data-title');
var c=box.querySelector('[data-copy]'),n=box.querySelector('[data-native]');
if(c){c.addEventListener('click',function(){
var done=function(){var o=c.textContent;c.textContent='Link copied';c.classList.add('ok');setTimeout(function(){c.textContent=o;c.classList.remove('ok')},2000)};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done,function(){fallback(url);done()})}else{fallback(url);done()}})}
if(n&&navigator.share){n.hidden=false;n.addEventListener('click',function(){navigator.share({title:title,url:url}).catch(function(){})})}
})})();
;(function(){
var b=document.createElement('button');b.type='button';b.className='totop';b.setAttribute('aria-label','Back to top');
b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
document.body.appendChild(b);
var on=false,t=false;
function upd(){t=false;var s=(window.pageYOffset||document.documentElement.scrollTop)>500;if(s!==on){on=s;b.classList.toggle('show',s)}}
window.addEventListener('scroll',function(){if(!t){t=true;requestAnimationFrame(upd)}},{passive:true});
b.addEventListener('click',function(){
  var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({top:0,behavior:rm?'auto':'smooth'});
  var h=document.querySelector('h1,nav a,a');if(h&&h.focus){try{h.focus({preventScroll:true})}catch(e){}}
});
upd();
})();
