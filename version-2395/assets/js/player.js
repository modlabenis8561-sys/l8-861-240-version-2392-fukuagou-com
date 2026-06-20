(function () {
  function prepare(box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var button = box.querySelector('.player-button');
    var url = box.getAttribute('data-video');
    var hls = null;

    function load() {
      if (!video || !url) {
        return;
      }
      if (!video.getAttribute('data-ready')) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        } else {
          video.src = url;
        }
        video.setAttribute('data-ready', '1');
      }
      video.setAttribute('controls', 'controls');
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', load);
    }
    if (overlay) {
      overlay.addEventListener('click', load);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!video.getAttribute('data-ready')) {
          load();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(prepare);
  });
})();
