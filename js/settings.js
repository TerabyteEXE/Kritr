const KritrSettings = {

    initialize() {

        const themeSelect =
            document.getElementById(
                "theme-select"
            );

        const visualizerSelect =
            document.getElementById(
                "visualizer-select"
            );

        const scale =
            document.getElementById(
                "ui-scale"
            );

        const crt =
            document.getElementById(
                "crt-toggle"
            );

        const reactivity =
            document.getElementById(
                "reactivity-toggle"
            );


        themeSelect.addEventListener(
            "change",
            () => {

                KritrThemes.set(
                    themeSelect.value
                );

            }
        );


        visualizerSelect.addEventListener(
            "change",
            () => {

                KritrVisualizer.setMode(
                    visualizerSelect.value
                );

            }
        );


        scale.addEventListener(
            "input",
            () => {

                const value =
                    Number(scale.value);

                document.documentElement.style.setProperty(
                    "--ui-scale",
                    value
                );

                KritrStorage.save(
                    "uiScale",
                    value
                );

            }
        );


        crt.addEventListener(
            "change",
            () => {

                document.getElementById(
                    "crt-overlay"
                ).style.display =
                    crt.checked
                        ? "block"
                        : "none";

                KritrStorage.save(
                    "crt",
                    crt.checked
                );

            }
        );


        reactivity.addEventListener(
            "change",
            () => {

                KritrReactivity.enabled =
                    reactivity.checked;

                KritrStorage.save(
                    "reactivity",
                    reactivity.checked
                );

            }
        );


        this.load();

    },


    load() {

        const theme =
            KritrStorage.load(
                "theme",
                "sakura"
            );

        const visualizer =
            KritrStorage.load(
                "visualizer",
                "bars"
            );

        const scale =
            KritrStorage.load(
                "uiScale",
                1
            );

        const crt =
            KritrStorage.load(
                "crt",
                true
            );

        const reactivity =
            KritrStorage.load(
                "reactivity",
                true
            );

        const volume =
            KritrStorage.load(
                "volume",
                0.8
            );

        const speed =
            KritrStorage.load(
                "speed",
                1
            );


        KritrThemes.set(
            theme
        );


        document.getElementById(
            "theme-select"
        ).value =
            theme;


        KritrVisualizer.setMode(
            visualizer
        );


        document.getElementById(
            "visualizer-select"
        ).value =
            visualizer;


        document.getElementById(
            "ui-scale"
        ).value =
            scale;


        document.documentElement.style.setProperty(
            "--ui-scale",
            scale
        );


        document.getElementById(
            "crt-toggle"
        ).checked =
            crt;


        document.getElementById(
            "crt-overlay"
        ).style.display =
            crt
                ? "block"
                : "none";


        document.getElementById(
            "reactivity-toggle"
        ).checked =
            reactivity;


        KritrReactivity.enabled =
            reactivity;


        document.getElementById(
            "volume"
        ).value =
            volume;


        Player.setVolume(
            volume
        );


        Player.setSpeed(
            speed
        );

    }

};