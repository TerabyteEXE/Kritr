const KritrThemes = {

    current: "sakura",


    set(theme) {

        const allowed = [
            "sakura",
            "cyber",
            "gameboy",
            "synthwave",
            "omarchy"
        ];

        if (!allowed.includes(theme)) {
            theme = "sakura";
        }

        this.current = theme;

        document.body.dataset.theme = theme;

        KritrStorage.save(
            "theme",
            theme
        );

    },


    load() {

        const saved =
            KritrStorage.load(
                "theme",
                "sakura"
            );

        this.set(saved);

    }

};