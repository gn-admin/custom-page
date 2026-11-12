/* ==========================================================================
   Grupo Nebak — detalle del post
   Lee el parámetro ?slug= de la URL y renderiza la historia en
   #blogPostDetail. Si el slug no existe, muestra un estado vacío.
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

  function renderError(root, message) {
    root.innerHTML = '' +
      '<a class="post-detail__back" href="blog">Volver al blog</a>' +
      '<div class="empty-state">' +
        '<h1>No encontramos esta historia</h1>' +
        '<p>' + escapeHtml(message) + '</p>' +
        '<p><a class="btn btn--primary" href="blog">Ver todas las historias</a></p>' +
      '</div>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('blogPostDetail');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var slug = params.get('slug');

    if (!slug) {
      renderError(root, 'El enlace no incluye el identificador de la historia.');
      return;
    }

    BlogAPI.load().then(function () {
      var post = BlogAPI.getPostBySlug(slug);

      if (!post) {
        renderError(root, 'Puede que la historia se haya movido o ya no esté publicada.');
        return;
      }

      document.title = post.title + ' · Grupo Nebak';
      var description = document.querySelector('meta[name="description"]');
      if (description && post.excerpt) {
        description.setAttribute('content', String(post.excerpt).replace(/<[^>]*>/g, '').trim());
      }

      var image = BlogAPI.fallbackImage(post.image);
      var tags = Array.isArray(post.tags) ? post.tags : [];
      var views = typeof post.views === 'number' ? post.views : null;

      root.innerHTML = '' +
        '<a class="post-detail__back" href="blog">Volver al blog</a>' +
        '<div class="post-detail__top">' +
          '<span class="badge badge--adopcion">' + escapeHtml(post.category || 'Blog') + '</span>' +
          '<span>' + escapeHtml(post.dateFormatted || post.date || '') + '</span>' +
        '</div>' +
        '<h1>' + escapeHtml(post.title) + '</h1>' +
        '<div class="post-detail__meta">' +
          '<span>Por ' + escapeHtml(post.author || 'gruponebak') + '</span>' +
          (post.readTime ? '<span>' + escapeHtml(post.readTime) + '</span>' : '') +
          (views !== null ? '<span>' + views + ' visualizaciones</span>' : '') +
        '</div>' +
        '<figure class="post-detail__hero">' +
          '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(post.imageAlt || post.title) + '" ' +
               'onerror="this.onerror=null;this.src=\'assets/images/logo.jpg\'">' +
        '</figure>' +
        '<div class="prose">' + (post.content || '<p>' + escapeHtml(post.excerpt || '') + '</p>') + '</div>' +
        (tags.length
          ? '<div class="post-detail__tags">' + tags.map(function (tag) {
              return '<span class="tag">' + escapeHtml(tag) + '</span>';
            }).join('') + '</div>'
          : '') +
        '<p style="margin-top:32px"><a class="btn btn--outline" href="blog">Ver más historias</a></p>';
    });
  });
})();
