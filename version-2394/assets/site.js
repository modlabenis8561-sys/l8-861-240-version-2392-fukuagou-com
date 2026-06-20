(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupBackTop() {
    var button = document.querySelector('[data-back-top]');
    if (!button) {
      return;
    }
    function refresh() {
      if (window.scrollY > 420) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    }
    window.addEventListener('scroll', refresh, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    refresh();
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var lists = selectAll('[data-card-list]');
    if (!lists.length) {
      return;
    }
    var keywordInput = document.querySelector('[data-card-filter]');
    var selects = selectAll('[data-select-filter]');
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function refresh() {
      var keyword = normalize(keywordInput ? keywordInput.value : '');
      var selected = {};
      selects.forEach(function (item) {
        selected[item.getAttribute('data-select-filter')] = normalize(item.value);
      });
      selectAll('[data-movie-card]').forEach(function (card) {
        var text = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent
        ].join(' '));
        var ok = !keyword || text.indexOf(keyword) !== -1;
        Object.keys(selected).forEach(function (key) {
          var value = selected[key];
          if (value && normalize(card.dataset[key]).indexOf(value) === -1) {
            ok = false;
          }
        });
        card.classList.toggle('is-hidden', !ok);
      });
    }
    if (keywordInput) {
      keywordInput.addEventListener('input', refresh);
    }
    selects.forEach(function (item) {
      item.addEventListener('change', refresh);
    });
  }

  function setupSearchPage() {
    var page = document.querySelector('[data-search-page]');
    var container = document.querySelector('[data-search-results]');
    if (!page || !container || !window.MOVIES_DATA) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    var input = document.querySelector('[data-search-input]');
    if (input) {
      input.value = q;
    }
    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }
    function card(movie) {
      return [
        '<article class="movie-card">',
        '  <a href="movie/' + movie.file + '" title="' + escapeHtml(movie.title) + ' 在线观看">',
        '    <div class="cover-frame">',
        '      <img src="' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '      <span class="play-mark">▶</span>',
        '    </div>',
        '    <div class="card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="card-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('\n');
    }
    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }
    var query = normalize(q);
    var results = window.MOVIES_DATA.filter(function (movie) {
      if (!query) {
        return true;
      }
      return normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ')).indexOf(query) !== -1;
    }).slice(0, 240);
    container.innerHTML = results.length ? results.map(card).join('\n') : '<p class="empty-state">暂未找到匹配影片</p>';
  }

  function setupPlayers() {
    function prepare(video) {
      if (!video || video.dataset.ready === '1') {
        return;
      }
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
        video.dataset.ready = '1';
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.dataset.ready = '1';
      } else {
        video.src = stream;
        video.dataset.ready = '1';
      }
    }
    selectAll('.movie-player').forEach(function (video) {
      video.addEventListener('play', function () {
        prepare(video);
        var shell = video.closest('.player-shell');
        if (shell) {
          shell.classList.add('is-playing');
        }
      });
      video.addEventListener('click', function () {
        prepare(video);
      });
    });
    selectAll('[data-player-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        var id = button.getAttribute('data-player-target');
        var video = document.getElementById(id);
        if (!video) {
          return;
        }
        prepare(video);
        var shell = video.closest('.player-shell');
        if (shell) {
          shell.classList.add('is-playing');
        }
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {});
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
