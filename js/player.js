const audio =
    document.getElementById("audio-engine");


const Player = {

    currentIndex: -1,

    playlist: [],

    audioContext: null,

    analyser: null,

    source: null,

    volume: 0.8,

    speed: 1,


    initializeAudio() {

        if (this.audioContext) {
            return;
        }

        try {

            this.audioContext =
                new (
                    window.AudioContext ||
                    window.webkitAudioContext
                )();

            this.source =
                this.audioContext.createMediaElementSource(
                    audio
                );

            this.analyser =
                this.audioContext.createAnalyser();

            this.analyser.fftSize = 256;

            this.analyser.smoothingTimeConstant =
                0.82;

            this.source.connect(
                this.analyser
            );

            this.analyser.connect(
                this.audioContext.destination
            );

            KritrReactivity.initialize(
                this.analyser
            );

        } catch (error) {

            console.error(
                "Audio engine failed:",
                error
            );

        }

    },


    async play() {

        if (!audio.src) {
            return;
        }

        this.initializeAudio();

        if (
            this.audioContext &&
            this.audioContext.state === "suspended"
        ) {
            await this.audioContext.resume();
        }

        try {

            await audio.play();

        } catch (error) {

            console.warn(
                "Playback failed:",
                error
            );

        }

    },


    pause() {

        audio.pause();

    },


    toggle() {

        if (audio.paused) {

            this.play();

        } else {

            this.pause();

        }

    },


    load(index, autoplay = true) {

        if (
            index < 0 ||
            index >= this.playlist.length
        ) {
            return;
        }

        this.currentIndex = index;

        const track =
            this.playlist[index];

        audio.src = track.url;

        audio.volume = this.volume;

        audio.playbackRate = this.speed;

        document.getElementById(
            "track-title"
        ).textContent =
            track.name;

        document.getElementById(
            "track-artist"
        ).textContent =
            track.artist || "LOCAL FILE";

        KritrAlbumArt.setTrack(
            track
        );

        Playlist.render();

        if (autoplay) {
            this.play();
        }

    },


    next() {

        if (!this.playlist.length) {
            return;
        }

        const nextIndex =
            (
                this.currentIndex + 1
            ) % this.playlist.length;

        this.load(
            nextIndex,
            true
        );

    },


    previous() {

        if (!this.playlist.length) {
            return;
        }

        const previousIndex =
            (
                this.currentIndex - 1 +
                this.playlist.length
            ) % this.playlist.length;

        this.load(
            previousIndex,
            true
        );

    },


    setVolume(value) {

        const volume =
            Math.max(
                0,
                Math.min(
                    1,
                    Number(value)
                )
            );

        this.volume = volume;

        audio.volume = volume;

        KritrStorage.save(
            "volume",
            volume
        );

    },


    setSpeed(value) {

        const speed =
            Math.max(
                0.5,
                Math.min(
                    2,
                    Number(value)
                )
            );

        this.speed = speed;

        audio.playbackRate = speed;

        document.getElementById(
            "speed-label"
        ).textContent =
            speed.toFixed(1) + "x";

        KritrStorage.save(
            "speed",
            speed
        );

    }

};