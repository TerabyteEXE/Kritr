const KritrWindow = {

    element:
        document.getElementById(
            "kritr-window"
        ),


    initialize() {

        document.getElementById(
            "minimize-window"
        ).addEventListener(
            "click",
            () => this.minimize()
        );


        document.getElementById(
            "maximize-window"
        ).addEventListener(
            "click",
            () => this.maximize()
        );


        document.getElementById(
            "close-window"
        ).addEventListener(
            "click",
            () => this.close()
        );

    },


    minimize() {

        this.element.classList.toggle(
            "hidden"
        );

    },


    maximize() {

        this.element.classList.toggle(
            "maximized"
        );

    },


    close() {

        this.element.classList.add(
            "hidden"
        );


        document.title =
            "Kritr — closed";


        setTimeout(
            () => {

                if (
                    this.element.classList.contains(
                        "hidden"
                    )
                ) {

                    this.element.classList.remove(
                        "hidden"
                    );

                    document.title =
                        "Kritr Player";

                }

            },
            1500
        );

    }

};