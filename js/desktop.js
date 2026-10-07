const Desktop = {
    api: window.kritrDesktop || null,
    initialized: false,
    saveTimer: null,

    get isDesktop() {
        return Boolean(this.api?.isDesktop);
    },

    async init() {
        if (!this.isDesktop || this.initialized) return;
        this.initialized = true;
        document.body.classList.add("desktop-app");

        this.bindNativeControls();
        this.bindPlayerCommands();
        this.setupMediaSession();

        const [library, playback, prefs] = await Promise.all([
            this.api.library.get(),
            this.api.playback.get(),
            this.api.prefs.get()
        ]);

        this.applyNativePrefs(prefs);
        Playlist.replaceTracks(library.tracks || []);
        this.updateFolderStatus(library.folders || []);
        this.restorePlayback(playback);

        this.api.onLibraryChanged(libraryUpdate => {
            Playlist.replaceTracks(libraryUpdate.tracks || []);
            this.updateFolderStatus(libraryUpdate.folders || []);
            this.setStatus("LIBRARY SAVED");
        });

        if (prefs.autoRescan) {
            this.rescan({ quiet: true });
        }
    },

    bindNativeControls() {
        document.querySelector("#add-songs-btn")?.addEventListener("click", () => this.addFiles());
        document.querySelector("#add-folder-btn")?.addEventListener("click", () => this.addFolder());
        document.querySelector("#rescan-library")?.addEventListener("click", () => this.rescan());

        const autoStart = document.querySelector("#auto-start");
        const startMinimized = document.querySelector("#start-minimized");
        const closeToTray = document.querySelector("#close-to-tray");
        const notifications = document.querySelector("#track-notifications");
        const autoRescan = document.querySelector("#auto-rescan");

        autoStart?.addEventListener("change", event => this.setPrefs({ autoStart: event.target.checked }));
        startMinimized?.addEventListener("change", event => this.setPrefs({ startMinimized: event.target.checked }));
        closeToTray?.addEventListener("change", event => this.setPrefs({ closeToTray: event.target.checked }));
        notifications?.addEventListener("change", event => this.setPrefs({ notifications: event.target.checked }));
        autoRescan?.addEventListener("change", event => this.setPrefs({ autoRescan: event.target.checked }));
    },

    applyNativePrefs(prefs = {}) {
        const map = {
            "#auto-start": prefs.autoStart,
            "#start-minimized": prefs.startMinimized,
            "#close-to-tray": prefs.closeToTray,
            "#track-notifications": prefs.notifications,
            "#auto-rescan": prefs.autoRescan
        };

        Object.entries(map).forEach(([selector, value]) => {
            const element = document.querySelector(selector);
            if (element) element.checked = Boolean(value);
        });
    },

    async setPrefs(patch) {
        const prefs = await this.api.prefs.set(patch);
        this.applyNativePrefs(prefs);
        return prefs;
    },

    async addFiles() {
        this.setStatus("CHOOSING SONGS...");
        const library = await this.api.library.addFiles();
        Playlist.replaceTracks(library.tracks || []);
        this.updateFolderStatus(library.folders || []);
        this.setStatus("LIBRARY SAVED");
        Pet?.say?.("songs saved!", 1200);
    },

    async addFolder() {
        this.setStatus("SCANNING FOLDER...");
        const library = await this.api.library.addFolder();
        Playlist.replaceTracks(library.tracks || []);
        this.updateFolderStatus(library.folders || []);
        this.setStatus("FOLDER ADDED");
        Pet?.say?.("music folder ready!", 1400);
    },

    async rescan({ quiet = false } = {}) {
        if (!quiet) this.setStatus("RESCANNING...");
        try {
            const library = await this.api.library.rescan();
            Playlist.replaceTracks(library.tracks || []);
            this.updateFolderStatus(library.folders || []);
            if (!quiet) {
                this.setStatus("LIBRARY UPDATED");
                Pet?.say?.("library updated!", 1100);
            }
        } catch (error) {
            console.error("Library rescan failed:", error);
            if (!quiet) this.setStatus("SCAN ERROR");
        }
    },

    async removeTrack(id) {
        const library = await this.api.library.removeTrack(id);
        Playlist.replaceTracks(library.tracks || []);
        this.updateFolderStatus(library.folders || []);
    },

    async clearLibrary() {
        const library = await this.api.library.clear();
        Playlist.replaceTracks(library.tracks || []);
        this.updateFolderStatus(library.folders || []);
    },

    updateFolderStatus(folders) {
        const detail = document.querySelector("#status-detail");
        if (!detail) return;
        detail.textContent = folders.length
            ? `${folders.length} FOLDER${folders.length === 1 ? "" : "S"} · ${Player.playlist.length} SONG${Player.playlist.length === 1 ? "" : "S"}`
            : `DESKTOP LIBRARY · ${Player.playlist.length} SONG${Player.playlist.length === 1 ? "" : "S"}`;
    },

    setStatus(text) {
        const status = document.querySelector("#status");
        if (status) status.textContent = text;
    },

    savePlaybackNow() {
        if (!this.isDesktop) return;
        const track = Player.playlist[Player.currentIndex];
        this.api.playback.save({
            trackId: track?.id || null,
            position: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
            wasPlaying: !audio.paused
        });
    },

    savePlaybackSoon() {
        if (!this.isDesktop) return;
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.savePlaybackNow(), 800);
    },

    restorePlayback(playback = {}) {
        if (!playback.trackId || !Player.playlist.length) return;
        const index = Player.playlist.findIndex(track => track.id === playback.trackId);
        if (index < 0) return;

        const target = Math.max(0, Number(playback.position) || 0);
        audio.addEventListener("loadedmetadata", () => {
            if (target && Number.isFinite(audio.duration)) {
                audio.currentTime = Math.min(target, Math.max(0, audio.duration - 0.25));
            }
        }, { once: true });
        Player.load(index, false, { restoring: true });
    },

    trackChanged(track) {
        if (!this.isDesktop || !track) return;
        this.savePlaybackSoon();
        this.updateMediaSession(track);
        this.api.notify({
            title: track.name || "Kritr",
            body: track.artist ? `${track.artist}${track.album ? ` — ${track.album}` : ""}` : "Now playing"
        });
    },

    bindPlayerCommands() {
        this.api.onPlayerCommand(command => {
            if (command === "toggle") Player.toggle();
            if (command === "next") Player.next();
            if (command === "previous") Player.previous();
            if (command === "mini-on") Features.applyWindowMode("mini", { fromNative: true });
            if (command === "mini-off") Features.applyWindowMode("normal", { fromNative: true });
        });
    },

    setupMediaSession() {
        if (!("mediaSession" in navigator)) return;
        const handlers = {
            play: () => Player.play(),
            pause: () => Player.pause(),
            previoustrack: () => Player.previous(),
            nexttrack: () => Player.next(),
            seekbackward: details => {
                audio.currentTime = Math.max(0, audio.currentTime - (details.seekOffset || 5));
            },
            seekforward: details => {
                audio.currentTime = Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset || 5));
            },
            seekto: details => {
                if (Number.isFinite(details.seekTime)) audio.currentTime = details.seekTime;
            }
        };

        Object.entries(handlers).forEach(([action, handler]) => {
            try { navigator.mediaSession.setActionHandler(action, handler); } catch {}
        });
    },

    updateMediaSession(track) {
        if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
        const artwork = track.artworkUrl
            ? [{ src: track.artworkUrl }]
            : [];
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name || "Unknown Track",
            artist: track.artist || "Local File",
            album: track.album || "",
            artwork
        });
    },

    async setWindowMode(mode) {
        if (!this.isDesktop) return mode;
        return this.api.window.setMode(mode);
    },

    async toggleMaximize() {
        if (!this.isDesktop) return false;
        return this.api.window.toggleMaximize();
    },

    closeWindow() {
        if (this.isDesktop) return this.api.window.close();
    }
};
