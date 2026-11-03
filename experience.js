(function(){
  'use strict';
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups=[].slice.call(document.querySelectorAll('.nav-dropdown'));
  function closeMenus(except){groups.forEach(function(g){if(g===except)return;g.classList.remove('is-open');var b=g.querySelector('.menu-toggle');b.setAttribute('aria-expanded','false');b.setAttribute('aria-label','Open '+(g.querySelector('a').textContent)+' menu');});}
  groups.forEach(function(g){
    var button=g.querySelector('.menu-toggle');
    function open(){closeMenus(g);g.classList.add('is-open');button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Close '+g.querySelector('a').textContent+' menu');}
    button.addEventListener('click',function(){if(g.classList.contains('is-open'))closeMenus();else open();});
    g.addEventListener('keydown',function(e){if(e.key==='Escape'){closeMenus();button.focus();}if(e.key==='ArrowDown'&&(e.target===button||e.target===g.querySelector('a'))){e.preventDefault();open();g.querySelector('.menu-project').focus();}});
    g.addEventListener('focusout',function(e){if(!g.contains(e.relatedTarget))closeMenus();});
    g.querySelectorAll('.dropdown-menu a').forEach(function(a){a.addEventListener('click',function(){closeMenus();});});
  });
  document.addEventListener('click',function(e){if(!e.target.closest('.nav-dropdown'))closeMenus();});
  window.addEventListener('pageshow',function(){closeMenus();});

  var marks=document.getElementById('analysis-marks');
  if(!marks)return;
  var ns='http://www.w3.org/2000/svg';
  var lenses=[].slice.call(document.querySelectorAll('[data-lens]'));
  var values=[28,47,39,67,57,83,74,98];
  function shape(tag,attrs){var el=document.createElementNS(ns,tag);Object.keys(attrs).forEach(function(k){el.setAttribute(k,attrs[k]);});marks.appendChild(el);return el;}
  function draw(mode){
    marks.replaceChildren();lenses.forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.lens===mode));});
    var copy=mode==='compare'?['Where are the differences?','Compare observations before deciding which ones deserve a closer look.','Compare the observations','Observations']:mode==='explain'?['What moves together?','Look for a relationship, then question whether it actually explains what you’re seeing.','Explore a relationship between observations','Input →']:['What might come next?','Extend the pattern, make the uncertainty visible and keep the assumptions in view.','Illustrative forecast with widening uncertainty','Past observations → possible future'];
    document.getElementById('lens-question').textContent=copy[0];document.getElementById('lens-description').textContent=copy[1];document.getElementById('art-title').textContent=copy[2];document.getElementById('analysis-axis').textContent=copy[3];
    if(mode==='compare'){values.forEach(function(v,i){shape('rect',{x:48+i*40,y:245-v*1.8,width:24,height:v*1.8,fill:i===7?'#fff':'#94b8ff',rx:2});});}
    else if(mode==='explain'){shape('path',{d:'M48 224L355 64',fill:'none',stroke:'#91b2ed','stroke-width':2,'stroke-dasharray':'5 7'});values.forEach(function(v,i){shape('circle',{cx:53+i*41,cy:250-v*1.8,r:7,fill:i===7?'#fff':'#94b8ff'});});}
    else{shape('path',{d:'M238 122L366 35L366 169Z',fill:'#a9c6ff',opacity:'.2'});shape('path',{d:'M48 224L86 198L124 206L162 157L200 174L238 122',fill:'none',stroke:'#fff','stroke-width':3,'stroke-linejoin':'round'});shape('path',{d:'M238 122L366 77',fill:'none',stroke:'#94b8ff','stroke-width':3,'stroke-dasharray':'6 6'});shape('circle',{cx:238,cy:122,r:6,fill:'#fff'});shape('text',{x:269,y:202,fill:'#dce8ff','font-family':'IBM Plex Sans,sans-serif','font-size':14}).textContent='Uncertainty';}
  }
  lenses.forEach(function(b){b.addEventListener('click',function(){draw(b.dataset.lens);});});draw('compare');
})();
