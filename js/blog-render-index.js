/* ==========================================================================
   Grupo Nebak — listado del blog
   Renderiza los primeros 6 posts en #storyGrid (inicio) y todos los posts en
   #blogPostsContainer (blog).
   ========================================================================== */
(function () {
  'use strict';

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

  function cardMarkup(post) {
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

  function render(container, posts) {
    container.innerHTML = posts.map(cardMarkup).join('');
  }

  function renderEmpty(container, message) {
    container.innerHTML = '<p class="empty-state">' + escapeHtml(message) + '</p>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var storyGrid = document.getElementById('storyGrid');
    var blogContainer = document.getElementById('blogPostsContainer');
    var counter = document.getElementById('blogCount');

    if (!storyGrid && !blogContainer) return;

    BlogAPI.load().then(function () {
      var posts = BlogAPI.getAllPosts();

      if (!posts.length) {
        if (storyGrid) renderEmpty(storyGrid, 'Todavía no hay historias publicadas.');
        if (blogContainer) renderEmpty(blogContainer, 'No se han podido cargar las historias del blog.');
        return;
      }

      if (storyGrid) render(storyGrid, posts.slice(0, 6));
      if (blogContainer) render(blogContainer, posts);
      if (counter) {
        counter.textContent = posts.length + (posts.length === 1 ? ' historia' : ' historias');
      }
    });
  });
})();
