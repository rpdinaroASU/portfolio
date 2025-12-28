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
        this.images = [];
    }
    /**
     * Helper function to calculate the modulus of two numbers within the length of FSM
     * @param targetNumber number to be modded
     * @param FSMLength length of finite state machine
     * @returns {number} returns the modulus of n and m
     */
    static mod(targetNumber, FSMLength) {
        return ((targetNumber % FSMLength) + FSMLength) % FSMLength;
    }

    /**
     * Starts the auto-scroll interval
     */
    startAutoScroll() {
        this.stopAutoScroll();
        // start css transition on current node
        const currentNode = this.circles[this.imgCount % this.circlesLen];
        currentNode.offsetWidth; // force reflow

        currentNode.classList.add("image-circle-transition-grow");

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

        const makeArrow = (isRight, gridColumn) => {
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
        const makeCircle = (column) => {
            const circle = document.createElement("div");
            circle.className = "image-circle";
            circle.style.gridArea = `1 / ${column} / 2 / ${column + 1}`;
            return circle;
        }

        // Left arrow
        this.scrollContainer.appendChild(makeArrow(false, 1));

        // Circles
        let col = 2;
        this.imageNameArray.forEach(() => {
            this.scrollContainer.appendChild(makeCircle(col));
            let selector = makeCircle(col);
            selector.classList.add("image-circle-selector");
            this.scrollContainer.appendChild(selector);

            col++;
        });

        // Right arrow
        this.scrollContainer.appendChild(makeArrow(true, col));

        // Cache selectors
        this.circles = [...this.scrollContainer.querySelectorAll(".image-circle-selector")];
        this.circlesLen = this.circles.length;
        for(let i = 0; i < this.circlesLen; i++) {
            const img = new Image();
            img.src = imagePath + this.imageNameArray[i];
            this.images[i] = img;
        }

        this.startAutoScroll();
    }

    setUpVisibleStageImages(isTopImage) {
        let node = document.createElement("img");
        node.src = imagePath + this.imageNameArray[0];
        node.alt = "Example Image";
        node.classList.add("stage-description-image");
        node.classList.add(isTopImage ? "top-stage-image" : "bottom-stage-image");
        node.style.opacity = isTopImage ? "1" : "0";

        return node;
    }


    /**
     * updates the image count and starts the auto-scroll interval
     */
    async arrowClick() {
        this.circles.forEach(node => {
            node.classList.remove("image-circle-transition-grow");
        });

        this.imgCount = ImageFSM.mod(this.imgCount + (this.right ? 1 : -1), this.circlesLen);

        this.bottomImage.src = imagePath + this.imageNameArray[this.imgCount];

        // Start fade
        this.topImage.classList.add("image-fade-out");

        // Wait for CSS transition to finish
        await new Promise(resolve => {
            const handler = () => {
                this.topImage.removeEventListener("animationend", handler);
                this.topImage.removeEventListener("animationcancel", handler);
                resolve();
            };
            const currentNode = this.circles[this.imgCount % this.circlesLen];
            currentNode.classList.add("image-circle-transition-grow");
            this.topImage.addEventListener("animationend", handler);
            this.topImage.addEventListener("animationcancel", handler);
        });

        // Swap image AFTER fade completes
        this.topImage.src = this.bottomImage.src;

        // Reset for next cycle
        this.topImage.classList.remove("image-fade-out");
    }
}