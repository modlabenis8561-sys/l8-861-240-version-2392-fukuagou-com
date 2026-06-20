(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileMenu = document.querySelector(".mobile-menu");
        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-hero-panel]"));
        if (slides.length > 1) {
            var current = 0;
            var show = function (index) {
                current = index % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
                panels.forEach(function (panel, i) {
                    panel.classList.toggle("is-active", i === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var activeChip = "";
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (filterInput && query) {
            filterInput.value = query;
        }
        var applyFilter = function () {
            if (!filterInput || !cards.length) {
                return;
            }
            var q = filterInput.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type")).toLowerCase();
                var chipOk = !activeChip || text.indexOf(activeChip.toLowerCase()) !== -1;
                var queryOk = !q || text.indexOf(q) !== -1;
                var visible = chipOk && queryOk;
                card.classList.toggle("hidden-card", !visible);
                if (visible) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        };
        if (filterInput) {
            filterInput.addEventListener("input", applyFilter);
            applyFilter();
        }
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeChip = chip.getAttribute("data-filter-chip") || "";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilter();
            });
        });
    });

    window.MoviePlayer = {
        init: function (url) {
            ready(function () {
                var video = document.getElementById("movie-video");
                var cover = document.getElementById("play-button");
                var shell = document.getElementById("player-shell");
                if (!video || !cover || !shell || !url) {
                    return;
                }
                var started = false;
                var start = function () {
                    if (started) {
                        return;
                    }
                    started = true;
                    cover.classList.add("is-hidden");
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = url;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        var hls = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hls.loadSource(url);
                        hls.attachMedia(video);
                    } else {
                        video.src = url;
                    }
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {});
                    }
                };
                cover.addEventListener("click", start);
                shell.addEventListener("click", function (event) {
                    if (!started && event.target !== video) {
                        start();
                    }
                });
            });
        }
    };
})();
