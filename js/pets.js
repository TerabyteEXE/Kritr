const Pet = {
    species: "cat",

    element: document.querySelector(".pet-sprite"),
    preview: document.querySelector("#pet-preview"),
    display: document.querySelector("#pet-display"),
    bubble: document.querySelector(".pet-bubble"),

    playing: false,
    activity: "normal",
    reactionsEnabled: true,

    frameIndex: 0,
    idleCounter: 0,
    loopTimer: null,

    speciesFrames: {
        cat: {
            idle: [
                "(=^･ω･^=)",
                "(=^･ｪ･^=)",
                "(=^･ω･^=)",
                "(=－ω－=)"
            ],

            happy: [
                "(=^▽^=)",
                "(=^ω^=)",
                "(=^･ω･^=)"
            ],

            music: [
                "(=^･ω･^=) ♪",
                "(=^ω^=) ♫",
                "(=≧▽≦=) ♪"
            ],

            bass: [
                "(=OωO=)!!",
                "(=≧ω≦=)★",
                "(=^▽^=)!!"
            ],

            sleepy: [
                "(=－ω－=)",
                "(=－ω－=) z",
                "(=－ω－=) zz"
            ]
        },


        slime: {
            idle: [
                "(●´ω｀●)",
                "(●・ω・●)",
                "(●´ω｀●)",
                "(●－ω－●)"
            ],

            happy: [
                "(●⌒ω⌒●)",
                "(●^▽^●)",
                "(●´▽｀●)"
            ],

            music: [
                "(●・ω・●) ♪",
                "(●⌒ω⌒●) ♫",
                "(●≧▽≦●) ♪"
            ],

            bass: [
                "(●OωO●)!!",
                "(●≧ω≦●)★",
                "(●^▽^●)!!"
            ],

            sleepy: [
                "(●－ω－●)",
                "(●－ω－●) z",
                "(●－ω－●) zz"
            ]
        },


        bunny: {
            idle: [
                "／(=･ x ･=)＼",
                "／(=･ω･=)＼",
                "／(=･ x ･=)＼",
                "／(=- x -=)＼"
            ],

            happy: [
                "／(=^ x ^=)＼",
                "／(=^ω^=)＼",
                "／(=≧ x ≦=)＼"
            ],

            music: [
                "／(=･ x ･=)＼ ♪",
                "／(=^ω^=)＼ ♫",
                "／(=≧▽≦=)＼ ♪"
            ],

            bass: [
                "／(=O x O=)＼!!",
                "／(=≧ω≦=)＼★",
                "／(=^▽^=)＼!!"
            ],

            sleepy: [
                "／(=- x -=)＼",
                "／(=- x -=)＼ z",
                "／(=- x -=)＼ zz"
            ]
        }
    },


    init() {
        this.load();
        this.startLifeLoop();
    },


    getFrames(type = "idle") {
        const species =
            this.speciesFrames[this.species]
            || this.speciesFrames.cat;

        return species[type] || species.idle;
    },


    showFrame(frame) {
        if (this.element) {
            this.element.textContent = frame;
        }

        if (this.preview) {
            this.preview.textContent = frame;
        }
    },


    showAnimation(type = "idle") {
        const frames = this.getFrames(type);

        if (!frames.length) {
            return;
        }

        const frame =
            frames[
                this.frameIndex
                % frames.length
            ];

        this.showFrame(frame);

        this.frameIndex++;
    },


    setSpecies(species) {
        if (!this.speciesFrames[species]) {
            species = "cat";
        }

        this.species = species;

        this.frameIndex = 0;

        const selector =
            document.querySelector(
                "#pet-species"
            );

        if (selector) {
            selector.value = species;
        }

        if (this.display) {
            this.display.dataset.species =
                species;
        }

        this.showAnimation("idle");

        KritrStorage.save(
            "petSpecies",
            species
        );

        KritrStorage.save("pet", species);
    },


    setPlaying(isPlaying) {
        this.playing = isPlaying;

        this.frameIndex = 0;
        this.wakeUp();

        if (this.display) {
            this.display.classList.toggle(
                "pet-is-playing",
                isPlaying
            );
        }

        if (this.reactionsEnabled) {
            this.showAnimation(isPlaying ? "music" : "idle");
            if (this.bubble) {
                this.bubble.textContent = isPlaying ? "♪" : "♡";
            }
        }
    },


    getEnergy() {
        const root =
            document.querySelector(
                ".kritr-window"
            );

        if (!root) {
            return 0;
        }

        const value =
            getComputedStyle(root)
                .getPropertyValue("--energy");

        const number =
            parseFloat(value);

        return Number.isFinite(number)
            ? number
            : 0;
    },


    updateLife() {
        if (!this.reactionsEnabled) {
            this.showAnimation("idle");
            if (this.bubble) this.bubble.textContent = "♡";
            return;
        }

        const energy =
            this.getEnergy();

        this.idleCounter++;


        /*
         * MUSIC MODE
         */

        if (this.playing) {

            if (energy > 0.72) {
                this.showAnimation("bass");

                if (this.bubble) {
                    this.bubble.textContent =
                        Math.random() > 0.5
                            ? "★"
                            : "!!";
                }

                return;
            }

            this.showAnimation(energy > 0.28 && Math.random() < 0.35 ? "happy" : "music");
            if (this.bubble) {
                const bubbles = energy > 0.28
                    ? ["♪", "♫", "♥", "☆", "!!"]
                    : ["♪", "♫", "♥"];
                this.bubble.textContent = bubbles[Math.floor(Math.random() * bubbles.length)];
            }

            return;
        }


        /*
         * IDLE MODE
         */

        if (this.idleCounter > 18) {
            this.showAnimation("sleepy");

            if (this.bubble) {
                this.bubble.textContent =
                    "z";
            }

            return;
        }


        /*
         * Occasional little expressions
         */

        if (Math.random() < 0.16) {
            this.showAnimation("happy");

            if (this.bubble) {
                this.bubble.textContent =
                    Math.random() > 0.5
                        ? "♡"
                        : "☆";
            }

            return;
        }


        this.showAnimation("idle");

        if (this.bubble) {
            this.bubble.textContent =
                "♡";
        }
    },


    startLifeLoop() {
        if (this.loopTimer) {
            clearInterval(
                this.loopTimer
            );
        }

        const speeds = {
            low: 1200,
            normal: 700,
            high: 400
        };

        const delay =
            speeds[this.activity]
            || speeds.normal;


        this.loopTimer =
            setInterval(() => {
                this.updateLife();
            }, delay);
    },


    setActivity(level) {
        if (
            ![
                "low",
                "normal",
                "high"
            ].includes(level)
        ) {
            level = "normal";
        }

        this.activity = level;

        this.startLifeLoop();

        KritrStorage.save(
            "petActivity",
            level
        );
    },


    setReactions(enabled) {
        this.reactionsEnabled =
            Boolean(enabled);

        if (this.display) {
            this.display.classList.toggle(
                "pet-reactions-on",
                this.reactionsEnabled
            );
        }

        if (!this.reactionsEnabled) {
            this.showAnimation("idle");
            if (this.bubble) this.bubble.textContent = "♡";
        } else if (this.playing) {
            this.showAnimation("music");
            if (this.bubble) this.bubble.textContent = "♪";
        }

        KritrStorage.save(
            "petReactions",
            this.reactionsEnabled
        );
    },


    wakeUp() {
        this.idleCounter = 0;
    },


    reactToBass() {
        if (!this.reactionsEnabled) {
            return;
        }

        const frames =
            this.getFrames("bass");

        const frame =
            frames[
                Math.floor(
                    Math.random()
                    * frames.length
                )
            ];

        this.showFrame(frame);

        if (this.bubble) {
            this.bubble.textContent =
                "★";
        }

        this.wakeUp();
    },


    trick(type) {
        if (!["bounce", "spin", "heart"].includes(type)) {
            return;
        }

        const targets = [
            this.element,
            this.preview
        ].filter(Boolean);


        const classes = [
            "pet-bounce",
            "pet-spin",
            "pet-heart"
        ];


        targets.forEach(target => {

            target.classList.remove(
                ...classes
            );

            void target.offsetWidth;

            target.classList.add(
                `pet-${type}`
            );

        });


        this.showAnimation("happy");

        this.wakeUp();


        window.setTimeout(() => {

            targets.forEach(target => {

                target.classList.remove(
                    ...classes
                );

            });

        }, 900);
    },


    load() {
        const activity = KritrStorage.load("petActivity", "normal");
        this.activity = ["low", "normal", "high"].includes(activity) ? activity : "normal";
        this.reactionsEnabled = Boolean(KritrStorage.load("petReactions", true));

        this.setSpecies(
            KritrStorage.load("petSpecies", KritrStorage.load("pet", "cat"))
        );
    }
};
// Personality extensions -----------------------------------------------------
Pet.name = KritrStorage.load("petName", "KRITR-CHAN");
Pet.messageTimer = null;

