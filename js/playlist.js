const Playlist = {

    addFiles(files) {

        [...files].forEach(file => {

            if (
                !file.type.startsWith("audio/")
            ) {
                return;
            }

            const track = {

                name:
                    file.name
                        .replace(
                            /\.[^/.]+$/,
                            ""
                        ),

                artist:
                    "Local File",

                file,

                url:
                    URL.createObjectURL(file)

            };

            Player.playlist.push(track);

        });

        this.render();

        if (
            Player.currentIndex === -1 &&
            Player.playlist.length
        ) {

            Player.load(0);

        }

    },


    render() {

        const container =
            document.querySelector(
                "#playlist"
            );

        if (
            Player.playlist.length === 0
        ) {

            container.innerHTML =
                `<div class="empty-playlist">
                    No music loaded.
                </div>`;

            return;

        }


        container.innerHTML = "";


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
                        ${index + 1}
                    </span>

                    <span class="playlist-name">
                        ${this.escape(
                            track.name
                        )}
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


                container.appendChild(item);

            }
        );

    },


    clear() {

        Player.playlist
            .forEach(track => {

                URL.revokeObjectURL(
                    track.url
                );

            });

        Player.playlist = [];

        Player.currentIndex = -1;

        audio.pause();

        audio.removeAttribute(
            "src"
        );

        this.render();

        document.querySelector(
            "#track-title"
        ).textContent =
            "NO TRACK LOADED";

        document.querySelector(
            "#track-artist"
        ).textContent =
            "Drop a song into Kritr";

    },


    escape(text) {

        const div =
            document.createElement(
                "div"
            );

        div.textContent = text;

        return div.innerHTML;

    }

};