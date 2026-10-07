const Playlist = {
    query: "",
    favoritesOnly: false,
    sortMode: KritrStorage.load("playlistSort", "artist"),

    replaceTracks(tracks) {
        const currentId = Player.playlist[Player.currentIndex]?.id || null;
        Player.playlist = Array.isArray(tracks) ? tracks : [];
        Player.currentIndex = currentId
            ? Player.playlist.findIndex(track => track.id === currentId)
            : -1;
        this.render();
        Features?.updateFavoriteButton?.();
    },

    addFiles(files) {
        if (Desktop?.isDesktop) {
            Desktop.addFiles();
            return;
        }

        let added = 0;
        [...files].forEach(file => {
            const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac|opus)$/i.test(file.name);
            if (!isAudio) return;
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const parts = cleanName.split(/\s+-\s+/);
            const artist = parts.length > 1 ? parts.shift() : "Local File";
            const name = parts.length > 0 ? parts.join(" - ") : cleanName;
            Player.playlist.push({ name, artist, file, url: URL.createObjectURL(file), id: `browser-${Date.now()}-${added}` });
            added++;
        });
        this.render();
        if (Player.currentIndex === -1 && Player.playlist.length) Player.load(0);
        const status = document.querySelector("#status");
        if (status && added) status.textContent = `${added} ADDED`;
        Pet?.say?.(added ? `${added} NEW SONG${added === 1 ? "" : "S"}!` : "NO AUDIO FOUND");
    },

    filteredTracks() {
        const rows = Player.playlist
            .map((track, index) => ({ track, index }))
            .filter(({ track }) => {
                const matches = `${track.artist} ${track.album || ""} ${track.name}`.toLowerCase().includes(this.query.toLowerCase());
                const favorite = !this.favoritesOnly || Features.isFavorite(track);
                return matches && favorite;
            });

        return rows.sort((a, b) => {
            if (this.sortMode === "title") {
                return (a.track.name || "").localeCompare(b.track.name || "");
            }
            if (this.sortMode === "added") {
                return Number(b.track.addedAt || 0) - Number(a.track.addedAt || 0);
            }
            return (a.track.artist || "").localeCompare(b.track.artist || "")
                || (a.track.name || "").localeCompare(b.track.name || "");
        });
    },

    render() {
        const container = document.querySelector("#playlist");
        if (!container) return;
        if (!Player.playlist.length) {
            container.innerHTML = `<div class="empty-playlist"><div class="empty-face">(￣▽￣)</div><strong>NO SONGS YET</strong><span>${Desktop?.isDesktop ? "add songs or choose a music folder" : "drop files on Kritr or use ＋ ADD SONG"}</span></div>`;
            return;
        }

        const rows = this.filteredTracks();
        if (!rows.length) {
            container.innerHTML = `<div class="empty-playlist"><div class="empty-face">(・_・;)</div><strong>NOTHING HERE</strong><span>try another search/filter</span></div>`;
            return;
        }

        container.innerHTML = "";
        rows.forEach(({ track, index }) => {
            const item = document.createElement("div");
            item.className = "playlist-item";
            if (index === Player.currentIndex) item.classList.add("active");
            if (track.missing) item.classList.add("missing");
            item.tabIndex = 0;
            item.setAttribute("role", "button");
            const fav = Features.isFavorite(track);
            item.innerHTML = `
                <span class="playlist-number">${String(index + 1).padStart(2, "0")}</span>
                <span class="playlist-copy"><span class="playlist-name">${this.escape(track.name)}</span><span class="playlist-artist">${this.escape(track.artist || "Local File")}${track.album ? ` · ${this.escape(track.album)}` : ""}</span></span>
                <button class="playlist-fav" type="button" aria-label="Favorite">${fav ? "♥" : "♡"}</button>
                <button class="playlist-queue" type="button" aria-label="Play next" title="Play next">→</button>
                ${Desktop?.isDesktop ? `<button class="playlist-remove" type="button" aria-label="Remove from library" title="Remove from library">×</button>` : ""}
                <span class="playlist-meta">${track.missing ? "MISSING" : index === Player.currentIndex ? "NOW" : Features.isQueued(track) ? "NEXT" : Desktop?.isDesktop ? "LIB" : "LOCAL"}</span>`;

            const activate = () => {
                if (track.missing) {
                    Pet?.say?.("file is missing", 1400);
                    const status = document.querySelector("#status");
                    if (status) status.textContent = "FILE MISSING";
                    return;
                }
                Player.load(index, true);
            };

            item.addEventListener("click", event => {
                if (event.target.closest("button")) return;
                activate();
            });
            item.addEventListener("keydown", event => {
                if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) {
                    event.preventDefault();
                    activate();
                }
            });
            item.querySelector(".playlist-fav")?.addEventListener("click", event => {
                event.stopPropagation();
                Features.toggleFavorite(track);
            });
            item.querySelector(".playlist-queue")?.addEventListener("click", event => {
                event.stopPropagation();
                Features.addToQueue(track);
            });
            item.querySelector(".playlist-remove")?.addEventListener("click", async event => {
                event.stopPropagation();
                if (Desktop?.isDesktop && track.id) await Desktop.removeTrack(track.id);
            });
            container.appendChild(item);
        });
    },

    setQuery(value) { this.query = String(value || ""); this.render(); },
    setSort(value) {
        this.sortMode = ["artist", "title", "added"].includes(value) ? value : "artist";
        KritrStorage.save("playlistSort", this.sortMode);
        this.render();
    },
    toggleFavorites() { this.favoritesOnly = !this.favoritesOnly; this.render(); },

    async clear() {
        if (Desktop?.isDesktop) {
            if (!confirm("Clear Kritr's saved library? Your music files will NOT be deleted.")) return;
            await Desktop.clearLibrary();
        } else {
            Player.playlist.forEach(track => {
                if (track.url?.startsWith("blob:")) URL.revokeObjectURL(track.url);
            });
            Player.playlist = [];
        }

        Player.currentIndex = -1;
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        this.render();
        const defaults = {
            "#track-title": "NO TRACK",
            "#track-artist": "add some music!",
            "#album-glyph": "K",
            "#album-label": "KRITR MIX",
            "#current-time": "0:00",
            "#duration": "0:00"
        };
        Object.entries(defaults).forEach(([selector, value]) => {
            const el = document.querySelector(selector); if (el) el.textContent = value;
        });
        const art = document.querySelector("#album-art");
        if (art) art.style.backgroundImage = "";
        const progress = document.querySelector("#progress"); if (progress) progress.value = 0;
        document.title = "Kritr Player";
        Features?.updateFavoriteButton?.();
        Pet?.say?.("LIBRARY CLEARED");
    },

    escape(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};
