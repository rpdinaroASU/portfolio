const imageChangeInterval = 5000;
const imagePath = "../images/";

/**
 * Creates a finite state machine that cycles through a set of images.
 * Generates a scrollable container with circles that can be clicked to cycle through images.
 * Animation is done using CSS transitions and intervals to simulate a rolling carousel.
 * The image fades out in set intervals.
 */
export class ImageFSM {
    /**
     * Creates a finite state machine that cycles through a set of images
     * @param imageNameArray the array of image names
     * @param parentNode the parent container for the scrollable container and the image
     */
    constructor(imageNameArray, parentNode) {
        this.imageNameArray = imageNameArray;
        this.parentNode = parentNode;
        this.parentNode.innerHTML = "";
        this.bottomImage = this.setUpVisibleStageImages(false);
        this.topImage = this.setUpVisibleStageImages(true);

        this.parentNode.appendChild(this.bottomImage);
        this.parentNode.appendChild(this.topImage);

        this.scrollContainer = document.createElement("div");

        this.scrollContainer.className = "img-scroll-container";
        this.scrollContainer.style.gridTemplateColumns = `repeat( ${imageNameArray.length + 2}, auto)`;
        this.parentNode.appendChild(this.scrollContainer);
        this.imgCount = 0;
        this.right = true;
        this.circles = [];

    }

    /**
     * Helper function to calculate the modulus of two numbers within the length of FSM
     * @param targetNumber number to be modded
     * @returns {number} returns the modulus of n and m
     */
    mod(targetNumber) {
        return ((targetNumber % this.circles.length) + this.circles.length) % this.circles.length;
    }

    /**
     * Starts the auto-scroll interval
     */
    startAutoScroll() {
        this.stopAutoScroll();
        // start css transition on current node
        const currentNode = this.circles[this.mod(this.imgCount)];
        currentNode.offsetWidth; // force reflow

        currentNode.classList.toggle("image-circle-transition-grow",true);

        //start rolling timer
        this.rollingInterval = setInterval(() => {
            this.arrowClick().then(() => {});
        }, imageChangeInterval);
    }

    /**
     * stops the auto-scroll interval
     */
    stopAutoScroll() {
        clearInterval(this.rollingInterval);
    }

    /**
     * Creates the scrollable carousel and adds the image selectors to it
     */
    createImageSelector() {
        const documentFragment = document.createDocumentFragment();
        // Left arrow
        documentFragment.appendChild(this.makeArrow(false, 1));

        // Circles
        let col = 2;
        this.imageNameArray.forEach(() => {
            documentFragment.appendChild(this.makeSelectorElement(col));
            let selector = this.makeSelectorElement(col);
            selector.classList.toggle("image-circle-selector", true);
            this.circles.push(selector);
            documentFragment.appendChild(selector);

            col++;
        });

        // Right arrow
        documentFragment.appendChild(this.makeArrow(true, col));

        this.scrollContainer.appendChild(documentFragment);

        this.startAutoScroll();
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
     * @returns {HTMLImageElement} the created arrow
     */
    makeArrow(isRight, gridColumn) {
        const arrow = document.createElement("img");
        arrow.src = `${imagePath}down-arrow.svg`;
        arrow.alt = isRight ? " > " : " < ";
        arrow.className = isRight ? "right-arrow" : "left-arrow";
        arrow.style.gridArea = `1 / ${gridColumn} / 2 / ${gridColumn + 1}`;
        arrow.addEventListener("click", () => {
            this.right = isRight;
            this.startAutoScroll();
            this.arrowClick().then(() => {});
        });
        return arrow;
    };

    /**
     * Creates top or bottom visible images
     * @param isTopImage true if an element should be the top image, false otherwise
     * @returns {HTMLImageElement} the top or bottom visible image
     */
    setUpVisibleStageImages(isTopImage) {
        let node = document.createElement("img");
        node.src = imagePath + this.imageNameArray[0];
        node.alt = "Example Image";
        node.classList.toggle("stage-description-image",true);
        node.classList.toggle(isTopImage ? "top-stage-image" : "bottom-stage-image", true);
        node.style.opacity = isTopImage ? "1" : "0";

        return node;
    }


    /**
     * updates the image count and starts the auto-scroll interval
     */
    async arrowClick() {
        this.circles.forEach(node => {
            node.classList.toggle("image-circle-transition-grow", false);
        });

        this.imgCount = this.mod(this.imgCount + (this.right ? 1 : -1));

        this.bottomImage.src = imagePath + this.imageNameArray[this.imgCount];

        // Start fade
        this.topImage.classList.toggle("image-fade-out",true);
        const currentNode = this.circles[this.mod(this.imgCount)];
        currentNode.classList.toggle("image-circle-transition-grow",true);

        // Wait for CSS transition to finish
        await new Promise(resolve => {
            this.topImage.addEventListener("animationend", resolve, { once: true });
        });

        // Swap image AFTER fade completes
        this.topImage.src = this.bottomImage.src;
        // Reset for next cycle
        this.topImage.classList.toggle("image-fade-out", false);
    }
}