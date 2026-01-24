import {FSMFunctions} from './FSMFunctions.js';


export class ModalFSM {
    constructor(modals) {
        this.modals = modals;
        this.modalCount = modals.length;
        this.modalState = 0;
    }
    mod(targetNumber) {
        return FSMFunctions.mod(targetNumber, this.modalCount);
    }
    getModal() {
        return this.modals[this.mod(this.modalState)];
    }
    setState(state) {
        this.modals.forEach(node => {
            if(node === state) {
                node.style.display = "initial"
            } else {
                node.style.display = "none"
            }
        });
    }

}