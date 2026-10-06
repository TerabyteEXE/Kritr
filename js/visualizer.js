const Visualizer = {
    canvas: document.querySelector("#visualizer"),
    ctx: null,
    frequencyData: null,
    timeData: null,
    mode: "bars",
    energy: 0,
    bass: 0,
    lastBassHit: 0,
    particles: [],
    resizeObserver: null,

    initialize() {
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.resize();

        if ("ResizeObserver" in window) {
            this.resizeObserver = new ResizeObserver(() => this.resize());
            this.resizeObserver.observe(this.canvas.parentElement);
        } else {
            window.addEventListener("resize", () => this.resize());
        }

        for (let i = 0; i < 28; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                size: 0.4 + Math.random() * 1.4,
                drift: 0.04 + Math.random() * 0.08
            });
        }

        requestAnimationFrame(() => this.render());
    },

    resize() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(rect.width * dpr));
        const height = Math.max(1, Math.floor(rect.height * dpr));

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }

        this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.cssWidth = rect.width;
        this.cssHeight = rect.height;
    },

    ensureData() {
        if (!Player.analyser) return false;
        const bins = Player.analyser.frequencyBinCount;
        if (!this.frequencyData || this.frequencyData.length !== bins) {
            this.frequencyData = new Uint8Array(bins);
            this.timeData = new Uint8Array(Player.analyser.fftSize);
        }
        return true;
    },

    render() {
        requestAnimationFrame(() => this.render());
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const width = this.cssWidth || this.canvas.clientWidth;
        const height = this.cssHeight || this.canvas.clientHeight;
        ctx.clearRect(0, 0, width, height);

        const styles = getComputedStyle(document.body);
        const primary = styles.getPropertyValue("--accent-main").trim() || "#ffffff";
        const secondary = styles.getPropertyValue("--accent-secondary").trim() || primary;

        if (!this.ensureData()) {
            this.energy *= 0.94;
            this.bass *= 0.9;
            this.pushEnergy();
            this.drawIdle(ctx, width, height, primary, secondary);
            return;
        }

        Player.analyser.getByteFrequencyData(this.frequencyData);
        Player.analyser.getByteTimeDomainData(this.timeData);

        this.measureEnergy();
        this.pushEnergy();
        this.drawParticles(ctx, width, height, primary);

        switch (this.mode) {
            case "wave":
                this.drawWave(ctx, width, height, secondary);
                break;
            case "dots":
                this.drawDots(ctx, width, height, primary);
                break;
            case "spectrum":
                this.drawSpectrum(ctx, width, height, primary, secondary);
                break;
            default:
                this.drawBars(ctx, width, height, primary, secondary);
        }
    },

    measureEnergy() {
        let total = 0;
        for (let i = 0; i < this.frequencyData.length; i++) total += this.frequencyData[i];

        const instantEnergy = total / this.frequencyData.length / 255;
        this.energy += (instantEnergy - this.energy) * 0.16;

        const bassBins = Math.max(3, Math.floor(this.frequencyData.length * 0.11));
        let bassTotal = 0;
        for (let i = 0; i < bassBins; i++) bassTotal += this.frequencyData[i];

        const instantBass = bassTotal / bassBins / 255;
        this.bass += (instantBass - this.bass) * 0.28;

        if (!audio.paused && instantBass > 0.72 && this.energy > 0.2) {
            const now = performance.now();
            if (now - this.lastBassHit > 250) {
                this.lastBassHit = now;
                window.dispatchEvent(new CustomEvent("kritr:basshit", {
                    detail: { bass: instantBass, energy: this.energy }
                }));
            }
        }
    },

    pushEnergy() {
        const reactive = KritrStorage.load("reactive", true);
        const root = document.documentElement;
        root.style.setProperty("--energy", reactive ? this.energy.toFixed(3) : "0");
        root.style.setProperty("--bass", reactive ? this.bass.toFixed(3) : "0");

        const readout = document.querySelector("#energy-readout");
        if (readout) {
            readout.textContent = audio.paused ? "IDLE" : `LVL ${Math.round(this.energy * 99).toString().padStart(2, "0")}`;
        }
    },

    drawParticles(ctx, width, height, color) {
        if (this.energy < 0.03) return;

        ctx.save();
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.08 + this.energy * 0.18;

        for (const particle of this.particles) {
            particle.y -= particle.drift * (0.35 + this.energy * 1.5) / 60;
            if (particle.y < -0.05) {
                particle.y = 1.05;
                particle.x = Math.random();
            }
            ctx.fillRect(particle.x * width, particle.y * height, particle.size, particle.size);
        }
        ctx.restore();
    },

    drawIdle(ctx, width, height, primary, secondary) {
        const t = performance.now() / 900;
        const center = height * 0.52;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, secondary);
        gradient.addColorStop(0.5, primary);
        gradient.addColorStop(1, secondary);

        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
            const edgeFade = Math.sin((x / width) * Math.PI);
            const y = center + Math.sin(x * 0.045 + t) * 5 * edgeFade;
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
    },

    drawBars(ctx, width, height, primary, secondary) {
        const count = Math.min(48, this.frequencyData.length);
        const gap = 2;
        const barWidth = width / count;
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, primary);
        gradient.addColorStop(1, secondary);

        ctx.fillStyle = gradient;
        for (let i = 0; i < count; i++) {
            const sourceIndex = Math.floor((i / count) * this.frequencyData.length * 0.75);
            const value = this.frequencyData[sourceIndex] / 255;
            const barHeight = Math.max(2, value * height * 0.82);
            const x = i * barWidth + gap / 2;
            const y = height - barHeight;
            ctx.globalAlpha = 0.5 + value * 0.5;
            ctx.fillRect(x, y, Math.max(1, barWidth - gap), barHeight);
            ctx.globalAlpha = 0.12;
            ctx.fillRect(x, height - Math.max(1, value * height * 0.12), Math.max(1, barWidth - gap), value * height * 0.12);
        }
        ctx.globalAlpha = 1;
    },

    drawWave(ctx, width, height, color) {
        const center = height / 2;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8 + this.energy * 12;
        ctx.beginPath();

        for (let i = 0; i < this.timeData.length; i++) {
            const x = (i / (this.timeData.length - 1)) * width;
            const normalized = (this.timeData[i] - 128) / 128;
            const y = center + normalized * height * 0.36;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }

        ctx.stroke();
        ctx.restore();
    },

    drawDots(ctx, width, height, color) {
        const count = 32;
        ctx.fillStyle = color;
        for (let i = 0; i < count; i++) {
            const idx = Math.floor((i / count) * this.frequencyData.length);
            const value = this.frequencyData[idx] / 255;
            const x = ((i + 0.5) / count) * width;
            const y = height * 0.72 - value * height * 0.48;
            ctx.globalAlpha = 0.3 + value * 0.7;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + value * 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    },

    drawSpectrum(ctx, width, height, primary, secondary) {
        const count = 58;
        const center = width / 2;
        const maxBar = height * 0.44;
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, secondary);
        gradient.addColorStop(.5, primary);
        gradient.addColorStop(1, secondary);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = Math.max(1, width / count - 2);

        for (let i = 0; i < count; i++) {
            const normalized = Math.abs(i - count / 2) / (count / 2);
            const idx = Math.floor(normalized * (this.frequencyData.length - 1) * 0.6);
            const value = this.frequencyData[idx] / 255;
            const x = (i + .5) * width / count;
            const bar = 2 + value * maxBar;

            ctx.globalAlpha = .45 + value * .55;
            ctx.beginPath();
            ctx.moveTo(x, height / 2 - bar);
            ctx.lineTo(x, height / 2 + bar);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    },

    setMode(mode) {
        this.mode = ["bars", "wave", "dots", "spectrum"].includes(mode) ? mode : "bars";
    }
};
