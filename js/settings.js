const Settings = {

    initialize() {

        const theme =
            document.querySelector(
                "#theme-select"
            );

        const visualizer =
            document.querySelector(
                "#visualizer-select"
            );

        const scale =
            document.querySelector(
                "#ui-scale"
            );

        const crt =
            document.querySelector(
                "#crt-toggle"
            );


        theme.addEventListener(
            "change",
            () => {

                KritrThemes.set(
                    theme.value
                );

            }
        );


        visualizer.addEventListener(
            "change",
            () => {

                Visualizer.setMode(
                    visualizer.value
                );

                KritrStorage.save(
                    "visualizer",
                    visualizer.value
                );

            }
        );


        scale.addEventListener(
            "input",
            () => {

                const value =
                    scale.value / 100;

                document.documentElement.style
                    .setProperty(
                        "--ui-scale",
                        value
                    );

                KritrStorage.save(
                    "scale",
                    scale.value
                );

            }
        );


        crt.addEventListener(
            "change",
            () => {

                document.querySelector(
                    "#crt-overlay"
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


        /* LOAD SAVED SETTINGS */

        const savedScale =
            KritrStorage.load(
                "scale",
                100
            );

        scale.value =
            savedScale;

        document.documentElement.style
            .setProperty(
                "--ui-scale",
                savedScale / 100
            );


        const savedVisualizer =
            KritrStorage.load(
                "visualizer",
                "bars"
            );

        visualizer.value =
            savedVisualizer;

        Visualizer.setMode(
            savedVisualizer
        );


        const savedCRT =
            KritrStorage.load(
                "crt",
                true
            );

        crt.checked =
            savedCRT;

        document.querySelector(
            "#crt-overlay"
        ).style.display =
            savedCRT
                ? "block"
                : "none";

    }

};