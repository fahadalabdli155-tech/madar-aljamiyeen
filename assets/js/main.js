(function(){
  "use strict";

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll(){
    if(window.scrollY > 40){ header.classList.add('is-scrolled'); }
    else{ header.classList.remove('is-scrolled'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ---------- Mobile nav ---------- */
  var navToggle = document.getElementById('navToggle');
  var navClose = document.getElementById('navClose');
  var navMobile = document.getElementById('navMobile');
  function openNav(){ navMobile.classList.add('open'); navToggle.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; }
  function closeNav(){ navMobile.classList.remove('open'); navToggle.setAttribute('aria-expanded','false'); document.body.style.overflow=''; }
  if(navToggle) navToggle.addEventListener('click', openNav);
  if(navClose) navClose.addEventListener('click', closeNav);
  navMobile && navMobile.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeNav); });

  /* ---------- Active nav link on scroll ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.nav-desktop a');
  function setActive(){
    var pos = window.scrollY + 140;
    var current = '';
    sections.forEach(function(sec){
      if(pos >= sec.offsetTop){ current = sec.id; }
    });
    navLinks.forEach(function(a){
      a.classList.toggle('active', a.getAttribute('href') === '#'+current);
    });
  }
  window.addEventListener('scroll', setActive, {passive:true});
  setActive();

  /* ---------- Reveal on scroll ----------
     Uses manual viewport checking (rAF + scroll/resize) rather than relying
     solely on IntersectionObserver, which is unreliable in some embedded/
     preview browser contexts. */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var revealTicking = false;
  function checkReveal(){
    var vh = window.innerHeight || document.documentElement.clientHeight;
    revealEls = revealEls.filter(function(el){
      var rect = el.getBoundingClientRect();
      if(rect.top < vh * 0.92 && rect.bottom > 0){
        el.classList.add('in');
        return false;
      }
      return true;
    });
    revealTicking = false;
    if(revealEls.length === 0){
      window.removeEventListener('scroll', onRevealScroll);
      window.removeEventListener('resize', onRevealScroll);
    }
  }
  function onRevealScroll(){
    if(!revealTicking){
      revealTicking = true;
      requestAnimationFrame(checkReveal);
    }
  }
  window.addEventListener('scroll', onRevealScroll, {passive:true});
  window.addEventListener('resize', onRevealScroll);
  checkReveal();

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el){
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1200;
    var start = null;
    function step(ts){
      if(!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if(progress < 1){ requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }
  var statBars = document.querySelectorAll('.stat-bar i');
  var dashboard = document.getElementById('indicators');
  var dashDone = false;
  function checkDashboard(){
    if(dashDone || !dashboard) return;
    var rect = dashboard.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    if(rect.top < vh * 0.85 && rect.bottom > 0){
      dashDone = true;
      counters.forEach(animateCounter);
      statBars.forEach(function(bar){ bar.style.width = (bar.getAttribute('data-fill')||0) + '%'; });
      window.removeEventListener('scroll', onDashScroll);
    }
  }
  var dashTicking = false;
  function onDashScroll(){
    if(!dashTicking){ dashTicking = true; requestAnimationFrame(function(){ dashTicking = false; checkDashboard(); }); }
  }
  if(dashboard){
    window.addEventListener('scroll', onDashScroll, {passive:true});
    checkDashboard();
  }

  /* ---------- Topics marquee ---------- */
  var topics = [
    "الأطر النظرية لبرامج الجامعيين","الرسائل الأكثر فاعلية","قضايا ذات أولوية ومستجدات",
    "جدارات العاملين مع المرحلة","دراسات حول المرحلة الجامعية","احتياجات المرحلة",
    "تجارب وممارسات عالمية ودولية","تصميم برامج الجامعيين","تمويل برامج الجامعيين",
    "أدوار برامج الجامعيين","الكتب المرجعية للمرحلة","القوالب الرئيسية للبرامج"
  ];
  var track = document.getElementById('topicsTrack');
  if(track){
    var html = '';
    (topics.concat(topics)).forEach(function(t){
      html += '<span class="topic-pill">'+t+'</span>';
    });
    track.innerHTML = html;
  }

  /* ---------- Join form (client-side demo) ---------- */
  var joinForm = document.getElementById('joinForm');
  if(joinForm){
    joinForm.addEventListener('submit', function(e){
      e.preventDefault();
      var fields = document.getElementById('formFields');
      var success = document.getElementById('formSuccess');
      fields.style.display = 'none';
      success.classList.add('show');
    });
  }

  /* ---------- Hero network canvas ---------- */
  (function heroNetwork(){
    var canvas = document.getElementById('network-canvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var hero = canvas.parentElement;
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W+'px'; canvas.style.height = H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      var count = Math.max(28, Math.min(70, Math.floor(W*H/22000)));
      nodes = [];
      for(var i=0;i<count;i++){
        nodes.push({
          x: Math.random()*W,
          y: Math.random()*H,
          vx: (Math.random()-.5)*.28,
          vy: (Math.random()-.5)*.28,
          r: Math.random()*1.6+1
        });
      }
    }

    function frame(){
      ctx.clearRect(0,0,W,H);
      var linkDist = Math.min(160, W*0.14);
      for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if(n.x < 0 || n.x > W) n.vx *= -1;
        if(n.y < 0 || n.y > H) n.vy *= -1;
      }
      for(var i=0;i<nodes.length;i++){
        for(var j=i+1;j<nodes.length;j++){
          var a = nodes[i], b = nodes[j];
          var dx = a.x-b.x, dy = a.y-b.y;
          var d = Math.sqrt(dx*dx+dy*dy);
          if(d < linkDist){
            var op = (1 - d/linkDist) * 0.35;
            ctx.strokeStyle = 'rgba(232,161,60,'+op+')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
            ctx.stroke();
          }
        }
      }
      for(var i=0;i<nodes.length;i++){
        var n = nodes[i];
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(240,183,104,.85)';
        ctx.fill();
      }
      if(!reduceMotion){ requestAnimationFrame(frame); }
    }

    resize();
    frame();
    var resizeTimer;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });
  })();

  /* ---------- Ecosystem network canvas ---------- */
  (function ecosystemNetwork(){
    var canvas = document.getElementById('ecosystem-canvas');
    if(!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H;
    var groups = [
      {label:'ممارسون', color:'#e8a13c', count:6},
      {label:'خبراء', color:'#6fb7ff', count:5},
      {label:'جهات', color:'#8ff0b0', count:4},
      {label:'مشاريع', color:'#ffffff', count:4}
    ];
    var nodes = [];
    var started = false;

    function buildNodes(){
      nodes = [];
      var cx = W/2, cy = H/2;
      var ringR = Math.min(W,H)*0.34;
      var total = groups.reduce(function(s,g){return s+g.count;},0);
      var idx = 0;
      groups.forEach(function(g){
        for(var i=0;i<g.count;i++){
          var angle = (idx/total) * Math.PI*2;
          idx++;
          nodes.push({
            x: cx + Math.cos(angle)*ringR + (Math.random()-.5)*30,
            y: cy + Math.sin(angle)*ringR + (Math.random()-.5)*30,
            baseX: cx + Math.cos(angle)*ringR,
            baseY: cy + Math.sin(angle)*ringR,
            color: g.color,
            r: g.color === '#ffffff' ? 3.5 : 4.5,
            phase: Math.random()*Math.PI*2
          });
        }
      });
      nodes.push({x:cx, y:cy, baseX:cx, baseY:cy, color:'#e8a13c', r:7, isCore:true, phase:0});
    }

    function resize(){
      W = canvas.parentElement.clientWidth;
      H = 420;
      canvas.width = W*dpr; canvas.height = H*dpr;
      canvas.style.width = W+'px'; canvas.style.height = H+'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
      buildNodes();
    }

    var t = 0;
    function frame(){
      t += 0.01;
      ctx.clearRect(0,0,W,H);
      var core = nodes[nodes.length-1];

      nodes.forEach(function(n){
        if(n.isCore) return;
        n.x = n.baseX + Math.sin(t + n.phase) * 6;
        n.y = n.baseY + Math.cos(t + n.phase) * 6;
      });

      // links to core
      nodes.forEach(function(n){
        if(n.isCore) return;
        ctx.strokeStyle = 'rgba(255,255,255,.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(core.x, core.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      });

      // occasional cross-links
      for(var i=0;i<nodes.length-1;i+=3){
        var a = nodes[i], b = nodes[(i+4) % (nodes.length-1)];
        ctx.strokeStyle = 'rgba(232,161,60,.12)';
        ctx.beginPath();
        ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.stroke();
      }

      nodes.forEach(function(n){
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = n.isCore ? 1 : 0.9;
        ctx.fill();
        if(n.isCore){
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r+6+Math.sin(t*2)*2, 0, Math.PI*2);
          ctx.strokeStyle = 'rgba(232,161,60,.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });

      requestAnimationFrame(frame);
    }

    function start(){
      if(started) return;
      started = true;
      resize();
      frame();
      var resizeTimer;
      window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 200);
      });
    }

    var ecoDone = false;
    function checkEco(){
      if(ecoDone) return;
      var rect = canvas.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if(rect.top < vh * 0.95 && rect.bottom > 0){
        ecoDone = true;
        start();
        window.removeEventListener('scroll', onEcoScroll);
      }
    }
    var ecoTicking = false;
    function onEcoScroll(){
      if(!ecoTicking){ ecoTicking = true; requestAnimationFrame(function(){ ecoTicking = false; checkEco(); }); }
    }
    window.addEventListener('scroll', onEcoScroll, {passive:true});
    checkEco();
  })();

  /* ---------- Smooth anchor scroll offset for fixed header ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length < 2) return;
      var target = document.querySelector(id);
      if(!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({top:y, behavior:'smooth'});
    });
  });

})();
