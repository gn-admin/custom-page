(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Year
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  // Mobile nav
  var nav = $('#siteNav');
  var toggle = $('.nav-toggle');
  function setNav(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  }
  document.addEventListener('click', function (e) {
    if (!nav || !toggle) return;
    if (!nav.classList.contains('open')) return;
    if (nav.contains(e.target) || toggle.contains(e.target)) return;
    setNav(false);
  });

  // Dropdowns
  $$('.nav-dropdown > button').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var item = btn.closest('.nav-dropdown');
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      $$('.nav-dropdown.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var b = other.querySelector('button');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('.nav-dropdown')) return;
    $$('.nav-dropdown.open').forEach(function (item) {
      item.classList.remove('open');
      var b = item.querySelector('button');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      setNav(false);
      $$('.nav-dropdown.open').forEach(function (item) {
        item.classList.remove('open');
        var b = item.querySelector('button');
        if (b) b.setAttribute('aria-expanded', 'false');
      });
    }
  });

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll (with stagger support via classes)
  var reveals = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else if (reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // Subtle interactive tilt for media/cards
  (function initTilt() {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return;
    $$('.hero-media, .split-media .rounded-img, .impact-band').forEach(function (el) {
      if (el.dataset.tiltBound) return;
      el.dataset.tiltBound = '1';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 3.5).toFixed(2) + 'deg) rotateY(' + (x * 4.5).toFixed(2) + 'deg) translateY(-2px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();

  // Dynamic adoption listings (cats/dogs) with search & filters
  (function initAdoptionListings() {
    var containers = $$('[data-adoption-list]');
    if (!containers.length) return;
    function norm(s){ return (s||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
    function imgPath(p){ if(!p) return ''; if(p.indexOf('http')===0) return p; if(p.indexOf('assets/')===0) return '../'+p; return p; }
    function tagFlags(p){
      var t = norm([p.title,p.excerpt,p.content,(p.tags||[]).join(' ')].join(' '));
      return {
        urgente: /urgent|urgente/.test(t),
        cachorro: /cachorr|gatit|beb[eé]|meses?/.test(t),
        adulto: /adult|senior|a[nñ]os?/.test(t) && !/meses?/.test(t),
        especial: /especial|ciego|ciega|tuert|neuron|cuidados/.test(t)
      };
    }
    fetch('../data/blog-posts.json').then(function(r){ return r.json(); }).then(function(data){
      var posts = (data && data.posts) ? data.posts : [];
      containers.forEach(function(root){
        var cat = root.getAttribute('data-adoption-list');
        var list = posts.filter(function(p){ return p.category === cat; });
        var search = document.querySelector('[data-adoption-search="'+cat+'"]');
        var filterSel = document.querySelector('[data-adoption-filter="'+cat+'"]');
        var chipsWrap = document.querySelector('[data-adoption-chips="'+cat+'"]');
        var meta = document.querySelector('[data-adoption-meta="'+cat+'"]');
        var state = { q:'', chip:'all', sort:'recent' };

        function render(){
          var q = norm(state.q);
          var filtered = list.filter(function(p){
            var text = norm([p.title,p.excerpt,p.category,(p.tags||[]).join(' ')].join(' '));
            if (q && text.indexOf(q) === -1) return false;
            var f = tagFlags(p);
            if (state.chip === 'urgente' && !f.urgente) return false;
            if (state.chip === 'cachorro' && !f.cachorro) return false;
            if (state.chip === 'adulto' && !f.adulto) return false;
            if (state.chip === 'especial' && !f.especial) return false;
            return true;
          });
          if (state.sort === 'name') filtered.sort(function(a,b){ return (a.title||'').localeCompare(b.title||'', 'es'); });
          else filtered.sort(function(a,b){ return (b.date||'').localeCompare(a.date||''); });
          if (meta) meta.textContent = filtered.length + ' caso' + (filtered.length===1?'':'s') + ' mostrado' + (filtered.length===1?'':'s');
          if (!filtered.length) {
            root.innerHTML = '<div class="listing-empty">No hay resultados con esos filtros. Prueba a borrar la búsqueda o cambia el filtro.</div>';
            return;
          }
          root.innerHTML = filtered.map(function(p){
            var href = 'post.html?slug=' + encodeURIComponent(p.slug);
            var img = imgPath(p.image);
            var flags = tagFlags(p);
            var badges = [];
            if (flags.urgente) badges.push('Urgente');
            if (flags.cachorro) badges.push('Cachorro');
            if (flags.especial) badges.push('Necesidades especiales');
            var badgeHtml = badges.length ? '<p class="meta">' + badges.join(' · ') + '</p>' : '<p class="meta">' + (p.category||'Adopción') + '</p>';
            return '<article class="card listing-card reveal is-visible">' +
              (img ? '<a href="'+href+'"><img src="'+img+'" alt="'+(p.title||'Animal en adopción')+'" loading="lazy"></a>' : '') +
              '<div class="card-body">' + badgeHtml + '<h3>'+(p.title||'')+'</h3><p>'+(p.excerpt||'')+'</p>' +
              '<a class="card-link" href="'+href+'">Conocer historia →</a></div></article>';
          }).join('');
        }

        if (search) search.addEventListener('input', function(){ state.q = search.value || ''; render(); });
        if (filterSel) filterSel.addEventListener('change', function(){ state.sort = filterSel.value || 'recent'; render(); });
        if (chipsWrap) $$('.filter-chip', chipsWrap).forEach(function(btn){
          btn.addEventListener('click', function(){
            $$('.filter-chip', chipsWrap).forEach(function(b){ b.classList.remove('is-active'); b.setAttribute('aria-pressed','false'); });
            btn.classList.add('is-active'); btn.setAttribute('aria-pressed','true');
            state.chip = btn.getAttribute('data-chip') || 'all'; render();
          });
        });
        render();
      });
    }).catch(function(){
      containers.forEach(function(root){ root.innerHTML = '<div class="listing-empty">No se pudo cargar el listado ahora mismo. Puedes escribirnos en <a href="contacto.html">contacto</a>.</div>'; });
    });
  })();

  // Simple carousel
  $$('[data-carousel]').forEach(function (root) {
    var track = root.querySelector('.carousel-track');
    var slides = $$('.carousel-slide', root);
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    var dotsWrap = root.querySelector('.carousel-dots');
    if (!track || !slides.length) return;
    var index = 0;
    var perView = 1;
    var timer = null;

    function calcPerView() {
      var w = root.clientWidth || window.innerWidth;
      perView = w >= 1100 ? 3 : (w >= 800 ? 2 : 1);
      return perView;
    }
    function maxIndex() { return Math.max(0, slides.length - calcPerView()); }
    function renderDots() {
      if (!dotsWrap) return;
      var count = maxIndex() + 1;
      dotsWrap.innerHTML = '';
      for (var i = 0; i < count; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'carousel-dot' + (i === index ? ' active' : '');
          b.setAttribute('aria-label', 'Ir al grupo ' + (i + 1));
          b.addEventListener('click', function () { go(i); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }
    function update() {
      var pv = calcPerView();
      if (index > maxIndex()) index = maxIndex();
      var pct = (100 / pv) * index;
      track.style.transform = 'translateX(-' + pct + '%)';
      if (dotsWrap) {
        $$('.carousel-dot', dotsWrap).forEach(function (d, i) { d.classList.toggle('active', i === index); });
      }
    }
    function go(i) { index = Math.min(Math.max(0, i), maxIndex()); update(); }
    function step(dir) { go(index + dir); }
    function start() { if (reduced || slides.length <= calcPerView()) return; stop(); timer = window.setInterval(function(){ go(index >= maxIndex() ? 0 : index + 1); }, 4500); }
    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }
    if (prev) prev.addEventListener('click', function () { step(-1); start(); });
    if (next) next.addEventListener('click', function () { step(1); start(); });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    root.addEventListener('focusout', start);
    window.addEventListener('resize', function () { renderDots(); update(); });
    renderDots(); update(); start();
  });

  // Contact/forms (static simulation)
  $$('form[data-static-form]').forEach(function (form) {
    var success = form.querySelector('.form-success');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var btn = form.querySelector('button[type="submit"], input[type="submit"]');
      var orig = btn ? (btn.textContent || btn.value) : '';
      if (btn) { btn.disabled = true; if (btn.textContent) btn.textContent = 'Enviando…'; else btn.value = 'Enviando…'; }
      window.setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; if (btn.textContent !== undefined && orig) btn.textContent = orig; else if (orig) btn.value = orig; }
        if (success) success.classList.add('show');
      }, 900);
    });
    form.addEventListener('input', function () {
      if (success) success.classList.remove('show');
    });
  });

  // Toast helper
  var toastEl = $('#toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  // Cookies (banner + modal)
  (function initCookies() {
    var CONSENT_KEY = 'nebak-cookie-consent-v2';
    var banner = $('#cookieBanner');
    var modal = $('#cookieModal');
    var analyticsInput = $('#cookieAnalytics');
    var marketingInput = $('#cookieMarketing');
    if (!banner || !modal) return;

    function readConsent() {
      try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); } catch (e) { return null; }
    }
    function applyConsent(c) {
      if (analyticsInput) analyticsInput.checked = !!(c && c.analytics);
      if (marketingInput) marketingInput.checked = !!(c && c.marketing);
    }
    function showBanner() { banner.classList.add('is-visible'); banner.setAttribute('aria-hidden', 'false'); document.body.classList.add('has-cookie'); }
    function hideBanner() { banner.classList.remove('is-visible'); banner.setAttribute('aria-hidden', 'true'); document.body.classList.remove('has-cookie'); }
    function openModal() { applyConsent(readConsent() || { analytics: false, marketing: false }); modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); }
    function closeModal() { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }
    function saveConsent(c, msg) {
      try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)); } catch (e) {}
      hideBanner(); closeModal(); showToast(msg || 'Preferencias de cookies guardadas.');
    }

    var existing = readConsent();
    if (existing) applyConsent(existing); else showBanner();

    var accept = $('[data-cookie-accept]');
    var options = $('[data-cookie-options]');
    var close = $('[data-cookie-close]');
    var save = $('[data-cookie-save]');
    var rejectAll = $('[data-cookie-reject-all]');
    var modalClose = $('[data-cookie-modal-close]');
    if (accept) accept.addEventListener('click', function () { saveConsent({ necessary: true, analytics: true, marketing: false, ts: Date.now() }, 'Cookies aceptadas.'); });
    if (options) options.addEventListener('click', openModal);
    if (close) close.addEventListener('click', function () { hideBanner(); });
    if (save) save.addEventListener('click', function () { saveConsent({ necessary: true, analytics: !!(analyticsInput && analyticsInput.checked), marketing: !!(marketingInput && marketingInput.checked), ts: Date.now() }); });
    if (rejectAll) rejectAll.addEventListener('click', function () { saveConsent({ necessary: true, analytics: false, marketing: false, ts: Date.now() }, 'Solo se usarán cookies necesarias.'); });
    if (modalClose) modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
  })();

  // Chat assistant with inline forms and animal search
  (function initChat() {
    var toggle = $('#chatToggle');
    var panel = $('#chatPanel');
    var close = $('#chatClose');
    var body = $('#chatBody');
    if (!toggle || !panel || !body) return;

    function open() { panel.classList.add('is-open'); panel.setAttribute('aria-hidden','false'); toggle.setAttribute('aria-expanded','true'); }
    function closeChat() { panel.classList.remove('is-open'); panel.setAttribute('aria-hidden','true'); toggle.setAttribute('aria-expanded','false'); }

    var blogCache = null;
    function loadPosts(cb) {
      if (blogCache) { cb(blogCache); return; }
      fetch('../data/blog-posts.json').then(function (r) { return r.json(); }).then(function (d) {
        blogCache = d && d.posts ? d.posts : [];
        cb(blogCache);
      }).catch(function () { cb([]); });
    }
    function normalize(s) { return (s || '').toString().toLowerCase(); }
    function isAnimalCategory(cat) { return cat === 'Gatos en adopción' || cat === 'Perros en adopción' || cat === 'Acogida' || cat === 'Caso externo' || cat === 'Adoptados'; }
    function imgPath(p) { if (!p) return ''; if (p.indexOf('http') === 0) return p; if (p.indexOf('assets/') === 0) return '../' + p; return p; }

    function homeView() {
      body.innerHTML = ''+
        '<div class="chat-msg"><strong>Hola, soy Nebi 🐾</strong><br>Te ayudo a buscar animales en adopción o acogida y a rellenar formularios aquí mismo.</div>'+
        '<p class="chat-hint">Prueba con “Lola”, “perro senior”, “acoger” o “voluntariado”.</p>'+
        '<div class="chat-search"><input id="chatAnimalSearch" type="text" placeholder="Busca un animal o escribe tu consulta..." aria-label="Buscar o escribir consulta"><button type="button" id="chatSearchBtn">Enviar</button></div>'+
        '<div class="chat-quick">'+
          '<button type="button" data-quick="adoptar">Adoptar</button>'+
          '<button type="button" data-quick="acoger">Acoger</button>'+
          '<button type="button" data-quick="voluntariado">Voluntariado</button>'+
          '<button type="button" data-quick="donar">Donar</button>'+
        '</div>'+
        '<div id="chatResults"></div>'+
        '<div class="chat-opts">'+
          '<button class="chat-opt" type="button" data-view="form-adopt">Solicitud de adopción</button>'+
          '<button class="chat-opt" type="button" data-view="form-acoge">Solicitud de acogida</button>'+
          '<button class="chat-opt" type="button" data-view="form-vol">Formulario de voluntariado</button>'+
          '<button class="chat-opt" type="button" data-view="form-contact">Formulario de contacto</button>'+
        '</div>';
      wireHome();
    }

    function routeIntent(q) {
      var raw = (q || '').trim();
      var t = normalize(raw);
      if (!t) return;
      var res = $('#chatResults');
      if (res) res.innerHTML = '<div class="chat-msg user">'+raw.replace(/</g,'&lt;')+'</div>';

      if (/(^|\s)(adoptar|adopcion|adopción)(\s|$)/.test(t) || /(quiero adoptar|rellenar.*adop)/.test(t)) { formAdopt(raw); return; }
      if (/acog/.test(t)) { if (/(form|solicitud|rellen|quiero acoger)/.test(t)) { formAcoge(raw); return; } }
      if (/volunt|ayud/.test(t)) { formVol(raw); return; }
      if (/don|teaming|socio|material/.test(t)) {
        if (res) res.innerHTML += '<div class="chat-msg">Puedes colaborar con transferencia, Teaming, cuota de socio o donación de material. Si quieres, te abro el formulario de contacto para que te indiquemos los pasos.</div>';
        setTimeout(function(){ formContact('Donación / colaboración'); }, 150);
        return;
      }
      if (/contact|pregunt|inform|duda/.test(t)) { formContact(); return; }
      if (/acog/.test(t)) { doAnimalSearch(raw, 'acogida'); return; }
      if (/adopt|gato|perro/.test(t)) { doAnimalSearch(raw, 'adopcion'); return; }
      doAnimalSearch(raw, 'auto');
    }

    function doAnimalSearch(q, mode) {
      var res = $('#chatResults');
      if (res) res.innerHTML = (res.innerHTML || '') + '<div class="chat-msg">Buscando coincidencias...</div>';
      loadPosts(function (posts) {
        var hasData = posts && posts.length;
        var list = hasData ? posts.filter(function (p) { return isAnimalCategory(p.category); }) : [];
        var nq = normalize(q);
        if (nq) {
          list = list.filter(function (p) { return (normalize(p.title)+' '+normalize(p.excerpt)+' '+normalize(p.category)+' '+(p.tags||[]).join(' ').toLowerCase()).indexOf(nq) !== -1; });
        } else {
          list = list.filter(function (p) { return p.category === 'Gatos en adopción' || p.category === 'Perros en adopción' || p.category === 'Acogida' || p.category === 'Acogidas'; });
        }
        if (mode === 'acogida') list = list.filter(function(p){ return /acog/i.test(p.category || ''); });
        if (mode === 'adopcion') list = list.filter(function(p){ return /adopci/i.test(p.category || '') || p.category === 'Caso externo'; });
        list = list.slice(0, 8);
        if (!res) return;
        if (!hasData) {
          res.innerHTML = '<div class="chat-msg chat-empty">No he podido cargar el buscador ahora mismo (necesita abrirse por HTTP). Aun así puedo ayudarte con formularios: <button class="chat-back" type="button" data-open-form="adopt">adopción</button> <button class="chat-back" type="button" data-open-form="acoge">acogida</button> <button class="chat-back" type="button" data-open-form="vol">voluntariado</button>.</div>';
          $$('[data-open-form]', res).forEach(function(b){ b.addEventListener('click', function(){ var v=b.getAttribute('data-open-form'); if(v==='adopt') formAdopt(); else if(v==='acoge') formAcoge(); else formVol(); }); });
          return;
        }
        if (!list.length) { res.innerHTML = '<div class="chat-msg chat-empty">No he encontrado coincidencias para “'+(q||'').replace(/</g,'&lt;')+'”. Prueba con otro nombre o usa los formularios de adopción, acogida o voluntariado.</div>'; return; }
        res.innerHTML = '<div class="chat-results">' + list.map(function (p) {
          var img = imgPath(p.image); var href = 'post.html?slug=' + encodeURIComponent(p.slug);
          return '<div class="chat-result">'+(img?('<img src="'+img+'" alt="">'):'<div></div>')+'<div><h4>'+p.title+'</h4><p>'+ (p.category||'') +'</p><a href="'+href+'">Ver ficha →</a></div></div>';
        }).join('') + '</div>';
      });
    }

    function wireHome() {
      var btn = $('#chatSearchBtn'); var inp = $('#chatAnimalSearch');
      if (btn) btn.addEventListener('click', function(){ routeIntent(inp ? inp.value : ''); });
      if (inp) inp.addEventListener('keydown', function(e){ if(e.key==='Enter'){ e.preventDefault(); routeIntent(inp.value || ''); }});
      $$('[data-quick]', body).forEach(function (b) {
        b.addEventListener('click', function(){ routeIntent(b.getAttribute('data-quick') || ''); });
      });
      $$('[data-view]', body).forEach(function (b) {
        b.addEventListener('click', function () {
          var v = b.getAttribute('data-view');
          if (v === 'form-adopt') formAdopt();
          else if (v === 'form-acoge') formAcoge();
          else if (v === 'form-vol') formVol();
          else if (v === 'form-contact') formContact();
        });
      });
    }

    function backBtn() { return '<button class="chat-back" type="button" data-back>← Volver</button>'; }
    function successMsg(text) { return '<div class="chat-msg" role="status">'+text+'</div>'; }

    function renderForm(title, intro, fieldsHtml, successText) {
      body.innerHTML = backBtn() + '<div class="chat-msg"><strong>'+title+'</strong><br>'+intro+'</div>' +
        '<form class="chat-form-inline" data-chat-inline-form>' + fieldsHtml +
        '<div class="chat-actions-row"><button class="chat-btn" type="submit">Enviar</button><button class="chat-btn chat-btn-ghost" type="button" data-back>Cancelar</button></div>' +
        '<p class="form-note">Formulario informativo (sitio estático): el envío se simula.</p></form>';
      $$('[data-back]', body).forEach(function (b){ b.addEventListener('click', homeView); });
      var f = $('[data-chat-inline-form]', body);
      if (f) f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!f.checkValidity()) { f.reportValidity(); return; }
        body.innerHTML = backBtn() + successMsg(successText) + '<div class="chat-actions-row" style="margin-top:.5rem"><button class="chat-btn" type="button" data-back>Volver al inicio</button></div>';
        $$('[data-back]', body).forEach(function (b){ b.addEventListener('click', homeView); });
      });
    }

    function formAdopt(prefill) {
      var animal = (prefill && !/(adopt|form|solicitud|rellen)/i.test(prefill)) ? prefill : '';
      renderForm('Adopción', 'Cuéntanos tu interés y te contactamos. Puedes revisar el <a href="protocolo.html">protocolo de adopción</a> antes de enviar.',
        '<label>Nombre *<input type="text" name="nombre" required></label>'+
        '<label>Email *<input type="email" name="email" required></label>'+
        '<label>Teléfono<input type="tel" name="telefono"></label>'+
        '<label>¿Qué animal te interesa?<input type="text" name="animal" placeholder="Nombre o tipo (gato/perro)" value="'+(animal||'').replace(/"/g,'&quot;')+'"></label>'+
        '<label>Mensaje<textarea name="mensaje" placeholder="Háblanos de tu hogar, experiencia y disponibilidad..."></textarea></label>',
        '¡Gracias! Hemos recibido tu solicitud de adopción. Te responderemos lo antes posible.');
    }
    function formAcoge(prefill) {
      renderForm('Acogida temporal', 'Ofrece un hogar temporal mientras el animal encuentra familia. Los gastos veterinarios se acuerdan con la protectora.',
        '<label>Nombre *<input type="text" name="nombre" required></label>'+
        '<label>Email *<input type="email" name="email" required></label>'+
        '<label>Teléfono<input type="tel" name="telefono"></label>'+
        '<label>Disponibilidad<input type="text" name="tiempo" placeholder="¿Durante cuánto tiempo podrías acoger?"></label>'+
        '<label>Mensaje<textarea name="mensaje" placeholder="¿Tienes otros animales o niños? ¿Qué tipo de acogida puedes ofrecer?"></textarea></label>',
        '¡Gracias! Hemos recibido tu interés en acoger. Te contactaremos pronto.');
    }
    function formVol(prefill) {
      renderForm('Voluntariado', 'Puedes ayudar en colonias, rescates, traslados al veterinario o construcción de casetas, según tu disponibilidad.',
        '<label>Nombre *<input type="text" name="nombre" required></label>'+
        '<label>Email *<input type="email" name="email" required></label>'+
        '<label>Teléfono<input type="tel" name="telefono"></label>'+
        '<label>¿Cómo te gustaría ayudar?<textarea name="mensaje" placeholder="Cuéntanos tu disponibilidad, zona y cómo te gustaría colaborar..."></textarea></label>',
        '¡Gracias por tu interés en ser voluntario/a! Te responderemos pronto.');
    }
    function formContact(subject) {
      renderForm('Contacto', 'Escríbenos y te responderemos lo antes posible.',
        '<label>Nombre *<input type="text" name="nombre" required></label>'+
        '<label>Email *<input type="email" name="email" required></label>'+
        '<label>Asunto<input type="text" name="asunto" value="'+(subject||'').replace(/"/g,'&quot;')+'"></label>'+
        '<label>Mensaje *<textarea name="mensaje" required placeholder="Tu mensaje..."></textarea></label>',
        '¡Gracias por tu mensaje! Te responderemos lo antes posible.');
    }

    toggle.addEventListener('click', function () { if (panel.classList.contains('is-open')) closeChat(); else { homeView(); open(); } });
    if (close) close.addEventListener('click', closeChat);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('is-open')) closeChat(); });
    document.addEventListener('click', function (e) {
      if (!panel.classList.contains('is-open')) return;
      if (!e.target || e.target.isConnected === false) return;
      if (panel.contains(e.target) || toggle.contains(e.target)) return;
      closeChat();
    });
  })();
})();