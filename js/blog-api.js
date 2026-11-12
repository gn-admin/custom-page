/* ==========================================================================
   Grupo Nebak — API del blog
   Carga los posts desde un endpoint opcional o, por defecto, desde el JSON
   local (data/blog-posts.json). Mantiene los datos en caché.
   ========================================================================== */
var ENDPOINT_URL = '';
var LOCAL_DATA_URL = 'data/blog-posts.json';

var BlogAPI = (function () {
  'use strict';

  var cache = null;
  var pending = null;
  var siteConfig = {};

  var FALLBACK_IMAGE = 'assets/images/logo.jpg';

  function fallbackImage(src) {
    if (!src || !String(src).trim()) return FALLBACK_IMAGE;
    return src;
  }

  function normalize(data) {
    return {
      site: data && data.site ? data.site : {},
      posts: data && Array.isArray(data.posts) ? data.posts : []
    };
  }

  function requestData() {
    var url = ENDPOINT_URL || LOCAL_DATA_URL;

    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) {
        throw new Error('No se pudo cargar el blog (HTTP ' + response.status + ')');
      }
      return response.json();
    });
  }

  function load() {
    if (cache) return Promise.resolve(cache);
    if (pending) return pending;

    pending = requestData()
      .then(function (data) {
        cache = normalize(data);
        siteConfig = cache.site;
        return cache;
      })
      .catch(function (error) {
        console.error('[blog-api]', error);
        cache = { site: {}, posts: [] };
        siteConfig = cache.site;
        return cache;
      })
      .then(function (result) {
        pending = null;
        return result;
      });

    return pending;
  }

  function getAllPosts() {
    return cache ? cache.posts.slice() : [];
  }

  function getPostBySlug(slug) {
    if (!slug || !cache) return null;
    var wanted = decodeURIComponent(String(slug));
    return cache.posts.find(function (post) {
      return post.slug === wanted;
    }) || null;
  }

  function getFeaturedPosts(limit) {
    var posts = getAllPosts();
    var max = typeof limit === 'number' ? limit : posts.length;

    return posts
      .slice()
      .sort(function (a, b) {
        if (!!b.featured !== !!a.featured) return b.featured ? 1 : -1;
        return String(b.date || '').localeCompare(String(a.date || ''));
      })
      .slice(0, max);
  }

  function getSiteConfig() {
    return siteConfig;
  }

  return {
    ENDPOINT_URL: ENDPOINT_URL,
    LOCAL_DATA_URL: LOCAL_DATA_URL,
    load: load,
    getAllPosts: getAllPosts,
    getPostBySlug: getPostBySlug,
    getFeaturedPosts: getFeaturedPosts,
    getSiteConfig: getSiteConfig,
    fallbackImage: fallbackImage
  };
})();