Pet.setName = function(name) {
    const clean = String(name || "KRITR-CHAN").trim().slice(0, 16) || "KRITR-CHAN";
    this.name = clean;
    document.querySelectorAll(".pet-name").forEach(el => el.textContent = clean.toUpperCase());
    const input = document.querySelector("#pet-name-input");
    if (input && input.value !== clean) input.value = clean;
    KritrStorage.save("petName", clean);
};

Pet.say = function(message, duration = 1800) {
    const box = document.querySelector("#pet-message");
    if (!box) return;
    window.clearTimeout(this.messageTimer);
    box.textContent = String(message).slice(0, 28);
    box.classList.remove("message-pop");
    void box.offsetWidth;
    box.classList.add("message-pop");
    this.messageTimer = window.setTimeout(() => {
        box.textContent = this.playing ? "jammin' with you!" : "ready to jam!";
    }, duration);
};

Pet.interact = function() {
    this.wakeUp();
    const lines = this.playing
        ? ["♪♪♪", "THIS ONE! ♥", "TURN IT UP!", "GOOD BEAT!", "WOO!! ☆"]
        : ["HI!!", "PLAY A SONG?", "*poke*", "(≧▽≦)", "I'M AWAKE! ☆"];
    this.say(lines[Math.floor(Math.random() * lines.length)]);
    const tricks = ["bounce", "heart", "bounce", "spin"];
    this.trick(tricks[Math.floor(Math.random() * tricks.length)]);
};

const petBaseInit = Pet.init.bind(Pet);
Pet.init = function() {
    petBaseInit();
    this.setName(KritrStorage.load("petName", "KRITR-CHAN"));
    const input = document.querySelector("#pet-name-input");
    input?.addEventListener("change", () => this.setName(input.value));
    input?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            this.setName(input.value);
            input.blur();
            this.say(`I'M ${this.name.toUpperCase()}!`);
        }
    });
};
