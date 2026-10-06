const KritrEffects = {

    window:
        document.getElementById(
            "kritr-window"
        ),

    ambientCanvas:
        document.getElementById(
            "ambient-canvas"
        ),

    ambientCtx: null,

    particles: [],


    initialize() {

        this.ambientCtx =
            this.ambientCanvas.getContext(
                "2d"
            );

        this.createParticles();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        this.resize();

        requestAnimationFrame(
            () => this.drawAmbient()
        );

    },


    resize() {

        const dpr =
            window.devicePixelRatio || 1;

        this.ambientCanvas.width =
            window.innerWidth * dpr;

        this.ambientCanvas.height =
            window.innerHeight * dpr;

        this.ambientCtx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    },


    createParticles() {

        this.particles = [];

        const count =
            Math.min(
                45,
                Math.max(
                    20,
                    Math.floor(
                        window.innerWidth /
                        30
                    )
                )
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            this.particles.push({

                x:
                    Math.random() *
                    window.innerWidth,

                y:
                    Math.random() *
                    window.innerHeight,

                size:
                    Math.random() *
                    2 +
                    1,

                speed:
                    Math.random() *
                    0.25 +
                    0.05,

                phase:
                    Math.random() *
                    Math.PI *
                    2

            });

        }

    },


    drawAmbient() {

        const ctx =
            this.ambientCtx;

        const width =
            window.innerWidth;

        const height =
            window.innerHeight;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        const style =
            getComputedStyle(
                document.body
            );


        const accent =
            style.getPropertyValue(
                "--accent-main"
            ).trim();


        const energy =
            KritrReactivity.energy;


        for (
            const particle
            of this.particles
        ) {

            particle.y -=
                particle.speed;

            particle.x +=
                Math.sin(
                    performance.now() *
                    0.0005 +
                    particle.phase
                ) *
                0.08;


            if (particle.y < -10) {

                particle.y =
                    height + 10;

            }


            const pulse =
                1 +
                energy *
                2;


            ctx.fillStyle =
                accent;

            ctx.globalAlpha =
                0.12 +
                energy * 0.35;


            ctx.fillRect(
                particle.x,
                particle.y,
                particle.size * pulse,
                particle.size * pulse
            );

        }


        ctx.globalAlpha = 1;

        requestAnimationFrame(
            () => this.drawAmbient()
        );

    },


    update() {

        if (
            !KritrReactivity.enabled
        ) {
            return;
        }


        const root =
            document.documentElement;


        root.style.setProperty(
            "--music-energy",
            KritrReactivity.energy.toFixed(3)
        );


        root.style.setProperty(
            "--music-bass",
            KritrReactivity.bass.toFixed(3)
        );


        root.style.setProperty(
            "--music-treble",
            KritrReactivity.treble.toFixed(3)
        );


        if (
            KritrReactivity.beat
        ) {

            this.window.classList.add(
                "beat"
            );

            this.window.classList.remove(
                "beat-flash"
            );

            void this.window.offsetWidth;

            this.window.classList.add(
                "beat-flash"
            );

            KritrPets.reactToMusic();

        } else {

            this.window.classList.remove(
                "beat"
            );

        }

    }

};