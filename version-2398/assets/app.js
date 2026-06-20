(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initImages() {
    Array.prototype.forEach.call(document.querySelectorAll("img"), function (img) {
      img.addEventListener("error", function () {
        var box = img.closest(".poster-frame, .hero-media, .detail-poster, .ranking-feature, .ranking-poster, .category-card");
        if (box) {
          box.classList.add("image-fallback");
        }
        img.remove();
      });
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearch() {
    var input = document.querySelector("[data-search-input]");
    if (!input) {
      return;
    }
    var region = document.querySelector("[data-region-filter]");
    var type = document.querySelector("[data-type-filter]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var q = normalize(input.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        var matchQuery = !q || text.indexOf(q) !== -1;
        var matchRegion = !r || text.indexOf(r) !== -1;
        var matchType = !t || text.indexOf(t) !== -1;
        var show = matchQuery && matchRegion && matchType;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    input.addEventListener("input", apply);
    if (region) {
      region.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
  }

  function initPlayers() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (box) {
      var video = box.querySelector("video");
      var button = box.querySelector(".play-overlay");
      if (!video) {
        return;
      }
      var stream = video.getAttribute("data-stream");
      var hlsInstance = null;
      var loaded = false;

      function start() {
        if (!stream) {
          return;
        }
        box.classList.add("is-playing");
        if (!loaded) {
          loaded = true;
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            video.play().catch(function () {});
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {});
            });
          } else {
            video.src = stream;
            video.play().catch(function () {});
          }
        } else {
          video.play().catch(function () {});
        }
      }

      if (button) {
        button.addEventListener("click", start);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        box.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          box.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initImages();
    initHero();
    initSearch();
    initPlayers();
  });
})();
