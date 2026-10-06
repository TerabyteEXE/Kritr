const KritrApp = {

    booted: false,

    bootTimer: null,


    initialize() {

        this.setupTabs();

        this.setupControls();

        this.setupAudioEvents();

        this.setupFileHandling();

        this.setupPetControls();

        this.setupKeyboard();

        KritrWindow.initialize();

        KritrVisualizer.initialize();

        KritrEffects.initialize();

        KritrPets.initialize();

        KritrSettings.initialize();

        Playlist.render();

        this.startBoot();

    },


    setupTabs() {

        const tabs =
            document.querySelectorAll(
                ".tab"
            );


        tabs.forEach(
            tab => {

                tab.addEventListener(
                    "click",
                    () => {

                        const target =
                            tab.dataset.tab;


                        tabs.forEach(
                            t =>
                                t.classList.remove(
                                    "active"
                                )
                        );


                        document
                            .querySelectorAll(
                                ".tab-panel"
                            )
                            .forEach(
                                panel =>
                                    panel.classList.remove(
                                        "active"
                                    )
                            );


                        tab.classList.add(
                            "active"
                        );


                        const panel =
                            document.getElementById(
                                `${target}-tab`
                            );


                        if (panel) {

                            panel.classList.add(
                                "active"
                            );

                        }

                    }
                );

            }
        );

    },


    setupControls() {

        document.getElementById(
            "play-button"
        ).addEventListener(
            "click",
            () => Player.toggle()
        );


        document.getElementById(
            "previous-track"
        ).addEventListener(
            "click",
            () => Player.previous()
        );


        document.getElementById(
            "next-track"
        ).addEventListener(
            "click",
            () => Player.next()
        );


        document.getElementById(
            "volume"
        ).addEventListener(
            "input",
            event => {

                Player.setVolume(
                    event.target.value
                );

            }
        );


        document.getElementById(
            "speed-down"
        ).addEventListener(
            "click",
            () => {

                Player.setSpeed(
                    Player.speed - 0.1
                );

            }
        );


        document.getElementById(
            "speed-up"
        ).addEventListener(
            "click",
            () => {

                Player.setSpeed(
                    Player.speed + 0.1
                );

            }
        );


        document.getElementById(
            "progress"
        ).addEventListener(
            "input",
            event => {

                if (!audio.duration) {
                    return;
                }

                const percentage =
                    Number(
                        event.target.value
                    ) / 100;

                audio.currentTime =
                    audio.duration *
                    percentage;

            }
        );


        document.getElementById(
            "visualizer-mode-button"
        ).addEventListener(
            "click",
            () => {

                const modes = [
                    "bars",
                    "wave",
                    "dots",
                    "orbit",
                    "pixel",
                    "void"
                ];

                const current =
                    KritrVisualizer.mode;

                const index =
                    modes.indexOf(
                        current
                    );

                const next =
                    modes[
                        (
                            index + 1
                        ) % modes.length
                    ];

                KritrVisualizer.setMode(
                    next
                );

                document.getElementById(
                    "visualizer-select"
                ).value =
                    next;

            }
        );


        document.getElementById(
            "clear-playlist"
        ).addEventListener(
            "click",
            () => Playlist.clear()
        );

    },


    setupAudioEvents() {

        audio.addEventListener(
            "play",
            () => {

                this.setPlayingUI(
                    true
                );

            }
        );


        audio.addEventListener(
            "pause",
            () => {

                this.setPlayingUI(
                    false
                );

            }
        );


        audio.addEventListener(
            "ended",
            () => {

                Player.next();

            }
        );


        audio.addEventListener(
            "timeupdate",
            () => {

                this.updateProgress();

            }
        );


        audio.addEventListener(
            "loadedmetadata",
            () => {

                document.getElementById(
                    "duration"
                ).textContent =
                    this.formatTime(
                        audio.duration
                    );

            }
        );


        audio.addEventListener(
            "error",
            () => {

                this.setStatus(
                    "AUDIO ERROR",
                    false
                );

            }
        );

    },


    setupFileHandling() {

        const input =
            document.getElementById(
                "file-input"
            );


        input.addEventListener(
            "change",
            event => {

                Playlist.addFiles(
                    event.target.files
                );

                event.target.value =
                    "";

            }
        );


        const windowElement =
            document.getElementById(
                "kritr-window"
            );


        windowElement.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                windowElement.classList.add(
                    "dragging"
                );

            }
        );


        windowElement.addEventListener(
            "dragleave",
            () => {

                windowElement.classList.remove(
                    "dragging"
                );

            }
        );


        windowElement.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                windowElement.classList.remove(
                    "dragging"
                );


                Playlist.addFiles(
                    event.dataTransfer.files
                );

            }
        );

    },


    setupPetControls() {

        document.getElementById(
            "pet-species"
        ).addEventListener(
            "change",
            event => {

                KritrPets.setSpecies(
                    event.target.value
                );

            }
        );


        document
            .querySelectorAll(
                "[data-trick]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            KritrPets.trick(
                                button.dataset.trick
                            );

                        }
                    );

                }
            );

    },


    setupKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                const tag =
                    event.target.tagName;

                if (
                    tag === "INPUT" ||
                    tag === "SELECT" ||
                    tag === "TEXTAREA"
                ) {
                    return;
                }


                if (
                    event.code === "Space"
                ) {

                    event.preventDefault();

                    Player.toggle();

                }


                if (
                    event.code === "ArrowRight"
                ) {

                    audio.currentTime =
                        Math.min(
                            audio.duration || 0,
                            (
                                audio.currentTime +
                                5
                            )
                        );

                }


                if (
                    event.code === "ArrowLeft"
                ) {

                    audio.currentTime =
                        Math.max(
                            0,
                            (
                                audio.currentTime -
                                5
                            )
                        );

                }

            }
        );

    },


    setPlayingUI(playing) {

        const button =
            document.getElementById(
                "play-button"
            );


        const indicator =
            document.getElementById(
                "playing-indicator"
            );


        const status =
            document.getElementById(
                "track-status-text"
            );


        if (playing) {

            button.textContent =
                "❚❚";

            button.setAttribute(
                "aria-label",
                "Pause"
            );

            indicator.classList.add(
                "playing"
            );

            status.textContent =
                "PLAYING";

            this.setStatus(
                "PLAYING",
                true
            );

        } else {

            button.textContent =
                "▶";

            button.setAttribute(
                "aria-label",
                "Play"
            );

            indicator.classList.remove(
                "playing"
            );

            status.textContent =
                "PAUSED";

            this.setStatus(
                "PAUSED",
                true
            );

        }

    },


    updateProgress() {

        if (
            !audio.duration ||
            !Number.isFinite(
                audio.duration
            )
        ) {
            return;
        }


        const percentage =
            (
                audio.currentTime /
                audio.duration
            ) * 100;


        document.getElementById(
            "progress"
        ).value =
            percentage;


        document.getElementById(
            "current-time"
        ).textContent =
            this.formatTime(
                audio.currentTime
            );

    },


    setStatus(
        text,
        online = true
    ) {

        document.getElementById(
            "status-text"
        ).textContent =
            text;


        const dot =
            document.getElementById(
                "status-dot"
            );


        dot.classList.toggle(
            "offline",
            !online
        );

    },


    formatTime(seconds) {

        if (
            !Number.isFinite(seconds) ||
            seconds < 0
        ) {
            return "0:00";
        }


        const minutes =
            Math.floor(
                seconds / 60
            );

        const remaining =
            Math.floor(
                seconds % 60
            );


        return (
            minutes +
            ":" +
            String(
                remaining
            ).padStart(
                2,
                "0"
            )
        );

    },


    startBoot() {

        const screen =
            document.getElementById(
                "boot-screen"
            );

        const bar =
            document.getElementById(
                "boot-progress-bar"
            );

        const status =
            document.getElementById(
                "boot-status"
            );

        const skip =
            document.getElementById(
                "skip-boot"
            );


        const messages = [
            "INITIALIZING...",
            "AUDIO ENGINE READY",
            "VISUALIZER CALIBRATED",
            "PET AWAKE",
            "KRITR READY"
        ];


        let progress = 0;


        const finish = () => {

            if (this.booted) {
                return;
            }

            this.booted = true;

            clearInterval(
                this.bootTimer
            );

            screen.classList.add(
                "finished"
            );


            setTimeout(
                () => {

                    screen.remove();

                },
                450
            );

        };


        skip.addEventListener(
            "click",
            finish
        );


        this.bootTimer =
            setInterval(
                () => {

                    progress +=
                        Math.random() *
                        18 +
                        8;


                    progress =
                        Math.min(
                            100,
                            progress
                        );


                    bar.style.width =
                        `${progress}%`;


                    const index =
                        Math.min(
                            messages.length - 1,
                            Math.floor(
                                progress /
                                20
                            )
                        );


                    status.textContent =
                        messages[index];


                    if (
                        progress >= 100
                    ) {

                        setTimeout(
                            finish,
                            350
                        );

                    }

                },
                180
            );

    }

};


KritrApp.initialize();