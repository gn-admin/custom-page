/* ==========================================================================
   Grupo Nebak — interacciones de la réplica
   Menú móvil, desplegables, carrusel, formularios, cookies y toast.
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); };

  /* ----------------------------------------------------------------------
     Año del footer
     ---------------------------------------------------------------------- */
  $$('[data-year], #year').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ----------------------------------------------------------------------
     Menú móvil
     ---------------------------------------------------------------------- */
  var menu = $('#mobileMenu');
  var backdrop = $('#menuBackdrop');
  var menuToggle = $('.menu-toggle');
  var menuClose = $('.mobile-close');

  function openMenu() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    if (backdrop) backdrop.classList.add('is-open');
    document.body.classList.add('menu-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    if (menuClose) menuClose.focus();
  }

  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      if (menu && menu.classList.contains('is-open')) closeMenu();
      else openMenu();
    });
  }
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  $$('.mobile-list a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  $$('.m-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var group = button.closest('.m-group');
      if (!group) return;
      var isOpen = group.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* Desplegables de escritorio: hover por CSS, click y teclado por JS */
  $$('.nav-parent').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      var item = button.closest('.nav-item');
      if (!item) return;
      var open = item.classList.toggle('open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
      $$('.nav-item.open').forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          var parent = $('.nav-parent', other);
          if (parent) parent.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.nav-item')) {
      $$('.nav-item.open').forEach(function (item) {
        item.classList.remove('open');
        var parent = $('.nav-parent', item);
        if (parent) parent.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (menu && menu.classList.contains('is-open')) closeMenu();
    $$('.nav-item.open').forEach(function (item) {
      item.classList.remove('open');
      var parent = $('.nav-parent', item);
      if (parent) parent.setAttribute('aria-expanded', 'false');
    });
    closeCookieModal();
  });

  /* ----------------------------------------------------------------------
     Carrusel de la home
     ---------------------------------------------------------------------- */
  var slider = $('[data-slider]');
  if (slider) {
    var slides = $$('.slide', slider);
    var current = 0;
    var timer = null;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function showSlide(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    }

    function nextSlide() { showSlide(current + 1); }
    function prevSlide() { showSlide(current - 1); }

    function startTimer() {
      if (reduced || slides.length < 2 || timer) return;
      timer = window.setInterval(nextSlide, 6000);
    }
    function stopTimer() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }


    slider.addEventListener('mouseenter', stopTimer);
    slider.addEventListener('mouseleave', startTimer);
    slider.addEventListener('focusin', stopTimer);
    slider.addEventListener('focusout', function () { startTimer(); });
    slider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') { prevSlide(); stopTimer(); startTimer(); }
      if (event.key === 'ArrowRight') { nextSlide(); stopTimer(); startTimer(); }
    });

    showSlide(0);
    startTimer();
  }

  /* ----------------------------------------------------------------------
     Formularios (sitio estático: se simula el envío)
     ---------------------------------------------------------------------- */
  $$('[data-contact-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var button = $('button[type="submit"]', form);
      var original = button ? button.textContent : '';
      if (button) {
        button.disabled = true;
        button.textContent = 'Enviando…';
      }

      window.setTimeout(function () {
        form.reset();
        if (button) {
          button.disabled = false;
          button.textContent = original;
        }
        var success = $('.contact-success', form);
        if (success) success.hidden = false;
        showToast('¡Gracias por tu mensaje! Te responderemos lo antes posible.');
      }, 900);
    });

    $$('input, textarea, select', form).forEach(function (field) {
      field.addEventListener('input', function () {
        var success = $('.contact-success', form);
        if (success) success.hidden = true;
      });
    });
  });

  /* ----------------------------------------------------------------------
     Toast
     ---------------------------------------------------------------------- */
  var toast = $('#toast');
  var toastTimer = null;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 4000);
  }

  /* ----------------------------------------------------------------------
     Cookies
     ---------------------------------------------------------------------- */
  var CONSENT_KEY = 'nebak-cookie-consent';
  var banner = $('#cookieBanner');
  var modal = $('#cookieModal');
  var analyticsInput = $('#cookieAnalytics');
  var marketingInput = $('#cookieMarketing');

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(CONSENT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeConsent(analytics, marketing) {
    var value = {
      necessary: true,
      analytics: !!analytics,
      marketing: !!marketing,
      date: new Date().toISOString()
    };
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    } catch (error) { /* almacenamiento no disponible */ }
    return value;
  }

  function hideBanner() {
    if (!banner) return;
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('has-cookie');
  }

  function showBanner() {
    if (!banner) return;
    banner.classList.add('is-visible');
    banner.setAttribute('aria-hidden', 'false');
    document.body.classList.add('has-cookie');
  }

  function openCookieModal() {
    if (!modal) return;
    var saved = readConsent();
    if (analyticsInput) analyticsInput.checked = !!(saved && saved.analytics);
    if (marketingInput) marketingInput.checked = !!(saved && saved.marketing);
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    var first = $('button, input, a', modal);
    if (first) first.focus();
  }

  function closeCookieModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function decide(analytics, marketing) {
    writeConsent(analytics, marketing);
    hideBanner();
    closeCookieModal();
    showToast(analytics ? 'Preferencias de cookies guardadas.' : 'Solo se usarán cookies necesarias.');
  }

  var accept = $('[data-cookie-accept]');
  var reject = $('[data-cookie-reject]');
  var options = $('[data-cookie-options]');
  var close = $('[data-cookie-close]');
  var save = $('[data-cookie-save]');
  var rejectAll = $('[data-cookie-reject-all]');
  var modalClose = $('[data-cookie-modal-close]');

  if (accept) accept.addEventListener('click', function () { decide(true, true); });
  if (reject) reject.addEventListener('click', function () { decide(false, false); });
  if (options) options.addEventListener('click', openCookieModal);
  if (close) close.addEventListener('click', function () { decide(false, false); });
  if (save) save.addEventListener('click', function () {
    decide(!!(analyticsInput && analyticsInput.checked), !!(marketingInput && marketingInput.checked));
  });
  if (rejectAll) rejectAll.addEventListener('click', function () { decide(false, false); });
  if (modalClose) modalClose.addEventListener('click', closeCookieModal);
  if (modal) modal.addEventListener('click', function (event) {
    if (event.target === modal) closeCookieModal();
  });

  if (banner) {
    if (!readConsent()) {
      window.setTimeout(showBanner, 350);
    } else {
      hideBanner();
    }
  }

  /* ----------------------------------------------------------------------
     Aparición progresiva de los bloques de Acerca de
     ---------------------------------------------------------------------- */
  var aboutPage = $('.page-about');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (aboutPage && !reducedMotion && 'IntersectionObserver' in window) {
    var revealItems = $$('main > .section .split__body, main > .section .split__media', aboutPage);
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('about-reveal');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px 12% 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  /* ----------------------------------------------------------------------
     Utilidades expuestas para depuración mínima
     ---------------------------------------------------------------------- */
  window.NebakUI = {
    showToast: showToast,
    openCookieSettings: openCookieModal
  };
})();
