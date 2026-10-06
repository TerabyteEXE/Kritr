const Settings = {
    initialized: false,

    defaults: {
        uiScale: 110,
        textSize: "normal",
        density: "cozy",
        crt: true,
        crtStrength: 18,
        reactive: true,
        boot: true,
        bootStyle: "cute",
        visualizer: "bars",
        visualizerIntensity: 100,
        visualizerColor: "theme",
        bassIntensity: "normal",
        screenShake: true,
        petActivity: "normal",
        petReactions: true,
        uiSounds: false,
        windowMode: "normal"
    },

    initialize() {
        if (this.initialized) return;
        this.initialized = true;

        const $ = id => document.querySelector(`#${id}`);
        const val = (key, allowed = null) => {
            const saved = KritrStorage.load(key, this.defaults[key]);
            return allowed && !allowed.includes(saved) ? this.defaults[key] : saved;
        };
        const num = (key, min, max) => Math.min(max, Math.max(min, Number(val(key)) || this.defaults[key]));
        const readout = (id, value) => {
            const el = document.querySelector(`[data-for="${id}"]`);
            if (el) el.value = `${value}%`;
        };

        const saved = {
            uiScale: num("uiScale", 90, 140),
            textSize: val("textSize", ["small", "normal", "large", "xlarge"]),
            density: val("density", ["compact", "cozy"]),
            crt: Boolean(val("crt")),
            crtStrength: num("crtStrength", 0, 100),
            reactive: Boolean(val("reactive")),
            boot: Boolean(val("boot")),
            bootStyle: val("bootStyle", ["cute", "terminal", "instant"]),
            visualizer: val("visualizer", ["bars", "wave", "dots", "spectrum", "blocks", "stars"]),
            visualizerIntensity: num("visualizerIntensity", 50, 150),
            visualizerColor: val("visualizerColor", ["theme", "mono", "rainbow"]),
            bassIntensity: val("bassIntensity", ["subtle", "normal", "wild"]),
            screenShake: Boolean(val("screenShake")),
            petActivity: val("petActivity", ["low", "normal", "high"]),
            petReactions: Boolean(val("petReactions")),
            uiSounds: Boolean(val("uiSounds")),
            windowMode: val("windowMode", ["normal", "mini"])
        };

        const set = (id, value) => {
            const el = $(id);
            if (!el) return;
            if (el.type === "checkbox") el.checked = Boolean(value);
            else el.value = value;
        };

        set("ui-scale", saved.uiScale);
        set("text-size", saved.textSize);
        set("ui-density", saved.density);
        set("crt-toggle", saved.crt);
        set("crt-strength", saved.crtStrength);
        set("reactive-toggle", saved.reactive);
        set("boot-toggle", saved.boot);
        set("boot-style", saved.bootStyle);
        set("visualizer-select", saved.visualizer);
        set("visualizer-intensity", saved.visualizerIntensity);
        set("visualizer-color", saved.visualizerColor);
        set("bass-intensity", saved.bassIntensity);
        set("screen-shake", saved.screenShake);
        set("pet-activity", saved.petActivity);
        set("pet-reactions", saved.petReactions);
        set("ui-sounds", saved.uiSounds);
        set("window-mode", saved.windowMode);

        this.applyScale(saved.uiScale);
        this.applyTextSize(saved.textSize);
        this.applyDensity(saved.density);
        this.applyCRT(saved.crt, saved.crtStrength);
        this.applyReactive(saved.reactive);
        this.applyVisualizerIntensity(saved.visualizerIntensity);
        Visualizer.setMode(saved.visualizer);
        this.applyVisualizerColor(saved.visualizerColor);
        this.applyBass(saved.bassIntensity, saved.screenShake);
        Pet.setActivity(saved.petActivity);
        Pet.setReactions(saved.petReactions);
        Features.uiSounds = saved.uiSounds;
        Features.applyWindowMode(saved.windowMode);
        document.body.dataset.bootStyle = saved.bootStyle;

        readout("ui-scale", saved.uiScale);
        readout("visualizer-intensity", saved.visualizerIntensity);
        readout("crt-strength", saved.crtStrength);

        $("theme-select")?.addEventListener("change", e => KritrThemes.set(e.target.value));
        $("ui-scale")?.addEventListener("input", e => {
            const v = Number(e.target.value);
            this.applyScale(v);
            KritrStorage.save("uiScale", v);
            readout("ui-scale", v);
        });
        $("text-size")?.addEventListener("change", e => {
            this.applyTextSize(e.target.value);
            KritrStorage.save("textSize", e.target.value);
        });
        $("ui-density")?.addEventListener("change", e => {
            this.applyDensity(e.target.value);
            KritrStorage.save("density", e.target.value);
        });
        $("visualizer-select")?.addEventListener("change", e => {
            Visualizer.setMode(e.target.value);
            KritrStorage.save("visualizer", Visualizer.mode);
        });
        $("visualizer-intensity")?.addEventListener("input", e => {
            const v = Number(e.target.value);
            this.applyVisualizerIntensity(v);
            KritrStorage.save("visualizerIntensity", v);
            readout("visualizer-intensity", v);
        });
        $("visualizer-color")?.addEventListener("change", e => {
            this.applyVisualizerColor(e.target.value);
            KritrStorage.save("visualizerColor", e.target.value);
        });
        $("crt-toggle")?.addEventListener("change", e => {
            this.applyCRT(e.target.checked, Number($("crt-strength")?.value || 18));
            KritrStorage.save("crt", e.target.checked);
        });
        $("crt-strength")?.addEventListener("input", e => {
            const v = Number(e.target.value);
            this.applyCRT($("crt-toggle")?.checked ?? true, v);
            KritrStorage.save("crtStrength", v);
            readout("crt-strength", v);
        });
        $("reactive-toggle")?.addEventListener("change", e => {
            this.applyReactive(e.target.checked);
            KritrStorage.save("reactive", e.target.checked);
        });
        $("bass-intensity")?.addEventListener("change", e => {
            this.applyBass(e.target.value, $("screen-shake")?.checked);
            KritrStorage.save("bassIntensity", e.target.value);
        });
        $("screen-shake")?.addEventListener("change", e => {
            this.applyBass($("bass-intensity")?.value || "normal", e.target.checked);
            KritrStorage.save("screenShake", e.target.checked);
        });
        $("pet-activity")?.addEventListener("change", e => Pet.setActivity(e.target.value));
        $("pet-reactions")?.addEventListener("change", e => Pet.setReactions(e.target.checked));
        $("boot-toggle")?.addEventListener("change", e => KritrStorage.save("boot", e.target.checked));
        $("boot-style")?.addEventListener("change", e => {
            document.body.dataset.bootStyle = e.target.value;
            KritrStorage.save("bootStyle", e.target.value);
        });
        $("window-mode")?.addEventListener("change", e => Features.applyWindowMode(e.target.value));
        $("ui-sounds")?.addEventListener("change", e => {
            Features.uiSounds = e.target.checked;
            KritrStorage.save("uiSounds", e.target.checked);
            Features.playUISound("confirm");
        });
        $("shortcuts-btn")?.addEventListener("click", () => {
            const help = $("shortcut-help");
            if (help) help.hidden = !help.hidden;
        });
        $("reset-settings")?.addEventListener("click", () => {
            if (!confirm("Reset Kritr settings? Your local playlist files are not affected.")) return;

            [
                "uiScale", "textSize", "density", "crt", "crtStrength", "reactive",
                "boot", "bootStyle", "visualizer", "visualizerIntensity", "visualizerColor",
                "bassIntensity", "screenShake", "petActivity", "petReactions", "uiSounds",
                "windowMode", "theme", "shuffle", "repeat"
            ].forEach(key => localStorage.removeItem(`kritr_${key}`));

            location.reload();
        });
    },

    applyScale(value) {
        document.documentElement.style.setProperty(
            "--ui-scale",
            Math.max(0.9, Math.min(1.4, value / 100))
        );
    },

    applyTextSize(value) {
        const scales = {
            small: 0.96,
            normal: 1.06,
            large: 1.18,
            xlarge: 1.32
        };

        document.documentElement.style.setProperty("--font-scale", scales[value] || scales.normal);
        document.body.dataset.textSize = value;
    },

    applyDensity(value) {
        document.body.dataset.density = value;
    },

    applyCRT(on, strength) {
        document.documentElement.style.setProperty(
            "--crt-opacity",
            Math.max(0, Math.min(1, strength / 100))
        );

        const overlay = document.querySelector("#crt-overlay");
        if (overlay) overlay.style.display = on ? "block" : "none";
    },

    applyReactive(on) {
        document.querySelector(".kritr-window")?.classList.toggle("reactive-on", on);
        if (!on) {
            document.documentElement.style.setProperty("--energy", "0");
            document.documentElement.style.setProperty("--bass", "0");
        }
    },

    applyVisualizerIntensity(value) {
        document.documentElement.style.setProperty("--viz-intensity", value / 100);
    },

    applyVisualizerColor(value) {
        Visualizer.colorMode = value;
        document.body.dataset.vizColor = value;
    },

    applyBass(level, shake) {
        document.body.dataset.bassFx = level;
        document.body.dataset.screenShake = shake ? "on" : "off";
    }
};
