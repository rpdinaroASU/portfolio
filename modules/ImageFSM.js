const topImage = document.getElementsByClassName("top-stage-image").item(0);
const bottomImage = document.getElementsByClassName("bottom-stage-image").item(0);
const imageChangeInterval = 4000;

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
        topImage.style.opacity = "1";
        this.rollingInterval = setInterval(() => {
            this.rightArrowClick();
        }, imageChangeInterval);
    }
    createImageSelector() {
        topImage.src = this.imageNameArray[0];
        bottomImage.src = this.imageNameArray[0];
        let leftArrow = document.createElement("img");
        leftArrow.src = "../images/down-arrow.svg";
        leftArrow.alt = " < ";
        leftArrow.className = "left-arrow";
        leftArrow.addEventListener("click", () => {
            this.leftArrowClick();
        })
        leftArrow.style.gridArea = "1 / 1 / 2 / 2";
        this.scrollContainer.appendChild(leftArrow);
        let count = 2;
        this.imageNameArray.forEach(() => {
            let imageSelector = document.createElement("div");
            if(count===2) {
                imageSelector.style.backgroundColor = "white";
                imageSelector.style.border = "1px solid white";
            } else {
                imageSelector.style.backgroundColor = "var(--secondary-light-color)";
                imageSelector.style.border = "1px solid var(--secondary-light-color)";
            }
            imageSelector.className = "image-circle";
            imageSelector.style.gridArea = "1 / " + count + " / 2 / " + (count + 1);
            imageSelector.style.margin = "auto 10px";
            this.scrollContainer.appendChild(imageSelector);
            count++;
        })
        let rightArrow = document.createElement("img");
        rightArrow.src = "../images/down-arrow.svg";
        rightArrow.alt = " > ";
        rightArrow.className = "right-arrow";
        rightArrow.style.gridArea = "1 / " + count + " / 2 / " + (count + 1);
        rightArrow.addEventListener("click", () => {
            this.rightArrowClick();
        })
        this.scrollContainer.appendChild(rightArrow);
    }
    updateImage(imgCount) {
        let count = 1;
        this.imageNameArray.forEach(() => {
            if(this.scrollContainer.childNodes.item(count).classList.contains("image-circle")) {
                this.scrollContainer.childNodes.item(count).style.backgroundColor = "var(--secondary-light-color)";
                this.scrollContainer.childNodes.item(count).style.border = "1px solid var(--secondary-light-color)";
            }
            count++;
        });
        imgCount %= this.imageNameArray.length;
        bottomImage.src = this.imageNameArray[imgCount];
        let currentNode = this.scrollContainer.childNodes.item(imgCount+1);
        currentNode.style.backgroundColor = "white";
        currentNode.style.border = "1px solid white";
        this.fadeInterval = setInterval(() => this.fadeOutAnimation(), 30);
    }
    fadeOutAnimation() {
        let opacity = parseFloat(topImage.style.opacity);
        if (opacity > 0) {
            opacity-=0.075;
            topImage.style.opacity = opacity.toString();
        } else {
            topImage.src = bottomImage.src;
            topImage.style.opacity = "1";
            clearInterval(this.fadeInterval);
        }
    }
    leftArrowClick() {
        if(this.imgCount === 0) {
            this.imgCount = this.imageNameArray.length-1;
        } else {
            this.imgCount--;
        }
        this.updateImage(this.imgCount);
        clearInterval(this.rollingInterval);
        this.rollingInterval = setInterval(() => {
            this.leftArrowClick();
        }, imageChangeInterval);
    }
    rightArrowClick() {
        if(this.imgCount === this.imageNameArray.length-1) {
            this.imgCount = 0;
        } else {
            this.imgCount++;
        }
        this.updateImage(this.imgCount);

        clearInterval(this.rollingInterval);
        this.rollingInterval = setInterval(() => {
            this.rightArrowClick();
        }, imageChangeInterval);
    }
}