/* Contenido de las páginas 2–5 del listado de Adoptados. */
(() => {
  const pages = {
    2: [
      { title: 'Jack', slug: 'jack-beagle-frances-bicolor', img: 'assets/images/adoptados/jack.webp', views: 198, likes: 8 },
      { title: 'Yako', slug: 'yako-lobo-checoslovaco', img: 'assets/images/adoptados/yako.webp', views: 93, likes: 3 },
      { title: 'Mango', slug: 'mango', img: 'assets/images/adoptados/mango.webp', views: 274, likes: 3 },
      { title: 'Siam', slug: 'siam-siames', img: 'assets/images/adoptados/siam.webp', views: 163, likes: 2 },
      { title: 'Thor', slug: 'thor-mix-boxer', img: 'assets/images/adoptados/thor.webp', views: 137, likes: 8 },
      { title: 'Keo', slug: 'keo-en-adopcion', img: 'assets/images/adoptados/keo.webp', views: 130, likes: 3 },
      { title: 'Shelma', slug: 'shelma-cachorrita', img: 'assets/images/adoptados/shelma.webp', views: 54, likes: 2 },
      { title: 'Dos cachorros en adopción', slug: 'dos-cachorros-en-adopcion', img: 'assets/images/dos-cachorros.webp', views: 288, likes: 1 }
    ],
    3: [
      { title: 'Duque', slug: 'duque-mezcla-pincher', img: 'assets/images/adoptados/duque.webp', views: 282, likes: 3 },
      { title: 'Gaspar', slug: 'gaspar-bulldog-franc%C3%A9s', img: 'assets/images/adoptados/gaspar.webp', views: 121, likes: 2 },
      { title: 'Blas', slug: 'blas-cachorro', img: 'assets/images/adoptados/blas.webp', views: 93, likes: 0 },
      { title: 'Yago y Lua', slug: 'yago-y-lua', img: 'assets/images/adoptados/yago-lua.webp', views: 209, likes: 4 },
      { title: 'Gala y Dali 🐈🐈♥️', slug: 'gala-y-dali', img: 'assets/images/adoptados/gala-dali.webp', views: 118, likes: 0 },
      { title: 'Zeus', slug: 'zeus-pitbull-blue', img: 'assets/images/adoptados/zeus.webp', views: 32, likes: 1 },
      { title: 'Noa', slug: 'noa-mix-sishu', img: 'assets/images/adoptados/noa.webp', views: 67, likes: 2 },
      { title: 'Melo', slug: 'melo-gato', img: 'assets/images/adoptados/melo.webp', views: 131, likes: 0 }
    ],
    4: [
      { title: 'Sia', slug: 'sia-gata', img: 'assets/images/adoptados/sia.webp', views: 132, likes: 0 },
      { title: 'Tula', slug: 'tula-gata', img: 'assets/images/adoptados/tula.webp', views: 107, likes: 1 },
      { title: 'Cala', slug: '_cala', img: 'assets/images/adoptados/cala.webp', views: 201, likes: 2 },
      { title: 'Fabry', slug: 'fabry', img: 'assets/images/adoptados/fabry.webp', views: 302, likes: 7 },
      { title: 'Beltzi - Mix Border Collie', slug: 'beltzi-mix-border-collie', img: 'assets/images/adoptados/beltzi.webp', views: 52, likes: 0 },
      { title: 'Nala', slug: '_nala', img: 'assets/images/adoptados/nala.webp', views: 71, likes: 1 },
      { title: 'Wendy', slug: 'wendy', img: 'assets/images/adoptados/wendy.webp', views: 72, likes: 4 },
      { title: 'Pipo', slug: '_pipo', img: 'assets/images/adoptados/pipo.webp', views: 94, likes: 1 }
    ],
    5: [
      { title: 'Winnie', slug: 'winnie', img: 'assets/images/adoptados/winnie.webp', views: 101, likes: 1 },
      { title: 'Mara', slug: '_mara', img: 'assets/images/adoptados/mara.webp', views: 18, likes: 0 },
      { title: 'Rodolfo', slug: 'rodolfo', img: 'assets/images/adoptados/rodolfo.webp', views: 65, likes: 1 },
      { title: 'BIMBA Y REX', slug: 'bimba-y-rex', img: 'assets/images/adoptados/bimba-rex.webp', views: 835, likes: 1 },
      { title: 'Luma', slug: '_luma', img: 'assets/images/adoptados/luma.webp', views: 112, likes: 0 },
      { title: 'Buddy', slug: 'buddy', img: 'assets/images/adoptados/buddy.webp', views: 64, likes: 1 },
      { title: 'Lua', slug: 'lua_gata', img: 'assets/images/adoptados/lua.webp', views: 57, likes: 1 },
      { title: 'Fenix', slug: 'fenix', img: 'assets/images/adoptados/fenix.webp', views: 116, likes: 3 }
    ]
  };

  const grid = document.querySelector('.feed-grid');
  const pagination = document.querySelector('.feed-pagination');
  if (!grid || !pagination) return;

  const page1HTML = grid.innerHTML;
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  const cardHTML = (item) => `
    <a class="feed-card" href="post?slug=${item.slug}" aria-label="${escapeHTML(item.title)}">
      <img src="${item.img}" alt="${escapeHTML(item.title)}" loading="lazy">
      <span class="feed-card__top">1 min de lectura</span>
      <h2 class="feed-card__title">${escapeHTML(item.title)}</h2>
      <span class="feed-card__rule" aria-hidden="true"></span>
      <span class="feed-card__bottom">
        <span class="feed-stat"><svg class="feed-icon" aria-hidden="true"><use href="#i-eye"></use></svg><span>${item.views}</span></span>
        <span class="feed-stat"><svg class="feed-icon" aria-hidden="true"><use href="#i-comment"></use></svg><span>0</span></span>
        <span class="feed-like" aria-label="${item.likes} Me gusta"><svg class="feed-icon" aria-hidden="true"><use href="#i-heart"></use></svg></span>
      </span>
    </a>`;

  const pageFromURL = () => {
    const requested = Number(new URLSearchParams(window.location.search).get('page'));
    return pages[requested] ? requested : 1;
  };

  const render = (page, shouldScroll) => {
    grid.innerHTML = page === 1 ? page1HTML : pages[page].map(cardHTML).join('');

    pagination.querySelectorAll('[data-page]').forEach((link) => {
      const isCurrent = Number(link.dataset.page) === page;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    if (shouldScroll) {
      const gridTop = grid.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: gridTop, behavior: 'smooth' });
    }
  };

  pagination.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-page]');
    if (!link) return;

    event.preventDefault();
    const page = Number(link.dataset.page);
    const url = new URL(window.location.href);
    if (page === 1) {
      url.searchParams.delete('page');
    } else {
      url.searchParams.set('page', page);
    }
    window.history.pushState({ page }, '', `${url.pathname}${url.search}`);
    render(page, true);
  });

  window.addEventListener('popstate', () => render(pageFromURL(), false));

  render(pageFromURL(), false);
})();
