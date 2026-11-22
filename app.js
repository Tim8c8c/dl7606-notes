(function(){
  var S={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
  window.DLStore=S;
  var page=document.body.getAttribute('data-page')||'';

  // font size
  var fs=parseFloat(S.get('dl-fs'))||0;
  function applyFs(){ if(fs) document.documentElement.style.setProperty('--fs',fs+'px'); }
  applyFs();
  document.querySelectorAll('[data-fs]').forEach(function(b){
    b.addEventListener('click',function(){
      var cur=fs||parseFloat(getComputedStyle(document.documentElement).fontSize)||16;
      fs=Math.max(14,Math.min(22,cur+(+b.getAttribute('data-fs'))));
      S.set('dl-fs',fs); applyFs();
    });
  });

  // reading progress
  var bar=document.querySelector('.progress');
  if(bar){
    var upd=function(){var h=document.documentElement;var max=h.scrollHeight-h.clientHeight;bar.style.width=(max>0?Math.min(100,h.scrollTop/max*100):0)+'%';};
    window.addEventListener('scroll',upd,{passive:true}); upd();
  }
  // remember last page
  if(page) S.set('dl-last',location.pathname.split('/').pop()||'');

  // done button
  var db=document.querySelector('.donebtn');
  if(db&&page){
    var key='dl-done-'+page;
    var draw=function(){var on=S.get(key)==='1';db.classList.toggle('on',on);db.textContent=on?'\u2713 Marked as studied':'Mark this chapter as studied';};
    db.addEventListener('click',function(){S.set(key,S.get(key)==='1'?'0':'1');draw();});
    draw();
  }

  // MCQs
  var mcqs=document.querySelectorAll('.mcq');
  var scoreEl=document.querySelector('.qscore');
  var answered=0,right=0;
  function drawScore(){ if(scoreEl) scoreEl.textContent=answered?('Score '+right+' / '+answered+' answered (of '+mcqs.length+')'):(mcqs.length+' questions \u00b7 tap an answer'); }
  mcqs.forEach(function(m){
    var exp=m.querySelector('.exp'); if(exp) exp.hidden=true;
    m.querySelectorAll('button.o').forEach(function(b){
      b.addEventListener('click',function(){
        if(m.getAttribute('data-done')) return;
        m.setAttribute('data-done','1'); answered++;
        var ok=b.hasAttribute('data-ok'); if(ok) right++;
        b.classList.add(ok?'right':'wrong');
        m.querySelectorAll('button.o[data-ok]').forEach(function(x){x.classList.add('right');});
        if(exp) exp.hidden=false;
        drawScore();
        if(page&&answered===mcqs.length) S.set('dl-quiz-'+page,right+'/'+mcqs.length);
      });
    });
  });
  var rs=document.querySelector('[data-reset-quiz]');
  if(rs) rs.addEventListener('click',function(){
    answered=0;right=0;
    mcqs.forEach(function(m){m.removeAttribute('data-done');m.querySelectorAll('button.o').forEach(function(b){b.classList.remove('right','wrong');});var e=m.querySelector('.exp');if(e)e.hidden=true;});
    drawScore();
  });
  drawScore();

  // steppers
  document.querySelectorAll('.stepper').forEach(function(st){
    var steps=st.querySelectorAll('.step'),i=0,c=st.querySelector('.cnt');
    function go(n){i=Math.max(0,Math.min(steps.length-1,n));steps.forEach(function(s,k){s.classList.toggle('on',k===i);});if(c)c.textContent='Step '+(i+1)+' / '+steps.length;}
    var p=st.querySelector('[data-prev]'),n=st.querySelector('[data-next]');
    if(p)p.addEventListener('click',function(){go(i-1)}); if(n)n.addEventListener('click',function(){go(i+1)});
    go(0);
  });

  // index page: progress on cards
  var cards=document.querySelectorAll('.card[data-page]');
  if(cards.length){
    var done=0;
    cards.forEach(function(c){
      var p=c.getAttribute('data-page'),st=c.querySelector('.st');
      var d=S.get('dl-done-'+p)==='1', q=S.get('dl-quiz-'+p);
      if(d) done++;
      if(st) st.innerHTML=(d?'<span class="ok" aria-label="studied">\u2713</span><br>':'')+(q?('quiz '+q):'');
    });
    var ob=document.querySelector('.overall .bar i'),ot=document.querySelector('.overall .ot');
    if(ob) ob.style.width=(done/cards.length*100)+'%';
    if(ot) ot.textContent=done+' / '+cards.length+' studied';
    var last=S.get('dl-last'),cont=document.getElementById('continue');
    if(cont&&last){var a=document.querySelector('.card[href="'+last+'"]');if(a){cont.href=last;cont.hidden=false;cont.querySelector('span').textContent=a.querySelector('.ti').firstChild.textContent.trim();}}
  }

  // topic guide: open all, open target from hash
  document.querySelectorAll('[data-tg-all]').forEach(function(b){b.addEventListener('click',function(){var box=b.closest('section')||document;var ds=box.querySelectorAll('details.tg');var open=!b.dataset.on;ds.forEach(function(d){d.open=open;});b.dataset.on=open?'1':'';b.textContent=open?'Close all topics':'Open all topics';});});
  function openHash(){var h=location.hash.slice(1);if(!h)return;var el=document.getElementById(h);if(el&&el.tagName==='DETAILS'){el.open=true;el.scrollIntoView();}}
  window.addEventListener('hashchange',openHash);openHash();
})();
