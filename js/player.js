const audio = document.querySelector("#audio-engine");

const Player = {
    currentIndex: -1,
    playlist: [],
    audioContext: null,
    analyser: null,
    source: null,
    initialized: false,

    initializeAudio() {
        if (this.initialized) return;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
            console.warn("Web Audio API is not supported in this browser.");
            return;
        }

        this.audioContext = new AudioCtx();
        this.source = this.audioContext.createMediaElementSource(audio);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.82;

        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
        this.initialized = true;
    },

    async play() {
        if (!audio.src) return;
        this.initializeAudio();

        try {
            if (this.audioContext?.state === "suspended") {
                await this.audioContext.resume();
            }
            await audio.play();
        } catch (error) {
            console.error("Unable to play audio:", error);
            document.querySelector("#status").textContent = "PLAY ERROR";
        }
    },

    pause() {
        audio.pause();
    },

    toggle() {
        if (!audio.src) return;
        audio.paused ? this.play() : this.pause();
    },

    load(index, autoplay = false) {
        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;
        const track = this.playlist[index];
        audio.src = track.url;
        audio.load();

        const title = document.querySelector("#track-title");
        const artist = document.querySelector("#track-artist");
        const glyph = document.querySelector("#album-glyph");
        const label = document.querySelector("#album-label");

        if (title) title.textContent = track.name;
        if (artist) artist.textContent = track.artist || "Local File";
        if (glyph) glyph.textContent = (track.name.trim()[0] || "K").toUpperCase();
        if (label) label.textContent = track.name.slice(0, 18).toUpperCase();

        document.title = `${track.name} — Kritr`;
        Playlist.render();

        if (autoplay) this.play();
    },

    next() {
        if (!this.playlist.length) return;
        const next = (this.currentIndex + 1) % this.playlist.length;
        this.load(next, true);
    },

    previous() {
        if (!this.playlist.length) return;
        const previous = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
        this.load(previous, true);
    },

    setVolume(value) {
        const normalized = Math.max(0, Math.min(100, Number(value)));
        audio.volume = normalized / 100;
        KritrStorage.save("volume", normalized);
    },

    setSpeed(value) {
        audio.playbackRate = Number(value) || 1;
        KritrStorage.save("speed", String(value));
    }
};
