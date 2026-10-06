const Visualizer = {

    canvas:
        document.querySelector(
            "#visualizer"
        ),

    ctx: null,

    data: null,

    mode: "bars",


    initialize() {

        this.ctx =
            this.canvas.getContext(
                "2d"
            );

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

        requestAnimationFrame(
            () => this.render()
        );

    },


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.canvas.width =
            rect.width;

        this.canvas.height =
            rect.height;

    },


    render() {

        requestAnimationFrame(
            () => this.render()
        );


        const ctx = this.ctx;

        const width =
            this.canvas.width;

        const height =
            this.canvas.height;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        if (
            !Player.analyser
        ) {

            this.drawIdle(
                ctx,
                width,
                height
            );

            return;

        }


        if (!this.data) {

            this.data =
                new Uint8Array(
                    Player.analyser.frequencyBinCount
                );

        }


        Player.analyser.getByteFrequencyData(
            this.data
        );


        if (
            this.mode === "wave"
        ) {

            this.drawWave(
                ctx,
                width,
                height
            );

        } else if (
            this.mode === "dots"
        ) {

            this.drawDots(
                ctx,
                width,
                height
            );

        } else {

            this.drawBars(
                ctx,
                width,
                height
            );

        }

    },


    drawIdle(
        ctx,
        width,
        height
    ) {

        const time =
            performance.now() / 500;

        const center =
            height / 2;

        ctx.strokeStyle =
            getComputedStyle(
                document.body
            )
            .getPropertyValue(
                "--accent-main"
            );

        ctx.lineWidth = 2;

        ctx.beginPath();


        for (
            let x = 0;
            x < width;
            x += 8
        ) {

            const y =
                center +
                Math.sin(
                    x * 0.03 + time
                ) * 8;

            if (x === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        }


        ctx.stroke();

    },


    drawBars(
        ctx,
        width,
        height
    ) {

        const barWidth =
            width /
            this.data.length;

        for (
            let i = 0;
            i < this.data.length;
            i++
        ) {

            const value =
                this.data[i] / 255;

            const barHeight =
                value * height * 0.8;

            const x =
                i * barWidth;

            const y =
                height - barHeight;


            ctx.fillStyle =
                getComputedStyle(
                    document.body
                )
                .getPropertyValue(
                    "--accent-main"
                );


            ctx.fillRect(
                x,
                y,
                Math.max(
                    2,
                    barWidth - 2
                ),
                barHeight
            );

        }

    },


    drawWave(
        ctx,
        width,
        height
    ) {

        const center =
            height / 2;

        ctx.strokeStyle =
            getComputedStyle(
                document.body
            )
            .getPropertyValue(
                "--accent-secondary"
            );

        ctx.lineWidth = 2;

        ctx.beginPath();


        for (
            let i = 0;
            i < this.data.length;
            i++
        ) {

            const x =
                (i /
                    this.data.length) *
                width;

            const y =
                center +
                (
                    this.data[i] -
                    128
                ) *
                0.8;


            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

        }


        ctx.stroke();

    },


    drawDots(
        ctx,
        width,
        height
    ) {

        const center =
            height / 2;

        ctx.fillStyle =
            getComputedStyle(
                document.body
            )
            .getPropertyValue(
                "--accent-main"
            );


        for (
            let i = 0;
            i < this.data.length;
            i++
        ) {

            const value =
                this.data[i] / 255;

            const x =
                (i /
                    this.data.length) *
                width;

            const y =
                center -
                value * center;


            ctx.beginPath();

            ctx.arc(
                x,
                y,
                3 + value * 5,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }

    },


    setMode(mode) {

        this.mode = mode;

    }

};