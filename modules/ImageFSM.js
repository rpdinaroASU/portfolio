import { FSMFunctions } from './FSMFunctions.js';

/**
 * Constant defining the time in milliseconds between automatic image transitions.
 * @type {number}
 */
const IMAGE_CHANGE_INTERVAL = 7000;

/**
 * Class representing a Finite State Machine for managing image carousels.
 * This class handles the initialization, DOM construction, auto-scrolling,
 * and cross-fade animations for multiple carousels simultaneously.
 */
export class ImageFSM {
    // Array properties storing the state and DOM elements for each carousel index.
    bottomImage = [];
    topImage = [];
    scrollContainer = [];
    circles = [];
    rollingInterval = [];
    imgCount = [];
    right = [];
    isAnimating = [];
    imageNameArray = [];
    parentNodeList = [];
    captionArr = [];
    caption = [];
    bottomWrapper = [];
    topWrapper = [];

    /**
     * Creates an instance of ImageFSM.
     *
     * @param {string[][]} imageNameArray - A 2D array where each sub-array contains a base prefix at index 0 followed by image suffixes for a specific carousel.
     * @param {string[][]} captionArr - A 2D array where each sub-array contains captions corresponding to the images.
     * @param {HTMLElement[]} parentNodeList - An array of DOM elements where each carousel will be mounted.
     * @param {string} imagePath - The base directory path where images are located.
     */
    constructor(imageNameArray, captionArr, parentNodeList, imagePath) {
        this.imageNameArray = imageNameArray;
        this.parentNodeList = parentNodeList;
        this.imagePath = imagePath;
        this.captionArr = captionArr;

        for (let index = 0; index < imageNameArray.length; index++) {
            if (!this.parentNodeList[index]) {
                console.warn(`ImageFSM: Missing parent node for carousel index ${index}. Skipping.`);
                continue;
            }
            if (!imageNameArray[index] || !imageNameArray[index][0]) {
                this.parentNodeList[index].parentNode.removeChild(this.parentNodeList[index]);
                continue;
            }

            this.parentNodeList[index].innerHTML = "";
            this.caption[index] = [];

            // 1. Create the dedicated inner container for the images/captions
            const carouselParent = document.createElement("div");
            carouselParent.className = "carousel-parent-container";

            // 2. Create the wrappers for top and bottom layers (used for crossfading)
            this.bottomWrapper[index] = document.createElement("div");
            this.bottomWrapper[index].className = "slide-wrapper bottom-slide-wrapper";

            this.topWrapper[index] = document.createElement("div");
            this.topWrapper[index].className = "slide-wrapper top-slide-wrapper";

            // 3. Initialize Captions (0 for bottom layer, 1 for top layer)
            for (let i = 0; i < 2; i++) {
                this.caption[index][i] = document.createElement("div");
                this.caption[index][i].className = "image-caption";
                if (this.captionArr && this.captionArr[index]) {
                    // Default to the first caption (index 1 in the subarray)
                    this.caption[index][i].innerText = this.captionArr[index][1] || "";
                }
            }

            // 4. Setup Images
            this.bottomImage[index] = this.setUpVisibleStageImages(false, index);
            this.topImage[index] = this.setUpVisibleStageImages(true, index);

            // 5. Assemble the DOM (Image + Caption inside Wrapper)
            this.bottomWrapper[index].appendChild(this.bottomImage[index]);
            this.bottomWrapper[index].appendChild(this.caption[index][0]);

            this.topWrapper[index].appendChild(this.topImage[index]);
            this.topWrapper[index].appendChild(this.caption[index][1]);

            // 6. Append Wrappers to the inner carouselParent
            carouselParent.appendChild(this.bottomWrapper[index]);
            carouselParent.appendChild(this.topWrapper[index]);

            // 7. Append the fully assembled carousel to the main DOM node
            this.parentNodeList[index].appendChild(carouselParent);

            // 8. Setup Controls (Sibling to carouselParent, appended directly to parentNodeList)
            this.scrollContainer[index] = document.createElement("div");
            this.scrollContainer[index].className = "img-scroll-container";
            this.scrollContainer[index].style.gridTemplateColumns = `repeat(${imageNameArray.length + 2}, auto)`;
            this.parentNodeList[index].appendChild(this.scrollContainer[index]);

            // Initialize state variables for this specific carousel instance
            this.imgCount[index] = 0;
            this.right[index] = true; // Determines direction of auto-scroll
            this.circles[index] = [];

            // Build the pagination circles and arrows
            this.createImageSelector(imageNameArray[index], index);
        }
    }

