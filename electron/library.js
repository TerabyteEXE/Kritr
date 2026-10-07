const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { pathToFileURL } = require("url");
const { app } = require("electron");
const Store = require("./store");

const AUDIO_EXTENSIONS = new Set([
    ".mp3", ".wav", ".flac", ".ogg", ".m4a", ".aac", ".opus", ".wma", ".aiff", ".aif"
]);

function isAudio(filePath) {
    return AUDIO_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function trackId(filePath) {
    return crypto.createHash("sha1").update(path.resolve(filePath).toLowerCase()).digest("hex");
}

function fallbackName(filePath) {
    const cleanName = path.basename(filePath, path.extname(filePath));
    const parts = cleanName.split(/\s+-\s+/);
    if (parts.length > 1) {
        const artist = parts.shift();
        return { name: parts.join(" - "), artist };
    }
    return { name: cleanName, artist: "Local File" };
}

function artworkDirectory() {
    const dir = path.join(app.getPath("userData"), "artwork");
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}

function mimeExtension(format = "") {
    const value = String(format).toLowerCase();
    if (value.includes("png")) return ".png";
    if (value.includes("webp")) return ".webp";
    if (value.includes("gif")) return ".gif";
    return ".jpg";
}

async function metadataModule() {
    return import("music-metadata");
}

async function parseTrack(filePath, existing = null) {
    const fallback = fallbackName(filePath);
    const stat = fs.statSync(filePath);
    let metadata = null;

    try {
        const { parseFile } = await metadataModule();
        metadata = await parseFile(filePath, { duration: true, skipCovers: false });
    } catch (error) {
        console.warn("Metadata read failed:", filePath, error.message);
    }

    const common = metadata?.common || {};
    const format = metadata?.format || {};
    const id = trackId(filePath);
    let artworkPath = existing?.artworkPath || null;

    if (common.picture?.length) {
        try {
            const picture = common.picture[0];
            const ext = mimeExtension(picture.format);
            artworkPath = path.join(artworkDirectory(), `${id}${ext}`);
            if (!fs.existsSync(artworkPath)) {
                fs.writeFileSync(artworkPath, picture.data);
            }
        } catch (error) {
            console.warn("Artwork cache failed:", error.message);
        }
    }

    return {
        id,
        filePath: path.resolve(filePath),
        name: common.title || fallback.name,
        artist: common.artist || common.albumartist || fallback.artist,
        album: common.album || "",
        year: common.year || null,
        trackNo: common.track?.no || null,
        duration: Number(format.duration) || 0,
        bitrate: Number(format.bitrate) || 0,
        artworkPath,
        addedAt: existing?.addedAt || Date.now(),
        modifiedAt: stat.mtimeMs,
        missing: false
    };
}

function serialize(track) {
    const exists = fs.existsSync(track.filePath);
    return {
        ...track,
        missing: !exists,
        url: exists ? pathToFileURL(track.filePath).href : "",
        artworkUrl: track.artworkPath && fs.existsSync(track.artworkPath)
            ? pathToFileURL(track.artworkPath).href
            : ""
    };
}

function uniquePaths(paths) {
    const seen = new Set();
    return paths
        .map(value => path.resolve(value))
        .filter(value => {
            const key = value.toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

async function walkFolder(folder) {
    const found = [];
    const stack = [folder];

    while (stack.length) {
        const current = stack.pop();
        let entries = [];

        try {
            entries = fs.readdirSync(current, { withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            const full = path.join(current, entry.name);
            if (entry.isDirectory()) stack.push(full);
            else if (entry.isFile() && isAudio(full)) found.push(full);
        }
    }

    return found;
}

async function importPaths(paths) {
    const state = Store.get();
    const existingMap = new Map(state.library.tracks.map(track => [track.id, track]));
    let added = 0;
    let updated = 0;

    for (const filePath of uniquePaths(paths).filter(isAudio)) {
        if (!fs.existsSync(filePath)) continue;

        const id = trackId(filePath);
        const existing = existingMap.get(id);
        let parsed;

        try {
            const stat = fs.statSync(filePath);
            if (existing && existing.modifiedAt === stat.mtimeMs) {
                parsed = { ...existing, missing: false };
            } else {
                parsed = await parseTrack(filePath, existing);
            }
        } catch {
            continue;
        }

        if (existing) updated++;
        else added++;

        existingMap.set(id, parsed);
    }

    state.library.tracks = [...existingMap.values()]
        .sort((a, b) => (a.artist || "").localeCompare(b.artist || "") || (a.name || "").localeCompare(b.name || ""));
    Store.saveSoon();

    return {
        added,
        updated,
        tracks: state.library.tracks.map(serialize)
    };
}

async function addFolder(folder) {
    const state = Store.get();
    const resolved = path.resolve(folder);
    if (!state.library.folders.some(item => item.toLowerCase() === resolved.toLowerCase())) {
        state.library.folders.push(resolved);
    }
    const files = await walkFolder(resolved);
    const result = await importPaths(files);
    Store.saveSoon();
    return {
        ...result,
        folders: [...state.library.folders]
    };
}

async function rescan() {
    const state = Store.get();
    const files = [];

    for (const folder of state.library.folders) {
        if (fs.existsSync(folder)) files.push(...await walkFolder(folder));
    }

    const result = await importPaths(files);
    const foundIds = new Set(files.map(trackId));

    state.library.tracks = state.library.tracks.map(track => ({
        ...track,
        missing: !fs.existsSync(track.filePath) || (state.library.folders.length > 0 && !foundIds.has(track.id) && !fs.existsSync(track.filePath))
    }));
    Store.saveSoon();

    return {
        ...result,
        tracks: state.library.tracks.map(serialize),
        folders: [...state.library.folders]
    };
}

function getLibrary() {
    const state = Store.get();
    return {
        tracks: state.library.tracks.map(serialize),
        folders: [...state.library.folders]
    };
}

function removeTrack(id) {
    const state = Store.get();
    state.library.tracks = state.library.tracks.filter(track => track.id !== id);
    Store.saveSoon();
    return getLibrary();
}

function removeFolder(folder) {
    const state = Store.get();
    const normalized = path.resolve(folder).toLowerCase();
    state.library.folders = state.library.folders.filter(item => path.resolve(item).toLowerCase() !== normalized);
    Store.saveSoon();
    return getLibrary();
}

function clearLibrary() {
    const state = Store.get();
    state.library.tracks = [];
    state.library.folders = [];
    state.playback = { trackId: null, position: 0, wasPlaying: false };
    Store.saveSoon();
    return getLibrary();
}

module.exports = {
    isAudio,
    importPaths,
    addFolder,
    rescan,
    getLibrary,
    removeTrack,
    removeFolder,
    clearLibrary
};
