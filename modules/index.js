/**
 * @fileoverview Main portfolio initialization script managing navigation,
 * modal states via finite state machines (FSM), and dynamic content listeners.
 * @author Emily Dinaro
 */

import {ImageFSM} from './ImageFSM.js';
import {ModalFSM} from "./ModalFSM.js";

/** Base directory path for satellite experience project resources. */
const IMAGE_PATH_SAT_EXP = "../images/projects/project-resources/sat-experience/";

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
 * Fetches and parses the satellite XML data.
 * @param {string} xmlUrl - The path to your XML file (e.g., './data.xml')
 * @returns {Promise<{satelliteImageArray: string[][], satelliteCaptionArray: string[][]}>}
 */

/**
 * Initializes all core event listeners, DOM elements, and FSM controllers
 * once the window content has fully loaded.
 */
window.onload = () => {
    const filePath = "../xml/satellite-experience/project-page.xml";
    const containerId = "stages-wrapper"; // The ID of your HTML container

    projectBuilder(filePath).then(html => {
        document.getElementById(containerId).innerHTML = html;
    });

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
    //const geneticButton = $$(".genetic-algorithm-button");
    //const lmButton = $$(".lore-button");
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

    loadSatelliteData('../xml/satellite-experience/image-caption-array.xml')
        .then(({ satelliteImageArray, satelliteCaptionArray }) => {
            // Bind project information buttons to their respective handlers
            for (let i = 0; i < satButton.length; i++) {
                addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, satelliteCaptionArray, modals.SATELLITE_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP, );
            }
        })
        .catch(error => {
            console.error("Error loading XML data:", error);
        });

    
    /*
    for (let i = 0; i < lmButton.length; i++) {
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, satelliteCaptionArray, modals.LORE_MYTHOLOGY_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP);
    }

    for (let i = 0; i < geneticButton.length; i++) {
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, satelliteCaptionArray, modals.GENETIC_ALGORITHM_MODAL, expandingMenuButton, projectArrow, IMAGE_PATH_SAT_EXP);
    }
    */


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

    async function loadSatelliteData(xmlUrl) {
        // 1. Fetch the XML file
        const response = await fetch(xmlUrl);
        const xmlText = await response.text();

        // 2. Parse the text into an XML Document Object
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, "application/xml");

        // 3. Initialize the two main arrays
        const satelliteImageArray = [];
        const satelliteCaptionArray = [];

        // 4. Iterate through every <stage> in the XML
        const stages = xmlDoc.querySelectorAll("stage");

        stages.forEach(stage => {
            // Extract the path attribute (e.g., "stage-0/")
            const path = stage.getAttribute("path");

            // Start our sub-arrays with the path as the first element
            const imageSubArray = [path];
            const captionSubArray = [path];

            // 5. Iterate through every <slide> within this stage
            const slides = stage.querySelectorAll("slide");

            slides.forEach(slide => {
                // Extract the text content from the inner tags
                const imageText = slide.querySelector("image").textContent;
                const captionText = slide.querySelector("caption").textContent;

                // Push the values to their respective sub-arrays
                imageSubArray.push(imageText);
                captionSubArray.push(captionText);
            });

            // 6. Push the completed sub-arrays into the main arrays
            satelliteImageArray.push(imageSubArray);
            satelliteCaptionArray.push(captionSubArray);
        });

        return { satelliteImageArray, satelliteCaptionArray };
    }
};

/**
 * Attaches a click event listener to a project button to open its corresponding modal,
 * instantiate its image gallery FSM, and collapse open menus.
 *
 * @param {HTMLElement} button - The button element triggering the modal view.
 * @param {HTMLElement} projectInfo - The container element holding the project's details and stages.
 * @param {string[][]} imageArr - The array of image paths structured by stages.
 * @param captionArr
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


async function projectBuilder(filePath) {
    try {
        // Fetch the XML file from the provided path
        const response = await fetch(filePath);

        // Extract the XML text
        const xmlString = await response.text();

        // Parse the XML string into an XML Document
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");

        // Get all stage elements
        const stages = xmlDoc.querySelectorAll("stage");
        let htmlOutput = "";

        // Loop through each stage and build the HTML
        stages.forEach((stage, index) => {
            if (stage.getAttribute("skip") === "true") {
                // Exit this iteration early, but 'index' will still increment for the next one
                return;
            }
            const stageTitle = stage.querySelector("title")?.textContent || "";
            const sectionTitle = stage.querySelector("section > title")?.textContent || "";

            // Handle optional description
            const descriptionNode = stage.querySelector("section > description");
            let descriptionHtml = "";
            if (descriptionNode) {
                descriptionHtml = `
                                    <p style="margin-bottom: 15px;">
                                        ${descriptionNode.textContent.trim()}
                                    </p>`;
            }

            // Build list items
            const items = stage.querySelectorAll("item");
            let itemsHtml = "";
            items.forEach(item => {
                const name = item.querySelector("name")?.textContent || "";
                const detail = item.querySelector("detail")?.textContent || "";

                itemsHtml += `
                                        
                                            <div class="project-title-font bold">${name}</div>
                                            <ul style="margin:2px"><li>${detail}</li></ul>`;
            });
            itemsHtml += `<div class="spacer"></div>`

            // Construct the full stage HTML
            htmlOutput += `
                    <div class="stage-container">
                        <div class="project-stage project-title-font dropdown-hitbox">
                            <div class="stage-title">${stageTitle}</div>
                            <img src="../images/icons/down-arrow.svg" alt=" ∨ " class="stage-image">
                        </div>
                        <div class="stage-image-container stage-${index}"></div>
                        <div class="stage-description left-align-text">
                            <div class="text text-top project-title-font">
                                <div class="project-title-font bold">
                                    ${sectionTitle}
                                </div>
                                <div class="project-paragraph-font-size">${descriptionHtml}
                                    ${itemsHtml}
                                </div>
                            </div>
                        </div>
                    </div>`;
        });

        return htmlOutput;

    } catch (error) {
        console.error("Error loading or parsing XML:", error);
        return `<div class="error">Unable to load project timeline.</div>`;
    }
}