    /**
     * Calculates the modulo to wrap around image indices safely.
     *
     * @param {number} targetNumber - The index to calculate the modulo for.
     * @param {number} index - The carousel index used to find the length of the circles array.
     * @returns {number} The wrapped index ensuring it stays within array bounds.
     */
    mod(targetNumber, index) {
        return FSMFunctions.mod(targetNumber, this.circles[index].length);
    }

    /**
     * Constructs the pagination navigation (circles) and directional arrows for a carousel.
     *
     * @param {string[]} imageArrayList - The array of image suffixes for this carousel.
     * @param {number} scrollIndex - The index of the current carousel being processed.
     */
    createImageSelector(imageArrayList, scrollIndex) {
        if (!imageArrayList || typeof imageArrayList[0] !== 'string') {
            return;
        }
        const documentFragment = document.createDocumentFragment();

        this.circles[scrollIndex] = [];

        // Add left arrow
        documentFragment.appendChild(this.makeArrow(false, 1, scrollIndex));

        // Create pagination circles (starting from 1 because index 0 is the image prefix)
        for (let i = 1; i < imageArrayList.length; i++) {
            const col = i + 2;

            // Clickable background area for the circle
            const backgroundCircle = this.makeSelectorElement(col);
            backgroundCircle.addEventListener("click", () => {
                this.imgCount[scrollIndex] = this.mod(i - 2, scrollIndex);
                this.startAutoScroll(scrollIndex); // Reset the timer on manual interaction
                this.arrowClick(scrollIndex).catch(() => {});
            });

            documentFragment.appendChild(backgroundCircle);

            // Visual indicator circle
            const selector = this.makeSelectorElement(col);
            selector.classList.add("image-circle-selector");
            this.circles[scrollIndex].push(selector);
            documentFragment.appendChild(selector);
        }

        // Add right arrow
        documentFragment.appendChild(this.makeArrow(true, imageArrayList.length + 2, scrollIndex));
        this.scrollContainer[scrollIndex].appendChild(documentFragment);

        // Begin automatic cycling
        this.startAutoScroll(scrollIndex);
    }

    /**
     * Helper to create a grid-aligned pagination circle element.
     *
     * @param {number} column - The CSS grid column position for the element.
     * @returns {HTMLDivElement} The constructed div element.
     */
    makeSelectorElement(column) {
        const circle = document.createElement("div");
        circle.className = "image-circle";
        circle.style.gridArea = `1 / ${column} / 2 / ${column + 1}`;
        return circle;
    }

    /**
     * Helper to create left or right navigation arrows.
     *
     * @param {boolean} isRight - True if right arrow, false if left arrow.
     * @param {number} gridColumn - The CSS grid column position.
     * @param {number} index - The carousel index.
     * @returns {HTMLImageElement} The constructed arrow image element.
     */
    makeArrow(isRight, gridColumn, index) {
        const arrow = document.createElement("img");
        arrow.src = `../images/icons/down-arrow.svg`;
        arrow.alt = isRight ? " > " : " < ";
        arrow.className = isRight ? "right-arrow" : "left-arrow";
        arrow.style.gridArea = `1 / ${gridColumn} / 2 / ${gridColumn + 1}`;

        arrow.addEventListener("click", () => {
            this.right[index] = isRight;
            this.startAutoScroll(index); // Reset the timer on manual interaction
            this.arrowClick(index).catch(() => {});
        });

        return arrow;
    }

