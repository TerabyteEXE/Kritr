const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const DEFAULT_STATE = {
    version: 1,
    library: {
        folders: [],
        tracks: []
    },
    playback: {
        trackId: null,
        position: 0,
        wasPlaying: false
    },
    nativePrefs: {
        autoStart: false,
        startMinimized: false,
        closeToTray: true,
        notifications: false,
        autoRescan: true
    },
    window: {
        normalBounds: null,
        mode: "normal"
    }
};

let state = null;
let saveTimer = null;

function statePath() {
    return path.join(app.getPath("userData"), "kritr-state.json");
}

function cloneDefault() {
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function mergeState(saved = {}) {
    const base = cloneDefault();
    return {
        ...base,
        ...saved,
        library: {
            ...base.library,
            ...(saved.library || {})
        },
        playback: {
            ...base.playback,
            ...(saved.playback || {})
        },
        nativePrefs: {
            ...base.nativePrefs,
            ...(saved.nativePrefs || {})
        },
        window: {
            ...base.window,
            ...(saved.window || {})
        }
    };
}

function load() {
    if (state) return state;

    try {
        const raw = fs.readFileSync(statePath(), "utf8");
        state = mergeState(JSON.parse(raw));
    } catch {
        state = cloneDefault();
    }

    return state;
}

function saveNow() {
    if (!state) return;

    const file = statePath();
    const temp = `${file}.tmp`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(temp, JSON.stringify(state, null, 2), "utf8");
    fs.renameSync(temp, file);
}

function saveSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 120);
}

function get() {
    return load();
}

function setSection(section, value) {
    load();
    state[section] = value;
    saveSoon();
    return state[section];
}

function patchSection(section, patch) {
    load();
    state[section] = {
        ...(state[section] || {}),
        ...patch
    };
    saveSoon();
    return state[section];
}

module.exports = {
    get,
    setSection,
    patchSection,
    saveNow,
    saveSoon,
    DEFAULT_STATE
};
