document.addEventListener("DOMContentLoaded", async () => {
    const windowElement = document.querySelector(".kritr-window");
    const tabs = [...document.querySelectorAll(".tab")];
    const pages = [...document.querySelectorAll(".tab-page")];
    const status = document.querySelector("#status");
    const playButton = document.querySelector("#play-btn");
    const progress = document.querySelector("#progress");

    KritrThemes.load();
    Pet.init();
    Settings.initialize();
    Visualizer.initialize();
    Features.init();
    await Desktop.init();

    const bootStyle = KritrStorage.load("bootStyle", "cute");
    if (KritrStorage.load("boot", true) && bootStyle !== "instant") {
        const boot = document.querySelector("#boot-screen");
        boot?.classList.add("show");
        window.setTimeout(() => boot?.classList.remove("show"), bootStyle === "terminal" ? 1900 : 1600);
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            if (windowElement?.classList.contains("mini-mode")) return;
            const target = tab.dataset.tab;
            tabs.forEach(item => item.classList.toggle("active", item === tab));
            pages.forEach(page => page.classList.toggle("active", page.id === `${target}-tab`));
            KritrStorage.save("lastTab", target);
            if (target === "player") window.setTimeout(() => Visualizer.resize(), 30);
        });
    });

    const lastTab = KritrStorage.load("lastTab", "player");
    if (!windowElement?.classList.contains("mini-mode")) {
        document.querySelector(`.tab[data-tab="${lastTab}"]`)?.click();
    }

    playButton?.addEventListener("click", () => Player.toggle());
    document.querySelector("#previous-btn")?.addEventListener("click", () => Player.previous());
    document.querySelector("#next-btn")?.addEventListener("click", () => Player.next());

    audio.addEventListener("play", () => {
        if (playButton) {
            playButton.textContent = "Ⅱ";
            playButton.setAttribute("aria-label", "Pause");
        }
        if (status) status.textContent = "PLAYING";
        Pet.setPlaying(true);
        windowElement?.classList.add("is-playing");
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "playing";
        Desktop.savePlaybackSoon();
    });

    audio.addEventListener("pause", () => {
        if (playButton) {
            playButton.textContent = "▶";
            playButton.setAttribute("aria-label", "Play");
        }
        if (status) status.textContent = audio.currentTime ? "PAUSED" : "READY";
        Pet.setPlaying(false);
        windowElement?.classList.remove("is-playing");
        if ("mediaSession" in navigator) navigator.mediaSession.playbackState = "paused";
        Desktop.savePlaybackSoon();
    });

    audio.addEventListener("ended", () => Player.next(true));

    audio.addEventListener("loadedmetadata", () => {
        const duration = document.querySelector("#duration");
        if (duration) duration.textContent = formatTime(audio.duration);
    });

    let lastPlaybackSave = 0;
    audio.addEventListener("timeupdate", () => {
        if (!Number.isFinite(audio.duration) || !audio.duration) return;
        if (progress) progress.value = Math.round((audio.currentTime / audio.duration) * 1000);

        const currentTime = document.querySelector("#current-time");
        const duration = document.querySelector("#duration");
        if (currentTime) currentTime.textContent = formatTime(audio.currentTime);
        if (duration) duration.textContent = formatTime(audio.duration);

        if ("mediaSession" in navigator && navigator.mediaSession.setPositionState) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: audio.duration,
                    playbackRate: audio.playbackRate,
                    position: Math.min(audio.currentTime, audio.duration)
                });
            } catch {}
        }

        if (Date.now() - lastPlaybackSave > 4000) {
            lastPlaybackSave = Date.now();
            Desktop.savePlaybackSoon();
        }
    });

    progress?.addEventListener("input", event => {
        if (!Number.isFinite(audio.duration) || !audio.duration) return;
        audio.currentTime = (Number(event.target.value) / 1000) * audio.duration;
        Desktop.savePlaybackSoon();
    });

    const savedVolume = KritrStorage.load("volume", 80);
    const volume = document.querySelector("#volume");
    if (volume) volume.value = savedVolume;
    Player.setVolume(savedVolume);
    volume?.addEventListener("input", event => Player.setVolume(event.target.value));

    const savedSpeed = KritrStorage.load("speed", "1");
    const speed = document.querySelector("#speed");
    if (speed) speed.value = savedSpeed;
    Player.setSpeed(savedSpeed);
    speed?.addEventListener("change", event => {
        Player.setSpeed(event.target.value);
        Desktop.savePlaybackSoon();
    });

    const fileInput = document.querySelector("#file-input");
    const addSongsButton = document.querySelector("#add-songs-btn");

    addSongsButton?.addEventListener("click", () => {
        if (Desktop.isDesktop) Desktop.addFiles();
        else fileInput?.click();
    });

    fileInput?.addEventListener("change", event => {
        if (!Desktop.isDesktop) Playlist.addFiles(event.target.files);
        event.target.value = "";
    });

    let dragDepth = 0;
    ["dragenter", "dragover"].forEach(type => {
        windowElement?.addEventListener(type, event => {
            event.preventDefault();
            if (type === "dragenter") dragDepth++;
            windowElement.classList.add("drag-over");
        });
    });

    windowElement?.addEventListener("dragleave", event => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) windowElement.classList.remove("drag-over");
    });

    windowElement?.addEventListener("drop", event => {
        event.preventDefault();
        dragDepth = 0;
        windowElement.classList.remove("drag-over");
        if (!Desktop.isDesktop) Playlist.addFiles(event.dataTransfer.files);
        else if (status) status.textContent = "IMPORTING...";
    });

    document.querySelector("#clear-playlist")?.addEventListener("click", () => Playlist.clear());
    document.querySelector("#pet-species")?.addEventListener("change", event => Pet.setSpecies(event.target.value));
    document.querySelector("#pet-trick-btn")?.addEventListener("click", () => {
        Pet.trick(document.querySelector("#pet-trick")?.value || "bounce");
    });

    document.querySelector("#pet-display")?.addEventListener("click", () => Pet.interact());
    document.querySelector("#pet-preview")?.addEventListener("click", () => Pet.interact());

    document.querySelector("#minimize-btn")?.addEventListener("click", () => Features.toggleMini());

    document.querySelector("#maximize-btn")?.addEventListener("click", async () => {
        if (Desktop.isDesktop) {
            Features.applyWindowMode("normal");
            const maximized = await Desktop.toggleMaximize();
            windowElement?.classList.toggle("maximized", maximized);
        } else {
            const becomingMaximized = !windowElement?.classList.contains("maximized");
            if (becomingMaximized) {
                Features.applyWindowMode("normal");
                windowElement?.classList.add("maximized");
            } else {
                windowElement?.classList.remove("maximized");
            }
        }
        window.setTimeout(() => Visualizer.resize(), 150);
    });

    document.querySelector("#close-btn")?.addEventListener("click", () => {
        if (Desktop.isDesktop) Desktop.closeWindow();
        else windowElement?.classList.add("hidden-player");
    });

    document.querySelector("#restore-btn")?.addEventListener("click", () => {
        windowElement?.classList.remove("hidden-player");
    });

    window.addEventListener("kritr:basshit", () => {
        Pet.reactToBass();
        if (!KritrStorage.load("reactive", true)) return;
        windowElement?.classList.remove("bass-hit");
        void windowElement?.offsetWidth;
        windowElement?.classList.add("bass-hit");
        window.setTimeout(() => windowElement?.classList.remove("bass-hit"), 220);
    });

    document.addEventListener("keydown", event => {
        const tag = document.activeElement?.tagName;
        const isFormControl = ["INPUT", "SELECT", "TEXTAREA", "BUTTON"].includes(tag);

        if (event.code === "Space" && !isFormControl) {
            event.preventDefault();
            Player.toggle();
        }

        if (!isFormControl && event.code === "ArrowRight" && audio.src) {
            audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + 5);
        }

        if (!isFormControl && event.code === "ArrowLeft" && audio.src) {
            audio.currentTime = Math.max(0, audio.currentTime - 5);
        }
    });

    window.addEventListener("beforeunload", () => Desktop.savePlaybackNow());
    Playlist.render();
    if (status && !Desktop.isDesktop) status.textContent = "READY";
});

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remaining}`;
}
