(function () {
  'use strict';

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function excerptOf(post, max) {
    var text = String(post.excerpt || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    var limit = max || 140;
    if (text.length <= limit) return text;
    return text.slice(0, limit).replace(/\s+\S*$/, '') + '…';
  }

  function postUrl(slug) { return 'post.html?slug=' + encodeURIComponent(slug); }

  function categoryTone(cat) {
    var c = norm(cat);
    if (c.indexOf('adopt') !== -1) return 'is-adopted';
    if (c.indexOf('acog') !== -1) return 'is-foster';
    if (c.indexOf('gato') !== -1 || c.indexOf('perro') !== -1) return 'is-adoption';
    if (c.indexOf('evento') !== -1) return 'is-event';
    if (c.indexOf('d.e.p') !== -1 || c.indexOf('dep') !== -1 || c.indexOf('sc') !== -1) return 'is-memory';
    if (c.indexOf('caso') !== -1) return 'is-case';
    return 'is-default';
  }

  function card(post) {
    var url = postUrl(post.slug);
    var image = (typeof HistoriasAPI !== 'undefined' && HistoriasAPI.fallbackImage)
      ? HistoriasAPI.fallbackImage(post.image)
      : (post.image || '../assets/images/logo.jpg');
    var cat = post.category || 'Historias';
    var date = post.dateFormatted || post.date || '';
    return '<article class="card post-card story-feed-card reveal is-visible ' + categoryTone(cat) + '">' +
      '<a class="story-feed-media" href="' + url + '" aria-label="' + esc(post.title) + '">' +
        '<img src="' + esc(image) + '" alt="' + esc(post.imageAlt || post.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'../assets/images/logo.jpg\'">' +
        '<span class="story-badge">' + esc(cat) + '</span>' +
      '</a>' +
      '<div class="card-body story-feed-body">' +
        (date ? '<p class="meta story-feed-date">' + esc(date) + '</p>' : '') +
        '<h3><a href="' + url + '">' + esc(post.title) + '</a></h3>' +
        '<p>' + esc(excerptOf(post)) + '</p>' +
        '<a class="card-link" href="' + url + '">Leer historia →</a>' +
      '</div></article>';
  }

  function uniqueCategories(posts) {
    var seen = {};
    var out = [];
    posts.forEach(function (p) {
      var c = (p.category || '').trim();
      if (!c || seen[c]) return;
      seen[c] = true;
      out.push(c);
    });
    return out;
  }

  function renderList(container, posts, emptyText) {
    if (!posts.length) {
      container.innerHTML = '<div class="listing-empty">' + esc(emptyText || 'No hay historias para mostrar con este filtro.') + '</div>';
      return;
    }
    container.innerHTML = posts.map(card).join('');
  }

  function isExcludedCategory(cat) {
    var c = norm(cat).replace(/\./g, '').trim();
    if (!c) return false;
    if (c === 'sc') return true;
    if (c.indexOf('acogida') !== -1 || c.indexOf('acogidas') !== -1) return true;
    if (c.indexOf('gatos en adopcion') !== -1 || c.indexOf('perros en adopcion') !== -1) return true;
    return false;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var featured = document.getElementById('blogFeatured');
    var all = document.getElementById('blogPostsContainer');
    var counter = document.getElementById('blogCount');
    var tools = document.getElementById('historiasTools');
    if ((!featured && !all) || typeof HistoriasAPI === 'undefined') return;

    if (all) all.innerHTML = '<div class="listing-empty">Cargando historias…</div>';

    HistoriasAPI.load().then(function () {
      var posts = HistoriasAPI.getAllPosts().filter(function (p) {
        return !isExcludedCategory(p.category);
      });
      if (counter) counter.textContent = posts.length + (posts.length === 1 ? ' historia' : ' historias');

      if (!posts.length) {
        if (featured) featured.innerHTML = '<div class="listing-empty">No hay historias disponibles.</div>';
        if (all) all.innerHTML = '<div class="listing-empty">No hay historias disponibles en este apartado.</div>';
        return;
      }

      if (featured) renderList(featured, posts.slice(0, 3), 'No hay historias destacadas.');

      if (!all) return;

      var state = { q: '', cat: 'all', sort: 'recent' };

      function filtered() {
        var q = norm(state.q);
        var list = posts.filter(function (p) {
          if (state.cat !== 'all' && (p.category || '') !== state.cat) return false;
          if (!q) return true;
          var hay = norm([p.title, p.excerpt, p.category, (p.tags || []).join(' ')].join(' '));
          return hay.indexOf(q) !== -1;
        });
        if (state.sort === 'old') list = list.slice().reverse();
        else if (state.sort === 'az') list = list.slice().sort(function (a, b) { return String(a.title || '').localeCompare(String(b.title || ''), 'es'); });
        else list = list.slice(); // recent: keep source order
        return list;
      }

      function update() {
        var list = filtered();
        var meta = document.getElementById('historiasMeta');
        if (meta) meta.textContent = list.length + ' de ' + posts.length + (posts.length === 1 ? ' historia' : ' historias');
        renderList(all, list, 'No hay resultados con esos filtros. Prueba con otra categoría o búsqueda.');
      }

      if (tools) {
        var cats = uniqueCategories(posts);
        var catChips = ['<button type="button" class="filter-chip is-active" data-hcat="all" aria-pressed="true">Todas</button>']
          .concat(cats.map(function (c) {
            return '<button type="button" class="filter-chip" data-hcat="' + esc(c) + '" aria-pressed="false">' + esc(c) + '</button>';
          })).join('');

        tools.innerHTML =
          '<div class="adoption-filters-top">' +
            '<label class="filter-field filter-field--search"><span class="filter-label">Buscar historias</span>' +
              '<input type="search" id="historiasSearch" placeholder="Nombre, tema, categoría..." autocomplete="off">' +
            '</label>' +
            '<label class="filter-field filter-field--sort"><span class="filter-label">Ordenar</span>' +
              '<select id="historiasSort" aria-label="Ordenar historias">' +
                '<option value="recent">Más recientes</option>' +
                '<option value="old">Más antiguas</option>' +
                '<option value="az">Título (A-Z)</option>' +
              '</select>' +
            '</label>' +
          '</div>' +
          '<div class="adoption-filters-bottom">' +
            '<div class="filter-group" role="group" aria-label="Filtrar por categoría">' +
              '<span class="filter-label">Categorías</span>' +
              '<div class="filter-chips" id="historiasCats">' + catChips + '</div>' +
            '</div>' +
            '<div class="results-meta" id="historiasMeta" aria-live="polite"></div>' +
          '</div>';

        var search = document.getElementById('historiasSearch');
        var sort = document.getElementById('historiasSort');
        var chipsWrap = document.getElementById('historiasCats');

        if (search) search.addEventListener('input', function () { state.q = search.value || ''; update(); });
        if (sort) sort.addEventListener('change', function () { state.sort = sort.value || 'recent'; update(); });
        if (chipsWrap) {
          Array.prototype.forEach.call(chipsWrap.querySelectorAll('[data-hcat]'), function (btn) {
            btn.addEventListener('click', function () {
              Array.prototype.forEach.call(chipsWrap.querySelectorAll('[data-hcat]'), function (b) {
                b.classList.remove('is-active');
                b.setAttribute('aria-pressed', 'false');
              });
              btn.classList.add('is-active');
              btn.setAttribute('aria-pressed', 'true');
              state.cat = btn.getAttribute('data-hcat') || 'all';
              update();
            });
          });
        }
      }

      update();
    }).catch(function () {
      if (all) all.innerHTML = '<div class="listing-empty">No se han podido cargar las historias. Inténtalo de nuevo más tarde.</div>';
    });
  });
})();