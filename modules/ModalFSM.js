export class ModalFSM {
    constructor(modals, blurrableParent, backdrop) {
        this.modals = modals;
        this.blurrableParent = blurrableParent;
        this.backdrop = backdrop;
        this.lastState = null;
        this.projectModals = [this.modals.SATELLITE_MODAL, this.modals.GENETIC_ALGORITHM_MODAL, this.modals.LORE_MYTHOLOGY_MODAL];
    }
    setState(state) {
        let isLastStateProject = this.projectModals.includes(this.lastState);
        let isNewStateProject = this.projectModals.includes(state);

        if(state !== this.modals.CONTACT_MODAL) {
            this.blurrableParent.style.filter = "none";
            Object.values(this.modals).forEach(modal => {
                modal.style.display = modal === state ? "initial" : "none";
            });
            if(isNewStateProject) {
                state.parentElement.style.display = "initial";
            } else if (this.lastState !== null && isLastStateProject) {
                this.lastState.parentElement.style.display = "none";
            }
            //Only update the last state if it's not the contact modal
            this.lastState = state;
        } else {
            this.blurrableParent.style.filter = "blur(5px)";
            this.modals.CONTACT_MODAL.style.display = "initial";
            this.modals.CONTACT_MODAL.style.visibility = "visible";
            this.backdrop.style.display = "flex";
        }

    }
}