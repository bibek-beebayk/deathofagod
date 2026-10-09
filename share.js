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
