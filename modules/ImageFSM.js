const topImage = document.getElementsByClassName("top-stage-image").item(0);
const bottomImage = document.getElementsByClassName("bottom-stage-image").item(0);
const imageChangeInterval = 5000;

export class ImageFSM {
    constructor(imageNameArray, scrollContainer) {
        this.imageNameArray = imageNameArray;
        let parentNode = scrollContainer.parentNode;
        parentNode.removeChild(scrollContainer);
        this.scrollContainer = document.createElement("div");
        parentNode.appendChild(this.scrollContainer);

        this.scrollContainer.className = "img-scroll-container";
        this.scrollContainer.style.gridTemplateColumns = "repeat(" + (imageNameArray.length + 2)+ "auto)";
        this.imgCount = 0;
        this.right = true;
        this.circles = [];
        topImage.style.opacity = "1";
    }

    startAutoScroll() {
        this.stopAutoScroll();
        // start css transition on current node
        const circles = [...this.scrollContainer.querySelectorAll(".image-circle-selector")];
        const len = circles.length;
        const currentNode = circles[this.imgCount % len];
        currentNode.offsetWidth; // force reflow

        currentNode.classList.add("image-circle-transition-grow");

        //start rolling timer
        this.rollingInterval = setInterval(() => {
            this.rollingIntervalAnimation();
        }, imageChangeInterval);
    }

    stopAutoScroll() {
        clearInterval(this.rollingInterval);
    }

    createImageSelector() {
        topImage.src = this.imageNameArray[0];
        bottomImage.src = this.imageNameArray[0];
        let leftArrow = document.createElement("img");
        leftArrow.src = "../images/down-arrow.svg";
        leftArrow.alt = " < ";
        leftArrow.className = "left-arrow";
        leftArrow.addEventListener("click", () => {
            this.right = false;
            this.arrowClick();
        })
        leftArrow.style.gridArea = "1 / 1 / 2 / 2";
        this.scrollContainer.appendChild(leftArrow);
        let count = 2;
        this.imageNameArray.forEach(() => {
            let imageSelector = document.createElement("div");
            imageSelector.className = "image-circle";
            imageSelector.style.gridArea = "1 / " + count + " / 2 / " + (count + 1);
            imageSelector.style.backgroundColor = "var(--secondary-light-color)";
            imageSelector.style.border = "1px solid var(--secondary-light-color)";
            this.scrollContainer.appendChild(imageSelector);
            let node = imageSelector.cloneNode(true);
            node.classList.add("image-circle-selector");
            node.style.gridArea = "1 / " + count + " / 2 / " + (count + 1);
            this.scrollContainer.appendChild(node);
            count++;
        })
        let rightArrow = document.createElement("img");
        rightArrow.src = "../images/down-arrow.svg";
        rightArrow.alt = " > ";
        rightArrow.className = "right-arrow";
        rightArrow.style.gridArea = "1 / " + count + " / 2 / " + (count + 1);
        rightArrow.addEventListener("click", () => {
            this.right = true;
            this.arrowClick();
        })
        this.scrollContainer.appendChild(rightArrow);
        this.circles = [...this.scrollContainer.querySelectorAll(".image-circle-selector")];
        this.startAutoScroll();
    }

    updateImage(imgCount) {
        imgCount %= this.imageNameArray.length;
        bottomImage.src = this.imageNameArray[imgCount];
        this.fadeInterval = setInterval(() => this.fadeOutAnimation(), 60);
    }

    fadeOutAnimation() {
        let opacity = parseFloat(topImage.style.opacity);
        if (opacity > 0) {
            opacity-=0.1;
            topImage.style.opacity = opacity.toString();
        } else {
            topImage.src = bottomImage.src;
            topImage.style.opacity = "1";
            clearInterval(this.fadeInterval);
        }
    }

    arrowClick() {
        this.circles.forEach(node => {
            node.classList.remove("image-circle-transition-grow");
        });
        if(this.right) {
            if (this.imgCount === this.imageNameArray.length - 1) {
                this.imgCount = 0;
            } else {
                this.imgCount++;
            }
        } else {
            if(this.imgCount === 0) {
                this.imgCount = this.imageNameArray.length-1;
            } else {
                this.imgCount--;
            }
        }

        this.startAutoScroll();
        this.updateImage(this.imgCount);

    }
    rollingIntervalAnimation() {
        this.circles.forEach(node => {
            node.classList.remove("image-circle-transition-grow");
        });
        this.arrowClick();

        const len = this.circles.length;
        const currentNode = this.circles[this.imgCount % len];
        currentNode.classList.add("image-circle-transition-grow");
    }
}