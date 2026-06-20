(function () {
    function setupMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHeroSlider() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    function setupFilters() {
        var grid = document.querySelector('[data-movie-grid]');
        var input = document.querySelector('[data-filter-input]');
        var region = document.querySelector('[data-filter-region]');
        var type = document.querySelector('[data-filter-type]');
        var year = document.querySelector('[data-filter-year]');
        if (!grid || !input) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

        function readValue(element) {
            return element ? element.value.trim().toLowerCase() : '';
        }

        function filterCards() {
            var text = readValue(input);
            var regionValue = readValue(region);
            var typeValue = readValue(type);
            var yearValue = readValue(year);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags')
                ].join(' ').toLowerCase();
                var matchesText = !text || haystack.indexOf(text) !== -1;
                var matchesRegion = !regionValue || (card.getAttribute('data-region') || '').toLowerCase() === regionValue;
                var matchesType = !typeValue || (card.getAttribute('data-type') || '').toLowerCase() === typeValue;
                var matchesYear = !yearValue || (card.getAttribute('data-year') || '').toLowerCase() === yearValue;
                card.hidden = !(matchesText && matchesRegion && matchesType && matchesYear);
            });
        }

        [input, region, type, year].forEach(function (element) {
            if (element) {
                element.addEventListener('input', filterCards);
                element.addEventListener('change', filterCards);
            }
        });
    }

    window.initMoviePlayer = function (sourceUrl) {
        var video = document.querySelector('[data-player]');
        var button = document.querySelector('[data-player-start]');
        var shell = document.querySelector('.player-shell');
        if (!video || !button || !sourceUrl) {
            return;
        }
        var loaded = false;
        var player = null;

        function loadSource() {
            if (loaded) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = sourceUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                player = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                player.loadSource(sourceUrl);
                player.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
            loaded = true;
        }

        function playVideo() {
            loadSource();
            if (shell) {
                shell.classList.add('is-playing');
            }
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        button.addEventListener('click', playVideo);
        video.addEventListener('click', function () {
            if (!loaded) {
                playVideo();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (player && typeof player.destroy === 'function') {
                player.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMobileMenu();
        setupHeroSlider();
        setupFilters();
    });
})();

function renderSearchPage() {
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    if (!input || !results || !window.SEARCH_INDEX) {
        return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    input.value = query;

    function movieCard(movie) {
        return [
            '<article class="movie-card regular">',
            '<a href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + ' 在线观看">',
            '<div class="card-poster">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
            '<span class="play-badge">▶</span>',
            '<div class="poster-tags"><span class="chip">' + escapeHtml(movie.region) + '</span><span class="chip">' + escapeHtml(movie.type) + '</span></div>',
            '</div>',
            '<div class="card-body">',
            '<h3>' + escapeHtml(movie.title) + '</h3>',
            '<p>' + escapeHtml(movie.oneLine) + '</p>',
            '<div class="card-meta"><span>' + escapeHtml(movie.genre) + '</span><span>' + escapeHtml(movie.year) + '年</span></div>',
            '</div>',
            '</a>',
            '</article>'
        ].join('');
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>'"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[char];
        });
    }

    function render() {
        var value = input.value.trim().toLowerCase();
        var list = window.SEARCH_INDEX.filter(function (movie) {
            if (!value) {
                return true;
            }
            return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine]
                .join(' ')
                .toLowerCase()
                .indexOf(value) !== -1;
        }).slice(0, 120);
        results.innerHTML = list.map(movieCard).join('');
    }

    input.addEventListener('input', render);
    render();
}
