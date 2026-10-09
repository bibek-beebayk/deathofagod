/* In-page dictionary: double-click a word in the chapter text for its definition. */
(function(){
var fs=document.getElementById('fs');if(!fs)return;
var pop=null,cache={},seq=0,sy=0;
function wordAt(x,y){
  var r=null,n,o;
  if(document.caretPositionFromPoint){var p=document.caretPositionFromPoint(x,y);if(p){n=p.offsetNode;o=p.offset}}
  else if(document.caretRangeFromPoint){r=document.caretRangeFromPoint(x,y);if(r){n=r.startContainer;o=r.startOffset}}
  if(!n||n.nodeType!==3||!fs.contains(n))return null;
  var t=n.nodeValue,re=/[A-Za-z’'-]/;
  if(o>=t.length)o=t.length-1;
  if(!re.test(t.charAt(o))&&o>0&&re.test(t.charAt(o-1)))o--;
  if(!re.test(t.charAt(o)))return null;
  var a=o,b=o;
  while(a>0&&re.test(t.charAt(a-1)))a--;
  while(b<t.length&&re.test(t.charAt(b)))b++;
  var w=t.slice(a,b).replace(/^['’-]+|['’-]+$/g,'');
  if(w.length<2||w.length>32)return null;
  var rg=document.createRange();rg.setStart(n,a);rg.setEnd(n,b);
  return{word:w,rect:rg.getBoundingClientRect()};
}
function close(){if(pop){pop.remove();pop=null}}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function show(hit,data){
  close();
  pop=el('div','dict');pop.setAttribute('role','dialog');pop.setAttribute('aria-label','Definition of '+hit.word);
  var h=el('div','dh');h.appendChild(el('strong','dw',data&&data.found?data.word:hit.word));
  if(data&&data.phonetic)h.appendChild(el('span','dp',data.phonetic));
  var x=el('button','dx','×');x.type='button';x.setAttribute('aria-label','Close');x.onclick=close;h.appendChild(x);
  pop.appendChild(h);
  if(data===null)pop.appendChild(el('p','dm','Looking up…'));
  else if(data.found){
    data.meanings.forEach(function(m){
      var s=el('div','ds');if(m.pos)s.appendChild(el('em','dpos',m.pos));
      var ol=el('ol');m.defs.forEach(function(d){ol.appendChild(el('li',null,d))});s.appendChild(ol);pop.appendChild(s)});
  }else pop.appendChild(el('p','dm',data.error==='unavailable'?'The dictionary is unavailable right now.'+(data.why?' ('+data.why+')':''):'No definition found. It may be a name or a word of this world.'));
  document.body.appendChild(pop);
  place(hit.rect);sy=window.scrollY;
}
function place(r){
  var w=pop.offsetWidth,h=pop.offsetHeight,vw=document.documentElement.clientWidth,vh=window.innerHeight;
  var left=Math.max(12,Math.min(r.left+r.width/2-w/2,vw-w-12));
  var top=r.bottom+10;if(top+h>vh-12)top=Math.max(12,r.top-h-10);
  pop.style.left=left+window.scrollX+'px';pop.style.top=top+window.scrollY+'px';
}
function lookup(w){
  var k=w.toLowerCase();
  if(cache[k])return Promise.resolve(cache[k]);
  return fetch('/api/define?w='+encodeURIComponent(k)).then(function(r){return r.json().catch(function(){return{found:false,error:'unavailable',why:'http_'+r.status}})})
    .then(function(d){if(d.error!=='unavailable')cache[k]=d;return d}).catch(function(){return{found:false,error:'unavailable',why:'network'}});
}
fs.addEventListener('dblclick',function(e){
  if(e.target.closest&&e.target.closest('a,button'))return;
  var hit=wordAt(e.clientX,e.clientY);if(!hit)return;
  e.preventDefault();
  var id=++seq;show(hit,cache[hit.word.toLowerCase()]||null);
  lookup(hit.word).then(function(d){if(id===seq)show(hit,d)});
});
document.addEventListener('mousedown',function(e){if(pop&&!pop.contains(e.target))close()});
document.addEventListener('touchstart',function(e){if(pop&&!pop.contains(e.target))close()},{passive:true});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
window.addEventListener('resize',close);
window.addEventListener('scroll',function(){if(pop&&Math.abs(window.scrollY-sy)>160)close()},{passive:true});
})();
