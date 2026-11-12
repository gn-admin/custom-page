(function () {
  'use strict';
  function esc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''); }

  function svgFor(label, icon, title, category) {
    var l = norm(label + ' ' + icon + ' ' + title + ' ' + category);
    var paw = '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse class="fill-soft" cx="12" cy="15.2" rx="4.8" ry="3.8"/><circle cx="7.6" cy="9.2" r="1.7"/><circle cx="12" cy="7.8" r="1.8"/><circle cx="16.4" cy="9.2" r="1.7"/><path d="M7.2 15.1c0-2.8 2.2-4.6 4.8-4.6s4.8 1.8 4.8 4.6c0 2.3-2.1 4.1-4.8 4.1s-4.8-1.8-4.8-4.1Z"/><path d="M10.2 15.1c.5-.7 1.1-1 1.8-1s1.3.3 1.8 1"/></svg>';
    var home = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M7.5 11.2 12 7.8l4.5 3.4V18h-9z"/><path d="M4.2 11.6 12 5.5l7.8 6.1"/><path d="M7.2 10.8V18.5h9.6v-7.7"/><path d="M12 12.2c.8-1 2.2-1 3 0 .8 1 .5 2.2-.5 3.1L12 17.5l-2.5-2.2c-1-.9-1.3-2.1-.5-3.1.8-1 2.2-1 3 0Z"/></svg>';
    var pin = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M12 20s6-5.1 6-10.1A6 6 0 0 0 6 9.9C6 14.9 12 20 12 20Z"/><circle cx="12" cy="10" r="2.4"/></svg>';
    var clock = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="fill-soft" cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="7.5"/><path d="M12 7.4v5l3.2 1.9"/></svg>';
    var heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M12 18.4 6.4 13a4 4 0 0 1 5.6-5.7l.9.9.9-.9A4 4 0 0 1 19.4 13Z"/><path d="M12 18.4 6.4 13a4 4 0 0 1 5.6-5.7l.9.9.9-.9A4 4 0 0 1 19.4 13Z"/></svg>';
    var doc = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M7.5 4h6.2l2.8 2.8V20H7.5z"/><path d="M7 3.8h6.8L17 7v13.2H7z"/><path d="M13.8 3.8v3.6H17"/><path d="M9.5 11h5M9.5 14h5M9.5 17h3.4"/></svg>';
    var alert = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M12 4.2 3.8 18.8h16.4z"/><path d="M12 4.2 3.8 18.8h16.4z"/><path d="M12 9v4.8"/><circle cx="12" cy="16.6" r=".9"/></svg>';
    var people = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle class="fill-soft" cx="9" cy="8.6" r="2.6"/><circle cx="9" cy="8.6" r="2.6"/><path d="M4.6 18.4a4.5 4.5 0 0 1 8.8 0"/><path d="M14.2 11.2a2.2 2.2 0 1 0 0-4.4"/><path d="M14.8 18.4c.2-1.8 1.5-3.1 3.3-3.4"/></svg>';
    var mail = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect class="fill-soft" x="4.2" y="6.6" width="15.6" height="10.8" rx="2.4"/><rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="m5 7.5 7 5 7-5"/></svg>';
    var star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="fill-soft" d="M12 4.2l2.3 4.8 5.3.8-3.8 3.7.9 5.3L12 16.3 7.3 18.8l.9-5.3-3.8-3.7 5.3-.8z"/><path d="M12 4.2l2.3 4.8 5.3.8-3.8 3.7.9 5.3L12 16.3 7.3 18.8l.9-5.3-3.8-3.7 5.3-.8z"/></svg>';
    if (/urgente|prioridad|alert/.test(l)) return { svg: alert, tone: 'tone-peach' };
    if (/zona|ubic|lugar|irun|gipuz/.test(l)) return { svg: pin, tone: 'tone-sky' };
    if (/duracion|tiempo|plazo|fecha|edad/.test(l)) return { svg: clock, tone: 'tone-sun' };
    if (/hogar|casa|acog|familia|estado|final feliz|adoptad/.test(l)) return { svg: home, tone: 'tone-mint' };
    if (/contact|correo|email|telefono/.test(l)) return { svg: mail, tone: 'tone-sky' };
    if (/vinculo|junt|conjunt|herman|duo|trio|grupo|person/.test(l)) return { svg: people, tone: 'tone-green' };
    if (/proceso|seguim|apoyo|cuidado|requisit/.test(l)) return { svg: doc, tone: 'tone-leaf' };
    if (/especie|gato|perro|animal/.test(l)) return { svg: paw, tone: 'tone-green' };
    if (/evento|hito|campan/.test(l)) return { svg: star, tone: 'tone-sun' };
    return { svg: heart, tone: 'tone-mint' };
  }

  function backTarget(post, fromParam) {
    var from = String(fromParam || '').toLowerCase();
    var cat = String(post.category || '');
    if (from === 'gatos') return { href: 'gatos-en-adopcion.html', label: 'Volver a gatos en adopción' };
    if (from === 'perros') return { href: 'perros-en-adopcion.html', label: 'Volver a perros en adopción' };
    if (from === 'historias') return { href: 'historias.html', label: 'Volver a historias' };
    if (cat === 'Gatos en adopción') return { href: 'gatos-en-adopcion.html', label: 'Volver a gatos en adopción' };
    if (cat === 'Perros en adopción') return { href: 'perros-en-adopcion.html', label: 'Volver a perros en adopción' };
    return { href: 'historias.html', label: 'Volver a historias' };
  }

  function isFichaPost(post) {
    var cat = String(post.category || '');
    return !!post.publication || cat === 'Gatos en adopción' || cat === 'Perros en adopción' || cat === 'Acogida' || cat === 'Acogidas' || cat === 'Adoptados' || cat === 'Caso externo';
  }

  function renderIcons(pub, post) {
    var icons = pub && Array.isArray(pub.icons) ? pub.icons : [];
    if (!icons.length) return '';
    return '<section class="post-section post-facts post-section--compact" aria-label="Datos destacados">' +
      '<div class="section-head section-head--compact"><h2>Datos destacados</h2></div>' +
      '<div class="post-facts-grid">' + icons.map(function (it) {
        var meta = svgFor(it.label || '', it.icon || '', post.title || '', post.category || '');
        return '<article class="feature-card ' + meta.tone + ' post-fact-card">' +
          '<div class="feature-icon" aria-hidden="true">' + meta.svg + '</div>' +
          '<div class="post-fact-copy"><h3>' + esc(it.label || '') + '</h3><p>' + esc(it.value || '') + '</p></div></article>';
      }).join('') + '</div></section>';
  }

  function renderGallery(pub) {
    var g = pub && Array.isArray(pub.gallery) ? pub.gallery : [];
    if (!g.length) return '';
    var slides = g.map(function (item, i) {
      var src = HistoriasAPI.fallbackImage(item.src || item.image || '');
      var alt = item.alt || ('Imagen ' + (i + 1));
      var cap = item.caption ? '<figcaption>' + esc(item.caption) + '</figcaption>' : '';
      return '<figure class="post-slide">' +
        '<img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" decoding="async">' + cap +
      '</figure>';
    }).join('');
    var dots = g.length > 1 ? '<div class="post-carousel-dots" role="tablist" aria-label="Seleccionar imagen">' + g.map(function (_, i) {
      return '<button type="button" class="post-carousel-dot' + (i===0?' active':'') + '" data-index="' + i + '" aria-label="Imagen ' + (i+1) + '"' + (i===0?' aria-current="true"':'') + '></button>';
    }).join('') + '</div>' : '';
    var controls = g.length > 1 ? '<div class="post-carousel-controls"><button type="button" class="post-carousel-btn" data-dir="-1" aria-label="Imagen anterior">‹</button><button type="button" class="post-carousel-btn" data-dir="1" aria-label="Imagen siguiente">›</button></div>' : '';
    return '<section class="post-section post-media-block" aria-label="Galería de imágenes">' +
      '<div class="section-head section-head--compact"><h2>Galería</h2></div>' +
      '<div class="post-carousel" data-post-carousel><div class="post-carousel-viewport"><div class="post-carousel-track">' + slides + '</div></div>' + controls + dots + '</div>' +
    '</section>';
  }

  function renderVideo(pub) {
    var v = pub && pub.video;
    if (!v || !v.url) return '';
    var safeUrl = esc(v.url);
    var title = esc(v.title || 'Vídeo de la publicación');
    var note = v.note ? '<p class="post-video-note">' + esc(v.note) + '</p>' : '';
    return '<section class="post-section post-media-block" aria-label="Vídeo">' +
      '<div class="section-head section-head--compact"><h2>Vídeo</h2></div>' +
      '<div class="post-video"><div class="post-video-frame"><iframe src="' + safeUrl + '" title="' + title + '" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>' + note + '</div>' +
    '</section>';
  }

  function initCarousel(root) {
    var car = root.querySelector('[data-post-carousel]');
    if (!car) return;
    var track = car.querySelector('.post-carousel-track');
    var slides = car.querySelectorAll('.post-slide');
    var dots = car.querySelectorAll('.post-carousel-dot');
    var btns = car.querySelectorAll('.post-carousel-btn');
    if (!track || !slides.length) return;
    var idx = 0;
    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, di) { var on = di === idx; d.classList.toggle('active', on); if (on) d.setAttribute('aria-current','true'); else d.removeAttribute('aria-current'); });
    }
    btns.forEach(function (b) { b.addEventListener('click', function(){ go(idx + parseInt(b.getAttribute('data-dir')||'1',10)); }); });
    dots.forEach(function (d) { d.addEventListener('click', function(){ go(parseInt(d.getAttribute('data-index')||'0',10)); }); });
    var startX = null;
    track.addEventListener('touchstart', function(e){ startX = e.touches[0].clientX; }, {passive:true});
    track.addEventListener('touchend', function(e){ if(startX==null) return; var dx = e.changedTouches[0].clientX - startX; if(Math.abs(dx)>40) go(idx + (dx<0?1:-1)); startX=null; }, {passive:true});
  }

  function renderError(root, message) {
    root.innerHTML = '<a class="card-link" href="historias.html">← Volver a historias</a>' +
      '<div class="post-sheet" style="margin-top:1rem"><h1>No encontramos esta ficha</h1><p>' + esc(message) + '</p><p><a class="btn btn-primary" href="historias.html">Ver historias</a></p></div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('blogPostDetail');
    if (!root || typeof HistoriasAPI === 'undefined') return;
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    var fromParam = params.get('from');
    if (!slug) { renderError(root, 'El enlace no incluye el identificador de la publicación.'); return; }
    HistoriasAPI.load().then(function () {
      var post = HistoriasAPI.getPostBySlug(slug);
      if (!post) { renderError(root, 'Puede que la publicación se haya movido o ya no esté disponible.'); return; }
      var ficha = isFichaPost(post);
      document.title = post.title + ' · Grupo Nebak';
      var image = HistoriasAPI.fallbackImage(post.image);
      var cta = post.cta || { label: 'Contactar con Nebak', url: 'contacto.html' };
      var tags = Array.isArray(post.tags) ? post.tags : [];
      var content = post.content || ('<p>' + esc(post.excerpt || '') + '</p>');
      var pub = post.publication || null;
      var back = backTarget(post, fromParam);
      var metaLine = [post.category || '', post.dateFormatted || post.date || '', post.readTime || ''].filter(Boolean).join(' · ');

      var hero = ficha ? (
        '<header class="post-hero">' +
          '<div class="post-hero-copy">' +
            '<p class="eyebrow">' + esc(post.category || 'Ficha') + '</p>' +
            '<h1>' + esc(post.title) + '</h1>' +
            (post.excerpt ? '<p class="lead">' + esc(post.excerpt) + '</p>' : '') +
            (metaLine ? '<p class="meta">' + esc(metaLine) + '</p>' : '') +
            '<div class="actions"><a class="btn btn-primary" href="' + esc(cta.url) + '">' + esc(cta.label) + '</a><a class="btn btn-secondary" href="' + esc(back.href) + '">' + esc(back.label) + '</a></div>' +
          '</div>' +
          '<div class="post-hero-media"><img src="' + esc(image) + '" alt="' + esc(post.imageAlt || post.title) + '" loading="eager" decoding="async"></div>' +
        '</header>'
      ) : (
        '<header class="post-header-simple">' +
          '<p class="eyebrow">' + esc(post.category || 'Historia') + '</p>' +
          '<h1>' + esc(post.title) + '</h1>' +
          (metaLine ? '<p class="meta">' + esc(metaLine) + '</p>' : '') +
          '<img src="' + esc(image) + '" alt="' + esc(post.imageAlt || post.title) + '" loading="lazy" decoding="async">' +
        '</header>'
      );

      var mediaBlocks = '';
      if (ficha && pub && pub.gallery && pub.video) {
        mediaBlocks = '<div class="post-media-grid">' + renderGallery(pub) + renderVideo(pub) + '</div>';
      } else {
        mediaBlocks = renderGallery(pub) + renderVideo(pub);
      }

      root.innerHTML =
        '<a class="card-link post-back" href="' + esc(back.href) + '">← ' + esc(back.label) + '</a>' +
        '<article class="post-sheet ' + (ficha ? 'post-sheet--ficha' : 'post-sheet--story') + '">' +
          hero +
          renderIcons(pub, post) +
          (tags.length ? '<div class="card-tags post-tags">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '<section class="post-section post-section--desc"><div class="section-head section-head--compact"><h2>Sobre este caso</h2></div><div class="post-body">' + content + '</div></section>' +
          mediaBlocks +
          '<div class="actions actions-center post-actions"><a class="btn btn-primary" href="' + esc(cta.url) + '">' + esc(cta.label) + '</a> <a class="btn btn-secondary" href="' + esc(back.href) + '">' + esc(back.label) + '</a></div>' +
        '</article>';
      initCarousel(root);
    }).catch(function (err) {
      renderError(root, 'No se pudo cargar la publicación. Comprueba tu conexión o inténtalo de nuevo.');
      console.error(err);
    });
  });
})();