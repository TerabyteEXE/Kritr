const KritrStorage = {

    prefix: "kritr_",

    save(key, value) {

        try {

            localStorage.setItem(
                this.prefix + key,
                JSON.stringify(value)
            );

        } catch (error) {

            console.warn(
                "Kritr storage failed:",
                error
            );

        }

    },


    load(key, fallback = null) {

        try {

            const value =
                localStorage.getItem(
                    this.prefix + key
                );

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {

            console.warn(
                "Kritr storage read failed:",
                error
            );

            return fallback;

        }

    }

};