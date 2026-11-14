/* ==========================================================================
   Grupo Nebak — detalle del post
   Las fichas de animales usan data/animal-posts.json. El resto de historias
   sigue usando el blog general de data/blog-posts.json.
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

  function setDescription(description) {
    var meta = document.querySelector('meta[name="description"]');
    if (meta && description) {
      meta.setAttribute('content', String(description).replace(/<[^>]*>/g, '').trim());
    }
  }

  function renderAnimal(root, post) {
    document.body.classList.add('animal-post-page');
    root.classList.add('animal-post-root');
    document.title = post.title + ' · Grupo Nebak';
    if (post.paragraphs && post.paragraphs.length) {
      setDescription(post.paragraphs[0]);
    }

    var tags = Array.isArray(post.tags) ? post.tags : [];
    var paragraphs = Array.isArray(post.paragraphs) ? post.paragraphs : [];
    var images = Array.isArray(post.images) ? post.images : [];

    root.innerHTML = '' +
      '<article class="animal-post">' +
        '<header class="animal-post__header">' +
          '<div class="animal-post__meta">' +
            '<img class="animal-post__avatar" src="assets/images/logo.jpg" alt="" width="32" height="32">' +
            '<span class="animal-post__author">gruponebak</span>' +
            '<span class="animal-post__dot" aria-hidden="true">·</span>' +
            '<span>' + escapeHtml(post.date) + '</span>' +
            '<span class="animal-post__dot" aria-hidden="true">·</span>' +
            '<span>' + escapeHtml(post.readTime) + '</span>' +
          '</div>' +
          '<h1>' + escapeHtml(post.title) + '</h1>' +
        '</header>' +
        '<div class="animal-post__body">' +
          paragraphs.map(function (paragraph) {
            return '<p>' + escapeHtml(paragraph) + '</p>';
          }).join('') +
          (images.length
            ? '<div class="animal-post__gallery">' + images.map(function (image, index) {
                return '<figure><img src="' + escapeHtml(image) + '" alt="' +
                  escapeHtml(post.title + ' ' + (index + 1)) + '" loading="lazy"></figure>';
              }).join('') + '</div>'
            : '') +
        '</div>' +
        '<footer class="animal-post__footer">' +
          (tags.length
            ? '<div class="animal-post__tags">' + tags.map(function (tag) {
                return '<span class="tag">' + escapeHtml(tag) + '</span>';
              }).join('') + '</div>'
            : '') +
          '<div class="animal-post__stats">' +
            '<span>' + Number(post.views || 0) + ' visualizaciones</span>' +
            '<span>' + Number(post.comments || 0) + ' comentarios</span>' +
            '<span>' + Number(post.likes || 0) + ' Me gusta</span>' +
          '</div>' +
        '</footer>' +
      '</article>' +
      '<p class="animal-post__back"><a href="adoptados">Volver a Adoptados</a></p>';
  }

  function renderBlogPost(root, post) {
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
  }

  function loadAnimalPosts() {
    return fetch('data/animal-posts.json', { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        return data && Array.isArray(data.posts) ? data.posts : [];
      })
      .catch(function () {
        return [];
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var root = document.getElementById('blogPostDetail');
    if (!root) return;

    var params = new URLSearchParams(window.location.search);
    var rawSlug = params.get('slug');

    if (!rawSlug) {
      renderError(root, 'El enlace no incluye el identificador de la historia.');
      return;
    }

    var slug;
    try {
      slug = decodeURIComponent(rawSlug);
    } catch (error) {
      slug = rawSlug;
    }

    Promise.all([BlogAPI.load(), loadAnimalPosts()]).then(function (results) {
      var animalPosts = results[1];
      var animal = animalPosts.find(function (item) {
        return item.slug === slug;
      });

      if (animal) {
        renderAnimal(root, animal);
        return;
      }

      var post = BlogAPI.getPostBySlug(slug);
      if (!post) {
        renderError(root, 'Puede que la historia se haya movido o ya no esté publicada.');
        return;
      }

      document.title = post.title + ' · Grupo Nebak';
      if (post.excerpt) {
        setDescription(post.excerpt);
      }
      renderBlogPost(root, post);
    });
  });
})();
