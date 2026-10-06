document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* THEMES */

        KritrThemes.load();


        /* SETTINGS */

        Settings.initialize();


        /* PET */

        Pet.load();


        /* VISUALIZER */

        Visualizer.initialize();


        /* TABS */

        const tabs =
            document.querySelectorAll(
                ".tab"
            );


        tabs.forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    const target =
                        tab.dataset.tab;


                    tabs.forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                    document.querySelectorAll(
                        ".tab-page"
                    ).forEach(
                        page =>
                            page.classList.remove(
                                "active"
                            )
                    );


                    tab.classList.add(
                        "active"
                    );


                    document.querySelector(
                        `#${target}-tab`
                    ).classList.add(
                        "active"
                    );

                }
            );

        });


        /* PLAY BUTTON */

        document.querySelector(
            "#play-btn"
        ).addEventListener(
            "click",
            () => {

                Player.toggle();

            }
        );


        /* PREVIOUS */

        document.querySelector(
            "#previous-btn"
        ).addEventListener(
            "click",
            () => {

                Player.previous();

            }
        );


        /* NEXT */

        document.querySelector(
            "#next-btn"
        ).addEventListener(
            "click",
            () => {

                Player.next();

            }
        );


        /* AUDIO EVENTS */

        audio.addEventListener(
            "play",
            () => {

                document.querySelector(
                    "#play-btn"
                ).textContent =
                    "Ⅱ";

                document.querySelector(
                    "#status"
                ).textContent =
                    "PLAYING";

            }
        );


        audio.addEventListener(
            "pause",
            () => {

                document.querySelector(
                    "#play-btn"
                ).textContent =
                    "▶";

                document.querySelector(
                    "#status"
                ).textContent =
                    "PAUSED";

            }
        );


        audio.addEventListener(
            "ended",
            () => {

                Player.next();

            }
        );


        /* PROGRESS */

        audio.addEventListener(
            "timeupdate",
            () => {

                if (
                    !audio.duration
                ) {
                    return;
                }


                const percentage =
                    (
                        audio.currentTime /
                        audio.duration
                    ) * 100;


                document.querySelector(
                    "#progress"
                ).value =
                    percentage;


                document.querySelector(
                    "#current-time"
                ).textContent =
                    formatTime(
                        audio.currentTime
                    );


                document.querySelector(
                    "#duration"
                ).textContent =
                    formatTime(
                        audio.duration
                    );

            }
        );


        document.querySelector(
            "#progress"
        ).addEventListener(
            "input",
            event => {

                if (
                    !audio.duration
                ) {
                    return;
                }


                audio.currentTime =
                    (
                        Number(
                            event.target.value
                        ) / 100
                    ) *
                    audio.duration;

            }
        );


        /* VOLUME */

        const savedVolume =
            KritrStorage.load(
                "volume",
                80
            );


        const volume =
            document.querySelector(
                "#volume"
            );


        volume.value =
            savedVolume;


        Player.setVolume(
            savedVolume
        );


        volume.addEventListener(
            "input",
            event => {

                Player.setVolume(
                    event.target.value
                );

            }
        );


        /* SPEED */

        const speed =
            document.querySelector(
                "#speed"
            );


        const savedSpeed =
            KritrStorage.load(
                "speed",
                "1"
            );


        speed.value =
            savedSpeed;


        Player.setSpeed(
            savedSpeed
        );


        speed.addEventListener(
            "change",
            event => {

                Player.setSpeed(
                    event.target.value
                );

            }
        );


        /* FILE INPUT */

        document.querySelector(
            "#file-input"
        ).addEventListener(
            "change",
            event => {

                Playlist.addFiles(
                    event.target.files
                );

                event.target.value = "";

            }
        );


        /* DRAG AND DROP */

        const windowElement =
            document.querySelector(
                ".kritr-window"
            );


        windowElement.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

            }
        );


        windowElement.addEventListener(
            "drop",
            event => {

                event.preventDefault();

                Playlist.addFiles(
                    event.dataTransfer.files
                );

            }
        );


        /* CLEAR PLAYLIST */

        document.querySelector(
            "#clear-playlist"
        ).addEventListener(
            "click",
            () => {

                Playlist.clear();

            }
        );


        /* PET */

        document.querySelector(
            "#pet-species"
        ).addEventListener(
            "change",
            event => {

                Pet.setSpecies(
                    event.target.value
                );

            }
        );


        document.querySelector(
            "#pet-trick-btn"
        ).addEventListener(
            "click",
            () => {

                const trick =
                    document.querySelector(
                        "#pet-trick"
                    ).value;

                Pet.trick(
                    trick
                );

            }
        );


        /* CLOSE / MINIMIZE */

        document.querySelector(
            "#close-btn"
        ).addEventListener(
            "click",
            () => {

                document.querySelector(
                    ".kritr-window"
                ).style.display =
                    "none";

            }
        );


        document.querySelector(
            "#minimize-btn"
        ).addEventListener(
            "click",
            () => {

                document.querySelector(
                    ".kritr-window"
                ).style.transform =
                    "scale(0.7)";

            }
        );


        /* MAXIMIZE */

        document.querySelector(
            "#maximize-btn"
        ).addEventListener(
            "click",
            () => {

                document.querySelector(
                    ".kritr-window"
                ).classList.toggle(
                    "maximized"
                );

            }
        );


        /* KEYBOARD */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.code ===
                    "Space"
                ) {

                    event.preventDefault();

                    Player.toggle();

                }


                if (
                    event.code ===
                    "ArrowRight"
                ) {

                    audio.currentTime += 5;

                }


                if (
                    event.code ===
                    "ArrowLeft"
                ) {

                    audio.currentTime -= 5;

                }

            }
        );


        document.querySelector(
            "#status"
        ).textContent =
            "READY";

    }
);


/* TIME FORMAT */

function formatTime(seconds) {

    if (
        !Number.isFinite(seconds)
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
        )
        .toString()
        .padStart(
            2,
            "0"
        );


    return `${minutes}:${remaining}`;

}