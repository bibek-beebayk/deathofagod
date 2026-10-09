/* Deters casual copying of chapter text. It cannot stop a determined reader. */
(function(){
var fs=document.getElementById('fs');if(!fs)return;
function inText(t){return t&&t.nodeType&&fs.contains(t.nodeType===1?t:t.parentNode)}
function stop(e){e.preventDefault()}
['copy','cut','dragstart','selectstart'].forEach(function(n){
  document.addEventListener(n,function(e){if(inText(e.target)||n==='copy'||n==='cut'){stop(e)}},true)});
document.addEventListener('contextmenu',function(e){if(inText(e.target))stop(e)},true);
document.addEventListener('keydown',function(e){
  var k=(e.key||'').toLowerCase();
  if((e.ctrlKey||e.metaKey)&&(k==='c'||k==='x'||k==='a'||k==='s'||k==='p'||k==='u'))stop(e)
},true);
})();
