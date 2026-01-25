export class ModalFSM {
    constructor(modals, blurrableParent, backdrop) {
        this.modals = modals;
        this.blurrableParent = blurrableParent;
        this.backdrop = backdrop;
        this.lastState = null;
    }
    setState(state) {
        let lastStateProject = this.lastState === this.modals.SATELLITE_MODAL ||
            this.lastState === this.modals.GENETIC_ALGORITHM_MODAL ||
            this.lastState === this.modals.LORE_MYTHOLOGY_MODAL;
        let newStateProject = state === this.modals.SATELLITE_MODAL ||
            state === this.modals.GENETIC_ALGORITHM_MODAL ||
            state === this.modals.LORE_MYTHOLOGY_MODAL;

        if(state !== this.modals.CONTACT_MODAL) {
            this.blurrableParent.style.filter = "none";
            Object.values(this.modals).forEach(modal => {
                modal.style.display = modal === state ? "initial" : "none";
            });
            if(newStateProject) {
                state.parentElement.style.display = "initial";
            } else if (this.lastState !== null && lastStateProject) {
                this.lastState.parentElement.style.display = "none";
            }
            this.lastState = state;
        } else {
            this.blurrableParent.style.filter = "blur(5px)";
            this.modals.CONTACT_MODAL.style.display = "initial";
            this.modals.CONTACT_MODAL.style.visibility = "visible";
            this.backdrop.style.display = "flex";
        }

    }
}