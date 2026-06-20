(function () {
  var body = document.body;
  var toggle = document.querySelector(".mobile-toggle");
  var panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.hasAttribute("hidden");
      if (open) {
        panel.removeAttribute("hidden");
        body.classList.add("menu-open");
      } else {
        panel.setAttribute("hidden", "");
        body.classList.remove("menu-open");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === current;
        slide.classList.toggle("is-active", active);
        if (active) {
          slide.removeAttribute("aria-hidden");
        } else {
          slide.setAttribute("aria-hidden", "true");
        }
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-index"));
        show(index);
        restart();
      });
    });

    restart();
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function cardText(card) {
    return normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags"),
      card.getAttribute("data-year"),
      card.getAttribute("data-category")
    ].join(" "));
  }

  function applyFilter(scope, value) {
    var keyword = normalize(value);
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-item"));
    cards.forEach(function (card) {
      card.classList.toggle("is-hidden", keyword && cardText(card).indexOf(keyword) === -1);
    });
  }

  var localInputs = Array.prototype.slice.call(document.querySelectorAll(".local-filter"));
  localInputs.forEach(function (input) {
    var scope = input.closest("section");
    if (scope) {
      var list = scope.querySelector("[data-filter-scope]");
      if (list) {
        input.addEventListener("input", function () {
          applyFilter(list, input.value);
        });
      }
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var searchInput = document.getElementById("search-keyword");
  var searchScope = document.querySelector("[data-search-page]");

  if (searchInput) {
    searchInput.value = query;
  }

  if (searchScope && query) {
    applyFilter(searchScope, query);
  }

  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-search-chip]"));
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var keyword = chip.getAttribute("data-search-chip") || "";
      if (searchInput) {
        searchInput.value = keyword;
      }
      if (searchScope) {
        applyFilter(searchScope, keyword);
      }
      var url = new URL(window.location.href);
      url.searchParams.set("q", keyword);
      window.history.replaceState(null, "", url.toString());
    });
  });
})();
