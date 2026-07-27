import {FSMFunctions} from './FSMFunctions.js';

const imageChangeInterval = 5000;
const imagePath = "../images/project-resources/sat-experience/";

/**
 * Creates a finite state machine that cycles through a set of images.
 * Generates a scrollable container with circles that can be clicked to cycle through images.
 * Animation is done using CSS transitions and intervals to simulate a rolling carousel.
 * The image fades out in set intervals.
 */
export class ImageFSM {
    bottomImage;
    topImage;
    scrollContainer;
    /**
     * Creates a finite state machine that cycles through a set of images
     * @param imageNameArray the array of image names
     * @param parentNodeList the parent containers for the scrollable containers and the image
     */
    constructor(imageNameArray, parentNodeList) {
        this.imageNameArray = imageNameArray;
        this.parentNodeList = parentNodeList;
        this.bottomImage = [];
        this.topImage = [];
        this.scrollContainer = [];
        this.circles = []
        this.rollingInterval = [];
        this.imgCount = [];
        this.right = [];

        for (let index = 0; index < imageNameArray.length; index++) {
            this.parentNodeList[index].innerHTML = "";
            this.bottomImage[index] = this.setUpVisibleStageImages(false, index);
            this.topImage[index] = this.setUpVisibleStageImages(true, index);

            this.parentNodeList[index].appendChild(this.bottomImage[index]);
            this.parentNodeList[index].appendChild(this.topImage[index]);

            this.scrollContainer[index] = document.createElement("div");

            this.scrollContainer[index].className = "img-scroll-container";
            this.scrollContainer[index].style.gridTemplateColumns = `repeat( ${imageNameArray.length + 2}, auto)`;
            this.parentNodeList[index].appendChild(this.scrollContainer[index]);
            this.imgCount[index] = 0;
            this.right[index] = true;
            this.circles[index] = [];
            this.createImageSelector(imageNameArray[index]);
        }
    }

    /**
     * Helper function to calculate the modulus of two numbers within the length of FSM
     * @param targetNumber number to be modded
     * @param index
     * @returns {number} returns the modulus of targetNumber and FSM length
     */
    mod(targetNumber, index) {
        return FSMFunctions.mod(targetNumber, this.circles[index].length);
    }

    /**
     * Starts the auto-scroll interval
     */
    startAutoScroll(index) {
        this.stopAutoScroll();
        // start CSS transition on current node
        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];

        currentNode.classList.toggle("image-circle-transition-grow",true);

        //start rolling timer
        this.rollingInterval[index] = setInterval(() => {
            this.arrowClick(index).then(() => {});
        }, imageChangeInterval);
    }

    /**
     * stops the auto-scroll interval
     */
    stopAutoScroll(index) {
        clearInterval(this.rollingInterval[index]);
    }

    /**
     * Creates the scrollable carousel and adds the image selectors to it
     */
    createImageSelector(imageArrayList) {
        const documentFragment = document.createDocumentFragment();
        const scrollIndex = Number(imageArrayList[0].slice(-2,-1));

        this.circles[scrollIndex] = [];
        // Left arrow
        documentFragment.appendChild(this.makeArrow(false, 1,scrollIndex));

        // Circles
        for (let i = 1; i < imageArrayList.length; i++) {
            let col = i + 2;

            let backgroundCircle = this.makeSelectorElement(col);
            backgroundCircle.addEventListener("click", () => {
                this.imgCount = i-1;
                this.startAutoScroll();
                this.arrowClick().then(() => {});
            });

            documentFragment.appendChild(backgroundCircle);

            let selector = this.makeSelectorElement(col);
            selector.classList.add("image-circle-selector");
            this.circles[scrollIndex].push(selector);
            documentFragment.appendChild(selector);
        }

        // Right arrow
        documentFragment.appendChild(this.makeArrow(true, imageArrayList.length + 2, scrollIndex));
        this.scrollContainer[scrollIndex].appendChild(documentFragment);

        this.startAutoScroll(scrollIndex);
    }

    /**
     * Creates a circle that indicates the selected images
     * @param column
     * @returns {HTMLDivElement}
     */
    makeSelectorElement(column) {
        const circle = document.createElement("div");
        circle.className = "image-circle";
        circle.style.gridArea = `1 / ${column} / 2 / ${column + 1}`;
        return circle;
    }

    /**
     * Creates the left or right arrow that cycles through the images
     * @param isRight true if the arrow should point right, false otherwise
     * @param gridColumn the column the arrow should be placed in
     * @param index
     * @returns {HTMLImageElement} the created arrow
     */
    makeArrow(isRight, gridColumn, index) {
        const arrow = document.createElement("img");
        arrow.src = `../images/icons/down-arrow.svg`;
        arrow.alt = isRight ? " > " : " < ";
        arrow.className = isRight ? "right-arrow" : "left-arrow";
        arrow.style.gridArea = `1 / ${gridColumn} / 2 / ${gridColumn + 1}`;
        arrow.addEventListener("click", () => {
            this.right[index] = isRight;
            this.startAutoScroll(index);
            this.arrowClick(index).then(() => {});
        });
        return arrow;
    };

    /**
     * Creates top or bottom visible images
     * @param isTopImage true if an element should be the top image, false otherwise
     * @param index
     * @returns {HTMLImageElement} the top or bottom visible image
     */
    setUpVisibleStageImages(isTopImage, index) {
        let node = document.createElement("img");
        node.src = imagePath + this.imageNameArray[index][0]+this.imageNameArray[index][1];
        node.alt = "Example Image";
        node.classList.toggle("stage-description-image",true);
        node.classList.toggle(isTopImage ? "top-stage-image" : "bottom-stage-image", true);

        return node;
    }


    /**
     * updates the image count and starts the auto-scroll interval
     */
    async arrowClick(index) {
        this.circles[index].forEach(node => {
            node.classList.toggle("image-circle-transition-grow", false);
        });

        this.imgCount[index] = this.mod(this.imgCount[index] + (this.right[index] ? 1 : -1),index);

        this.bottomImage[index].src = imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][this.imgCount[index]+1];

        // Start fade
        this.topImage[index].classList.toggle("image-fade-out",true);
        const currentNode = this.circles[index][this.mod(this.imgCount[index],index)];
        currentNode.classList.toggle("image-circle-transition-grow",true);

        // Wait for CSS transition to finish
        await new Promise(resolve => {
            this.topImage[index].addEventListener("animationend", resolve, { once: true });
        });

        // Swap image AFTER fade completes
        this.topImage[index].src = this.bottomImage[index].src;
        // Reset for next cycle
        this.topImage[index].classList.toggle("image-fade-out", false);
    }
}