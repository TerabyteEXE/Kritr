const Playlist = {
    query: "",
    favoritesOnly: false,

    addFiles(files) {
        let added = 0;
        [...files].forEach(file => {
            const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
            if (!isAudio) return;
            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const parts = cleanName.split(/\s+-\s+/);
            const artist = parts.length > 1 ? parts.shift() : "Local File";
            const name = parts.length > 0 ? parts.join(" - ") : cleanName;
            Player.playlist.push({ name, artist, file, url: URL.createObjectURL(file) });
            added++;
        });
        this.render();
        if (Player.currentIndex === -1 && Player.playlist.length) Player.load(0);
        const status = document.querySelector("#status");
        if (status && added) status.textContent = `${added} ADDED`;
        Pet?.say?.(added ? `${added} NEW SONG${added === 1 ? "" : "S"}!` : "NO AUDIO FOUND");
    },

    filteredTracks() {
        return Player.playlist
            .map((track, index) => ({ track, index }))
            .filter(({ track }) => {
                const matches = `${track.artist} ${track.name}`.toLowerCase().includes(this.query.toLowerCase());
                const favorite = !this.favoritesOnly || Features.isFavorite(track);
                return matches && favorite;
            });
    },

    render() {
        const container = document.querySelector("#playlist");
        if (!container) return;
        if (!Player.playlist.length) {
            container.innerHTML = `<div class="empty-playlist"><div class="empty-face">(￣▽￣)</div><strong>NO SONGS YET</strong><span>drop files on Kritr or use ＋ ADD SONG</span></div>`;
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
            item.tabIndex = 0;
            item.setAttribute("role", "button");
            const fav = Features.isFavorite(track);
            item.innerHTML = `
                <span class="playlist-number">${String(index + 1).padStart(2, "0")}</span>
                <span class="playlist-copy"><span class="playlist-name">${this.escape(track.name)}</span><span class="playlist-artist">${this.escape(track.artist || "Local File")}</span></span>
                <button class="playlist-fav" type="button" aria-label="Favorite">${fav ? "♥" : "♡"}</button>
                <span class="playlist-meta">${index === Player.currentIndex ? "NOW" : "LOCAL"}</span>`;
            const activate = () => Player.load(index, true);
            item.addEventListener("click", event => {
                if (event.target.closest(".playlist-fav")) return;
                activate();
            });
            item.addEventListener("keydown", event => {
                if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".playlist-fav")) {
                    event.preventDefault(); activate();
                }
            });
            item.querySelector(".playlist-fav")?.addEventListener("click", event => {
                event.stopPropagation();
                Features.toggleFavorite(track);
            });
            container.appendChild(item);
        });
    },

    setQuery(value) { this.query = String(value || ""); this.render(); },
    toggleFavorites() { this.favoritesOnly = !this.favoritesOnly; this.render(); },

    clear() {
        Player.playlist.forEach(track => URL.revokeObjectURL(track.url));
        Player.playlist = [];
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
        const progress = document.querySelector("#progress"); if (progress) progress.value = 0;
        document.title = "Kritr Player";
        Features?.updateFavoriteButton?.();
        Pet?.say?.("PLAYLIST CLEARED");
    },

    escape(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};
