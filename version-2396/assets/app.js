(function () {
    const $ = function (selector, parent) {
        return (parent || document).querySelector(selector);
    };

    const $$ = function (selector, parent) {
        return Array.from((parent || document).querySelectorAll(selector));
    };

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function bindMenu() {
        const button = $(".menu-toggle");
        const panel = $(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function bindHero() {
        const slider = $(".hero-slider");
        if (!slider) {
            return;
        }
        const slides = $$(".hero-slide", slider);
        const dots = $$(".hero-dot", slider);
        const prev = $(".hero-prev", slider);
        const next = $(".hero-next", slider);
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.slide || 0));
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function bindLocalFilter() {
        const input = $("#page-filter");
        if (!input) {
            return;
        }
        const cards = $$(".movie-card");
        const empty = $(".empty-filter");
        input.addEventListener("input", function () {
            const keyword = input.value.trim().toLowerCase();
            let visible = 0;
            cards.forEach(function (card) {
                const text = [
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.tags,
                    card.dataset.genre,
                    card.textContent
                ].join(" ").toLowerCase();
                const matched = !keyword || text.indexOf(keyword) >= 0;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        });
    }

    function renderMovieCard(movie) {
        const tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class="movie-card">" +
            "<a class="movie-poster" href="./" + escapeHtml(movie.file) + "" aria-label="观看 " + escapeHtml(movie.title) + "">" +
            "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
            "<span class="poster-play">▶</span>" +
            "</a>" +
            "<div class="movie-info">" +
            "<h2><a href="./" + escapeHtml(movie.file) + "">" + escapeHtml(movie.title) + "</a></h2>" +
            "<p class="movie-meta">" + escapeHtml(movie.year) + " · " + escapeHtml(movie.region) + " · " + escapeHtml(movie.type) + "</p>" +
            "<p class="movie-genre">" + escapeHtml(movie.genre) + "</p>" +
            "<p class="movie-desc">" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class="tag-row">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }

    function bindSearchPage() {
        const holder = $("#search-results");
        if (!holder || !window.SiteMovies) {
            return;
        }
        const params = new URLSearchParams(window.location.search);
        const input = $("#search-page-input");
        const q = (params.get("q") || "").trim();
        if (input) {
            input.value = q;
        }
        const keyword = q.toLowerCase();
        const movies = window.SiteMovies.filter(function (movie) {
            if (!keyword) {
                return true;
            }
            const text = [
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine
            ].join(" ").toLowerCase();
            return text.indexOf(keyword) >= 0;
        }).slice(0, 160);

        if (!movies.length) {
            holder.innerHTML = "<div class="search-results-message">没有找到匹配的影片，换个关键词试试。</div>";
            return;
        }
        holder.innerHTML = movies.map(renderMovieCard).join("");
    }

    function bindBackTop() {
        const button = $(".back-top");
        if (!button) {
            return;
        }
        function update() {
            button.classList.toggle("is-visible", window.scrollY > 420);
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        window.addEventListener("scroll", update, { passive: true });
        update();
    }

    window.initializePlayer = function (source) {
        const video = document.getElementById("site-player");
        const button = document.getElementById("player-start");
        const shell = document.querySelector(".player-shell");
        let ready = false;
        let hls = null;

        if (!video || !source) {
            return;
        }

        function prepare() {
            if (ready) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            ready = true;
        }

        function start() {
            prepare();
            video.controls = true;
            if (shell) {
                shell.classList.add("is-playing");
            }
            const playing = video.play();
            if (playing && typeof playing.catch === "function") {
                playing.catch(function () {});
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

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        bindMenu();
        bindHero();
        bindLocalFilter();
        bindSearchPage();
        bindBackTop();
    });
})();
