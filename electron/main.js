const path = require("path");
const fs = require("fs");
const {
    app,
    BrowserWindow,
    ipcMain,
    dialog,
    Tray,
    Menu,
    nativeImage,
    globalShortcut,
    Notification,
    screen,
    shell
} = require("electron");

const Store = require("./store");
const Library = require("./library");

const APP_NAME = "Kritr";
app.setName(APP_NAME);
const NORMAL_SIZE = { width: 760, height: 820 };
const MINI_SIZE = { width: 520, height: 390 };

let mainWindow = null;
let tray = null;
let isQuitting = false;
let pendingOpenPaths = [];
let suppressBoundsSave = false;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
}

function audioArgs(argv) {
    return argv
        .filter(value => typeof value === "string" && !value.startsWith("--"))
        .filter(value => {
            try {
                return fs.existsSync(value) && fs.statSync(value).isFile() && Library.isAudio(value);
            } catch {
                return false;
            }
        });
}

pendingOpenPaths.push(...audioArgs(process.argv.slice(1)));

function clampBounds(bounds) {
    const area = screen.getDisplayMatching(bounds).workArea;
    const width = Math.min(Math.max(bounds.width || NORMAL_SIZE.width, 420), area.width);
    const height = Math.min(Math.max(bounds.height || NORMAL_SIZE.height, 300), area.height);
    const x = Math.min(Math.max(bounds.x ?? area.x, area.x), area.x + area.width - width);
    const y = Math.min(Math.max(bounds.y ?? area.y, area.y), area.y + area.height - height);
    return { x, y, width, height };
}

function initialBounds() {
    const state = Store.get();
    if (state.window.mode === "mini") {
        if (state.window.miniBounds) return clampBounds({ ...state.window.miniBounds, ...MINI_SIZE });
        const display = screen.getPrimaryDisplay().workArea;
        return {
            width: MINI_SIZE.width,
            height: MINI_SIZE.height,
            x: display.x + Math.max(0, display.width - MINI_SIZE.width - 24),
            y: display.y + Math.max(0, display.height - MINI_SIZE.height - 24)
        };
    }

    if (state.window.normalBounds) {
        return clampBounds(state.window.normalBounds);
    }

    return NORMAL_SIZE;
}

function saveWindowBounds() {
    if (!mainWindow || mainWindow.isDestroyed() || suppressBoundsSave) return;
    if (mainWindow.isMaximized() || mainWindow.isMinimized()) return;
    const state = Store.get();
    const bounds = clampBounds(mainWindow.getBounds());
    if (state.window.mode === "mini") {
        Store.patchSection("window", { miniBounds: bounds });
    } else {
        Store.patchSection("window", { normalBounds: bounds });
    }
}

function sendPlayerCommand(command) {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    mainWindow.webContents.send("player-command", command);
}

function refreshTray() {
    if (!tray) return;

    const prefs = Store.get().nativePrefs;
    tray.setContextMenu(Menu.buildFromTemplate([
        {
            label: "Open Kritr",
            click: () => showWindow()
        },
        { type: "separator" },
        {
            label: "Play / Pause",
            click: () => sendPlayerCommand("toggle")
        },
        {
            label: "Previous",
            click: () => sendPlayerCommand("previous")
        },
        {
            label: "Next",
            click: () => sendPlayerCommand("next")
        },
        { type: "separator" },
        {
            label: Store.get().window.mode === "mini" ? "Pocket Mode" : "Mini Player",
            click: async () => {
                const next = Store.get().window.mode === "mini" ? "normal" : "mini";
                await setWindowMode(next);
                mainWindow?.webContents.send("player-command", next === "mini" ? "mini-on" : "mini-off");
                showWindow();
            }
        },
        {
            label: "Start with Windows",
            type: "checkbox",
            checked: Boolean(prefs.autoStart),
            click: item => updatePrefs({ autoStart: item.checked })
        },
        { type: "separator" },
        {
            label: "Quit Kritr",
            click: () => {
                isQuitting = true;
                app.quit();
            }
        }
    ]));
}

function createTray() {
    if (tray) return;
    const iconPath = path.join(__dirname, "..", "assets", "icons", "kritr.png");
    let icon = nativeImage.createFromPath(iconPath);
    if (!icon.isEmpty()) icon = icon.resize({ width: 20, height: 20 });
    tray = new Tray(icon);
    tray.setToolTip(APP_NAME);
    tray.on("double-click", showWindow);
    tray.on("click", showWindow);
    refreshTray();
}

