(function () {
  'use strict';
  function esc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function renderError(root, message) {
    root.innerHTML = '<a class="card-link" href="historias.html">← Volver al blog</a>' +
      '<div class="post-content" style="margin-top:1rem"><h1>No encontramos esta historia</h1><p>' + esc(message) + '</p><p><a class="btn btn-primary" href="historias.html">Ver todas las historias</a></p></div>';
  }
  function renderIcons(pub) {
    var icons = pub && Array.isArray(pub.icons) ? pub.icons : [];
    if (!icons.length) return '';
    return '<section class="post-icons" aria-label="Datos destacados de la publicación">' +
      icons.map(function (it) {
        return '<div class="post-icon"><span class="post-icon-emoji" aria-hidden="true">' + esc(it.icon || '•') + '</span><span class="post-icon-text"><strong>' + esc(it.label || '') + '</strong><span>' + esc(it.value || '') + '</span></span></div>';
      }).join('') + '</section>';
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
    return '<section class="post-section" aria-label="Galería de imágenes">' +
      '<div class="post-section-head"><h2>Galería</h2><p>Carrusel de imágenes de la publicación.</p></div>' +
      '<div class="post-carousel" data-post-carousel><div class="post-carousel-viewport"><div class="post-carousel-track">' + slides + '</div></div>' + controls + dots + '</div>' +
    '</section>';
  }
  function renderVideo(pub) {
    var v = pub && pub.video;
    if (!v || !v.url) return '';
    var safeUrl = esc(v.url);
    var title = esc(v.title || 'Vídeo de la publicación');
    var note = v.note ? '<p class="post-video-note">' + esc(v.note) + '</p>' : '';
    return '<section class="post-section" aria-label="Vídeo">' +
      '<div class="post-section-head"><h2>Vídeo</h2><p>' + esc(v.title || 'Contenido en vídeo relacionado con la publicación.') + '</p></div>' +
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
  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('blogPostDetail');
    if (!root || typeof HistoriasAPI === 'undefined') return;
    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');
    if (!slug) { renderError(root, 'El enlace no incluye el identificador de la historia.'); return; }
    HistoriasAPI.load().then(function () {
      var post = HistoriasAPI.getPostBySlug(slug);
      if (!post) { renderError(root, 'Puede que la historia se haya movido o ya no esté publicada.'); return; }
      document.title = post.title + ' · Grupo Nebak';
      var image = HistoriasAPI.fallbackImage(post.image);
      var cta = post.cta || { label: 'Contactar con Nebak', url: 'contacto.html' };
      var tags = Array.isArray(post.tags) ? post.tags : [];
      var content = post.content || ('<p>' + esc(post.excerpt || '') + '</p>');
      var pub = post.publication || null;
      root.innerHTML =
        '<a class="card-link" href="historias.html">← Volver a historias</a>' +
        '<article class="post-content post-publication" style="margin-top:1rem">' +
          '<p class="eyebrow">' + esc(post.category || 'Historia') + '</p>' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<p class="meta">' + esc(post.dateFormatted || post.date || '') + ' · ' + esc(post.readTime || '') + '</p>' +
          (pub ? '' : '<img src="' + esc(image) + '" alt="' + esc(post.imageAlt || post.title) + '" loading="lazy" decoding="async">') +
          renderIcons(pub) +
          (tags.length ? '<div class="card-tags post-tags" style="margin:1rem 0">' + tags.map(function (t) { return '<span class="tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '') +
          '<section class="post-section"><div class="post-section-head"><h2>Descripción</h2></div><div class="post-body">' + content + '</div></section>' +
          renderGallery(pub) +
          renderVideo(pub) +
          '<div class="actions actions-center" style="margin-top:1.5rem"><a class="btn btn-primary" href="' + esc(cta.url) + '">' + esc(cta.label) + '</a> <a class="btn btn-secondary" href="historias.html">Volver al blog</a></div>' +
        '</article>';
      initCarousel(root);
    }).catch(function (err) {
      renderError(root, 'No se pudo cargar la historia. Comprueba tu conexión o inténtalo de nuevo.');
      console.error(err);
    });
  });
})();