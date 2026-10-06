const KritrAlbumArt = {

    container:
        document.getElementById(
            "album-art-container"
        ),

    art:
        document.getElementById(
            "album-art"
        ),

    label:
        document.querySelector(
            ".album-art-label"
        ),


    setTrack(track) {

        this.label.textContent =
            "LOCAL AUDIO";

        this.art.classList.remove(
            "track-change"
        );

        void this.art.offsetWidth;

        this.art.classList.add(
            "track-change"
        );


        if (track.art) {

            this.art.style.backgroundImage =
                `url("${track.art}")`;

            this.art.style.backgroundSize =
                "cover";

            this.art.style.backgroundPosition =
                "center";

        } else {

            this.art.style.backgroundImage =
                "";

        }

    },


    clear() {

        this.art.style.backgroundImage =
            "";

        this.label.textContent =
            "NO TRACK";

    }

};