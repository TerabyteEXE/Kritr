const KritrThemes = {
    allowed: ["sakura", "cyber", "gameboy", "synthwave", "omarchy", "oxide", "ice", "amber"],

    set(theme) {
        const next = this.allowed.includes(theme) ? theme : "omarchy";
        document.body.dataset.theme = next;
        KritrStorage.save("theme", next);

        const selector = document.querySelector("#theme-select");
        if (selector && selector.value !== next) selector.value = next;
    },

    load() {
        this.set(KritrStorage.load("theme", "omarchy"));
    }
};
