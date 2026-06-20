(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || '').toString().toLowerCase();
  }

  function setupMenu() {
    var button = qs('.menu-toggle');
    if (!button) {
      return;
    }
    button.addEventListener('click', function () {
      document.body.classList.toggle('nav-open');
    });
  }

  function setupSearchForms() {
    qsa('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = qs('input[name="q"]', form);
        var value = input ? input.value.trim() : '';
        if (value) {
          window.location.href = 'search.html?q=' + encodeURIComponent(value);
        } else {
          window.location.href = 'search.html';
        }
      });
    });
  }

  function setupHero() {
    var slider = qs('[data-hero-slider]');
    if (!slider) {
      return;
    }
    var slides = qsa('[data-hero-slide]', slider);
    var dots = qsa('[data-hero-dot]', slider);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  function setupFilters() {
    var input = qs('[data-filter-input]');
    var type = qs('[data-filter-type]');
    var year = qs('[data-filter-year]');
    var cards = qsa('[data-card]');
    var empty = qs('[data-empty]');
    if (!cards.length || (!input && !type && !year)) {
      return;
    }

    function apply() {
      var keyword = input ? text(input.value) : '';
      var typeValue = type ? text(type.value) : '';
      var yearValue = year ? text(year.value) : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchKeyword = !keyword || text(card.getAttribute('data-search')).indexOf(keyword) !== -1;
        var matchType = !typeValue || text(card.getAttribute('data-type')).indexOf(typeValue) !== -1 || text(card.getAttribute('data-genre')).indexOf(typeValue) !== -1;
        var matchYear = !yearValue || text(card.getAttribute('data-year')) === yearValue;
        var ok = matchKeyword && matchType && matchYear;
        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [input, type, year].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-card data-search="' + escapeHtml([movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(' ')].join(' ')) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-region="' + escapeHtml(movie.region) + '" data-type="' + escapeHtml(movie.type) + '">' +
      '<a class="movie-cover" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">' +
      '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="play-mark">▶</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<div class="movie-meta">' + escapeHtml(movie.year + ' · ' + movie.region + ' · ' + movie.type) + '</div>' +
      '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine || '') + '</p>' +
      '<div class="tag-row">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return (value || '').toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var form = qs('[data-search-page-form]');
    var input = qs('[data-search-page-input]');
    var grid = qs('[data-search-results]');
    var empty = qs('[data-empty]');
    if (!form || !input || !grid || typeof MOVIE_SEARCH_DATA === 'undefined') {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function render(value) {
      var keyword = text(value);
      var list = MOVIE_SEARCH_DATA.filter(function (movie) {
        if (!keyword) {
          return true;
        }
        return text([movie.title, movie.region, movie.type, movie.genre, (movie.tags || []).join(' '), movie.oneLine].join(' ')).indexOf(keyword) !== -1;
      }).slice(0, 120);
      grid.innerHTML = list.map(renderMovieCard).join('');
      if (empty) {
        empty.classList.toggle('is-visible', list.length === 0);
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? 'search.html?q=' + encodeURIComponent(value) : 'search.html';
      window.history.replaceState(null, '', url);
      render(value);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    render(initial);
  }

  function setupBackTop() {
    var button = document.createElement('button');
    button.className = 'back-top';
    button.type = 'button';
    button.textContent = '↑';
    document.body.appendChild(button);
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    window.addEventListener('scroll', function () {
      button.classList.toggle('is-visible', window.scrollY > 380);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupBackTop();
  });
})();
