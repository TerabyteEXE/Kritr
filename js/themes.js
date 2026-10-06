const KritrThemes = {

    set(theme) {

        document.body.dataset.theme = theme;

        KritrStorage.save(
            "theme",
            theme
        );

    },


    load() {

        const theme =
            KritrStorage.load(
                "theme",
                "sakura"
            );

        document.body.dataset.theme =
            theme;

        const selector =
            document.querySelector(
                "#theme-select"
            );

        if (selector) {
            selector.value = theme;
        }

    }

};