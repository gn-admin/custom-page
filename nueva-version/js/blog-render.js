(function () {
  'use strict';
  function esc(v) { return String(v == null ? '' : v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function renderError(root, message) {
    root.innerHTML = '<a class="card-link" href="historias.html">← Volver al blog</a>' +
      '<div class="post-content" style="margin-top:1rem"><h1>No encontramos esta historia</h1><p>' + esc(message) + '</p><p><a class="btn btn-primary" href="historias.html">Ver todas las historias</a></p></div>';
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
      var content = (post.content || '<p>' + esc(post.excerpt || '') + '</p>');
      // fix asset paths inside content
      content = content.replace(/src="assets\//g, 'src="../assets/').replace(/src='assets\//g, "src='../assets/");
      root.innerHTML =
        '<a class="card-link" href="historias.html">← Volver al blog</a>' +
        '<article class="post-content" style="margin-top:1rem">' +
          '<p class="meta">' + esc(post.category || 'Historias') + ' · ' + esc(post.dateFormatted || post.date || '') + (post.readTime ? ' · ' + esc(post.readTime) : '') + '</p>' +
          '<h1>' + esc(post.title) + '</h1>' +
          '<p class="muted">Por ' + esc(post.author || 'gruponebak') + '</p>' +
          '<figure style="margin:1rem 0"><img src="' + esc(image) + '" alt="' + esc(post.imageAlt || post.title) + '" onerror="this.onerror=null;this.src=\'../assets/images/logo.jpg\'"></figure>' +
          '<div class="prose">' + content + '</div>' +
        '</article>';
    });
  });
})();