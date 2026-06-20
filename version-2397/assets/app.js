(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMobileNavigation() {
        var toggle = document.querySelector('[data-mobile-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!toggle || !nav) {
            return;
        }

        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var thumbs = selectAll('[data-hero-thumb]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function goTo(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });

            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle('is-active', thumbIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                goTo(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                goTo(dotIndex);
                start();
            });
        });

        thumbs.forEach(function (thumb, thumbIndex) {
            thumb.addEventListener('mouseenter', function () {
                goTo(thumbIndex);
                stop();
            });

            thumb.addEventListener('mouseleave', start);
        });

        if (prev) {
            prev.addEventListener('click', function () {
                goTo(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                goTo(current + 1);
                start();
            });
        }

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function parseYear(value) {
        var match = String(value || '').match(/\d{4}/);
        return match ? Number(match[0]) : 0;
    }

    function initLocalFilters() {
        var panels = selectAll('[data-filter-scope]');

        panels.forEach(function (panel) {
            var grid = document.querySelector('[data-card-grid]');
            var searchInput = panel.querySelector('[data-card-search]');
            var sortSelect = panel.querySelector('[data-card-sort]');
            var count = panel.querySelector('[data-filter-count]');
            var cards = grid ? selectAll('.movie-card, .ranking-item', grid) : [];

            function applyFilter() {
                var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = String(card.getAttribute('data-search') || '').toLowerCase();
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.classList.toggle('is-hidden-by-filter', !matched);

                    if (matched) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
                }
            }

            function applySort() {
                if (!grid || !sortSelect) {
                    return;
                }

                var value = sortSelect.value;
                var sorted = cards.slice();

                if (value === 'title') {
                    sorted.sort(function (a, b) {
                        return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-CN');
                    });
                }

                if (value === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return parseYear(b.getAttribute('data-year')) - parseYear(a.getAttribute('data-year'));
                    });
                }

                if (value === 'year-asc') {
                    sorted.sort(function (a, b) {
                        return parseYear(a.getAttribute('data-year')) - parseYear(b.getAttribute('data-year'));
                    });
                }

                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });

                applyFilter();
            }

            if (searchInput) {
                searchInput.addEventListener('input', applyFilter);
            }

            if (sortSelect) {
                sortSelect.addEventListener('change', applySort);
            }

            selectAll('[data-filter-tag]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = button.getAttribute('data-filter-tag') || '';
                    }

                    applyFilter();
                });
            });

            selectAll('[data-filter-clear]', panel).forEach(function (button) {
                button.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }

                    if (sortSelect) {
                        sortSelect.value = 'default';
                    }

                    applySort();
                    applyFilter();
                });
            });

            applyFilter();
        });
    }

    function cardHtml(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return [
            '<a class="movie-card" href="' + escapeHtml(movie.file) + '">',
            '    <span class="poster-wrap">',
            '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '        <span class="poster-shade"></span>',
            '        <span class="play-chip">播放</span>',
            '    </span>',
            '    <span class="card-body">',
            '        <strong class="card-title">' + escapeHtml(movie.title) + '</strong>',
            '        <span class="card-meta">' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + ' · ' + escapeHtml(movie.year) + '</span>',
            '        <span class="card-desc">' + escapeHtml(movie.oneLine) + '</span>',
            '        <span class="tag-row">' + tags + '</span>',
            '    </span>',
            '</a>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (character) {
            var entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            };

            return entities[character];
        });
    }

    function initGlobalSearch() {
        var input = document.querySelector('[data-global-search-input]');
        var form = document.querySelector('[data-global-search-form]');
        var results = document.querySelector('[data-global-search-results]');
        var count = document.querySelector('[data-global-search-count]');
        var data = window.MOVIE_SEARCH_INDEX || [];

        if (!input || !results || !count) {
            return;
        }

        function render(keyword) {
            var normalized = keyword.trim().toLowerCase();

            if (!normalized) {
                results.innerHTML = '';
                count.textContent = '请输入关键词开始搜索。';
                return;
            }

            var matched = data.filter(function (movie) {
                return String(movie.search || '').toLowerCase().indexOf(normalized) !== -1;
            }).slice(0, 120);

            results.innerHTML = matched.map(cardHtml).join('\n');
            count.textContent = '找到 ' + matched.length + ' 条结果，最多显示前 120 条。';
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render(input.value);
            });
        }

        input.addEventListener('input', function () {
            render(input.value);
        });

        selectAll('[data-global-keyword]').forEach(function (button) {
            button.addEventListener('click', function () {
                input.value = button.getAttribute('data-global-keyword') || '';
                render(input.value);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (query) {
            input.value = query;
            render(query);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileNavigation();
        initHeroSlider();
        initLocalFilters();
        initGlobalSearch();
    });
})();
