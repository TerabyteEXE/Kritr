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

    /*
     * Each pet keeps one recognizable silhouette. Reactions only make small
     * changes inside that silhouette, which makes them feel like characters
     * instead of a random kaomoji generator.
     */
    faces: {
        cat: {
            base: " /\\_/\\\n( o.o )\n > ^ <",
            blink: " /\\_/\\\n( -.- )\n > ^ <",
            happy: " /\\_/\\\n( ^.^ )\n > ^ <",
            surprised: " /\\_/\\\n( O.O )\n > ^ <",
            lines: ["nya~", "good song!", "purrr ♪", "i'm listening!"]
        },
        bunny: {
            base: `  /)/)\n ( . .)\n c(")(")`,
            blink: `  /)/)\n ( - -)\n c(")(")`,
            happy: `  /)/)\n ( ^ ^)\n c(")(")`,
            surprised: `  /)/)\n ( O O)\n c(")(")`,
            lines: ["hop hop!", "soft beat~", "one more!", "♪"]
        },
        slime: {
            base: "  .---.\n / o o \\\n|   ᴗ   |\n '-----'",
            blink: "  .---.\n / - - \\\n|   ᴗ   |\n '-----'",
            happy: "  .---.\n / ^ ^ \\\n|   ▽   |\n '-----'",
            surprised: "  .---.\n / O O \\\n|   o   |\n '-----'",
            lines: ["bloop!", "wobble ♪", "squish", "nice beat!"]
        },
        fox: {
            base: " /\\   /\\\n(  •ᴥ•  )\n /  >  \\",
            blink: " /\\   /\\\n(  -ᴥ-  )\n /  >  \\",
            happy: " /\\   /\\\n(  ^ᴥ^  )\n /  >  \\",
            surprised: " /\\   /\\\n(  OᴥO  )\n /  >  \\",
            lines: ["yip!", "tail wag!", "this one!", "☆"]
        },
        frog: {
            base: "  @..@\n (----)\n( >__< )",
            blink: "  @--@\n (----)\n( >__< )",
            happy: "  @^^@\n (----)\n( >__< )",
            surprised: "  @OO@\n (----)\n( >__< )",
            lines: ["ribbit ♪", "cozy!", "good groove", "hop!"]
        },
        girl: {
            base: "  ╭────╮\n (  •‿•  )\n /|  ♡  |\\\n  |     |\n  /     \\",
            blink: "  ╭────╮\n (  -‿-  )\n /|  ♡  |\\\n  |     |\n  /     \\",
            happy: "  ╭────╮\n (  ^▽^  )\n /|  ♡  |\\\n  |     |\n  /     \\",
            surprised: "  ╭────╮\n (  O口O  )\n /|  ♡  |\\\n  |     |\n  /     \\",
            lines: ["this is cute!", "♪♪", "play it again!", "nice choice!"]
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

    currentFaces() { return this.faces[this.species] || this.faces.cat; },
    showFace(face) { if (this.element) this.element.textContent = face; if (this.preview) this.preview.textContent = face; },
    showBase() { this.showFace(this.currentFaces().base); this.setBubble(this.playing ? "♪" : "♡"); },
    setBubble(symbol) { if (this.bubble) this.bubble.textContent = symbol; },

    moment(faceName, duration = 320, bubble = null) {
        if (!this.reactionsEnabled) return;
        clearTimeout(this.reactionTimer);
        this.showFace(this.currentFaces()[faceName] || this.currentFaces().base);
        if (bubble !== null) this.setBubble(bubble);
        this.reactionTimer = setTimeout(() => this.showBase(), duration);
    },

    setSpecies(species) {
        if (!this.faces[species]) species = "cat";
        this.species = species;
        const selector = document.querySelector("#pet-species");
        if (selector) selector.value = species;
        if (this.display) this.display.dataset.species = species;
        KritrStorage.save("petSpecies", species);
        this.showBase();
        this.say(`${species.toUpperCase()} READY`, 1000);
    },

    setPlaying(isPlaying) {
        this.playing = Boolean(isPlaying);
        this.display?.classList.toggle("pet-is-playing", this.playing);
        if (this.playing) this.moment("happy", 420, "♪");
        else this.showBase();
    },

    reactToBass() {
        if (!this.reactionsEnabled || !this.playing) return;
        if (Math.random() < 0.28) this.moment("surprised", 180, "★");
    },

    blink() { if (this.reactionsEnabled) this.moment("blink", 150, this.playing ? "♪" : "♡"); },
    updateLife() { if (this.reactionsEnabled && Math.random() < (this.playing ? 0.14 : 0.24)) this.blink(); },

    startLifeLoop() {
        clearInterval(this.loopTimer);
        const speeds = { low: 10000, normal: 7200, high: 4800 };
        this.loopTimer = setInterval(() => this.updateLife(), speeds[this.activity] || speeds.normal);
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
        this.display?.classList.toggle("pet-reactions-on", this.reactionsEnabled);
        this.showBase();
    },

    trick(type) {
        if (!["bounce", "spin", "heart"].includes(type)) return;
        const targets = [this.element, this.preview].filter(Boolean);
        const classes = ["pet-bounce", "pet-spin", "pet-heart"];
        targets.forEach(target => { target.classList.remove(...classes); void target.offsetWidth; target.classList.add(`pet-${type}`); });
        this.moment("happy", 760, type === "heart" ? "♥" : "☆");
        this.say(type === "heart" ? "love!" : "ta-da!", 1000);
        setTimeout(() => targets.forEach(target => target.classList.remove(...classes)), 900);
    },

    interact() {
        const lines = this.currentFaces().lines || ["hi!"];
        this.say(lines[Math.floor(Math.random() * lines.length)], 1400);
        this.moment("happy", 520, "♡");
    },

    setName(name) {
        const clean = String(name || "KRITR-CHAN").trim().slice(0, 16) || "KRITR-CHAN";
        this.name = clean;
        document.querySelectorAll(".pet-name").forEach(el => el.textContent = clean.toUpperCase());
        const input = document.querySelector("#pet-name-input");
        if (input && input.value !== clean) input.value = clean;
        KritrStorage.save("petName", clean);
    },

    say(message, duration = 1700) {
        const box = document.querySelector("#pet-message");
        if (!box) return;
        clearTimeout(this.messageTimer);
        box.textContent = String(message).slice(0, 30);
        box.classList.remove("message-pop"); void box.offsetWidth; box.classList.add("message-pop");
        this.messageTimer = setTimeout(() => { box.textContent = this.playing ? "listening with you" : "ready when you are"; }, duration);
    },

    bindNameInput() {
        const input = document.querySelector("#pet-name-input");
        if (!input) return;
        input.addEventListener("change", () => this.setName(input.value));
        input.addEventListener("keydown", event => { if (event.key === "Enter") { this.setName(input.value); input.blur(); this.say(`i'm ${this.name}!`, 1300); } });
    },

    load() {
        const activity = KritrStorage.load("petActivity", "normal");
        this.activity = ["low", "normal", "high"].includes(activity) ? activity : "normal";
        this.reactionsEnabled = Boolean(KritrStorage.load("petReactions", true));
        this.name = KritrStorage.load("petName", "KRITR-CHAN");
        this.setSpecies(KritrStorage.load("petSpecies", "cat"));
        this.setName(this.name);
    }
};
