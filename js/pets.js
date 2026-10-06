const Pet = {
    species: "cat",
    element: document.querySelector(".pet-sprite"),
    preview: document.querySelector("#pet-preview"),

    speciesFaces: {
        cat: "◕ᴗ◕",
        slime: "●ᴗ●",
        bunny: "ᵔᴥᵔ"
    },

    setSpecies(species) {
        if (!this.speciesFaces[species]) species = "cat";
        this.species = species;
        const face = this.speciesFaces[species];

        if (this.element) this.element.textContent = face;
        if (this.preview) this.preview.textContent = face;

        const selector = document.querySelector("#pet-species");
        if (selector) selector.value = species;

        KritrStorage.save("pet", species);
    },

    trick(type) {
        const targets = [this.element, this.preview].filter(Boolean);
        const classes = ["pet-bounce", "pet-spin", "pet-heart"];

        targets.forEach(target => {
            target.classList.remove(...classes);
            void target.offsetWidth;
            target.classList.add(`pet-${type}`);
        });

        window.setTimeout(() => {
            targets.forEach(target => target.classList.remove(...classes));
        }, 900);
    },

    setPlaying(isPlaying) {
        if (!this.element) return;
        this.element.classList.toggle("pet-dance", isPlaying);
    },

    load() {
        this.setSpecies(KritrStorage.load("pet", "cat"));
    }
};
