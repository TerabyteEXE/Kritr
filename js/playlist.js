const Playlist = {

    addFiles(files) {

        const fileList =
            Array.from(files);

        for (const file of fileList) {

            if (!file.type.startsWith("audio/")) {
                continue;
            }

            const url =
                URL.createObjectURL(file);

            Player.playlist.push({

                name:
                    file.name.replace(
                        /\.[^/.]+$/,
                        ""
                    ),

                artist:
                    "LOCAL FILE",

                url,

                file

            });

        }

        this.render();

        document.getElementById(
            "track-counter"
        ).textContent =
            `${Player.playlist.length} TRACKS`;

        if (
            Player.currentIndex === -1 &&
            Player.playlist.length > 0
        ) {

            Player.load(
                0,
                false
            );

        }

    },


    render() {

        const container =
            document.getElementById(
                "playlist"
            );

        const empty =
            document.getElementById(
                "playlist-empty"
            );

        container.innerHTML = "";

        if (!Player.playlist.length) {

            empty.style.display =
                "flex";

            return;

        }

        empty.style.display =
            "none";


        Player.playlist.forEach(
            (track, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "playlist-item";

                if (
                    index ===
                    Player.currentIndex
                ) {

                    item.classList.add(
                        "active"
                    );

                }


                item.innerHTML = `
                    <span class="playlist-number">
                        ${String(index + 1).padStart(2, "0")}
                    </span>

                    <span class="playlist-name">
                        ${this.escape(track.name)}
                    </span>

                    <span class="playlist-meta">
                        ${this.escape(track.artist || "LOCAL")}
                    </span>
                `;


                item.addEventListener(
                    "click",
                    () => {

                        Player.load(
                            index,
                            true
                        );

                    }
                );


                container.appendChild(
                    item
                );

            }
        );

    },


    clear() {

        for (const track of Player.playlist) {

            try {

                URL.revokeObjectURL(
                    track.url
                );

            } catch {}

        }

        Player.playlist = [];

        Player.currentIndex = -1;

        audio.pause();

        audio.removeAttribute(
            "src"
        );

        audio.load();

        document.getElementById(
            "track-title"
        ).textContent =
            "Kritr is waiting";

        document.getElementById(
            "track-artist"
        ).textContent =
            "DROP SOME MUSIC IN";

        KritrAlbumArt.clear();

        this.render();

        document.getElementById(
            "track-counter"
        ).textContent =
            "0 TRACKS";

    },


    escape(value) {

        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    }

};