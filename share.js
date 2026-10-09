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
;(function(){
var nav=document.querySelector('nav');if(!nav)return;
var links=[].slice.call(nav.querySelectorAll('a')).filter(function(a){return a.getAttribute('href')});
var ctl=[].slice.call(nav.querySelectorAll('button')).filter(function(b){return b.id});
var hasBrand=nav.firstElementChild&&nav.firstElementChild.tagName==='A';
if(!hasBrand){var nb=document.createElement('a');nb.className='nb';nb.href='/';nb.textContent='Oathlands';nav.insertBefore(nb,nav.firstChild)}
var tg=document.createElement('button');tg.type='button';tg.className='nt';tg.setAttribute('aria-expanded','false');tg.setAttribute('aria-controls','mm');tg.innerHTML='<span>Menu</span><i aria-hidden="true"><b></b></i>';
nav.appendChild(tg);
var m=document.createElement('div');m.className='mm';m.id='mm';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Site menu');
var top=document.createElement('div');top.className='mm-top';
top.innerHTML='<span class="mm-brand">Oathlands</span><button type="button" class="mm-x" aria-label="Close menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>';
m.appendChild(top);
var ul=document.createElement('ul'),seen={},items=[['Home','/']];
links.forEach(function(a){if(a.className==='nb')return;var h=a.getAttribute('href'),t=a.textContent.replace(/^[\s←]+/,'').trim();if(/^oathlands$/i.test(t))return;items.push([t,h])});
if(!items.some(function(i){return /map/i.test(i[1])}))items.push(['3D Map','/map.html']);
var here=location.pathname.replace(/index\.html$/,'');
items.forEach(function(it,i){if(seen[it[1]])return;seen[it[1]]=1;var li=document.createElement('li');li.style.setProperty('--i',i);var a=document.createElement('a');a.href=it[1];a.textContent=it[0];
  if(it[1].charAt(0)!=='#'&&it[1].split('#')[0].replace(/index\.html$/,'')===here)a.setAttribute('aria-current','page');
  li.appendChild(a);ul.appendChild(li)});
m.appendChild(ul);
if(ctl.length){var c=document.createElement('div');c.className='mm-ctl';c.style.setProperty('--n',items.length);
  ctl.forEach(function(b){var p=document.createElement('button');p.type='button';p.textContent=b.textContent.trim();p.setAttribute('aria-label',b.getAttribute('aria-label')||b.textContent.trim());p.addEventListener('click',function(){b.click()});c.appendChild(p)});m.appendChild(c)}
var f=document.createElement('div');f.className='mm-foot';f.textContent='Oathlands: The Death of a God';m.appendChild(f);
document.body.appendChild(m);
var x=top.querySelector('.mm-x'),isOpen=false,rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,timer;
function open(){
  if(isOpen)return;isOpen=true;clearTimeout(timer);
  var r=tg.getBoundingClientRect();m.style.setProperty('--cx',(r.left+r.width/2)+'px');m.style.setProperty('--cy',(r.top+r.height/2)+'px');
  m.classList.add('on');void m.offsetWidth;m.classList.add('open');
  tg.setAttribute('aria-expanded','true');document.body.classList.add('mm-lock');
  setTimeout(function(){x.focus()},rm?0:350);
}
function close(back){
  if(!isOpen)return;isOpen=false;
  var r=tg.getBoundingClientRect();m.style.setProperty('--cx',(r.left+r.width/2)+'px');m.style.setProperty('--cy',(r.top+r.height/2)+'px');
  m.classList.remove('open');tg.setAttribute('aria-expanded','false');document.body.classList.remove('mm-lock');
  timer=setTimeout(function(){m.classList.remove('on')},rm?0:600);
  if(back!==false)tg.focus({preventScroll:true});
}
tg.addEventListener('click',open);x.addEventListener('click',function(){close()});
m.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('li a');if(a)close(false)});
document.addEventListener('keydown',function(e){
  if(!isOpen)return;
  if(e.key==='Escape'){close();return}
  if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('a,button')),i=f.indexOf(document.activeElement);
    if(e.shiftKey&&(i<=0)){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}
});
window.addEventListener('resize',function(){if(isOpen&&window.innerWidth>640)close(false)});
})();