function registerMediaKeys() {
    [
        ["MediaPlayPause", "toggle"],
        ["MediaNextTrack", "next"],
        ["MediaPreviousTrack", "previous"]
    ].forEach(([accelerator, command]) => {
        try {
            globalShortcut.register(accelerator, () => sendPlayerCommand(command));
        } catch (error) {
            console.warn(`Unable to register ${accelerator}:`, error.message);
        }
    });
}

function showWindow() {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
}

async function setWindowMode(mode) {
    if (!mainWindow || mainWindow.isDestroyed()) return mode;
    const next = mode === "mini" ? "mini" : "normal";
    const state = Store.get();
    suppressBoundsSave = true;

    try {
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        const current = clampBounds(mainWindow.getBounds());

        if (next === "mini") {
            if (state.window.mode !== "mini") {
                Store.patchSection("window", { normalBounds: current, mode: "mini" });
            }
            const savedMini = Store.get().window.miniBounds;
            const target = savedMini
                ? clampBounds({ ...savedMini, ...MINI_SIZE })
                : clampBounds({ x: current.x, y: current.y, ...MINI_SIZE });
            mainWindow.setBounds(target, false);
        } else {
            if (state.window.mode === "mini") {
                Store.patchSection("window", { miniBounds: current, mode: "normal" });
            }
            const savedNormal = Store.get().window.normalBounds;
            const target = savedNormal
                ? clampBounds(savedNormal)
                : clampBounds({ x: current.x, y: current.y, ...NORMAL_SIZE });
            mainWindow.setBounds(target, false);
        }
        Store.patchSection("window", { mode: next });
    } finally {
        setTimeout(() => { suppressBoundsSave = false; saveWindowBounds(); }, 80);
    }

    refreshTray();
    return next;
}

function applyAutoStart(enabled) {
    if (process.platform !== "win32") return;
    app.setLoginItemSettings({
        openAtLogin: Boolean(enabled),
        path: process.execPath,
        args: app.isPackaged
            ? ["--autostart"]
            : [path.join(__dirname, ".."), "--autostart"]
    });
}

function updatePrefs(patch) {
    const prefs = Store.patchSection("nativePrefs", patch || {});
    if (Object.prototype.hasOwnProperty.call(patch || {}, "autoStart")) {
        applyAutoStart(prefs.autoStart);
    }
    refreshTray();
    return prefs;
}

async function importPendingPaths() {
    if (!pendingOpenPaths.length) return;
    const paths = [...new Set(pendingOpenPaths)];
    pendingOpenPaths = [];
    const result = await Library.importPaths(paths);
    mainWindow?.webContents.send("library-changed", {
        tracks: result.tracks,
        folders: Store.get().library.folders
    });
}

