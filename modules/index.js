import {ImageFSM} from './ImageFSM.js';

const satelliteImageArray = ["sat-img-1.png", "sat-img-2.png", "sat-img-3.png"];

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
    const moreInformation = $$(".more-information");
    const dropdownHitbox = $$(".dropdown-hitbox");
    const geneticButton = $$(".genetic-algorithm-button");
    const lmButton = $$(".lore-button");
    const satButton = $$(".sat-button");


    $("#close-button").addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        body.style.overflowY = "visible";
        blurrable.style.filter = "none";
    });
    $("#contact").addEventListener("click", function () {
        contactPage.style.visibility = "visible";
        contactPage.display = "flex";
        body.style.overflow = "hidden";
        modalBackdrop.style.display = "flex";
        blurrable.style.filter = "blur(5px)";
    });
    $("#github-title").addEventListener("click", function () {
        window.location.assign('https://github.com/rpdinaroASU');
    });
    $("#psyche-title").addEventListener("click", function () {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });
    modalBackdrop.addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        body.style.overflowY = "visible";
        modalBackdrop.style.display = "none";
        blurrable.style.filter =  "none";
    });

    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = "&copy; 2025 - " + new Date().getFullYear() + " www.emily-dinaro-portfolio.com - All Rights Reserved.";
        })();
    }
    about.addEventListener("click", function () {
        projects.style.display = "none";
        aboutPage.style.display = "flex";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
    });
    homePage.addEventListener("click", function () {
        projects.style.display = "initial";
        aboutPage.style.display = "none";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
    });

    for (let i = 0; i < satButton.length; i++)
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, projects, aboutPage, moreInformation);


    for(let i = 0; i < lmButton.length; i++)
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, projects, aboutPage, moreInformation);


    for(let i = 0; i < geneticButton.length; i++)
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, projects, aboutPage, moreInformation);

    for(let i = 0; i < dropdownHitbox.length; i++){
        dropdownHitbox.item(i).addEventListener("click", function () {
            dropdownHitbox.item(i).getElementsByClassName("stage-image").item(0).classList.toggle("selected-arrow");
            dropdownHitbox.item(i).parentElement.getElementsByClassName("stage-content").item(0).classList.toggle("hidden");
        });
    }

}
function addProjectInfoButtonListener(button, projectInfo, imageArr, projects, aboutPage, moreInformation) {
    button.addEventListener("click", function () {
        projects.style.display = "none";
        aboutPage.style.display = "none";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
        projectInfo.style.display = "flex";
        projectInfo.parentElement.style.display = "initial";
        let scrollContainer = projectInfo.querySelector(".stage-image-container");
        const ImageSelector = new ImageFSM(imageArr, scrollContainer);
        ImageSelector.createImageSelector();
    });
}
