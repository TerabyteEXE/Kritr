const Features = {
    favorites: new Set(KritrStorage.load("favorites", [])),
    uiSounds: KritrStorage.load("uiSounds", false),
    soundContext: null,

    trackKey(track) {
        return `${track?.artist || "Local File"}::${track?.name || ""}`.toLowerCase();
    },

    isFavorite(track) { return this.favorites.has(this.trackKey(track)); },

    toggleFavorite(track = Player.playlist[Player.currentIndex]) {
        if (!track) return;
        const key = this.trackKey(track);
        this.favorites.has(key) ? this.favorites.delete(key) : this.favorites.add(key);
        KritrStorage.save("favorites", [...this.favorites]);
        this.updateFavoriteButton();
        Playlist.render();
        Pet?.say?.(this.favorites.has(key) ? "FAVORITE! ♥" : "UNFAVORITED");
    },

    updateFavoriteButton() {
        const button = document.querySelector("#favorite-btn");
        const track = Player.playlist[Player.currentIndex];
        const active = track && this.isFavorite(track);
        if (button) {
            button.textContent = active ? "♥" : "♡";
            button.classList.toggle("active", Boolean(active));
            button.disabled = !track;
        }
    },

    syncPlaybackButtons() {
        const shuffle = document.querySelector("#shuffle-btn");
        const repeat = document.querySelector("#repeat-btn");
        shuffle?.classList.toggle("active", Player.shuffle);
        if (shuffle) shuffle.setAttribute("aria-pressed", String(Player.shuffle));
        if (repeat) {
            repeat.classList.toggle("active", Player.repeat !== "off");
            repeat.textContent = Player.repeat === "one" ? "↻1" : "↻";
            repeat.title = `Repeat: ${Player.repeat}`;
        }
    },

    trackChanged(track) {
        const card = document.querySelector(".track-card");
        card?.classList.remove("track-swap");
        void card?.offsetWidth;
        card?.classList.add("track-swap");
        Pet?.wakeUp?.();
        Pet?.say?.(["GOOD PICK!", "♪ LET'S GO!", "NICE SONG!", "PLAYING NOW ☆"][Math.floor(Math.random() * 4)]);
    },

    applyWindowMode(mode) {
        const win = document.querySelector(".kritr-window");
        const mini = mode === "mini";
        win?.classList.toggle("mini-mode", mini);
        KritrStorage.save("windowMode", mini ? "mini" : "normal");
        setTimeout(() => Visualizer.resize(), 100);
    },

    playUISound(kind = "click") {
        if (!this.uiSounds) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.soundContext ||= new AudioCtx();
        const ctx = this.soundContext;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.value = kind === "tab" ? 560 : kind === "confirm" ? 760 : 430;
        gain.gain.setValueAtTime(0.025, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.04);
    },

    init() {
        this.syncPlaybackButtons();
        this.updateFavoriteButton();
        document.querySelector("#shuffle-btn")?.addEventListener("click", () => Player.toggleShuffle());
        document.querySelector("#repeat-btn")?.addEventListener("click", () => Player.cycleRepeat());
        document.querySelector("#favorite-btn")?.addEventListener("click", () => this.toggleFavorite());
        document.querySelector("#playlist-search")?.addEventListener("input", e => Playlist.setQuery(e.target.value));
        document.querySelector("#favorites-filter")?.addEventListener("click", e => {
            Playlist.toggleFavorites();
            e.currentTarget.classList.toggle("active", Playlist.favoritesOnly);
            e.currentTarget.setAttribute("aria-pressed", String(Playlist.favoritesOnly));
        });

        document.addEventListener("click", e => {
            if (e.target.closest("button,.action-button,.tab")) this.playUISound(e.target.closest(".tab") ? "tab" : "click");
        });

        document.addEventListener("keydown", e => {
            const tag = document.activeElement?.tagName;
            if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;
            if (e.key.toLowerCase() === "s") Player.toggleShuffle();
            if (e.key.toLowerCase() === "r") Player.cycleRepeat();
            if (e.key.toLowerCase() === "m") {
                const mini = !document.querySelector(".kritr-window")?.classList.contains("mini-mode");
                this.applyWindowMode(mini ? "mini" : "normal");
                const select = document.querySelector("#window-mode"); if (select) select.value = mini ? "mini" : "normal";
            }
        });
    }
};
