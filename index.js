window.onload = () => {
    /* Contact me page */
    const contactPage = document.querySelector("#contact-me");
    document.querySelector("#close-button").addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        document.querySelector("body").style.overflowY = "visible";
        document.querySelector("#blurrable").style.filter = "none";
    });
    document.querySelector("#contact").addEventListener("click", function () {
        contactPage.style.visibility = "visible";
        contactPage.display = "flex";
        document.querySelector("body").style.overflow = "hidden";
        document.querySelector("#modal-backdrop").style.display = "flex";
        document.querySelector("#blurrable").style.filter = "blur(5px)";
    });
    document.querySelector("#github-title").addEventListener("click", function () {
        window.location.assign('https://github.com/rpdinaroASU');
    });
    document.querySelector("#psyche-title").addEventListener("click", function () {
        window.location.assign('https://psyche.ssl.berkeley.edu/get-involved/capstone-projects/capstone-projects-iridium-class/ar-webxr-for-public-engagement-asu-e/');
    });
    document.querySelector("#modal-backdrop").addEventListener("click", function () {
        contactPage.style.visibility = "hidden";
        document.querySelector("body").style.overflowY = "visible";
        document.querySelector("#modal-backdrop").style.display = "none";
        document.querySelector("#blurrable").style.filter =  "none";
    });
    const copyrightElement = document.querySelector("#copyright");
    if (copyrightElement) {
        (() => {
            copyrightElement.innerHTML = "&copy; 2025 - " + new Date().getFullYear() + " www.emily-dinaro.portfolio - All Rights Reserved.";
        })();
    }
    document.querySelector("#about").addEventListener("click", function () {
        const project = document.querySelector("#content");
        project.style.display = "none";
        const aboutPage = document.querySelector("#about-me");
        aboutPage.style.display = "flex";
    });
    document.querySelector("#home-page").addEventListener("click", function () {
        const project = document.querySelector("#content");
        project.style.display = "flex";
        const aboutPage = document.querySelector("#about-me");
        aboutPage.style.display = "none";
    });

}