function createWindow() {
    const state = Store.get();
    const bounds = initialBounds();

    mainWindow = new BrowserWindow({
        ...bounds,
        minWidth: 360,
        minHeight: 300,
        show: false,
        frame: false,
        backgroundColor: "#181420",
        icon: path.join(__dirname, "..", "assets", "icons", "kritr.png"),
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

    mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    mainWindow.webContents.on("will-navigate", event => {
        const target = event.url;
        if (!target.startsWith("file://")) event.preventDefault();
    });

    mainWindow.once("ready-to-show", () => {
        const prefs = Store.get().nativePrefs;
        const launchedAtLogin = process.argv.includes("--autostart");
        if (!(prefs.startMinimized && launchedAtLogin)) mainWindow.show();
        else mainWindow.hide();
    });

    mainWindow.webContents.on("did-finish-load", async () => {
        if (state.window.mode === "mini") {
            mainWindow.webContents.send("player-command", "mini-on");
        }
        await importPendingPaths();
    });

    let moveTimer = null;
    const remember = () => {
        clearTimeout(moveTimer);
        moveTimer = setTimeout(saveWindowBounds, 300);
    };
    mainWindow.on("move", remember);
    mainWindow.on("resize", remember);

    mainWindow.on("close", event => {
        const prefs = Store.get().nativePrefs;
        if (!isQuitting && prefs.closeToTray) {
            event.preventDefault();
            mainWindow.hide();
            return;
        }
        saveWindowBounds();
    });

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

function wireIpc() {
    ipcMain.handle("library:get", () => Library.getLibrary());
    ipcMain.handle("library:import-paths", async (_event, paths) => {
        const imported = await Library.importPaths(Array.isArray(paths) ? paths : []);
        const library = { tracks: imported.tracks, folders: [...Store.get().library.folders] };
        mainWindow?.webContents.send("library-changed", library);
        return library;
    });

    ipcMain.handle("library:add-files", async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Add songs to Kritr",
            properties: ["openFile", "multiSelections"],
            filters: [{
                name: "Audio",
                extensions: ["mp3", "wav", "flac", "ogg", "m4a", "aac", "opus", "wma", "aiff", "aif"]
            }]
        });
        if (result.canceled) return Library.getLibrary();
        const imported = await Library.importPaths(result.filePaths);
        return { tracks: imported.tracks, folders: [...Store.get().library.folders] };
    });

    ipcMain.handle("library:add-folder", async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            title: "Choose your music folder",
            properties: ["openDirectory"]
        });
        if (result.canceled || !result.filePaths[0]) return Library.getLibrary();
        return Library.addFolder(result.filePaths[0]);
    });

    ipcMain.handle("library:rescan", () => Library.rescan());
    ipcMain.handle("library:remove-track", (_event, id) => Library.removeTrack(id));
    ipcMain.handle("library:remove-folder", (_event, folder) => Library.removeFolder(folder));
    ipcMain.handle("library:clear", () => Library.clearLibrary());

    ipcMain.handle("playback:get", () => Store.get().playback);
    ipcMain.handle("playback:save", (_event, playback) => Store.patchSection("playback", playback || {}));

    ipcMain.handle("prefs:get", () => Store.get().nativePrefs);
    ipcMain.handle("prefs:set", (_event, patch) => updatePrefs(patch));

    ipcMain.handle("window:set-mode", (_event, mode) => setWindowMode(mode));
    ipcMain.handle("window:toggle-maximize", () => {
        if (!mainWindow) return false;
        if (mainWindow.isMaximized()) mainWindow.unmaximize();
        else mainWindow.maximize();
        return mainWindow.isMaximized();
    });
    ipcMain.handle("window:close", () => {
        if (mainWindow) mainWindow.close();
    });
    ipcMain.handle("window:show", () => showWindow());


    ipcMain.handle("external:open", async (_event, url) => {
        const value = String(url || "");
        if (!/^https:\/\//i.test(value)) return false;
        await shell.openExternal(value);
        return true;
    });

    ipcMain.handle("notification:show", (_event, payload = {}) => {
        if (!Store.get().nativePrefs.notifications || !Notification.isSupported()) return false;
        const notification = new Notification({
            title: payload.title || "Kritr",
            body: payload.body || "",
            icon: payload.iconPath && fs.existsSync(payload.iconPath)
                ? payload.iconPath
                : path.join(__dirname, "..", "assets", "icons", "kritr.png")
        });
        notification.show();
        return true;
    });
}

app.on("second-instance", async (_event, argv) => {
    pendingOpenPaths.push(...audioArgs(argv));
    showWindow();
    await importPendingPaths();
});

app.on("open-file", (event, filePath) => {
    event.preventDefault();
    if (Library.isAudio(filePath)) pendingOpenPaths.push(filePath);
});

app.whenReady().then(() => {
    if (process.platform === "win32") app.setAppUserModelId("com.terabyteexe.kritr");
    Store.get();
    wireIpc();
    applyAutoStart(Store.get().nativePrefs.autoStart);
    createWindow();
    createTray();
    registerMediaKeys();

    app.on("activate", () => {
        if (!mainWindow) createWindow();
        else showWindow();
    });
});

app.on("before-quit", () => {
    isQuitting = true;
    saveWindowBounds();
    Store.saveNow();
});

app.on("will-quit", () => {
    globalShortcut.unregisterAll();
});

app.on("window-all-closed", event => {
    // Kritr is tray-first. Quit only from the tray menu or app shutdown.
    if (process.platform !== "darwin" && !Store.get().nativePrefs.closeToTray) app.quit();
});
