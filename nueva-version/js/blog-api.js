/* Historias API adaptado para nueva-version (rutas relativas a ../data y ../assets) */
var HistoriasAPI = (function () {
  'use strict';
  var ENDPOINT_URL = '';
  var LOCAL_DATA_URL = '../data/blog-posts.json';
  var FALLBACK_IMAGE = '../assets/images/logo.jpg';
  var cache = null;
  var pending = null;
  var siteConfig = {};

  function fallbackImage(src) {
    if (!src || !String(src).trim()) return FALLBACK_IMAGE;
    var s = String(src);
    if (s.indexOf('assets/images/') === 0) return '../' + s;
    return s;
  }
  function normalize(data) {
    return { site: data && data.site ? data.site : {}, posts: data && Array.isArray(data.posts) ? data.posts : [] };
  }
  function requestData() {
    var url = ENDPOINT_URL || LOCAL_DATA_URL;
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('No se pudo cargar el blog (HTTP ' + r.status + ')');
      return r.json();
    });
  }
  function load() {
    if (cache) return Promise.resolve(cache);
    if (pending) return pending;
    pending = requestData().then(function (data) {
      cache = normalize(data); siteConfig = cache.site; return cache;
    }).catch(function (err) {
      console.error('[blog-api]', err); cache = { site: {}, posts: [] }; siteConfig = {}; return cache;
    }).then(function (result) { pending = null; return result; });
    return pending;
  }
  function getAllPosts() { return cache ? cache.posts.slice() : []; }
  function getPostBySlug(slug) {
    if (!slug || !cache) return null;
    var wanted = decodeURIComponent(String(slug));
    return cache.posts.find(function (p) { return p.slug === wanted; }) || null;
  }
  function getSiteConfig() { return siteConfig; }
  return { load: load, getAllPosts: getAllPosts, getPostBySlug: getPostBySlug, getSiteConfig: getSiteConfig, fallbackImage: fallbackImage };
})();