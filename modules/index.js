import {ImageFSM} from './ImageFSM.js';
import {ModalFSM} from "./ModalFSM.js";

const satelliteImageArray = ["sat-img-1.png", "sat-img-2.png", "sat-img-3.png"];
let modalFSM;

window.onload = () => {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    /* Contact me page */
    const contactPage = $("#contact-me");
    const projects = $("#projects");
    const aboutPage = $("#about-me");
    const homePage = $("#home-page");
    const body = $("body");
    const modalBackdrop =  $("#modal-backdrop");
    const blurrable = $("#blurrable");
    const satelliteExperience = $("#satellite-experience");
    const loreMythologyExperience = $("#lore-mythology-experience");
    const geneticAlgorithm = $("#genetic-algorithm-information");
    const copyrightElement = $("#copyright");
    const about = $("#about");
    const dropdownHitbox = $$(".dropdown-hitbox");
    const geneticButton = $$(".genetic-algorithm-button");
    const lmButton = $$(".lore-button");
    const satButton = $$(".sat-button");

    //Create an Enum of modals
    const modals ={
        SATELLITE_MODAL: satelliteExperience,
        LORE_MYTHOLOGY_MODAL: loreMythologyExperience,
        GENETIC_ALGORITHM_MODAL: geneticAlgorithm,
        ABOUT_MODAL: aboutPage,
        CONTACT_MODAL: contactPage,
        CLOSE_CONTACT_MODAL: "CLOSE_CONTACT_MODAL",
        HOME_MODAL: projects,

    };
    modalFSM = new ModalFSM(modals, blurrable, modalBackdrop,satelliteExperience.parentElement, body);

    $("#close-button").addEventListener("click", function () {
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
    });
    $("#contact").addEventListener("click", function () {
        modalFSM.setState(modals.CONTACT_MODAL);
    });
    $("#github-title").addEventListener("click", function () {
        window.location.assign('https://github.com/rpdinaroASU');
    });
    $("#psyche-title").addEventListener("click", function () {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });
    modalBackdrop.addEventListener("click", function () {
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
    });

    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = "&copy; 2025 - " + new Date().getFullYear() + " www.emily-dinaro-portfolio.com - All Rights Reserved.";
        })();
    }
    about.addEventListener("click", function () {
        modalFSM.setState(modals.ABOUT_MODAL);
    });
    homePage.addEventListener("click", function () {
        modalFSM.setState(modals.HOME_MODAL)
    });

    for (let i = 0; i < satButton.length; i++)
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, modals.SATELLITE_MODAL);

    for(let i = 0; i < lmButton.length; i++)
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, modals.LORE_MYTHOLOGY_MODAL);

    for(let i = 0; i < geneticButton.length; i++)
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, modals.GENETIC_ALGORITHM_MODAL);

    for(let i = 0; i < dropdownHitbox.length; i++){
        dropdownHitbox.item(i).addEventListener("click", function () {
            dropdownHitbox.item(i).getElementsByClassName("stage-image").item(0).classList.toggle("selected-arrow");
            dropdownHitbox.item(i).parentElement.getElementsByClassName("stage-content").item(0).classList.toggle("hidden");
        });
    }

}
function addProjectInfoButtonListener(button, projectInfo, imageArr, modal) {
    button.addEventListener("click", function () {
        modalFSM.setState(modal);
        const ImageSelector = new ImageFSM(imageArr, projectInfo.querySelector(".stage-image-container"));
        ImageSelector.createImageSelector();
    });
}