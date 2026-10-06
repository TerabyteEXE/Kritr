const KritrVisualizer = {

    canvas:
        document.getElementById(
            "visualizer"
        ),

    ctx: null,

    mode: "bars",

    dpr: 1,


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
            () => this.draw()
        );

    },


    resize() {

        const rect =
            this.canvas.getBoundingClientRect();

        this.dpr =
            window.devicePixelRatio || 1;

        this.canvas.width =
            rect.width * this.dpr;

        this.canvas.height =
            rect.height * this.dpr;

        this.ctx.setTransform(
            this.dpr,
            0,
            0,
            this.dpr,
            0,
            0
        );

    },


    setMode(mode) {

        const modes = [
            "bars",
            "wave",
            "dots",
            "orbit",
            "pixel",
            "void"
        ];

        if (!modes.includes(mode)) {
            mode = "bars";
        }

        this.mode = mode;

        KritrStorage.save(
            "visualizer",
            mode
        );

        document.getElementById(
            "visualizer-mode-button"
        ).textContent =
            `MODE: ${mode.toUpperCase()}`;

    },


    draw() {

        const ctx =
            this.ctx;

        const rect =
            this.canvas.getBoundingClientRect();

        const width =
            rect.width;

        const height =
            rect.height;


        ctx.clearRect(
            0,
            0,
            width,
            height
        );


        KritrReactivity.update();


        const style =
            getComputedStyle(
                document.body
            );

        const accent =
            style.getPropertyValue(
                "--accent-main"
            ).trim();

        const secondary =
            style.getPropertyValue(
                "--accent-secondary"
            ).trim();


        if (this.mode === "bars") {

            this.drawBars(
                ctx,
                width,
                height,
                accent
            );

        }


        if (this.mode === "wave") {

            this.drawWave(
                ctx,
                width,
                height,
                accent
            );

        }


        if (this.mode === "dots") {

            this.drawDots(
                ctx,
                width,
                height,
                accent
            );

        }


        if (this.mode === "orbit") {

            this.drawOrbit(
                ctx,
                width,
                height,
                accent,
                secondary
            );

        }


        if (this.mode === "pixel") {

            this.drawPixel(
                ctx,
                width,
                height,
                accent
            );

        }


        if (this.mode === "void") {

            this.drawVoid(
                ctx,
                width,
                height,
                accent
            );

        }


        KritrEffects.update();

        requestAnimationFrame(
            () => this.draw()
        );

    },


    drawBars(
        ctx,
        width,
        height,
        color
    ) {

        const data =
            KritrReactivity.frequencyData;

        if (!data) {
            this.drawIdle(
                ctx,
                width,
                height,
                color
            );

            return;
        }


        const bars = 40;

        const gap = 3;

        const barWidth =
            (
                width -
                gap * (bars - 1)
            ) / bars;


        for (
            let i = 0;
            i < bars;
            i++
        ) {

            const index =
                Math.floor(
                    i /
                    bars *
                    data.length
                );

            const value =
                data[index] / 255;

            const barHeight =
                Math.max(
                    2,
                    value * height * 0.9
                );


            const x =
                i *
                (barWidth + gap);

            const y =
                height - barHeight;


            ctx.fillStyle =
                color;

            ctx.fillRect(
                Math.floor(x),
                Math.floor(y),
                Math.ceil(barWidth),
                Math.ceil(barHeight)
            );

        }

    },


    drawWave(
        ctx,
        width,
        height,
        color
    ) {

        const data =
            KritrReactivity.getWaveform();

        if (!data) {
            return;
        }


        ctx.beginPath();

        ctx.lineWidth = 2;

        ctx.strokeStyle =
            color;


        for (
            let i = 0;
            i < data.length;
            i++
        ) {

            const x =
                i /
                (data.length - 1) *
                width;

            const y =
                (
                    data[i] / 255
                ) * height;


            if (i === 0) {
                ctx.moveTo(
                    x,
                    y
                );
            } else {
                ctx.lineTo(
                    x,
                    y
                );
            }

        }


        ctx.stroke();

    },


    drawDots(
        ctx,
        width,
        height,
        color
    ) {

        const data =
            KritrReactivity.frequencyData;

        if (!data) {
            return;
        }


        const count = 48;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const value =
                data[
                    Math.floor(
                        i /
                        count *
                        data.length
                    )
                ] / 255;


            const x =
                i /
                (count - 1) *
                width;

            const y =
                height / 2 +
                (
                    value -
                    0.5
                ) *
                height *
                0.9;


            const size =
                1.5 +
                value * 4;


            ctx.fillStyle =
                color;

            ctx.fillRect(
                x,
                y,
                size,
                size
            );

        }

    },


    drawOrbit(
        ctx,
        width,
        height,
        color,
        secondary
    ) {

        const data =
            KritrReactivity.frequencyData;

        if (!data) {
            return;
        }


        const cx =
            width / 2;

        const cy =
            height / 2;

        const radius =
            Math.min(
                width,
                height
            ) *
            (
                0.22 +
                KritrReactivity.bass *
                0.08
            );


        ctx.beginPath();

        ctx.strokeStyle =
            secondary;

        ctx.lineWidth = 2;

        ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
        );

        ctx.stroke();


        const points = 36;


        for (
            let i = 0;
            i < points;
            i++
        ) {

            const value =
                data[
                    Math.floor(
                        i /
                        points *
                        data.length
                    )
                ] / 255;


            const angle =
                i /
                points *
                Math.PI *
                2;


            const r =
                radius +
                value *
                28;


            const x =
                cx +
                Math.cos(angle) * r;

            const y =
                cy +
                Math.sin(angle) * r;


            ctx.fillStyle =
                color;

            ctx.fillRect(
                x - 2,
                y - 2,
                4,
                4
            );

        }

    },


    drawPixel(
        ctx,
        width,
        height,
        color
    ) {

        const data =
            KritrReactivity.frequencyData;

        if (!data) {
            return;
        }


        const cols = 48;

        const rows = 8;

        const cellWidth =
            width / cols;

        const cellHeight =
            height / rows;


        for (
            let x = 0;
            x < cols;
            x++
        ) {

            const index =
                Math.floor(
                    x /
                    cols *
                    data.length
                );

            const value =
                data[index] / 255;


            const activeRows =
                Math.floor(
                    value * rows
                );


            for (
                let y = 0;
                y < activeRows;
                y++
            ) {

                ctx.fillStyle =
                    color;

                ctx.globalAlpha =
                    0.35 +
                    (
                        y /
                        rows
                    ) *
                    0.65;


                ctx.fillRect(
                    Math.floor(
                        x *
                        cellWidth
                    ),
                    Math.floor(
                        height -
                        (
                            y + 1
                        ) *
                        cellHeight
                    ),
                    Math.ceil(
                        cellWidth - 2
                    ),
                    Math.ceil(
                        cellHeight - 2
                    )
                );

            }

        }

        ctx.globalAlpha = 1;

    },


    drawVoid(
        ctx,
        width,
        height,
        color
    ) {

        const data =
            KritrReactivity.frequencyData;

        if (!data) {
            return;
        }


        const energy =
            KritrReactivity.energy;


        const count =
            Math.floor(
                5 +
                energy * 80
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const x =
                Math.random() *
                width;

            const y =
                Math.random() *
                height;


            const size =
                Math.random() *
                3 +
                1;


            ctx.fillStyle =
                color;

            ctx.globalAlpha =
                energy * 0.7;


            ctx.fillRect(
                x,
                y,
                size,
                size
            );

        }


        ctx.globalAlpha = 1;

    },


    drawIdle(
        ctx,
        width,
        height,
        color
    ) {

        ctx.beginPath();

        ctx.strokeStyle =
            color;

        ctx.globalAlpha =
            0.35;

        ctx.lineWidth = 1;


        for (
            let x = 0;
            x <= width;
            x += 4
        ) {

            const y =
                height / 2 +
                Math.sin(
                    x * 0.04 +
                    performance.now() *
                    0.001
                ) *
                5;


            if (x === 0) {
                ctx.moveTo(
                    x,
                    y
                );
            } else {
                ctx.lineTo(
                    x,
                    y
                );
            }

        }


        ctx.stroke();

        ctx.globalAlpha = 1;

    }

};