const Pet = {

    species: "cat",

    element:
        document.querySelector(
            ".pet-sprite"
        ),


    speciesFaces: {

        cat: "◕ᴗ◕",

        slime: "●ᴗ●",

        bunny: "ᵔᴥᵔ"

    },


    setSpecies(species) {

        this.species =
            species;

        this.element.textContent =
            this.speciesFaces[
                species
            ];

        KritrStorage.save(
            "pet",
            species
        );

    },


    trick(type) {

        this.element.classList.remove(
            "pet-bounce",
            "pet-spin",
            "pet-heart"
        );


        void this.element.offsetWidth;


        if (type === "bounce") {

            this.element.classList.add(
                "pet-bounce"
            );

        }

        if (type === "spin") {

            this.element.classList.add(
                "pet-spin"
            );

        }

        if (type === "heart") {

            this.element.classList.add(
                "pet-heart"
            );

        }

    },


    load() {

        const species =
            KritrStorage.load(
                "pet",
                "cat"
            );

        this.setSpecies(
            species
        );

    }

};