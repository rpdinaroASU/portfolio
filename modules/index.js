import {ImageFSM} from './ImageFSM.js';
import {ModalFSM} from "./ModalFSM.js";

const IMAGE_PATH_SAT_EXP = "../images/project-resources/sat-experience/";

const satelliteImageArray = [
    ["stage-0/", "sat-img-1.png", "sat-img-2.png", "sat-img-3.png"],
    ["stage-1/", "design.png", "mockup1.png", "mockup2.png", "mockup3.png", "research.png"],
    ["stage-2/", "color-blind-mockup.jpeg", "high-contrast-mockup.jpeg", "settings-mockup.jpg"],
    ["stage-3/", "distance-tracking.png", "horizons-api.png"],
    ["stage-4/", "colorblind.png", "help-refactor.png", "homepage-refactor.png"],
    ["stage-5/", "optical-before.png", "optical-after.png", "spec-before.png", "optical-after.png"]];


let modalFSM;
let expandedProjectMenu = false;
let expandedMenu = false;
let expandingMenuButton;
let expandingMenu;
let projectArrow;
let selectedModal;
let projectButton;

window.onload = () => {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    /* Contact me page */
    const contactPage = $("#contact-me");
    const projects = $("#projects");
    const aboutPage = $("#about-me");
    const homePage = $$(".home-page");
    const body = $("body");
    const modalBackdrop =  $("#modal-backdrop");
    const blurrable = $("#blurrable");
    const satelliteExperience = $("#satellite-experience");
    const loreMythologyExperience = $("#lore-mythology-experience");
    const geneticAlgorithm = $("#genetic-algorithm-information");
    const copyrightElement = $("#copyright");
    const about = $$(".about");
    const dropdownHitbox = $$(".dropdown-hitbox");
    const geneticButton = $$(".genetic-algorithm-button");
    const lmButton = $$(".lore-button");
    const satButton = $$(".sat-button");
    const contact = $$(".contact");
    projectButton = $$(".project-horizontal");
    expandingMenuButton = $("#expanding-menu-button");
    expandingMenu = $("#expanding-menu");
    projectArrow = $("#projects-dropdown");
    const expandingMenuProjects = $("#expanding-menu-projects");

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
        if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
    });
    for(let x =0; x < contact.length;x++) {
        contact.item(x).addEventListener("click", function () {
            modalFSM.setState(modals.CONTACT_MODAL);
        })
    }
    $("#github-title").addEventListener("click", function () {
        window.location.assign('https://github.com/rpdinaroASU');
    });
    $("#psyche-title").addEventListener("click", function () {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });
    modalBackdrop.addEventListener("click", function () {
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
        if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });
    expandingMenuButton.addEventListener("click", function() {
        expandingMenu.classList.toggle("hidden")
        expandingMenu.classList.toggle("expanding-animation");
        expandingMenuButton.classList.toggle("project-hovered");
        expandedMenu = !expandedMenu;
        if(expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });
    projectArrow.addEventListener("click", function() {
        expandingMenuProjects.classList.toggle("hidden");
        expandingMenuProjects.classList.toggle("expanding-animation");
        projectArrow.classList.toggle("project-hovered");
        expandedProjectMenu = !expandedProjectMenu;
    });

    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = "&copy; 2025 - " + new Date().getFullYear() + " www.emily-dinaro-portfolio.com - All Rights Reserved.";
        })();
    }
    for (let i = 0; i < about.length; i++) {
        about.item(i).addEventListener("click", function () {
            modalFSM.setState(modals.ABOUT_MODAL);
            selectedModal.classList.toggle("underline");
            selectedModal = about.item(i);
            selectedModal.classList.toggle("underline")
            if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
            if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        });
    }
    selectedModal = homePage.item(0);
    selectedModal.classList.toggle("underline");
    for (let i = 0; i < homePage.length; i++) {
        homePage.item(i).addEventListener("click", function () {
            selectedModal.classList.toggle("underline");
            selectedModal = homePage.item(i);
            selectedModal.classList.toggle("underline")
            modalFSM.setState(modals.HOME_MODAL);
            if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
            if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        });
    }

    for (let i = 0; i < satButton.length; i++)
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, modals.SATELLITE_MODAL, expandingMenuButton, projectArrow);

    for(let i = 0; i < lmButton.length; i++)
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, modals.LORE_MYTHOLOGY_MODAL, expandingMenuButton, projectArrow);

    for(let i = 0; i < geneticButton.length; i++)
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, modals.GENETIC_ALGORITHM_MODAL, expandingMenuButton, projectArrow);

    for(let i = 0; i < dropdownHitbox.length; i++){
        dropdownHitbox.item(i).addEventListener("click", function () {
            dropdownHitbox.item(i).getElementsByClassName("stage-image").item(0).classList.toggle("selected-arrow");
            dropdownHitbox.item(i).parentElement.getElementsByClassName("stage-content").item(0).classList.toggle("hidden");
        });
    }
    const largeScreenProjects = $("#large-screen-projects");
    largeScreenProjects.addEventListener("transitionstart", function () {
        if(largeScreenProjects.clientHeight<5)largeScreenProjects.classList.toggle("border", true);
    })
    largeScreenProjects.addEventListener("transitionend", function () {
        if(largeScreenProjects.clientHeight<5)largeScreenProjects.classList.toggle("border", false);
    })


}
function addProjectInfoButtonListener(button, projectInfo, imageArr, modal, expandingMenuButton, projectArrow) {
    button.addEventListener("click", function () {
        for(let i = 0; i < projectButton.length; i++) {
            selectedModal.classList.toggle("underline");
            selectedModal = projectButton.item(i);
            selectedModal.classList.toggle("underline")
        }
        modalFSM.setState(modal);
        const ImageSelector = new ImageFSM(imageArr, projectInfo.querySelectorAll(".stage-image-container"));
        if(expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if(expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });
}