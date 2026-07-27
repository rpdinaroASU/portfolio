/**
 * @fileoverview Main portfolio initialization script managing navigation,
 * modal states via finite state machines (FSM), and dynamic content listeners.
 * @author Emily Dinaro
 */

import { ImageFSM } from './ImageFSM.js';
import { ModalFSM } from "./ModalFSM.js";

/** Base directory path for satellite experience project resources. */
const IMAGE_PATH_SAT_EXP = "../images/projects/project-resources/sat-experience/";

/**
 * Hierarchical array defining stages and their associated image assets
 * for the satellite experience project.
 */
const satelliteImageArray = [
    ["stage-0/", "sat-img-1.png", "sat-img-2.png", "sat-img-3.png"],
    ["stage-1/", "design.png", "mockup1.png", "mockup2.png", "mockup3.png", "research.png"],
    ["stage-2/", "color-blind-mockup.jpeg", "high-contrast-mockup.jpeg", "settings-mockup.jpg"],
    ["stage-3/", "distance-tracking.png", "horizons-api.png"],
    ["stage-4/", "colorblind.png", "help-refactor.png", "homepage-refactor.png"],
    ["stage-5/", "optical-before.png", "optical-after.png", "spec-before.png", "optical-after.png"]
];
const satelliteCaptionArray = [
    ["stage-0/",
        "Delivered Main page: Includes mission countdown, distance traveled, and navigation controls",
        "Delivered Mission page: Includes mission details and a scrubbable timeline",
        "Delivered Instrument page: Includes instrument details and allows the User to explore the spacecraft Psyche" ],
    ["stage-1/", "design.png", "mockup1.png", "mockup2.png", "mockup3.png", "research.png"],
    ["stage-2/", "color-blind-mockup.jpeg", "high-contrast-mockup.jpeg", "settings-mockup.jpg"],
    ["stage-3/", "distance-tracking.png", "horizons-api.png"],
    ["stage-4/", "colorblind.png", "help-refactor.png", "homepage-refactor.png"],
    ["stage-5/", "optical-before.png", "optical-after.png", "spec-before.png", "optical-after.png"]
];

/** Finite State Machine instance managing active modals and view transitions. */
let modalFSM;

/** Tracks whether the main navigation expanding menu is currently open. */
let expandedMenu = false;

/** Tracks whether the nested project navigation menu is currently open. */
let expandedProjectMenu = false;

/** DOM reference for the button that toggles the expanding menu. */
let expandingMenuButton;

/** DOM reference for the expanding menu container. */
let expandingMenu;

/** DOM reference for the project dropdown trigger element. */
let projectArrow;

/** DOM reference representing the currently active navigation item. */
let selectedModal;

/** Collection of horizontal project navigation elements. */
let projectButton;

/**
 * Initializes all core event listeners, DOM elements, and FSM controllers
 * once the window content has fully loaded.
 */
