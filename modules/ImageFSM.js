import { FSMFunctions } from './FSMFunctions.js';

/**
 * Interval duration in milliseconds for automatically switching carousel images.
 * @type {number}
 */
const IMAGE_CHANGE_INTERVAL = 7000;

/**
 * Creates and manages a finite state machine (FSM) that cycles through a set of images
 * to form an interactive image carousel or slideshow.
 * Generates scrollable containers with interactive selector circles and navigation arrows
 * to control image states via CSS transitions and intervals.
 */
export class ImageFSM {
    /**
     * Array of bottom/background image elements indexed by carousel instance.
     * @type {HTMLImageElement[]}
     */
    bottomImage;

    /**
     * Array of top/foreground image elements indexed by carousel instance.
     * @type {HTMLImageElement[]}
     */
    topImage;

    /**
     * Array of scrollable grid container elements for navigation controls, indexed by instance.
     * @type {HTMLDivElement[]}
     */
    scrollContainer;

    /**
     * Array of arrays containing selector circle DOM elements for each carousel instance.
     * @type {HTMLDivElement[][]}
     */
    circles;

    /**
     * Array of active interval timers handling automated carousel sliding, indexed by instance.
     * @type {number[]}
     */
    rollingInterval;

    /**
     * Array tracking the currently active image index for each carousel instance.
     * @type {number[]}
     */
    imgCount;

    /**
     * Array tracking the current slide direction (`true` for right/forward, `false` for left/backward).
     * @type {boolean[]}
     */
    right;

    /**
     * Array tracking whether an animation is currently executing to prevent overlapping states.
     * @type {boolean[]}
     */
    isAnimating;

    /**
     * Stores configuration data or image names for each carousel instance.
     * @type {string[][]}
     */
    imageNameArray;

    /**
     * Array of parent DOM elements where the carousels are mounted.
     * @type {NodeListOf<HTMLElement>}
     */
    parentNodeList;

    /**
     * Initializes the ImageFSM class across a collection of target parent nodes.
     * Sets up DOM structures, image stages, scroll containers, and interactive selectors for each data set.
     *
     * @constructor
     * @param {string[][]} imageNameArray - A two-dimensional array where each sub-array contains configuration strings and image file names.
     * @param {NodeListOf<HTMLElement>} parentNodeList - Array of parent DOM containers where each respective carousel will be rendered.
     * @param imagePath - Base directory path for resource images used within the carousel.
     */
    constructor(imageNameArray, parentNodeList, imagePath) {
        this.imageNameArray = imageNameArray;
        this.parentNodeList = parentNodeList;
        this.imagePath = imagePath;
        this.bottomImage = [];
        this.topImage = [];
        this.scrollContainer = [];
        this.circles = [];
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
     * Calculates the safe modulus value of a target number constrained within the bounds of a specific FSM instance's selector length.
     *
     * @param {number} targetNumber - The numerical value or index to be modulated.
     * @param {number} index - The target carousel instance index.
     * @returns {number} The resulting normalized index value.
     */
    mod(targetNumber, index) {
        return FSMFunctions.mod(targetNumber, this.circles[index].length);
    }

    /**
     * Creates the scrollable carousel control bar, attaches navigation arrows,
     * and constructs clickable indicator circles linked to individual slides.
     *
     * @param {string[]} imageArrayList - The subset array containing configuration prefixes and image file names for the current carousel.
     */
    createImageSelector(imageArrayList) {
        const documentFragment = document.createDocumentFragment();
        const scrollIndex = Number(imageArrayList[0].slice(-2, -1));

        this.circles[scrollIndex] = [];

        // Append Left navigation arrow
        documentFragment.appendChild(this.makeArrow(false, 1, scrollIndex));

        // Append interactive selector indicator circles
        for (let i = 1; i < imageArrayList.length; i++) {
            const col = i + 2;

            const backgroundCircle = this.makeSelectorElement(col);
            backgroundCircle.addEventListener("click", () => {
                this.imgCount[scrollIndex] = this.mod(i-2, scrollIndex);
                this.startAutoScroll(scrollIndex);
                this.arrowClick(scrollIndex).catch(() => {});
            });

            documentFragment.appendChild(backgroundCircle);

            const selector = this.makeSelectorElement(col);
            selector.classList.add("image-circle-selector");
            this.circles[scrollIndex].push(selector);
            documentFragment.appendChild(selector);
        }

        // Append Right navigation arrow
        documentFragment.appendChild(this.makeArrow(true, imageArrayList.length + 2, scrollIndex));
        this.scrollContainer[scrollIndex].appendChild(documentFragment);

        this.startAutoScroll(scrollIndex);
    }

    /**
     * Instantiates an individual selector circle DOM element positioned within the CSS grid layout.
     *
     * @param {number} column - The grid column index where the selector circle should be placed.
     * @returns {HTMLDivElement} The constructed selector grid item element.
     */
    makeSelectorElement(column) {
        const circle = document.createElement("div");
        circle.className = "image-circle";
        circle.style.gridArea = `1 / ${column} / 2 / ${column + 1}`;
        return circle;
    }

    /**
     * Constructs a directional navigation arrow image element for changing carousel slides.
     *
     * @param {boolean} isRight - Flag indicating if the arrow points forward (`true`) or backward (`false`).
     * @param {number} gridColumn - The CSS grid column position for the arrow element.
     * @param {number} index - The index reference of the active carousel instance.
     * @returns {HTMLImageElement} The fully configured arrow image DOM element.
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
            this.arrowClick(index).catch(() => {});
        });
        return arrow;
    }

    /**
     * Initializes and configures the foreground (top) or background (bottom) stage image elements.
     *
     * @param {boolean} isTopImage - Flag indicating whether the element acts as the top layer (`true`) or bottom layer (`false`).
     * @param {number} index - The index reference of the active carousel instance.
     * @returns {HTMLImageElement} The created image element with assigned classes and initial source path.
     */
    setUpVisibleStageImages(isTopImage, index) {
        const node = document.createElement("img");
        node.src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][1];
        node.alt = "Example Image";
        node.classList.toggle("stage-description-image", true);
        node.classList.toggle(isTopImage ? "top-stage-image" : "bottom-stage-image", true);

        return node;
    }