    /**
     * Initializes the stage images used in the carousel.
     *
     * @param {boolean} isTopImage - Indicates if this is the top layer (true) or bottom layer (false).
     * @param {number} index - The carousel index.
     * @returns {HTMLImageElement} The constructed image node.
     */
    setUpVisibleStageImages(isTopImage, index) {
        const node = document.createElement("img");
        // Construct source combining base path + image prefix + first image suffix
        node.src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][1];
        node.alt = "Carousel Image";
        node.classList.toggle("stage-description-image", true);
        node.classList.toggle(isTopImage ? "top-stage-image" : "bottom-stage-image", true);
        return node;
    }

    /**
     * Updates the caption text for a specific layer.
     *
     * @param {number} index - The carousel index.
     * @param {boolean} isTop - Specifies which layer's caption to update (true = top, false = bottom).
     * @param {number} captionNumber - The index of the caption string in captionArr.
     */
    setCaption(index, isTop, captionNumber) {
        let pos = isTop ? 1 : 0;
        if (this.captionArr && this.captionArr[index]) {
            this.caption[index][pos].innerText = this.captionArr[index][captionNumber] || "";
        }
    }

    /**
     * Starts or restarts the automatic image scrolling interval.
     *
     * @param {number} index - The carousel index.
     */
    startAutoScroll(index) {
        this.stopAutoScroll(index);

        // Highlight the active pagination circle
        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        // Set repeating interval
        this.rollingInterval[index] = setInterval(() => {
            this.arrowClick(index).catch(() => {});
        }, IMAGE_CHANGE_INTERVAL);
    }

    /**
     * Clears the automatic image scrolling interval.
     *
     * @param {number} index - The carousel index.
     */
    stopAutoScroll(index) {
        if (this.rollingInterval[index]) {
            clearInterval(this.rollingInterval[index]);
            this.rollingInterval[index] = 0;
        }
    }

    /**
     * Handles the crossfade logic between images when advancing to the next/previous slide.
     * This orchestrates changing the bottom layer, fading out the top layer, and then synchronizing them.
     *
     * @param {number} index - The carousel index.
     * @returns {Promise<void>} Resolves when the cross-fade animation is complete.
     */
    async arrowClick(index) {
        // Prevent concurrent animations on the same carousel
        if (this.isAnimating && this.isAnimating[index]) return;
        if (!this.isAnimating) this.isAnimating = [];
        this.isAnimating[index] = true;

        // Remove active state from all pagination circles
        if (this.circles[index]) {
            this.circles[index].forEach(node => {
                node.classList.toggle("image-circle-transition-grow", false);
            });
        }

        // Calculate the next image index based on direction
        this.imgCount[index] = this.mod(this.imgCount[index] + (this.right[index] ? 1 : -1), index);

        // 1. Prepare bottom layer: Load the incoming image & caption
        this.bottomImage[index].src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][this.imgCount[index] + 1];
        this.setCaption(index, false, this.imgCount[index] + 1);

        // 2. Animate out the top layer to reveal the new bottom layer
        this.topImage[index].classList.toggle("image-fade-out", true);
        this.caption[index][1].classList.toggle("image-fade-out", true);

        // Highlight the new active pagination circle
        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        // 3. Wait for the CSS fade-out animation to finish (with a 1s failsafe)
        await new Promise(resolve => {
            const handleAnimationEnd = (e) => {
                if (e.target === this.topImage[index]) {
                    this.topImage[index].removeEventListener("animationend", handleAnimationEnd);
                    resolve();
                }
            };
            this.topImage[index].addEventListener("animationend", handleAnimationEnd);
            setTimeout(resolve, 1000); // Failsafe timeout
        });

        // 4. Synchronize top layer: Set it to the new image/caption to act as the base for the next transition
        this.topImage[index].src = this.bottomImage[index].src;
        this.setCaption(index, true, this.imgCount[index] + 1);

        // 5. Reset fade-out classes to make the top layer fully opaque again
        this.topImage[index].classList.toggle("image-fade-out", false);
        this.caption[index][1].classList.toggle("image-fade-out", false);

        // Unlock animation state
        this.isAnimating[index] = false;
    }
}