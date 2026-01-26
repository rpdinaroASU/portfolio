export class ModalFSM {
    constructor(modals, blurrableParent, backdrop) {
        this.modals = modals;
        this.blurrableParent = blurrableParent;
        this.backdrop = backdrop;
        this.lastState = this.modals.HOME_MODAL;
        this.projectModals = new Set([this.modals.SATELLITE_MODAL, this.modals.GENETIC_ALGORITHM_MODAL, this.modals.LORE_MYTHOLOGY_MODAL]);
        this.contact = false;
        this.currentProject = this.modals.HOME_MODAL;
    }
    setState(state) {
        if(state.id !== this.modals.CONTACT_MODAL.id) {
            //If a modal change occurs and the contact modal is active,
            //Hide the contact modal
            if(this.contact) {
                this.updateContactModalDisplay(false);
            }

            //If the state is a project modal, show the project modal
            if(this.projectModals.has(state)){
                this.updateProjectModalDisplay(state);
            } else {
                //If the state is not a project modal,
                // hide the project modals.
                if(this.projectModals.has(this.currentProject)) {
                    this.hideProjectModal();
                    this.currentProject = state;
                }
                //Show the new state
                this.toggle(this.lastState,false);
                this.toggle(state,true);
                this.lastState = state;
            }
        } else {
            //If the state is the contact modal, show it
            this.updateContactModalDisplay(true);
        }

    }

    // When the contact model is selected,
    // blur the background and show the contact modal.
    // When the contact modal is hidden, unblur the background.
    updateContactModalDisplay(isVisible) {
        this.contact = isVisible;
        this.blurrableParent.style.filter = this.contact ? "blur(5px)" : "none";
        this.toggle(this.modals.CONTACT_MODAL, this.contact);
        this.modals.CONTACT_MODAL.style.visibility = this.contact ? "visible" : "hidden";
        this.toggle(this.backdrop, this.contact);
    }
    updateProjectModalDisplay(projectModal) {
        this.currentProject = projectModal;
        if (this.projectModals.has(this.currentProject)) {
            this.toggle(this.lastState, false);
            this.toggle(this.currentProject.parentElement,true);
            this.projectModals.forEach(modal => {
                this.toggle(modal, modal.id === this.currentProject.id);
            });
        } else {
            this.hideProjectModal();
        }
    }
    hideProjectModal() {
        this.toggle(this.modals.SATELLITE_MODAL.parentElement, false);
    }
    toggle(el, show, displayType = "block") {
        el.style.display = show ? displayType : "none";
    }
}