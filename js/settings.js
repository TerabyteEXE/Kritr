const Settings = {
    initialize() {
        const theme = document.querySelector("#theme-select");
        const visualizer = document.querySelector("#visualizer-select");
        const scale = document.querySelector("#ui-scale");
        const crt = document.querySelector("#crt-toggle");
        const reactive = document.querySelector("#reactive-toggle");
        const boot = document.querySelector("#boot-toggle");

        theme?.addEventListener("change", () => KritrThemes.set(theme.value));

        visualizer?.addEventListener("change", () => {
            Visualizer.setMode(visualizer.value);
            KritrStorage.save("visualizer", visualizer.value);
        });

        scale?.addEventListener("input", () => {
            document.documentElement.style.setProperty("--ui-scale", Number(scale.value) / 100);
            KritrStorage.save("scale", Number(scale.value));
        });

        crt?.addEventListener("change", () => {
            document.querySelector("#crt-overlay").style.display = crt.checked ? "block" : "none";
            KritrStorage.save("crt", crt.checked);
        });

        reactive?.addEventListener("change", () => {
            document.querySelector(".kritr-window")?.classList.toggle("reactive-on", reactive.checked);
            if (!reactive.checked) {
                document.documentElement.style.setProperty("--energy", "0");
                document.documentElement.style.setProperty("--bass", "0");
            }
            KritrStorage.save("reactive", reactive.checked);
        });

        boot?.addEventListener("change", () => KritrStorage.save("boot", boot.checked));

        const savedScale = KritrStorage.load("scale", 100);
        if (scale) scale.value = savedScale;
        document.documentElement.style.setProperty("--ui-scale", Number(savedScale) / 100);

        const savedVisualizer = KritrStorage.load("visualizer", "bars");
        if (visualizer) visualizer.value = savedVisualizer;
        Visualizer.setMode(savedVisualizer);

        const savedCRT = KritrStorage.load("crt", true);
        if (crt) crt.checked = savedCRT;
        document.querySelector("#crt-overlay").style.display = savedCRT ? "block" : "none";

        const savedReactive = KritrStorage.load("reactive", true);
        if (reactive) reactive.checked = savedReactive;
        document.querySelector(".kritr-window")?.classList.toggle("reactive-on", savedReactive);

        const savedBoot = KritrStorage.load("boot", true);
        if (boot) boot.checked = savedBoot;
    }
};
