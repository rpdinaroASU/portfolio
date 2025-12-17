import {ImageFSM} from './ImageFSM.js';

const satelliteImageArray = ["../images/sat-img-1.png", "../images/sat-img-2.png", "../images/sat-img-3.png"];

window.onload = () => {
    /* Contact me page */
    const contactPage = document.querySelector("#contact-me");
    const projects = document.querySelector("#projects");
    const aboutPage = document.querySelector("#about-me");
    const body = document.querySelector("body");
    const modalBackdrop =  document.querySelector("#modal-backdrop");
    const blurrable = document.querySelector("#blurrable");
    const satelliteExperience = document.querySelector("#satellite-experience");
    const loreMythologyExperience = document.querySelector("#lore-mythology-experience");
    const geneticAlgorithm = document.querySelector("#genetic-algorithm-information");
    const moreInformation = document.getElementsByClassName("more-information");


    document.querySelector("#close-button").addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        body.style.overflowY = "visible";
        blurrable.style.filter = "none";
    });
    document.querySelector("#contact").addEventListener("click", function () {
        contactPage.style.visibility = "visible";
        contactPage.display = "flex";
        body.style.overflow = "hidden";
        modalBackdrop.style.display = "flex";
        blurrable.style.filter = "blur(5px)";
    });
    document.querySelector("#github-title").addEventListener("click", function () {
        window.location.assign('https://github.com/rpdinaroASU');
    });
    document.querySelector("#psyche-title").addEventListener("click", function () {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });
    modalBackdrop.addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        body.style.overflowY = "visible";
        modalBackdrop.style.display = "none";
        blurrable.style.filter =  "none";
    });
    const copyrightElement = document.querySelector("#copyright");
    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = "&copy; 2025 - " + new Date().getFullYear() + " www.emily-dinaro-portfolio.com - All Rights Reserved.";
        })();
    }
    document.querySelector("#about").addEventListener("click", function () {
        projects.style.display = "none";
        aboutPage.style.display = "flex";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
    });
    document.querySelector("#home-page").addEventListener("click", function () {
        projects.style.display = "initial";
        aboutPage.style.display = "none";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
    });

    const satButton = document.getElementsByClassName("sat-button");
    for (let i = 0; i < satButton.length; i++)
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, satelliteImageArray, projects, aboutPage, moreInformation);

    const lmButton = document.getElementsByClassName("lore-button");
    for(let i = 0; i < lmButton.length; i++)
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, satelliteImageArray, projects, aboutPage, moreInformation);

    const geneticButton = document.getElementsByClassName("genetic-algorithm-button");
    for(let i = 0; i < geneticButton.length; i++)
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, satelliteImageArray, projects, aboutPage, moreInformation);
}
function addProjectInfoButtonListener(button, projectInfo, imageArr, projects, aboutPage, moreInformation, item) {
    button.addEventListener("click", function () {
        projects.style.display = "none";
        aboutPage.style.display = "none";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
        projectInfo.style.display = "flex";
        projectInfo.parentElement.style.display = "initial";
        const scrollContainer = projectInfo.querySelector(".img-scroll-container");
        const ImageSelector = new ImageFSM(imageArr, scrollContainer);
        ImageSelector.createImageSelector();
    });
}