    /**
     * Initializes or resets the automated sliding interval timer for a specific carousel instance,
     * while visually activating the corresponding active indicator circle.
     *
     * @param {number} index - The index reference of the target carousel instance.
     */
    startAutoScroll(index) {
        this.stopAutoScroll(index);

        // Apply visual CSS transition grow effect to the active indicator node
        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        // Start recurring interval timer for automated scrolling
        this.rollingInterval[index] = setInterval(() => {
            this.arrowClick(index).catch(() => {});
        }, IMAGE_CHANGE_INTERVAL);
    }

    /**
     * Clears and stops the active automated sliding interval timer for a specified carousel instance.
     *
     * @param {number} index - The index reference of the target carousel instance.
     */
    stopAutoScroll(index) {
        if (this.rollingInterval[index]) {
            clearInterval(this.rollingInterval[index]);
            this.rollingInterval[index] = 0;
        }
    }

    /**
     * Asynchronously handles slide transitions triggered by user interactions or interval ticks.
     * Updates internal image indexes, manages fade-out animations, swaps image asset paths safely,
     * and updates active indicator elements.
     *
     * @param {number} index - The index reference of the target carousel instance.
     * @returns {Promise<void>} A promise that resolves when the slide transition animation sequence completes.
     */
    async arrowClick(index) {
        // Prevent overlapping animations from corrupting state synchronization
        if (this.isAnimating && this.isAnimating[index]) return;
        if (!this.isAnimating) this.isAnimating = [];
        this.isAnimating[index] = true;

        // Reset visual state across all active indicator circles for this instance
        if (this.circles[index]) {
            this.circles[index].forEach(node => {
                node.classList.toggle("image-circle-transition-grow", false);
            });
        }

        // Compute the next target image index based on the navigation direction flag
        this.imgCount[index] = this.mod(this.imgCount[index] + (this.right[index] ? 1 : -1), index);

        // Update the background image source resource
        this.bottomImage[index].src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][this.imgCount[index] + 1];

        // Trigger the foreground image fade-out transition
        this.topImage[index].classList.toggle("image-fade-out", true);
        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        // Safely wait for the CSS fade-out transition or animation sequence to finish
        await new Promise(resolve => {
            const handleAnimationEnd = (e) => {
                if (e.target === this.topImage[index]) {
                    this.topImage[index].removeEventListener("animationend", handleAnimationEnd);
                    resolve();
                }
            };
            this.topImage[index].addEventListener("animationend", handleAnimationEnd);

            // Safety timeout fallback in case the animationend event fails to trigger
            setTimeout(resolve, 1000);
        });

        // Swap the image source properties after the fade transition completes
        this.topImage[index].src = this.bottomImage[index].src;

        // Reset state classes for the next animation cycle
        this.topImage[index].classList.toggle("image-fade-out", false);

        this.isAnimating[index] = false;
    }
}