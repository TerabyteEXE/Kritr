const audio =
    document.querySelector("#audio-engine");


const Player = {

    currentIndex: -1,

    playlist: [],

    audioContext: null,

    analyser: null,

    source: null,

    initialized: false,


    initializeAudio() {

        if (this.initialized) {
            return;
        }

        this.audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

        this.source =
            this.audioContext
                .createMediaElementSource(audio);

        this.analyser =
            this.audioContext
                .createAnalyser();

        this.analyser.fftSize = 128;

        this.source.connect(
            this.analyser
        );

        this.analyser.connect(
            this.audioContext.destination
        );

        this.initialized = true;

    },


    async play() {

        this.initializeAudio();

        if (
            this.audioContext.state ===
            "suspended"
        ) {

            await this.audioContext.resume();

        }

        await audio.play();

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


    load(index, autoplay = false) {

        if (
            index < 0 ||
            index >= this.playlist.length
        ) {
            return;
        }

        this.currentIndex = index;

        const track =
            this.playlist[index];

        audio.src =
            track.url;

        audio.load();

        document.querySelector(
            "#track-title"
        ).textContent =
            track.name;

        document.querySelector(
            "#track-artist"
        ).textContent =
            track.artist || "Unknown Artist";

        Playlist.render();

        if (autoplay) {
            this.play();
        }

    },


    next() {

        if (!this.playlist.length) {
            return;
        }

        let next =
            this.currentIndex + 1;

        if (
            next >=
            this.playlist.length
        ) {
            next = 0;
        }

        this.load(
            next,
            true
        );

    },


    previous() {

        if (!this.playlist.length) {
            return;
        }

        let previous =
            this.currentIndex - 1;

        if (previous < 0) {
            previous =
                this.playlist.length - 1;
        }

        this.load(
            previous,
            true
        );

    },


    setVolume(value) {

        audio.volume =
            value / 100;

        KritrStorage.save(
            "volume",
            value
        );

    },


    setSpeed(value) {

        audio.playbackRate =
            Number(value);

        KritrStorage.save(
            "speed",
            value
        );

    }

};