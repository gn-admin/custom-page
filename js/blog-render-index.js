/* ==========================================================================
   Grupo Nebak — listado del blog
   - blog.html: listado real de entradas con filtros por categoría.
   - inicio: los seis posts que se muestran en #storyGrid.
   ========================================================================== */
(function () {
  'use strict';

  var BLOG_LIST_URL = 'data/blog-list.json';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function excerptOf(post, max) {
    var text = String(post.excerpt || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    var limit = max || 165;
    if (text.length <= limit) return text;
    return text.slice(0, limit).replace(/\s+\S*$/, '') + '…';
  }

  function postUrl(slug) {
    return 'post?slug=' + encodeURIComponent(slug);
  }

  function countLabel(value, singular, plural) {
    return Number(value) + ' ' + (Number(value) === 1 ? singular : plural);
  }

  /* ----------------------------------------------------------------------
     Inicio: tarjetas pequeñas de las últimas historias
     ---------------------------------------------------------------------- */
  function homeCardMarkup(post) {
    var url = postUrl(post.slug);
    var image = BlogAPI.fallbackImage(post.image);
    var alt = escapeHtml(post.imageAlt || post.title || '');
    var category = escapeHtml(post.category || 'Blog');
    var tags = Array.isArray(post.tags) ? post.tags.slice(0, 3) : [];

    return '' +
      '<article class="post-card">' +
        '<a class="post-card__media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + escapeHtml(image) + '" alt="' + alt + '" loading="lazy" ' +
               'onerror="this.onerror=null;this.src=\'assets/images/logo.jpg\'">' +
        '</a>' +
        '<div class="post-card__body">' +
          '<div class="post-card__top">' +
            '<span class="post-card__category">' + category + '</span>' +
            '<span>' + escapeHtml(post.dateFormatted || post.date || '') + '</span>' +
          '</div>' +
          '<h3><a href="' + url + '">' + escapeHtml(post.title) + '</a></h3>' +
          '<p>' + escapeHtml(excerptOf(post)) + '</p>' +
          (tags.length
            ? '<div class="post-card__tags">' + tags.map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
              }).join('') + '</div>'
            : '') +
          '<a class="link-arrow" href="' + url + '">Leer la historia</a>' +
        '</div>' +
      '</article>';
  }

  function initHomeGrid() {
    var storyGrid = document.getElementById('storyGrid');
    if (!storyGrid) return;

    BlogAPI.load().then(function () {
      var posts = BlogAPI.getAllPosts();
      var published = posts.filter(function (post) {
        return post.blogOrder == null || post.blogOrder <= 20;
      });

      if (!published.length) {
        storyGrid.innerHTML = '<p class="empty-state">Todavía no hay historias publicadas.</p>';
        return;
      }

      storyGrid.innerHTML = published
        .sort(function (a, b) {
          return (a.blogOrder || 999) - (b.blogOrder || 999);
        })
        .slice(0, 6)
        .map(homeCardMarkup)
        .join('');
    });
  }

  /* ----------------------------------------------------------------------
     Blog: filas del listado real
     ---------------------------------------------------------------------- */
  function blogRowMarkup(post) {
    var url = postUrl(post.slug);
    var image = post.image || 'assets/images/logo.jpg';
    var alt = escapeHtml(post.imageAlt || post.title || '');
    var meta = [post.dateFormatted, post.readTime].filter(Boolean).join(' · ');
    var likes = Number(post.likes || 0);
    var comments = Number(post.comments || 0);
    var views = Number(post.views || 0);

    return '' +
      '<article class="blog-entry">' +
        '<a class="blog-entry__media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + escapeHtml(image) + '" alt="' + alt + '" loading="lazy" ' +
               'onerror="this.onerror=null;this.src=\'assets/images/logo.jpg\'">' +
        '</a>' +
        '<div class="blog-entry__body">' +
          '<div class="blog-entry__byline">' +
            '<img class="blog-entry__avatar" src="assets/images/logo.jpg" alt="" width="32" height="32" loading="lazy">' +
            '<div>' +
              '<span class="blog-entry__author">' + escapeHtml(post.author || 'gruponebak') + '</span>' +
              '<span class="blog-entry__meta">' + escapeHtml(meta) + '</span>' +
            '</div>' +
          '</div>' +
          '<h2><a class="blog-entry__link" href="' + url + '">' + escapeHtml(post.title) + '</a></h2>' +
          '<p class="blog-entry__excerpt">' + escapeHtml(post.excerpt || '') + '</p>' +
          '<div class="blog-entry__footer">' +
            '<span>' + escapeHtml(countLabel(views, 'visualización', 'visualizaciones')) + '</span>' +
            '<span>' + escapeHtml(countLabel(comments, 'comentario', 'comentarios')) + '</span>' +
            (likes > 0 ? '<span class="blog-entry__likes" aria-label="' + likes + ' me gusta">♥ ' + likes + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function initBlogList() {
    var container = document.getElementById('blogPostsContainer');
    if (!container) return;

    var filters = Array.prototype.slice.call(document.querySelectorAll('[data-blog-filter]'));
    var status = document.querySelector('[data-blog-status]');
    var more = document.querySelector('.blog-nav__more');
    var moreToggle = document.querySelector('.blog-nav__more-toggle');
    var moreMenu = document.getElementById('blogMoreMenu');
    var posts = [];

    function setMoreOpen(open) {
      if (!moreToggle || !moreMenu) return;
      moreToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreMenu.hidden = !open;
    }

    function setActive(value) {
      filters.forEach(function (button) {
        var active = button.getAttribute('data-blog-filter') === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (moreToggle) {
        var extraActive = filters.some(function (button) {
          return button.getAttribute('data-blog-filter') === value &&
            more && more.contains(button);
        });
        moreToggle.classList.toggle('has-active', extraActive);
      }
    }

    function renderFilter(value) {
      var visible = posts.filter(function (post) {
        if (value === 'Todas las entradas') return post.listed !== false;
        return post.category === value;
      });

      visible.sort(function (a, b) {
        return (a.order || 999) - (b.order || 999);
      });

      container.innerHTML = visible.length
        ? visible.map(blogRowMarkup).join('')
        : '<p class="blog-empty">No hay entradas en esta categoría.</p>';

      setActive(value);
      setMoreOpen(false);

      if (status) {
        status.textContent = 'Mostrando ' + visible.length +
          (visible.length === 1 ? ' entrada' : ' entradas') +
          (value === 'Todas las entradas' ? '.' : ' en ' + value + '.');
      }
    }

    if (moreToggle && moreMenu) {
      moreToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        var open = moreMenu.hidden;
        setMoreOpen(open);
      });

      document.addEventListener('click', function (event) {
        if (!more || !more.contains(event.target)) setMoreOpen(false);
      });

      document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') setMoreOpen(false);
      });
    }

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        renderFilter(button.getAttribute('data-blog-filter') || 'Todas las entradas');
      });
    });

    fetch(BLOG_LIST_URL, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        posts = data && Array.isArray(data.posts) ? data.posts : [];
        renderFilter('Todas las entradas');
      })
      .catch(function (error) {
        console.error('[blog-index]', error);
        container.innerHTML = '<p class="blog-empty">No se han podido cargar las entradas del blog.</p>';
        if (status) status.textContent = 'No se han podido cargar las entradas del blog.';
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initHomeGrid();
    initBlogList();
  });
})();
