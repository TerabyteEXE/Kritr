const Pet = {
    species: "cat",
    playing: false,
    activity: "normal",
    reactionsEnabled: true,
    loopTimer: null,
    reactionTimer: null,
    messageTimer: null,
    name: "KRITR-CHAN",

    element: null,
    preview: null,
    display: null,
    bubble: null,

    faces: {
        cat: {
            base: "(=^･ω･^=)",
            blink: "(=^－ω－^=)",
            happy: "(=^▽^=)",
            surprised: "(=OωO=)",
            sleepy: "(=－ω－=)"
        },
        slime: {
            base: "(●´ω｀●)",
            blink: "(●－ω－●)",
            happy: "(●^▽^●)",
            surprised: "(●OωO●)",
            sleepy: "(●－ω－●)"
        },
        bunny: {
            base: "／(=･ x ･=)＼",
            blink: "／(=- x -=)＼",
            happy: "／(=^ x ^=)＼",
            surprised: "／(=O x O=)＼",
            sleepy: "／(=- x -=)＼"
        }
    },

    init() {
        this.element = document.querySelector(".pet-sprite");
        this.preview = document.querySelector("#pet-preview");
        this.display = document.querySelector("#pet-display");
        this.bubble = document.querySelector(".pet-bubble");

        this.load();
        this.bindNameInput();
        this.startLifeLoop();
        this.showBase();
    },

    currentFaces() {
        return this.faces[this.species] || this.faces.cat;
    },

    showFace(face) {
        if (this.element) this.element.textContent = face;
        if (this.preview) this.preview.textContent = face;
    },

    showBase() {
        this.showFace(this.currentFaces().base);
        this.setBubble(this.playing ? "♪" : "♡");
    },

    setBubble(symbol) {
        if (this.bubble) this.bubble.textContent = symbol;
    },

    moment(faceName, duration = 360, bubble = null) {
        if (!this.reactionsEnabled) return;

        window.clearTimeout(this.reactionTimer);
        const face = this.currentFaces()[faceName] || this.currentFaces().base;
        this.showFace(face);
        if (bubble !== null) this.setBubble(bubble);

        this.reactionTimer = window.setTimeout(() => {
            this.showBase();
        }, duration);
    },

    setSpecies(species) {
        if (!this.faces[species]) species = "cat";
        this.species = species;

        const selector = document.querySelector("#pet-species");
        if (selector) selector.value = species;
        if (this.display) this.display.dataset.species = species;

        KritrStorage.save("petSpecies", species);
        KritrStorage.save("pet", species);
        this.showBase();
    },

    setPlaying(isPlaying) {
        this.playing = Boolean(isPlaying);
        if (this.display) {
            this.display.classList.toggle("pet-is-playing", this.playing);
        }

        if (this.playing) {
            this.moment("happy", 500, "♪");
            this.say("let's listen!", 1200);
        } else {
            this.showBase();
        }
    },

    reactToBass() {
        if (!this.reactionsEnabled || !this.playing) return;
        this.moment("surprised", 260, "★");
    },

    blink() {
        if (!this.reactionsEnabled) return;
        this.moment("blink", 180, this.playing ? "♪" : "♡");
    },

    updateLife() {
        if (!this.reactionsEnabled) {
            this.showBase();
            return;
        }

        // The pet should feel like one character, not a slot machine.
        // Most life-loop ticks do nothing. Occasionally it only blinks.
        const chance = this.playing ? 0.22 : 0.32;
        if (Math.random() < chance) this.blink();
    },

    startLifeLoop() {
        if (this.loopTimer) window.clearInterval(this.loopTimer);

        const speeds = {
            low: 9000,
            normal: 6500,
            high: 4200
        };

        this.loopTimer = window.setInterval(
            () => this.updateLife(),
            speeds[this.activity] || speeds.normal
        );
    },

    setActivity(level) {
        if (!["low", "normal", "high"].includes(level)) level = "normal";
        this.activity = level;
        KritrStorage.save("petActivity", level);
        this.startLifeLoop();
    },

    setReactions(enabled) {
        this.reactionsEnabled = Boolean(enabled);
        KritrStorage.save("petReactions", this.reactionsEnabled);
        if (this.display) {
            this.display.classList.toggle("pet-reactions-on", this.reactionsEnabled);
        }
        this.showBase();
    },

    wakeUp() {
        if (this.reactionsEnabled) this.moment("happy", 420, "☆");
    },

    trick(type) {
        if (!["bounce", "spin", "heart"].includes(type)) return;

        const targets = [this.element, this.preview].filter(Boolean);
        const classes = ["pet-bounce", "pet-spin", "pet-heart"];

        targets.forEach(target => {
            target.classList.remove(...classes);
            void target.offsetWidth;
            target.classList.add(`pet-${type}`);
        });

        this.moment("happy", 850, type === "heart" ? "♥" : "☆");
        this.say(type === "heart" ? "love!" : "ta-da!", 1100);

        window.setTimeout(() => {
            targets.forEach(target => target.classList.remove(...classes));
        }, 900);
    },

    interact() {
        const lines = this.playing
            ? ["good song!", "♪", "nice beat!", "i'm listening!"]
            : ["hi!", "play something?", "*poke*", "i'm here!"];

        this.say(lines[Math.floor(Math.random() * lines.length)], 1500);
        this.moment("happy", 650, "♡");
    },

    setName(name) {
        const clean = String(name || "KRITR-CHAN").trim().slice(0, 16) || "KRITR-CHAN";
        this.name = clean;

        document.querySelectorAll(".pet-name").forEach(el => {
            el.textContent = clean.toUpperCase();
        });

        const input = document.querySelector("#pet-name-input");
        if (input && input.value !== clean) input.value = clean;
        KritrStorage.save("petName", clean);
    },

    say(message, duration = 1800) {
        const box = document.querySelector("#pet-message");
        if (!box) return;

        window.clearTimeout(this.messageTimer);
        box.textContent = String(message).slice(0, 28);
        box.classList.remove("message-pop");
        void box.offsetWidth;
        box.classList.add("message-pop");

        this.messageTimer = window.setTimeout(() => {
            box.textContent = this.playing ? "listening with you" : "ready when you are";
        }, duration);
    },

    bindNameInput() {
        const input = document.querySelector("#pet-name-input");
        if (!input) return;

        input.addEventListener("change", () => this.setName(input.value));
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                this.setName(input.value);
                input.blur();
                this.say(`i'm ${this.name}!`, 1400);
            }
        });
    },

    load() {
        const activity = KritrStorage.load("petActivity", "normal");
        this.activity = ["low", "normal", "high"].includes(activity) ? activity : "normal";
        this.reactionsEnabled = Boolean(KritrStorage.load("petReactions", true));
        this.name = KritrStorage.load("petName", "KRITR-CHAN");

        this.setSpecies(KritrStorage.load("petSpecies", KritrStorage.load("pet", "cat")));
        this.setName(this.name);
    }
};
