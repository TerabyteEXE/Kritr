const Settings = {
    initialized: false,

    defaults: {
        uiScale: 100,
        textSize: "normal",
        density: "cozy",
        crt: true,
        crtStrength: 18,
        reactive: true,
        boot: true,
        visualizer: "bars",
        visualizerIntensity: 100,
        petActivity: "normal",
        petReactions: true
    },

    initialize() {
        if (this.initialized) return;
        this.initialized = true;

        const controls = {
            theme: document.querySelector("#theme-select"),
            scale: document.querySelector("#ui-scale"),
            textSize: document.querySelector("#text-size"),
            density: document.querySelector("#ui-density"),
            visualizer: document.querySelector("#visualizer-select"),
            visualizerIntensity: document.querySelector("#visualizer-intensity"),
            crtStrength: document.querySelector("#crt-strength"),
            crt: document.querySelector("#crt-toggle"),
            reactive: document.querySelector("#reactive-toggle"),
            boot: document.querySelector("#boot-toggle"),
            petActivity: document.querySelector("#pet-activity"),
            petReactions: document.querySelector("#pet-reactions")
        };
        const stored = (key, legacyKey) => KritrStorage.load(
            key,
            legacyKey ? KritrStorage.load(legacyKey, this.defaults[key]) : this.defaults[key]
        );
        const boundedNumber = (value, min, max, fallback) => {
            const number = Number(value);
            return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
        };
        const updateReadout = (id, value) => {
            const output = document.querySelector(`[data-for="${id}"]`);
            if (output) output.value = `${value}%`;
        };

        const saved = {
            uiScale: boundedNumber(stored("uiScale", "scale"), 90, 120, this.defaults.uiScale),
            textSize: ["small", "normal", "large"].includes(stored("textSize"))
                ? stored("textSize") : this.defaults.textSize,
            density: ["compact", "cozy"].includes(stored("density"))
                ? stored("density") : this.defaults.density,
            crt: Boolean(stored("crt")),
            crtStrength: boundedNumber(stored("crtStrength"), 0, 100, this.defaults.crtStrength),
            reactive: Boolean(stored("reactive")),
            boot: Boolean(stored("boot")),
            visualizer: ["bars", "wave", "dots", "spectrum"].includes(stored("visualizer"))
                ? stored("visualizer") : this.defaults.visualizer,
            visualizerIntensity: boundedNumber(
                stored("visualizerIntensity"), 50, 150, this.defaults.visualizerIntensity
            ),
            petActivity: ["low", "normal", "high"].includes(stored("petActivity"))
                ? stored("petActivity") : this.defaults.petActivity,
            petReactions: Boolean(stored("petReactions"))
        };

        if (controls.theme) {
            controls.theme.addEventListener("change", () => KritrThemes.set(controls.theme.value));
        }
        if (controls.scale) {
            controls.scale.value = saved.uiScale;
            controls.scale.addEventListener("input", () => {
                const value = boundedNumber(controls.scale.value, 90, 120, this.defaults.uiScale);
                document.documentElement.style.setProperty("--ui-scale", value / 100);
                KritrStorage.save("uiScale", value);
                KritrStorage.save("scale", value);
                updateReadout("ui-scale", value);
            });
        }
        if (controls.textSize) {
            controls.textSize.value = saved.textSize;
            controls.textSize.addEventListener("change", () => {
                const value = ["small", "normal", "large"].includes(controls.textSize.value)
                    ? controls.textSize.value : this.defaults.textSize;
                this.applyTextSize(value);
                KritrStorage.save("textSize", value);
            });
        }
        if (controls.density) {
            controls.density.value = saved.density;
            controls.density.addEventListener("change", () => {
                const value = ["compact", "cozy"].includes(controls.density.value)
                    ? controls.density.value : this.defaults.density;
                document.body.dataset.density = value;
                KritrStorage.save("density", value);
            });
        }
        if (controls.visualizer) {
            controls.visualizer.value = saved.visualizer;
            controls.visualizer.addEventListener("change", () => {
                Visualizer.setMode(controls.visualizer.value);
                KritrStorage.save("visualizer", Visualizer.mode);
            });
        }
        if (controls.visualizerIntensity) {
            controls.visualizerIntensity.value = saved.visualizerIntensity;
            controls.visualizerIntensity.addEventListener("input", () => {
                const value = boundedNumber(
                    controls.visualizerIntensity.value, 50, 150, this.defaults.visualizerIntensity
                );
                this.applyVisualizerIntensity(value);
                KritrStorage.save("visualizerIntensity", value);
                updateReadout("visualizer-intensity", value);
            });
        }
        if (controls.crt) {
            controls.crt.checked = saved.crt;
            controls.crt.addEventListener("change", () => {
                this.applyCRT(controls.crt.checked, controls.crtStrength?.value ?? saved.crtStrength);
                KritrStorage.save("crt", controls.crt.checked);
            });
        }
        if (controls.crtStrength) {
            controls.crtStrength.value = saved.crtStrength;
            controls.crtStrength.addEventListener("input", () => {
                const value = boundedNumber(controls.crtStrength.value, 0, 100, this.defaults.crtStrength);
                this.applyCRT(controls.crt?.checked ?? saved.crt, value);
                KritrStorage.save("crtStrength", value);
                updateReadout("crt-strength", value);
            });
        }
        if (controls.reactive) {
            controls.reactive.checked = saved.reactive;
            controls.reactive.addEventListener("change", () => {
                this.applyReactive(controls.reactive.checked);
                KritrStorage.save("reactive", controls.reactive.checked);
            });
        }
        if (controls.boot) {
            controls.boot.checked = saved.boot;
            controls.boot.addEventListener("change", () => {
                KritrStorage.save("boot", controls.boot.checked);
            });
        }
        if (controls.petActivity) {
            controls.petActivity.value = saved.petActivity;
            controls.petActivity.addEventListener("change", () => {
                Pet.setActivity(controls.petActivity.value);
            });
        }
        if (controls.petReactions) {
            controls.petReactions.checked = saved.petReactions;
            controls.petReactions.addEventListener("change", () => {
                Pet.setReactions(controls.petReactions.checked);
            });
        }

        document.documentElement.style.setProperty("--ui-scale", saved.uiScale / 100);
        this.applyTextSize(saved.textSize);
        document.body.dataset.density = saved.density;
        this.applyCRT(saved.crt, saved.crtStrength);
        this.applyReactive(saved.reactive);
        this.applyVisualizerIntensity(saved.visualizerIntensity);
        Visualizer.setMode(saved.visualizer);
        Pet.setActivity(saved.petActivity);
        Pet.setReactions(saved.petReactions);
        KritrStorage.save("uiScale", saved.uiScale);
        KritrStorage.save("visualizerIntensity", saved.visualizerIntensity);
        KritrStorage.save("crtStrength", saved.crtStrength);

        updateReadout("ui-scale", saved.uiScale);
        updateReadout("visualizer-intensity", saved.visualizerIntensity);
        updateReadout("crt-strength", saved.crtStrength);
    },

    applyTextSize(size) {
        const scales = { small: 0.92, normal: 1, large: 1.12 };
        document.documentElement.style.setProperty("--font-scale", scales[size] || scales.normal);
        document.body.dataset.textSize = size;
    },

    applyVisualizerIntensity(value) {
        document.documentElement.style.setProperty("--viz-intensity", value / 100);
    },

    applyCRT(enabled, strength) {
        document.documentElement.style.setProperty("--crt-opacity", strength / 100);
        const overlay = document.querySelector("#crt-overlay");
        if (overlay) overlay.style.display = enabled ? "block" : "none";
    },

    applyReactive(enabled) {
        document.querySelector(".kritr-window")?.classList.toggle("reactive-on", enabled);
        if (!enabled) {
            document.documentElement.style.setProperty("--energy", "0");
            document.documentElement.style.setProperty("--bass", "0");
        }
    }
};
