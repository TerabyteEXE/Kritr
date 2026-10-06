const KritrStorage = {

    save(key, value) {

        localStorage.setItem(
            `kritr_${key}`,
            JSON.stringify(value)
        );

    },


    load(key, fallback = null) {

        const value =
            localStorage.getItem(
                `kritr_${key}`
            );

        if (value === null) {
            return fallback;
        }

        try {

            return JSON.parse(value);

        } catch {

            return fallback;

        }

    }

};