window.onload = () => {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    /* Page Sections & Core DOM Elements */
    const contactPage = $("#contact-me");
    const projects = $("#projects");
    const aboutPage = $("#about-me");
    const homePage = $$(".home-page");
    const body = $("body");
    const modalBackdrop = $("#modal-backdrop");
    const blurrable = $("#blurrable");
    const satelliteExperience = $("#satellite-experience");
    const loreMythologyExperience = $("#lore-mythology-experience");
    const geneticAlgorithm = $("#genetic-algorithm-information");
    const copyrightElement = $("#copyright");

    /* Interactive Elements & Buttons */
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

    /**
     * Enumeration mapping modal identifiers to their respective DOM containers.
     * @readonly
     * @enum {HTMLElement|string}
     */
    const modals = {
        SATELLITE_MODAL: satelliteExperience,
        LORE_MYTHOLOGY_MODAL: loreMythologyExperience,
        GENETIC_ALGORITHM_MODAL: geneticAlgorithm,
        ABOUT_MODAL: aboutPage,
        CONTACT_MODAL: contactPage,
        CLOSE_CONTACT_MODAL: "CLOSE_CONTACT_MODAL",
        HOME_MODAL: projects,
    };

    // Initialize the Modal Finite State Machine
    modalFSM = new ModalFSM(
        modals,
        blurrable,
        modalBackdrop,
        satelliteExperience.parentElement,
        body
    );

    // Close button event handler
    $("#close-button").addEventListener("click", () => {
        if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
    });

    // Contact triggers event listeners
    for (let x = 0; x < contact.length; x++) {
        contact.item(x).addEventListener("click", () => {
            modalFSM.setState(modals.CONTACT_MODAL);
        });
    }

    // External link handlers
    $("#github-title").addEventListener("click", () => {
        window.location.assign('https://github.com/rpdinaroASU');
    });

    $("#psyche-title").addEventListener("click", () => {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });

    // Backdrop click handler to close modals and menus
    modalBackdrop.addEventListener("click", () => {
        modalFSM.setState(modals.CLOSE_CONTACT_MODAL);
        if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });

    // Expanding menu toggle handler
    expandingMenuButton.addEventListener("click", () => {
        expandingMenu.classList.toggle("hidden");
        expandingMenu.classList.toggle("expanding-animation");
        expandingMenuButton.classList.toggle("project-hovered");
        expandedMenu = !expandedMenu;
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });

    // Nested project dropdown toggle handler
    projectArrow.addEventListener("click", () => {
        expandingMenuProjects.classList.toggle("hidden");
        expandingMenuProjects.classList.toggle("expanding-animation");
        projectArrow.classList.toggle("project-hovered");
        expandedProjectMenu = !expandedProjectMenu;
    });

    // Dynamic copyright year injection
    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = `&copy; 2025 - ${new Date().getFullYear()} www.emily-dinaro-portfolio.com - All Rights Reserved.`;
        })();
    }

    // About navigation links event listeners
    for (let i = 0; i < about.length; i++) {
        about.item(i).addEventListener("click", () => {
            modalFSM.setState(modals.ABOUT_MODAL);
            selectedModal.classList.toggle("underline");
            selectedModal = about.item(i);
            selectedModal.classList.toggle("underline");
            if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
            if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        });
    }

    // Set default home page state & active indicator
    selectedModal = homePage.item(0);
    selectedModal.classList.toggle("underline");

    for (let i = 0; i < homePage.length; i++) {
        homePage.item(i).addEventListener("click", () => {
            selectedModal.classList.toggle("underline");
            selectedModal = homePage.item(i);
            selectedModal.classList.toggle("underline");
            modalFSM.setState(modals.HOME_MODAL);
            if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
            if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
        });
    }

    // Bind project information buttons to their respective handlers
    for (let i = 0; i < satButton.length; i++) {
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, satelliteCaptionArray, modals.SATELLITE_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP, );
    }

    for (let i = 0; i < lmButton.length; i++) {
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, satelliteCaptionArray, modals.LORE_MYTHOLOGY_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP);
    }

    for (let i = 0; i < geneticButton.length; i++) {
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, satelliteCaptionArray, modals.GENETIC_ALGORITHM_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP);
    }

    // Accordion dropdown hitboxes for project stages
    for (let i = 0; i < dropdownHitbox.length; i++) {
        dropdownHitbox.item(i).addEventListener("click", () => {
            dropdownHitbox.item(i).getElementsByClassName("stage-image").item(0).classList.toggle("selected-arrow");
            dropdownHitbox.item(i).parentElement.getElementsByClassName("stage-content").item(0).classList.toggle("hidden");
        });
    }

    // Large screen projects container animation boundary adjustments
    const largeScreenProjects = $("#large-screen-projects");

    largeScreenProjects.addEventListener("transitionstart", () => {
        if (largeScreenProjects.clientHeight < 5) {
            largeScreenProjects.classList.toggle("border", true);
        }
    });

    largeScreenProjects.addEventListener("transitionend", () => {
        if (largeScreenProjects.clientHeight < 5) {
            largeScreenProjects.classList.toggle("border", false);
        }
    });
};

/**
 * Attaches a click event listener to a project button to open its corresponding modal,
 * instantiate its image gallery FSM, and collapse open menus.
 *
 * @param {HTMLElement} button - The button element triggering the modal view.
 * @param {HTMLElement} projectInfo - The container element holding the project's details and stages.
 * @param {string[][]} imageArr - The array of image paths structured by stages.
 * @param {HTMLElement|string} modal - The target modal identifier from the modals enum.
 * @param {HTMLElement} expandingMenuButton - The main menu expansion toggle button.
 * @param {HTMLElement} projectArrow - The project submenu toggle indicator element.
 * @param {string} imagePath - The root directory path for the project's images.
 */
function addProjectInfoButtonListener(button, projectInfo, imageArr, captionArr, modal, expandingMenuButton, projectArrow, imagePath) {
    button.addEventListener("click", () => {
        for (let i = 0; i < projectButton.length; i++) {
            selectedModal.classList.toggle("underline");
            selectedModal = projectButton.item(i);
            selectedModal.classList.toggle("underline");
        }

        modalFSM.setState(modal);
        new ImageFSM(imageArr, captionArr, projectInfo.querySelectorAll(".stage-image-container"), imagePath);

        if (expandedMenu) expandingMenuButton.dispatchEvent(new Event("click"));
        if (expandedProjectMenu) projectArrow.dispatchEvent(new Event("click"));
    });
}