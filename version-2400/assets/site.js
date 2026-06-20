(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobile = document.querySelector('[data-mobile-nav]');
    if (toggle && mobile) {
      toggle.addEventListener('click', function () {
        mobile.classList.toggle('open');
      });
    }

    initHero();
    initFilters();
    initPlayer();
  });

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }

    var active = 0;
    var timer = null;

    function show(index) {
      active = index % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(active + 1);
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

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-card-list]');
    var empty = document.querySelector('[data-empty-state]');
    var category = document.querySelector('[data-category-select]');
    var form = document.querySelector('[data-filter-form]') || document.querySelector('[data-search-page-form]');
    if (!input || !list) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function apply() {
      var query = normalize(input.value);
      var cat = category ? category.value : '';
      var cards = Array.prototype.slice.call(list.children);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute('data-search'));
        var cardCat = card.getAttribute('data-category') || '';
        var matchText = !query || text.indexOf(query) !== -1;
        var matchCat = !cat || cardCat === cat;
        var ok = matchText && matchCat;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    input.addEventListener('input', apply);
    if (category) {
      category.addEventListener('change', apply);
    }
    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        apply();
      });
    }
    apply();
  }

  function initPlayer() {
    var holder = document.querySelector('.player-card[data-hls]');
    var video = holder ? holder.querySelector('video') : null;
    var trigger = holder ? holder.querySelector('[data-player-trigger]') : null;
    if (!holder || !video) {
      return;
    }

    var src = holder.getAttribute('data-hls');
    var hlsInstance = null;
    var prepared = false;

    function prepare() {
      if (prepared) {
        return Promise.resolve();
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      return Promise.resolve();
    }

    function play() {
      prepare().then(function () {
        if (trigger) {
          trigger.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {
            if (trigger) {
              trigger.classList.remove('is-hidden');
            }
          });
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (trigger) {
        trigger.classList.add('is-hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (trigger && video.currentTime === 0) {
        trigger.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
