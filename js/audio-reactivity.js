const KritrReactivity = {

    analyser: null,

    frequencyData: null,

    waveformData: null,

    bass: 0,

    mids: 0,

    treble: 0,

    energy: 0,

    beat: false,

    enabled: true,

    lastBeat: 0,

    beatCooldown: 140,


    initialize(analyser) {

        this.analyser =
            analyser;

        this.frequencyData =
            new Uint8Array(
                analyser.frequencyBinCount
            );

        this.waveformData =
            new Uint8Array(
                analyser.fftSize
            );

    },


    update() {

        if (
            !this.analyser ||
            !this.enabled
        ) {

            this.bass *= 0.92;
            this.mids *= 0.92;
            this.treble *= 0.92;
            this.energy *= 0.92;

            this.beat = false;

            return;

        }


        this.analyser.getByteFrequencyData(
            this.frequencyData
        );


        const length =
            this.frequencyData.length;


        let bassTotal = 0;

        let midTotal = 0;

        let trebleTotal = 0;


        const bassEnd =
            Math.max(
                1,
                Math.floor(length * 0.12)
            );

        const midEnd =
            Math.max(
                bassEnd + 1,
                Math.floor(length * 0.55)
            );


        for (
            let i = 0;
            i < length;
            i++
        ) {

            const value =
                this.frequencyData[i] / 255;


            if (i < bassEnd) {

                bassTotal += value;

            } else if (i < midEnd) {

                midTotal += value;

            } else {

                trebleTotal += value;

            }

        }


        const rawBass =
            bassTotal / bassEnd;

        const rawMids =
            midTotal /
            Math.max(
                1,
                midEnd - bassEnd
            );

        const rawTreble =
            trebleTotal /
            Math.max(
                1,
                length - midEnd
            );


        this.bass =
            this.smooth(
                this.bass,
                rawBass
            );

        this.mids =
            this.smooth(
                this.mids,
                rawMids
            );

        this.treble =
            this.smooth(
                this.treble,
                rawTreble
            );


        this.energy =
            Math.min(
                1,
                (
                    this.bass * 0.5 +
                    this.mids * 0.3 +
                    this.treble * 0.2
                )
            );


        const now =
            performance.now();


        const threshold =
            0.55;


        if (
            this.bass > threshold &&
            this.bass >
                this.energy + 0.08 &&
            now - this.lastBeat >
                this.beatCooldown
        ) {

            this.beat = true;

            this.lastBeat =
                now;

        } else {

            this.beat = false;

        }

    },


    smooth(oldValue, newValue) {

        return (
            oldValue * 0.72 +
            newValue * 0.28
        );

    },


    getWaveform() {

        if (!this.analyser) {
            return null;
        }

        this.analyser.getByteTimeDomainData(
            this.waveformData
        );

        return this.waveformData;

    }

};