const Playlist = {
    addFiles(files) {
        let added = 0;

        [...files].forEach(file => {
            const isAudio = file.type.startsWith("audio/") || /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
            if (!isAudio) return;

            const cleanName = file.name.replace(/\.[^/.]+$/, "");
            const parts = cleanName.split(/\s+-\s+/);
            const artist = parts.length > 1 ? parts.shift() : "Local File";
            const name = parts.length > 0 ? parts.join(" - ") : cleanName;

            Player.playlist.push({
                name,
                artist,
                file,
                url: URL.createObjectURL(file)
            });
            added++;
        });

        this.render();

        if (Player.currentIndex === -1 && Player.playlist.length) {
            Player.load(0);
        }

        const status = document.querySelector("#status");
        if (status && added) status.textContent = `${added} ADDED`;
    },

    render() {
        const container = document.querySelector("#playlist");
        if (!container) return;

        if (!Player.playlist.length) {
            container.innerHTML = `<div class="empty-playlist">No music loaded.<br><br>Drop files on Kritr or use ＋ ADD MUSIC.</div>`;
            return;
        }

        container.innerHTML = "";

        Player.playlist.forEach((track, index) => {
            const item = document.createElement("div");
            item.className = "playlist-item";
            if (index === Player.currentIndex) item.classList.add("active");
            item.tabIndex = 0;
            item.setAttribute("role", "button");

            item.innerHTML = `
                <span class="playlist-number">${String(index + 1).padStart(2, "0")}</span>
                <span class="playlist-name">${this.escape(track.name)}</span>
                <span class="playlist-meta">${index === Player.currentIndex ? "NOW" : "LOCAL"}</span>
            `;

            const activate = () => Player.load(index, true);
            item.addEventListener("click", activate);
            item.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    activate();
                }
            });

            container.appendChild(item);
        });
    },

    clear() {
        Player.playlist.forEach(track => URL.revokeObjectURL(track.url));
        Player.playlist = [];
        Player.currentIndex = -1;

        audio.pause();
        audio.removeAttribute("src");
        audio.load();

        this.render();

        document.querySelector("#track-title").textContent = "NO TRACK LOADED";
        document.querySelector("#track-artist").textContent = "Drop a song into Kritr";
        document.querySelector("#album-glyph").textContent = "K";
        document.querySelector("#album-label").textContent = "KRITR LOCAL";
        document.querySelector("#progress").value = 0;
        document.querySelector("#current-time").textContent = "0:00";
        document.querySelector("#duration").textContent = "0:00";
        document.title = "Kritr Player";
    },

    escape(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
};
