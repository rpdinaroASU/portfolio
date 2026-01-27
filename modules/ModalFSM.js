export class ModalFSM {
    constructor(modalList, contactBackground, contactBackgroundHitbox, projectContainer, body) {
        this.modals = modalList;
        this.contactBackground = contactBackground;
        this.contactBackgroundHitbox = contactBackgroundHitbox;
        this.lastState = this.modals.HOME_MODAL;
        this.projectModals = new Set([this.modals.SATELLITE_MODAL, this.modals.GENETIC_ALGORITHM_MODAL, this.modals.LORE_MYTHOLOGY_MODAL]);
        this.contact = false;
        this.currentProject = this.modals.HOME_MODAL;
        this.projectContainer = projectContainer;
        this.contactBackgroundHitbox.classList.add('modal-hidden');
        this.body = body;
    }
    setState(state) {
        if(state !== this.modals.CONTACT_MODAL) {
            //If a modal change occurs and the contact modal is active,
            //Hide the contact modal
            if(this.contact || state === this.modals.CLOSE_CONTACT_MODAL) {
                this.updateContactModalDisplay(false);
                return;
            }

            //If the state is a project modal, show the project modal
            if(this.projectModals.has(state)){
                this.updateProjectModalDisplay(state);
            } else {
                //If the state is not a project modal,
                // hide the project modals.
                if(this.projectModals.has(this.currentProject)) {
                    this.toggleModalVisibility(this.projectContainer, false);
                    this.currentProject = state;
                }
                //Show the new state
                this.toggleModalVisibility(this.lastState,false);
                this.toggleModalVisibility(state,true);
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
        this.toggleCSSClass(this.body,this.contact,"overflow-hidden");
        this.toggleCSSClass(this.contactBackground, this.contact, "contact-blur")
        this.toggleModalVisibility(this.modals.CONTACT_MODAL, this.contact);
        this.toggleModalVisibility(this.contactBackgroundHitbox, this.contact);
    }
    updateProjectModalDisplay(projectModal) {
        if (this.currentProject === projectModal && this.projectContainer.classList.contains("modal-visible")) {
            return;
        }

        this.currentProject = projectModal;
        this.toggleModalVisibility(this.lastState, false);
        this.toggleModalVisibility(this.projectContainer, true);
        this.projectModals.forEach(modal => {
            this.toggleModalVisibility(modal, modal === this.currentProject);
        });
    }
    toggleModalVisibility(el, show) {
        const add = show ? "modal-visible" : "modal-hidden";
        const remove = show ? "modal-hidden" : "modal-visible";

        if (!el.classList.contains(add)) {
            el.classList.add(add);
        }
        if (el.classList.contains(remove)) {
            el.classList.remove(remove);
        }
    }
    toggleCSSClass(el, show, cssClass) {
        if (show) {
            if (!el.classList.contains(cssClass)) el.classList.add(cssClass);
        } else {
            if (el.classList.contains(cssClass)) el.classList.remove(cssClass);
        }
    }
}