(function () {
  function initMoviePlayer(id, url) {
    var shell = document.getElementById(id);
    if (!shell) {
      return;
    }

    var video = shell.querySelector("video");
    var cover = shell.querySelector(".player-cover");
    var errorBox = shell.querySelector(".player-error");
    var playButton = shell.querySelector(".control-play");
    var muteButton = shell.querySelector(".control-mute");
    var fullButton = shell.querySelector(".control-full");
    var hls = null;
    var attached = false;

    function showError() {
      if (errorBox) {
        errorBox.textContent = "视频暂时无法播放，请稍后再试。";
        errorBox.hidden = false;
      }
    }

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else {
        showError();
      }
    }

    function updatePlayState() {
      if (playButton) {
        playButton.textContent = video && !video.paused ? "❚❚" : "▶";
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.hidden = true;
      }
      shell.classList.add("is-started");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (cover) {
            cover.hidden = false;
          }
        });
      }
      updatePlayState();
    }

    function togglePlay() {
      if (!attached || video.paused) {
        start();
      } else {
        video.pause();
        updatePlayState();
      }
    }

    if (cover) {
      cover.addEventListener("click", start);
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    if (video) {
      video.addEventListener("click", togglePlay);
      video.addEventListener("play", updatePlayState);
      video.addEventListener("pause", updatePlayState);
      video.addEventListener("error", showError);
    }

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "静" : "音";
      });
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (shell.requestFullscreen) {
          shell.requestFullscreen();
        }
      });
    }

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
