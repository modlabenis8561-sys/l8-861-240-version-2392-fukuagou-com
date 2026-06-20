import { H as Hls } from './hls-dru42stk.js';

function setupPlayer(shell) {
    const video = shell.querySelector('video');
    const playButton = shell.querySelector('[data-play-toggle]');
    const status = shell.querySelector('[data-player-status]');
    const source = shell.getAttribute('data-video');
    let hls = null;

    if (!video || !source) {
        if (status) {
            status.textContent = '播放源未找到';
        }
        return;
    }

    function setStatus(message) {
        if (status) {
            status.textContent = message;
        }
    }

    function togglePlay() {
        if (video.paused) {
            video.play().then(function () {
                shell.classList.add('is-playing');
                setStatus('正在播放');
            }).catch(function () {
                setStatus('浏览器阻止了自动播放，请再次点击播放按钮');
            });
        } else {
            video.pause();
            shell.classList.remove('is-playing');
            setStatus('已暂停');
        }
    }

    if (Hls && Hls.isSupported()) {
        hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 90
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus('播放源已就绪，点击播放');
        });
        hls.on(Hls.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus('网络加载异常，正在重试');
                hls.startLoad();
                return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus('媒体解码异常，正在恢复');
                hls.recoverMediaError();
                return;
            }

            setStatus('播放失败，请刷新页面后重试');
            hls.destroy();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        setStatus('播放源已就绪，点击播放');
    } else {
        setStatus('当前浏览器不支持 HLS 播放');
    }

    if (playButton) {
        playButton.addEventListener('click', togglePlay);
    }

    video.addEventListener('click', togglePlay);
    video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
    });
    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-video]').forEach(setupPlayer);
});
