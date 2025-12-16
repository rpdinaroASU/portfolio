let imgCount = 0;
let projectPage = -1;
const firstStageImages = document.getElementsByClassName("first-stage-image");
const secondStageImages = document.getElementsByClassName("second-stage-image");
const thirdStageImages = document.getElementsByClassName("third-stage-image");


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
        addProjectInfoButtonListener(satButton.item(i), satelliteExperience, projects, aboutPage, moreInformation, 0);

    const lmButton = document.getElementsByClassName("lore-button");
    for(let i = 0; i < lmButton.length; i++)
        addProjectInfoButtonListener(lmButton.item(i), loreMythologyExperience, projects, aboutPage, moreInformation, 1);

    const geneticButton = document.getElementsByClassName("genetic-algorithm-button");
    for(let i = 0; i < geneticButton.length; i++)
        addProjectInfoButtonListener(geneticButton.item(i), geneticAlgorithm, projects, aboutPage, moreInformation, 2);

    document.querySelector(".left-arrow").addEventListener("click", function () {
        if(imgCount === 0) {
            imgCount = 2;
        } else {
            imgCount--;
        }
        updateImage();
    });
    document.querySelector(".right-arrow").addEventListener("click", function () {
        if(imgCount === 2) {
            imgCount = 0;
        } else {
            imgCount++;
        }
        updateImageSelector();
    });
}
function addProjectInfoButtonListener(button, projectInfo, projects, aboutPage, moreInformation, item) {
    button.addEventListener("click", function () {
        projects.style.display = "none";
        aboutPage.style.display = "none";
        for (let i = 0; i < moreInformation.length; i++) {
            moreInformation.item(i).style.display = "none";
        }
        projectInfo.style.display = "flex";
        projectInfo.parentElement.style.display = "initial";
        imgCount = 0;
        projectPage = item;
        updateImageSelector();
    })
}
function updateImageSelector() {
    imgCount %= 3;
    if(imgCount === 0) {
        document.querySelector(".first-img-circle").style.backgroundColor = "white";
        document.querySelector(".first-img-circle").style.border = "1px solid white";
        document.querySelector(".second-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".second-img-circle").style.border = "1px solid var(--secondary-light-color)";
        document.querySelector(".third-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".third-img-circle").style.border = "1px solid var(--secondary-light-color)";
    }
    else if(imgCount ===1) {
        document.querySelector(".first-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".first-img-circle").style.border = "1px solid var(--secondary-light-color)";
        document.querySelector(".second-img-circle").style.backgroundColor = "white";
        document.querySelector(".second-img-circle").style.border = "1px solid white";
        document.querySelector(".third-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".third-img-circle").style.border = "1px solid var(--secondary-light-color)";
    }
    else if(imgCount ===2) {
        document.querySelector(".first-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".first-img-circle").style.border = "1px solid var(--secondary-light-color)";
        document.querySelector(".second-img-circle").style.backgroundColor = "var(--secondary-light-color)";
        document.querySelector(".second-img-circle").style.border = "1px solid var(--secondary-light-color)";
        document.querySelector(".third-img-circle").style.backgroundColor = "white";
        document.querySelector(".third-img-circle").style.border = "1px solid white";
    }
}