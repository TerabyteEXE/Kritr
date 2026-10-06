const KritrThemes = {
    allowed: [
        "sakura", "cyber", "gameboy", "synthwave", "omarchy", "oxide", "ice", "amber",
        "mochi", "bluecrt", "matcha", "candy", "midnight", "famicom", "lavender", "lcd"
    ],

    set(theme) {
        const next = this.allowed.includes(theme) ? theme : "omarchy";
        document.body.dataset.theme = next;
        KritrStorage.save("theme", next);
        const selector = document.querySelector("#theme-select");
        if (selector && selector.value !== next) selector.value = next;
        document.querySelector('meta[name="theme-color"]')?.setAttribute("content", getComputedStyle(document.body).getPropertyValue("--window-bg").trim() || "#17141f");
        Pet?.say?.(`${next.toUpperCase()} MODE!`, 1200);
    },

    load() { this.set(KritrStorage.load("theme", "omarchy")); }
};
