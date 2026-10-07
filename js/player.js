const audio = document.querySelector("#audio-engine");

const Player = {
    currentIndex: -1,
    playlist: [],
    audioContext: null,
    analyser: null,
    source: null,
    initialized: false,
    shuffle: KritrStorage.load("shuffle", false),
    repeat: KritrStorage.load("repeat", "off"),

    initializeAudio() {
        if (this.initialized) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
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
            if (this.audioContext?.state === "suspended") await this.audioContext.resume();
            await audio.play();
        } catch (error) {
            console.error("Unable to play audio:", error);
            const status = document.querySelector("#status");
            if (status) status.textContent = "PLAY ERROR";
        }
    },

    pause() { audio.pause(); },
    toggle() { if (audio.src) audio.paused ? this.play() : this.pause(); },

    load(index, autoplay = false, options = {}) {
        if (index < 0 || index >= this.playlist.length) return;
        const track = this.playlist[index];
        if (track.missing || !track.url) {
            const status = document.querySelector("#status");
            if (status) status.textContent = "FILE MISSING";
            Pet?.say?.("can't find that song", 1400);
            return;
        }

        this.currentIndex = index;
        audio.src = track.url;
        audio.load();

        const title = document.querySelector("#track-title");
        const artist = document.querySelector("#track-artist");
        const glyph = document.querySelector("#album-glyph");
        const label = document.querySelector("#album-label");
        const art = document.querySelector("#album-art");
        if (title) title.textContent = track.name;
        if (artist) artist.textContent = track.artist || "Local File";
        if (glyph) glyph.textContent = (track.name.trim()[0] || "K").toUpperCase();
        if (label) label.textContent = (track.album || track.name).slice(0, 18).toUpperCase();

        if (art) {
            if (track.artworkUrl) {
                art.style.backgroundImage = `linear-gradient(rgba(12,9,16,.12), rgba(12,9,16,.2)), url("${track.artworkUrl.replace(/"/g, "%22")}")`;
                art.style.backgroundSize = "cover";
                art.style.backgroundPosition = "center";
                art.classList.add("has-artwork");
            } else {
                art.style.backgroundImage = "";
                art.classList.remove("has-artwork");
            }
        }

        document.title = `${track.name} — Kritr`;
        Playlist.render();
        Features?.updateFavoriteButton?.();
        Features?.trackChanged?.(track);
        if (!options.restoring) Desktop?.trackChanged?.(track);
        else Desktop?.updateMediaSession?.(track);
        if (autoplay) this.play();
    },

    next(fromEnded = false) {
        if (!this.playlist.length) return;
        if (fromEnded && this.repeat === "one") {
            audio.currentTime = 0;
            this.play();
            return;
        }

        const queued = Features?.takeQueuedIndex?.() ?? -1;
        if (queued >= 0) {
            this.load(queued, true);
            return;
        }

        const playable = this.playlist
            .map((track, index) => ({ track, index }))
            .filter(({ track }) => !track.missing && track.url);
        if (!playable.length) return;

        let next;
        if (this.shuffle && playable.length > 1) {
            const candidates = playable.map(item => item.index).filter(index => index !== this.currentIndex);
            next = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
            next = this.currentIndex;
            let attempts = 0;
            do {
                next++;
                if (next >= this.playlist.length) {
                    if (fromEnded && this.repeat === "off") {
                        audio.pause();
                        audio.currentTime = 0;
                        Desktop?.savePlaybackSoon?.();
                        return;
                    }
                    next = 0;
                }
                attempts++;
            } while ((this.playlist[next]?.missing || !this.playlist[next]?.url) && attempts <= this.playlist.length);
        }
        this.load(next, true);
    },

    previous() {
        if (!this.playlist.length) return;
        if (audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        let previous = this.currentIndex;
        let attempts = 0;
        do {
            previous = (previous - 1 + this.playlist.length) % this.playlist.length;
            attempts++;
        } while ((this.playlist[previous]?.missing || !this.playlist[previous]?.url) && attempts <= this.playlist.length);
        this.load(previous, true);
    },

    toggleShuffle() {
        this.shuffle = !this.shuffle;
        KritrStorage.save("shuffle", this.shuffle);
        Features?.syncPlaybackButtons?.();
        Pet?.say?.(this.shuffle ? "SHUFFLE ON!" : "SHUFFLE OFF");
    },

    cycleRepeat() {
        const modes = ["off", "all", "one"];
        this.repeat = modes[(modes.indexOf(this.repeat) + 1) % modes.length];
        KritrStorage.save("repeat", this.repeat);
        Features?.syncPlaybackButtons?.();
        Pet?.say?.(`REPEAT ${this.repeat.toUpperCase()}`);
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
