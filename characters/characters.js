(function(){
var dlg=document.getElementById('cd');if(!dlg||!dlg.showModal)return;
var figs=[].slice.call(document.querySelectorAll('figure.ch')),cur=-1,last=null;
var im=document.getElementById('cd-i'),nm=document.getElementById('cd-n'),tt=document.getElementById('cd-t'),bd=document.getElementById('cd-b');
function fill(i){cur=(i+figs.length)%figs.length;var f=figs[cur],src=f.querySelector('img');
im.src=src.src;im.alt=src.alt;nm.textContent=f.querySelector('h3').textContent;tt.textContent=f.querySelector('.t').textContent;bd.innerHTML=f.querySelector('.more').innerHTML;dlg.scrollTop=0;
try{history.replaceState(null,'','#'+f.id)}catch(e){}}
function open(i,from){last=from||last;fill(i);if(!dlg.open){dlg.showModal();document.documentElement.classList.add('mo')}}
function close(){if(dlg.open)dlg.close()}
dlg.addEventListener('close',function(){document.documentElement.classList.remove('mo');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(last&&document.contains(last))last.focus()});
dlg.addEventListener('click',function(e){if(e.target===dlg)close()});
dlg.querySelector('.x').addEventListener('click',close);
document.getElementById('cd-p').addEventListener('click',function(){fill(cur-1)});
document.getElementById('cd-nx').addEventListener('click',function(){fill(cur+1)});
dlg.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){fill(cur-1)}else if(e.key==='ArrowRight'){fill(cur+1)}});
figs.forEach(function(f,i){f.querySelectorAll('[data-k]').forEach(function(b){b.addEventListener('click',function(){open(i,b)})})});
var h=location.hash.slice(1);if(h){var i=figs.findIndex(function(f){return f.id===h});if(i>-1)open(i,figs[i].querySelector('.more-btn'))}
})();
