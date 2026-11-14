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
  var ICON_EYE = '<svg class="blog-entry__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 5.2C6.9 5.2 2.6 9.5 1.6 12c1 2.5 5.3 6.8 10.4 6.8s9.4-4.3 10.4-6.8c-1-2.5-5.3-6.8-10.4-6.8Z" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
    '<circle cx="12" cy="12" r="2.9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

  var ICON_COMMENT = '<svg class="blog-entry__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M4 4.8h16v11.6H9.3L4 20.4V4.8Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  var ICON_DOTS = '<svg viewBox="0 0 19 19" aria-hidden="true" focusable="false">' +
    '<circle cx="9.5" cy="4" r="1.7" fill="currentColor"/>' +
    '<circle cx="9.5" cy="9.5" r="1.7" fill="currentColor"/>' +
    '<circle cx="9.5" cy="15" r="1.7" fill="currentColor"/></svg>';

  var ICON_HEART = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M12 20.3 4.3 12.6a4.7 4.7 0 0 1 6.6-6.7l1.1 1.1 1.1-1.1a4.7 4.7 0 1 1 6.6 6.7Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>';

  function blogRowMarkup(post) {
    var url = postUrl(post.slug);
    var image = post.image || 'assets/images/logo.jpg';
    var alt = escapeHtml(post.imageAlt || post.title || '');
    var date = post.dateFormatted || post.date || '';
    var read = post.readTime || '';
    var comments = Number(post.comments || 0);
    var views = Number(post.views || 0);
    var meta = '';

    if (date) meta += '<span>' + escapeHtml(date) + '</span>';
    if (date && read) meta += '<span class="blog-entry__dot" aria-hidden="true">&middot;</span>';
    if (read) meta += '<span>' + escapeHtml(read) + '</span>';

    return '' +
      '<article class="blog-entry">' +
        '<a class="blog-entry__media" href="' + url + '" tabindex="-1" aria-hidden="true">' +
          '<img src="' + escapeHtml(image) + '" alt="' + alt + '" loading="lazy" ' +
               'onerror="this.onerror=null;this.src=\'assets/images/logo.jpg\'">' +
        '</a>' +
        '<div class="blog-entry__body">' +
          '<div class="blog-entry__byline">' +
            '<img class="blog-entry__avatar" src="assets/images/logo.jpg" alt="" width="32" height="32" loading="lazy">' +
            '<div class="blog-entry__byline-text">' +
              '<span class="blog-entry__author">' + escapeHtml(post.author || 'gruponebak') + '</span>' +
              '<span class="blog-entry__meta">' + meta + '</span>' +
            '</div>' +
            '<button class="blog-entry__more" type="button" aria-label="Compartir esta entrada" data-blog-share="' + escapeHtml(url) + '">' + ICON_DOTS + '</button>' +
          '</div>' +
          '<h2><a class="blog-entry__link" href="' + url + '">' + escapeHtml(post.title) + '</a></h2>' +
          '<p class="blog-entry__excerpt">' + escapeHtml(post.excerpt || '') + '</p>' +
          '<div class="blog-entry__footer">' +
            '<span class="blog-entry__stat">' + ICON_EYE +
              '<span class="blog-entry__stat-num">' + views + '</span>' +
              '<span class="blog-entry__stat-label">' + (views === 1 ? 'visualización' : 'visualizaciones') + '</span>' +
            '</span>' +
            '<span class="blog-entry__stat">' + ICON_COMMENT +
              '<span class="blog-entry__stat-num">' + comments + '</span>' +
              '<span class="blog-entry__stat-label">' + (comments === 1 ? 'comentario' : 'comentarios') + '</span>' +
            '</span>' +
            '<button class="blog-entry__like" type="button" aria-label="Me gusta" aria-pressed="false" data-blog-like>' + ICON_HEART + '</button>' +
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
    var categorySelect = document.getElementById('blogCategorySelect');
    var searchToggles = Array.prototype.slice.call(document.querySelectorAll('[data-blog-search-toggle]'));
    var searchPanel = document.getElementById('blogSearchPanel');
    var searchInput = document.getElementById('blogSearchInput');
    var searchClose = document.querySelector('[data-blog-search-close]');
    var posts = [];
    var activeFilter = 'Todas las entradas';

    function toast(message) {
      if (window.NebakUI && typeof window.NebakUI.showToast === 'function') {
        window.NebakUI.showToast(message);
      }
    }

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      }

      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } catch (error) {
        /* sin soporte de portapapeles */
      }
      document.body.removeChild(area);
      return Promise.resolve();
    }

    function setMoreOpen(open) {
      if (!moreToggle || !moreMenu) return;
      moreToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      moreMenu.hidden = !open;
    }

    function setActive(value) {
      activeFilter = value;

      filters.forEach(function (button) {
        var active = button.getAttribute('data-blog-filter') === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });

      if (categorySelect && categorySelect.value !== value) {
        categorySelect.value = value;
      }

      if (moreToggle) {
        var extraActive = filters.some(function (button) {
          return button.getAttribute('data-blog-filter') === value &&
            more && more.contains(button);
        });
        moreToggle.classList.toggle('has-active', extraActive);
      }
    }

    function renderFilter(value) {
      var query = searchInput ? searchInput.value.replace(/\s+/g, ' ').trim().toLowerCase() : '';

      var visible = posts.filter(function (post) {
        if (value === 'Todas las entradas') {
          if (post.listed === false) return false;
        } else if (post.category !== value) {
          return false;
        }

        if (!query) return true;

        var haystack = [post.title, post.excerpt, post.category, post.author]
          .join(' ')
          .toLowerCase();
        return haystack.indexOf(query) !== -1;
      });

      visible.sort(function (a, b) {
        return (a.order || 999) - (b.order || 999);
      });

      container.innerHTML = visible.length
        ? visible.map(blogRowMarkup).join('')
        : '<p class="blog-empty">' + (query
            ? 'No hay entradas que coincidan con tu búsqueda.'
            : 'No hay entradas en esta categoría.') + '</p>';

      setActive(value);
      setMoreOpen(false);

      if (status) {
        status.textContent = 'Mostrando ' + visible.length +
          (visible.length === 1 ? ' entrada' : ' entradas') +
          (value === 'Todas las entradas' ? '' : ' en ' + value) +
          (query ? ' para "' + query + '".' : '.');
      }
    }

    function setSearchOpen(open) {
      if (!searchPanel || !searchToggles.length) return;

      searchPanel.hidden = !open;
      searchToggles.forEach(function (button) {
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      if (open) {
        if (searchInput) {
          window.setTimeout(function () { searchInput.focus(); }, 0);
        }
        return;
      }

      if (searchInput) searchInput.value = '';
      renderFilter(activeFilter);
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
    }

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      setMoreOpen(false);
      if (searchPanel && !searchPanel.hidden) setSearchOpen(false);
    });

    filters.forEach(function (button) {
      button.addEventListener('click', function () {
        renderFilter(button.getAttribute('data-blog-filter') || 'Todas las entradas');
      });
    });

    if (categorySelect) {
      categorySelect.addEventListener('change', function () {
        renderFilter(categorySelect.value);
      });
    }

    searchToggles.forEach(function (button) {
      button.addEventListener('click', function () {
        setSearchOpen(Boolean(searchPanel && searchPanel.hidden));
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderFilter(activeFilter);
      });
    }

    if (searchClose) {
      searchClose.addEventListener('click', function () {
        setSearchOpen(false);
      });
    }

    container.addEventListener('click', function (event) {
      var target = event.target;

      var shareButton = target && target.closest ? target.closest('[data-blog-share]') : null;
      if (shareButton) {
        event.preventDefault();
        var shareUrl = new URL(shareButton.getAttribute('data-blog-share'), window.location.href).href;
        copyText(shareUrl).then(function () {
          toast('Enlace copiado al portapapeles.');
        });
        return;
      }

      var likeButton = target && target.closest ? target.closest('[data-blog-like]') : null;
      if (likeButton) {
        var active = likeButton.classList.toggle('is-active');
        likeButton.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
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
