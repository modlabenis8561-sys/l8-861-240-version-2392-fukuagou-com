(function () {
    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function openMobileMenu() {
        var panel = document.querySelector("[data-mobile-panel]");
        if (panel) {
            panel.classList.toggle("open");
        }
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        if (button) {
            button.addEventListener("click", openMobileMenu);
        }
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll(".global-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-filter-input]");
        var year = document.querySelector("[data-year-filter]");
        var category = document.querySelector("[data-category-filter]");
        var empty = document.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial && input) {
            input.value = initial;
        }
        function apply() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = normalize(year ? year.value : "");
            var selectedCategory = normalize(category ? category.value : "");
            var visible = 0;
            cards.forEach(function (card) {
                var search = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-title"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardCategory = normalize(card.getAttribute("data-category"));
                var matched = true;
                if (keyword && search.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }
                if (selectedCategory && cardCategory !== selectedCategory) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }
        [input, year, category].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function restart(next) {
            if (timer) {
                window.clearInterval(timer);
            }
            show(next);
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                restart(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });
        start();
    }

    function setupPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var layer = player.querySelector(".play-layer");
            var stream = player.getAttribute("data-stream");
            var ready = false;
            var hls = null;
            if (!video || !stream) {
                return;
            }
            function attach() {
                if (ready) {
                    return;
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    ready = true;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    ready = true;
                    return;
                }
                video.src = stream;
                ready = true;
            }
            function play() {
                attach();
                if (layer) {
                    layer.classList.add("hidden");
                }
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            }
            if (layer) {
                layer.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (layer) {
                    layer.classList.add("hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupGlobalSearch();
        setupFilters();
        setupHero();
        setupPlayers();
    });
})();
