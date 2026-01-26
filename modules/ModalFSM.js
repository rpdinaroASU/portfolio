export class ModalFSM {
    constructor(modals, blurrableParent, backdrop) {
        this.modals = modals;
        this.blurrableParent = blurrableParent;
        this.backdrop = backdrop;
        this.lastState = this.modals.HOME_MODAL;
        this.projectModals = new Set([this.modals.SATELLITE_MODAL, this.modals.GENETIC_ALGORITHM_MODAL, this.modals.LORE_MYTHOLOGY_MODAL]);
        this.contact = false;
    }
    setState(state) {
        if(state.id !== this.modals.CONTACT_MODAL.id) {
            if(this.contact) {
                this.contact = false;
                this.updateContactModal();
            }
            let isLastStateProject = this.projectModals.has(this.lastState);
            let isNewStateProject = this.projectModals.has(state);
            if(isNewStateProject) {
                state.parentElement.style.display = "block";
                this.projectModals.forEach(modal =>
                    modal.style.display = (modal.id === state.id) ? "block" : "none");
            } else if (isLastStateProject) {
                state.style.display = "initial";
                this.lastState.parentElement.style.display = "none";
            } else {
                state.style.display = "initial";
            }
            //Only update the last state if it's not the contact modal
            this.lastState.style.display = "none";
            this.lastState = state;

        } else {
            this.contact = true;
            this.updateContactModal();
        }

    }
    // When the contact model is selected,
    // blur the background and show the contact modal.
    // Don't update the last state.
    updateContactModal() {
        this.blurrableParent.style.filter = this.contact ? "blur(5px)" : "none";
        this.modals.CONTACT_MODAL.style.display = this.contact ? "initial" : "none";
        this.modals.CONTACT_MODAL.style.visibility = this.contact ? "visible" : "hidden";
        this.backdrop.style.display = this.contact ? "flex" : "none";
    }
}