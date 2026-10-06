const KritrPets = {

    species: "cat",

    moods: {
        cat: [
            "READY...",
            "VIBING...",
            "MEOW.EXE",
            "GOOD SONG",
            "VERY NICE"
        ],

        slime: [
            "BLORB...",
            "BOUNCING...",
            "SLIME MODE",
            "GROOVY",
            "SQUISH"
        ],

        bunny: [
            "HOP...",
            "VIBING...",
            "HOP HOP",
            "GOOD BEAT",
            "BUNNY MODE"
        ]
    },


    faces: {

        cat:
            "ฅ^•ﻌ•^ฅ",

        slime:
            "●ᴗ●",

        bunny:
            "ᵔᴥᵔ"

    },


    initialize() {

        this.load();

    },


    setSpecies(species) {

        if (!this.faces[species]) {
            return;
        }

        this.species =
            species;

        document.getElementById(
            "pet-sprite"
        ).textContent =
            this.faces[species];

        KritrStorage.save(
            "pet",
            species
        );

        this.setMood(
            this.moods[species][0]
        );

    },


    load() {

        const saved =
            KritrStorage.load(
                "pet",
                "cat"
            );

        this.setSpecies(
            saved
        );

    },


    setMood(text) {

        document.getElementById(
            "pet-mood"
        ).textContent =
            text;

    },


    trick(type) {

        const sprite =
            document.getElementById(
                "pet-sprite"
            );

        sprite.classList.remove(
            "pet-bounce",
            "pet-spin",
            "pet-heart"
        );

        void sprite.offsetWidth;


        if (
            type === "bounce"
        ) {

            sprite.classList.add(
                "pet-bounce"
            );

            this.setMood(
                "BOING!"
            );

        }


        if (
            type === "spin"
        ) {

            sprite.classList.add(
                "pet-spin"
            );

            this.setMood(
                "WHEEEEE!"
            );

        }


        if (
            type === "heart"
        ) {

            sprite.classList.add(
                "pet-heart"
            );

            this.setMood(
                "♥♥♥"
            );

        }

    },


    reactToMusic() {

        if (
            !audio ||
            audio.paused
        ) {
            return;
        }


        const messages =
            this.moods[
                this.species
            ];


        const random =
            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ];


        this.setMood(
            random
        );

        this.trick(
            "bounce"
        );

    }

};