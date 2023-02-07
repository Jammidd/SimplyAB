import { isBrowser } from "./utils/browser";
import { getCookie, setCookie } from "./utils/cookies";

class ExperimentAB {
    cookieName = null;

    // The current assigned experiment settings
    currentExperiment = null;

    currentVariant = null;

    // Local experiment configuration
    experiments = [{
        name: "EXPERIMENT",
        variants: [{
            name: "control",
            weight: 50
        }, {
            name: "variant_1",
            weight: 50
        }]
    }];

    // Experiments set in the environment on the server
    serverExperiments = [];

    constructor(serverExperiments = [], experimentOverride = [], cookieName = "simply_ab_experiment") {
        this.serverExperiments = serverExperiments;
        this.cookieName = cookieName;

        // For testing allow experiments to be overwritten
        if (Object.keys(experimentOverride).length) {
            this.experiments = experimentOverride;
        }

        // search for cookie with current configuration
        const cookie = getCookie(this.cookieName);

        if (cookie) {
            const experimentData = JSON.parse(decodeURIComponent(cookie));
            const experimentState = this.getExperimentState(experimentData.experiment);

            if (experimentState === "paused") {
                this.currentExperiment = {
                    name: "PAUSED_EXPERIMENT",
                    variants: [{ name: "control", weight: 100 }]
                };
                this.currentVariant = { name: "control", weight: 100 };
            } else if (experimentState !== "expired") {
                this.currentExperiment = this.getExperiment(experimentData.experiment);

                // If the variant has been stopped, reassign to the control group
                if (this.getVariantState(experimentData.variant) === "stopped") {
                    this.currentVariant = this.getVariant("control");
                    this.setExperiment();
                } else {
                    this.currentVariant = this.getVariant(experimentData.variant);
                }
            } else {
                // If the experiment is expired remove it.
                deleteCookie(this.cookieName);
            }
        }
    }

    isAssignedExperiment(experimentName) {
        return this.currentExperiment?.name.toLowerCase() === experimentName.toLowerCase();
    }

    isAssignedVariant(variantName) {
        return this.currentVariant?.name.toLowerCase() === variantName.toLowerCase();
    }

    setExperiment() {
        setCookie(cookieName,
            encodeURIComponent(
                JSON.stringify({
                    experiment: this.currentExperiment.name,
                    variant: this.currentVariant.name
                })
            ), 30);
    }

    getActiveExperiments() {
        return this.experiments.filter(a => this.serverExperiments.includes(a.name));
    }

    getExperiment(experimentName) {
        return this.getActiveExperiments().find(a => a.name === experimentName);
    }

    getVariant(variantName) {
        return this.currentExperiment?.variants?.find(a => a.name === variantName);
    }

    getExperimentState(experimentName) {
        if (
            this.experiments.some(a => a.name === experimentName) &&
            this.serverExperiments.some(a => a === experimentName)
        ) {
            return "active";
        }

        if (
            this.experiments.some(a => a.name === experimentName) &&
            !this.serverExperiments.some(a => a === experimentName)
        ) {
            return "paused";
        }

        return "expired";
    }

    getVariantState(variantName) {
        if (
            this.currentExperiment?.variants?.some(a => a.name === variantName)
        ) {
            return "active";
        }

        return "stopped";
    }

    static getUrlOverrides() {
        const overrideObj = {
            experiment: null,
            variant: null
        };
        if (!isBrowser()) return overrideObj;

        const search = window.location.search.substring(1);
        const paramsArr = search.split("&");

        paramsArr.forEach(elem => {
            const tempVar = elem.split("=");

            if (tempVar.includes("tm-exp") && tempVar.length > 1) {
                const urlParts = tempVar[1].split("|");

                if (urlParts.length > 1) {
                    overrideObj.experiment = urlParts[0];
                    overrideObj.variant = urlParts[1];
                }
            }
        });

        return overrideObj;
    }

    selectRandomExperiment() {
        const index = Math.floor(Math.random() * this.getActiveExperiments().length);
        return this.getActiveExperiments()[index];
    }

    selectRandomVariant() {
        const weights = this.currentExperiment?.variants?.map(elem => elem.weight) || [];

        let i;

        for (i = 0; i < weights.length; i++) {
            weights[i] += weights[i - 1] || 0;
        }

        const random = Math.random() * weights[weights.length - 1];

        for (i = 0; i < weights.length; i++) {
            if (weights[i] > random) break;
        }

        return this.currentExperiment?.variants?.[i];
    }

    assign() {
        if (!this.getActiveExperiments().length) return;

        const urlOverride = ExperimentAB.getUrlOverrides();
        const override = (urlOverride.experiment !== null) ? true : false;

        if (this.currentExperiment && this.currentVariant && !override) return;

        if (override) {
            const overrideExp = this.getExperiment(urlOverride.experiment);
            this.currentExperiment = overrideExp;
            const overrideVar = this.getVariant(urlOverride.variant);
            this.currentVariant = overrideVar;
        } else {
            this.currentExperiment = this.selectRandomExperiment();
            this.currentVariant = this.selectRandomVariant();
        }

        this.setExperiment();
    }
}

export const initExperiment = (serverExperiments) => {
    return new ExperimentAB(serverExperiments);
};

export { ExperimentAB };