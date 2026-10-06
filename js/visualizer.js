const Visualizer = {

    canvas: document.querySelector("#visualizer"),

    ctx: null,

    data: null,

    waveform: null,

    mode: "bars",

    level: 0,

    bass: 0,

    lastFrame: 0,

    motionQuery: null,

    particles: [],


    initialize() {

        this.ctx = this.canvas.getContext("2d");
        this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.motionQuery.addEventListener("change", () => {
            this.lastFrame = 0;
            this.render();
        });

        requestAnimationFrame(
            time => this.render(time)
        );

    },


    resize() {

        const rect = this.canvas.getBoundingClientRect();
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        this.canvas.width = Math.round(rect.width * ratio);
        this.canvas.height = Math.round(rect.height * ratio);
        this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        const count = Math.max(18, Math.min(42, Math.round(rect.width / 18)));

        while (this.particles.length < count) {
            this.particles.push(this.createParticle(rect.width, rect.height));
        }

        this.particles.length = count;

    },


    createParticle(width, height) {

        return {
            x: Math.random() * width,
            y: Math.random() * height,
            speed: 0.15 + Math.random() * 0.45,
            size: 1 + Math.random() * 2,
            phase: Math.random() * Math.PI * 2
        };

    },


    render(time = performance.now()) {

        const reducedMotion = this.motionQuery.matches;

        if (!reducedMotion) {
            requestAnimationFrame(
                nextTime => this.render(nextTime)
            );
        }

        if (!reducedMotion && time - this.lastFrame < 33) {
            return;
        }

        this.lastFrame = time;

        const rect = this.canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const ctx = this.ctx;

        if (!width || !height) {
            return;
        }

        ctx.clearRect(0, 0, width, height);

        const playing = !audio.paused && Player.analyser;

        if (playing && !reducedMotion) {
            this.readAudio();
        } else {
            this.level = 0;
            this.bass = 0;
            this.drawIdle(ctx, width, height);
        }

        this.canvas.parentElement.style.setProperty(
            "--audio-level",
            Math.min(0.14, this.level * 0.12 + this.bass * 0.08).toFixed(3)
        );

        document.querySelector(".pet-sprite").style.setProperty(
            "--pet-scale",
            (1 + this.bass * 0.06).toFixed(3)
        );

        if (this.mode === "wave" && playing && !reducedMotion) {
            this.drawWave(ctx, width, height);
        } else if (this.mode === "dots" && playing && !reducedMotion) {
            this.drawDots(ctx, width, height);
        } else if (this.mode === "particles" && playing && !reducedMotion) {
            this.drawParticles(ctx, width, height);
        } else if (playing && !reducedMotion) {
            this.drawBars(ctx, width, height);
        }

        if (!reducedMotion) {
            this.drawAmbientParticles(ctx, width, height, playing);
        }

    },


    readAudio() {

        const analyser = Player.analyser;

        if (!this.data || this.data.length !== analyser.frequencyBinCount) {
            this.data = new Uint8Array(analyser.frequencyBinCount);
            this.waveform = new Uint8Array(analyser.fftSize);
        }

        analyser.getByteFrequencyData(this.data);
        analyser.getByteTimeDomainData(this.waveform);

        const bassBins = Math.min(8, this.data.length);
        let bassTotal = 0;

        for (let i = 1; i < bassBins; i++) {
            bassTotal += this.data[i];
        }

        const bassTarget = bassTotal / Math.max(1, bassBins - 1) / 255;
        let total = 0;
        const samples = Math.min(52, this.data.length);

        for (let i = 0; i < samples; i++) {
            total += this.data[i];
        }

        this.level += (total / samples / 255 - this.level) * 0.28;
        this.bass += (bassTarget - this.bass) * 0.28;

    },


    colors() {

        const styles = getComputedStyle(document.body);

        return {
            main: styles.getPropertyValue("--accent-main").trim(),
            secondary: styles.getPropertyValue("--accent-secondary").trim()
        };

    },


    drawIdle(ctx, width, height) {

        const center = height / 2;
        const { main, secondary } = this.colors();
        const gradient = ctx.createLinearGradient(0, 0, width, 0);

        gradient.addColorStop(0, main);
        gradient.addColorStop(1, secondary);

        ctx.beginPath();

        for (let x = 0; x <= width; x += 4) {
            const y = center + Math.sin(x * 0.018) * 3;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.strokeStyle = gradient;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;

    },


    drawBars(ctx, width, height) {

        const count = Math.min(64, this.data.length);
        const step = Math.max(1, Math.floor(this.data.length / count));
        const gap = 3;
        const barWidth = width / count;
        const center = height * 0.72;
        const { main, secondary } = this.colors();
        const gradient = ctx.createLinearGradient(0, height, width * 0.35, 0);

        gradient.addColorStop(0, main);
        gradient.addColorStop(1, secondary);

        ctx.fillStyle = gradient;

        for (let i = 0; i < count; i++) {
            const value = this.data[i * step] / 255;
            const barHeight = Math.max(2, value * height * 0.72);
            const x = i * barWidth + gap / 2;
            const w = Math.max(1, barWidth - gap);

            ctx.globalAlpha = 0.55 + value * 0.45;
            ctx.fillRect(x, center - barHeight, w, barHeight);
            ctx.globalAlpha = 0.18 + value * 0.3;
            ctx.fillRect(x, center + 5, w, barHeight * 0.32);
        }

        ctx.globalAlpha = 1;

    },


    drawWave(ctx, width, height) {

        const center = height / 2;
        const { main, secondary } = this.colors();

        for (let line = 0; line < 2; line++) {
            const gradient = ctx.createLinearGradient(0, 0, width, 0);
            gradient.addColorStop(0, line ? secondary : main);
            gradient.addColorStop(1, line ? main : secondary);

            ctx.beginPath();

            for (let i = 0; i < this.waveform.length; i += 2) {
                const x = i / (this.waveform.length - 1) * width;
                const sample = (this.waveform[i] - 128) / 128;
                const y = center + sample * height * (line ? 0.34 : 0.48);

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            ctx.strokeStyle = gradient;
            ctx.globalAlpha = line ? 0.42 : 0.95;
            ctx.lineWidth = line ? 1 : 2;
            ctx.shadowColor = main;
            ctx.shadowBlur = line ? 4 : 12;
            ctx.stroke();
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

    },


    drawDots(ctx, width, height) {

        const count = Math.min(48, this.data.length);
        const { main, secondary } = this.colors();

        for (let i = 0; i < count; i++) {
            const index = Math.floor(i / count * this.data.length);
            const value = this.data[index] / 255;
            const x = i / (count - 1) * width;
            const y = height * 0.72 - value * height * 0.62;

            ctx.beginPath();
            ctx.arc(x, y, 1.5 + value * 5, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 ? main : secondary;
            ctx.globalAlpha = 0.55 + value * 0.45;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 8 * value;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

    },


    drawParticles(ctx, width, height) {

        const { main, secondary } = this.colors();
        const center = height * 0.58;

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const index = Math.floor(i / this.particles.length * this.data.length);
            const value = this.data[index] / 255;
            const radius = particle.size + value * 7;
            const x = particle.x;
            const y = center + Math.sin(particle.phase + performance.now() / 700) * height * 0.22;

            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fillStyle = i % 3 ? main : secondary;
            ctx.globalAlpha = 0.45 + value * 0.4;
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 5 + value * 12;
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

    },


    drawAmbientParticles(ctx, width, height, playing) {

        const { main } = this.colors();
        const lift = playing ? 0.5 + this.level * 2 : 0.25;

        ctx.fillStyle = main;
        ctx.globalAlpha = playing ? 0.22 + this.level * 0.4 : 0.16;

        this.particles.forEach(particle => {
            particle.y -= particle.speed * lift;
            particle.x += Math.sin(performance.now() / 1000 + particle.phase) * 0.12;

            if (particle.y < -4) {
                particle.y = height + 4;
                particle.x = Math.random() * width;
            }

            ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        });

        ctx.globalAlpha = 1;

    },


    setMode(mode) {

        this.mode = mode;

    }

};
