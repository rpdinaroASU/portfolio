import { FSMFunctions } from './FSMFunctions.js';


const TIME_BETWEEN_PICTURES_MS = 10000;
const FADE_ANIMATION_TIMEOUT_MS = 1000;

// Grid layout and array positioning offsets
const LEFT_ARROW_GRID_COLUMN = 1;
const GRID_COLUMN_START_OFFSET = 2;
const INDEX_OFFSET_FOR_DOT_CLICKS = 2;

// Array positions based on the expected input data structure
const FOLDER_PREFIX_POSITION = 0;
const FIRST_PICTURE_POSITION = 1;

// Layer identifiers for the cross-fade effect
const BOTTOM_LAYER_ID = 0;
const TOP_LAYER_ID = 1;
const TOTAL_IMAGE_LAYERS = 2;

/**
 * Manages multiple image sliders on a single page.
 * Handles creating the layout, navigation dots, and smooth fading animations between pictures.
 */
export class ImageFSM {
    // Arrays storing the visual elements and state for each separate slider on the page
    bottomPictures = [];
    topPictures = [];
    navigationDotAreas = [];
    navigationDots = [];
    automaticScrollTimers = [];
    currentPictureNumbers = [];
    isMovingForward = [];
    isCurrentlyFading = [];

    // Data provided when starting the slider
    imageFileNames = [];
    imageTextDescriptions = [];
    htmlDisplayAreas = [];
    folderPath = "";

    // Wrapper boxes used for the fading effect
    textDescriptionLayers = [];
    bottomPictureBoxes = [];
    topPictureBoxes = [];

    /**
     * Sets up the image sliders inside the provided HTML sections.
     *
     * @param {string[][]} imageFileNames - List of image names (first item is the shared prefix, rest are unique suffixes).
     * @param {string[][]} imageTextDescriptions - List of text descriptions matching the pictures.
     * @param {NodeListOf<HTMLElement>} htmlDisplayAreas - The HTML sections where the sliders will be built.
     * @param {string} folderPath - The folder location where the pictures are stored.
     */
    constructor(imageFileNames, imageTextDescriptions, htmlDisplayAreas, folderPath) {
        this.imageFileNames = imageFileNames;
        this.imageTextDescriptions = imageTextDescriptions;
        this.htmlDisplayAreas = htmlDisplayAreas;
        this.folderPath = folderPath;

        for (let sliderId = 0; sliderId < imageFileNames.length; sliderId++) {
            const currentDisplayArea = this.htmlDisplayAreas[sliderId];
            const currentPictureGroup = this.imageFileNames[sliderId];

            // Safety check to ensure the HTML area and pictures exist before building
            if (!currentDisplayArea) {
                console.warn(`ImageSlider: Missing HTML area for slider number ${sliderId}. Skipping.`);
                continue;
            }
            if (!currentPictureGroup || !currentPictureGroup[FOLDER_PREFIX_POSITION]) {
                currentDisplayArea.parentNode.removeChild(currentDisplayArea);
                continue;
            }

            // Clear out any old content inside the HTML area
            currentDisplayArea.innerHTML = "";
            this.textDescriptionLayers[sliderId] = [];

            // 1. Create the main box that holds the pictures and text
            const mainSliderBox = document.createElement("div");
            mainSliderBox.className = "carousel-parent-container";

            // 2. Create the hidden bottom box and visible top box for the fading effect
            this.bottomPictureBoxes[sliderId] = document.createElement("div");
            this.bottomPictureBoxes[sliderId].className = "slide-wrapper bottom-slide-wrapper";

            this.topPictureBoxes[sliderId] = document.createElement("div");
            this.topPictureBoxes[sliderId].className = "slide-wrapper top-slide-wrapper";

            // 3. Create the text description elements for both layers
            for (let layerId = 0; layerId < TOTAL_IMAGE_LAYERS; layerId++) {
                const textElement = document.createElement("div");
                const textWrapper = document.createElement("div");
                textElement.className = "image-caption";
                textWrapper.className = "image-caption-wrapper";

                if (this.imageTextDescriptions && this.imageTextDescriptions[sliderId]) {
                    textElement.innerText = this.imageTextDescriptions[sliderId][FIRST_PICTURE_POSITION] || "";
                }
                textWrapper.appendChild(textElement);

                this.textDescriptionLayers[sliderId][layerId] = textWrapper;
            }

            // 4. Create the actual image elements
            this.bottomPictures[sliderId] = this.createPictureElement(false, sliderId);
            this.topPictures[sliderId] = this.createPictureElement(true, sliderId);

            // 5. Put the pictures and text inside their respective boxes
            this.bottomPictureBoxes[sliderId].appendChild(this.bottomPictures[sliderId]);
            this.bottomPictureBoxes[sliderId].appendChild(this.textDescriptionLayers[sliderId][BOTTOM_LAYER_ID]);

            this.topPictureBoxes[sliderId].appendChild(this.topPictures[sliderId]);
            this.topPictureBoxes[sliderId].appendChild(this.textDescriptionLayers[sliderId][TOP_LAYER_ID]);

            // 6. Put the layer boxes into the main slider box
            mainSliderBox.appendChild(this.bottomPictureBoxes[sliderId]);
            mainSliderBox.appendChild(this.topPictureBoxes[sliderId]);

            // 7. Add the finished slider box to the webpage
            currentDisplayArea.appendChild(mainSliderBox);

            // 8. Create the area that will hold the clickable navigation dots and arrows
            this.navigationDotAreas[sliderId] = document.createElement("div");
            this.navigationDotAreas[sliderId].className = "img-scroll-container";

            const totalGridColumns = currentPictureGroup.length + GRID_COLUMN_START_OFFSET;
            this.navigationDotAreas[sliderId].style.gridTemplateColumns = `repeat(${totalGridColumns}, auto)`;



            // Set up the starting status for this slider
            this.currentPictureNumbers[sliderId] = 0;
            this.isMovingForward[sliderId] = true;
            this.navigationDots[sliderId] = [];

            // Build the clickable buttons
            let responseCode = this.createNavigationButtons(currentPictureGroup, sliderId);
            if(responseCode===1) {
                const navigationWrapper = document.createElement("div");
                navigationWrapper.className = "navigation-wrapper";
                navigationWrapper.appendChild(this.navigationDotAreas[sliderId])
                currentDisplayArea.appendChild(navigationWrapper);
            } else if(responseCode===0) {
                currentDisplayArea.classList.add("stage-image-container-no-navigation");
                currentDisplayArea.children[0].classList.add("carousel-parent-container-no-navigation")
                currentDisplayArea.children[0].removeChild(currentDisplayArea.children[0].children[1]);
            }
        }
    }

    /**
     * Prevents the picture number from going outside the available number of pictures.
     * If it goes past the end, it loops back to the start (and vice versa).
     *
     * @param {number} targetPictureNumber - The requested picture number.
     * @param {number} sliderId - Which slider is being checked.
     * @returns {number} A valid picture number within the allowed range.
     */
    keepNumberWithinBounds(targetPictureNumber, sliderId) {
        const dots = this.navigationDots[sliderId];
        if (!dots || dots.length === 0) return 0;
        return FSMFunctions.mod(targetPictureNumber, dots.length);
    }

    /**
     * Creates the clickable dots and the left/right arrows for the user.
     *
     * @param {string[]} pictureSuffixes - The list of image name endings.
     * @param {number} sliderId - Which slider is being built.
     * @return {int} exit code
     */
    createNavigationButtons(pictureSuffixes, sliderId) {
        if (!pictureSuffixes || typeof pictureSuffixes[FOLDER_PREFIX_POSITION] !== 'string') return -1;
        if(pictureSuffixes && pictureSuffixes.length === 2) {
            return 0;
        }

        const htmlMemoryBank = document.createDocumentFragment();
        this.navigationDots[sliderId] = [];

        // Add the Left Arrow
        htmlMemoryBank.appendChild(this.createArrowButton(false, LEFT_ARROW_GRID_COLUMN, sliderId));

        // Create the navigation dots (ignoring the first array item since it's just the shared folder prefix)
        for (let listPosition = FIRST_PICTURE_POSITION; listPosition < pictureSuffixes.length; listPosition++) {
            const gridColumn = listPosition + GRID_COLUMN_START_OFFSET;

            // An invisible, wider circle that makes it easier to click on touch screens
            const invisibleClickArea = this.createVisualDot(gridColumn);
            invisibleClickArea.addEventListener("click", () => {
                const requestedPicture = listPosition - INDEX_OFFSET_FOR_DOT_CLICKS;
                this.currentPictureNumbers[sliderId] = this.keepNumberWithinBounds(requestedPicture, sliderId);

                this.startAutomaticTimer(sliderId);
                this.changeToNextPicture(sliderId).catch(() => {});
            });

            htmlMemoryBank.appendChild(invisibleClickArea);

            // The visible dot that the user actually sees
            const visibleDot = this.createVisualDot(gridColumn);
            visibleDot.classList.add("image-circle-selector");
            this.navigationDots[sliderId].push(visibleDot);

            htmlMemoryBank.appendChild(visibleDot);
        }

        // Add the Right Arrow at the very end
        const rightArrowGridColumn = pictureSuffixes.length + GRID_COLUMN_START_OFFSET;
        htmlMemoryBank.appendChild(this.createArrowButton(true, rightArrowGridColumn, sliderId));
        this.navigationDotAreas[sliderId].appendChild(htmlMemoryBank);
        this.startAutomaticTimer(sliderId);

        return 1;
    }

    /**
     * Creates a simple circular div used for the navigation dots.
     *
     * @param {number} columnLocation - Where it sits in the CSS grid.
     * @returns {HTMLDivElement} The circular element.
     */
    createVisualDot(columnLocation) {
        const dot = document.createElement("div");
        dot.className = "image-circle";
        dot.style.gridArea = `1 / ${columnLocation} / 2 / ${columnLocation + 1}`;
        return dot;
    }

    /**
     * Creates a clickable arrow button to move left or right.
     *
     * @param {boolean} movesForward - True if it's the right arrow, false if left.
     * @param {number} columnLocation - Where it sits in the CSS grid.
     * @param {number} sliderId - Which slider it belongs to.
     * @returns {HTMLImageElement} The arrow image button.
     */
    createArrowButton(movesForward, columnLocation, sliderId) {
        const arrow = document.createElement("img");
        arrow.src = `../images/icons/down-arrow.svg`;
        arrow.alt = movesForward ? "Next Image" : "Previous Image";
        arrow.className = movesForward ? "right-arrow" : "left-arrow";
        arrow.style.gridArea = `1 / ${columnLocation} / 2 / ${columnLocation + 1}`;

        arrow.addEventListener("click", () => {
            this.isMovingForward[sliderId] = movesForward;
            this.startAutomaticTimer(sliderId);
            this.changeToNextPicture(sliderId).catch(() => {});
        });

        return arrow;
    }

    /**
     * Sets up an image element to be used in the slider.
     *
     * @param {boolean} isTopLayer - True if this picture sits on top, false if on bottom.
     * @param {number} sliderId - Which slider is being built.
     * @returns {HTMLDivElement} The configured picture element.
     */
    createPictureElement(isTopLayer, sliderId) {
        // 1. Create the wrapper div
        const wrapper = document.createElement("div");
        wrapper.classList.add("stage-image-wrapper");

        // 2. Create and configure the image (your original code)
        const picture = document.createElement("img");

        const sharedPrefix = this.imageFileNames[sliderId][FOLDER_PREFIX_POSITION];
        const firstImageSuffix = this.imageFileNames[sliderId][FIRST_PICTURE_POSITION];

        picture.src = `${this.folderPath}${sharedPrefix}${firstImageSuffix}`;
        picture.alt = "Carousel Content";
        picture.classList.toggle("stage-description-image", true);
        picture.classList.toggle(isTopLayer ? "top-stage-image" : "bottom-stage-image", true);

        // 3. Put the image inside the wrapper
        wrapper.appendChild(picture);

        // 4. Return the wrapper so it gets placed in the DOM
        return wrapper;
    }

    /**
     * Updates the text displayed on top of the picture.
     *
     * @param {number} sliderId - Which slider is being updated.
     * @param {boolean} isTopLayer - True to change the top box's text, false for the bottom box.
     * @param {number} textListPosition - Which text to pull from the list.
     */
    updateTextDescription(sliderId, isTopLayer, textListPosition) {
        const targetLayerId = isTopLayer ? TOP_LAYER_ID : BOTTOM_LAYER_ID;

        if (this.imageTextDescriptions && this.imageTextDescriptions[sliderId]) {
            const captionWrapper = this.textDescriptionLayers[sliderId][targetLayerId];
            const textElement = captionWrapper.querySelector(".image-caption");

            if (textElement) {
                textElement.innerText = this.imageTextDescriptions[sliderId][textListPosition] || "";
            }
        }
    }

    /**
     * Starts the timer that automatically changes the picture after a few seconds.
     *
     * @param {number} sliderId - Which slider to start.
     */
    startAutomaticTimer(sliderId) {
        this.stopAutomaticTimer(sliderId);

        // Make the current dot look active/larger
        const activeDotNumber = this.keepNumberWithinBounds(this.currentPictureNumbers[sliderId], sliderId);
        const activeDotElement = this.navigationDots[sliderId][activeDotNumber];

        if (activeDotElement) {
            activeDotElement.classList.toggle("image-circle-transition-grow", true);
        }

        this.automaticScrollTimers[sliderId] = setInterval(() => {
            this.changeToNextPicture(sliderId).catch(() => {});
        }, TIME_BETWEEN_PICTURES_MS);
    }

    /**
     * Stops the automatic timer.
     *
     * @param {number} sliderId - Which slider to stop.
     */
    stopAutomaticTimer(sliderId) {
        if (this.automaticScrollTimers[sliderId]) {
            clearInterval(this.automaticScrollTimers[sliderId]);
            this.automaticScrollTimers[sliderId] = 0;
        }
    }

    /**
     * Smoothly fades out the current picture to reveal the new one underneath,
     * then resets the layers so it can happen again.
     *
     * @param {number} sliderId - Which slider is changing pictures.
     * @returns {Promise<void>} Resolves when the fading visual effect finishes.
     */
    async changeToNextPicture(sliderId) {
        // 1. Safety check: ensure slider elements still exist in DOM
        if (!this.bottomPictures[sliderId] || !this.topPictures[sliderId]) {
            this.stopAutomaticTimer(sliderId);
            return;
        }

        if (this.isCurrentlyFading && this.isCurrentlyFading[sliderId]) return;
        if (!this.isCurrentlyFading) this.isCurrentlyFading = [];
        this.isCurrentlyFading[sliderId] = true;

        if (this.navigationDots[sliderId]) {
            this.navigationDots[sliderId].forEach(dotElement => {
                dotElement.classList.toggle("image-circle-transition-grow", false);
            });
        }

        const directionModifier = this.isMovingForward[sliderId] ? 1 : -1;
        this.currentPictureNumbers[sliderId] = this.keepNumberWithinBounds(
            this.currentPictureNumbers[sliderId] + directionModifier,
            sliderId
        );

        const nextPictureTarget = this.currentPictureNumbers[sliderId] + FIRST_PICTURE_POSITION;
        const sharedPrefix = this.imageFileNames[sliderId]?.[FOLDER_PREFIX_POSITION];
        const nextPictureSuffix = this.imageFileNames[sliderId]?.[nextPictureTarget];

        // 2. Guard against missing image elements
        const bottomImg = this.bottomPictures[sliderId].querySelector("img");
        if (!bottomImg) {
            this.stopAutomaticTimer(sliderId);
            return;
        }

        bottomImg.src = `${this.folderPath}${sharedPrefix}${nextPictureSuffix}`;
        this.updateTextDescription(sliderId, false, nextPictureTarget);

        this.topPictures[sliderId].classList.toggle("image-fade-out", true);
        if (this.textDescriptionLayers[sliderId]?.[TOP_LAYER_ID]) {
            this.textDescriptionLayers[sliderId][TOP_LAYER_ID].classList.toggle("image-fade-out", true);
        }

        const newActiveDotNumber = this.keepNumberWithinBounds(this.currentPictureNumbers[sliderId], sliderId);
        const newActiveDotElement = this.navigationDots[sliderId]?.[newActiveDotNumber];

        if (newActiveDotElement) {
            newActiveDotElement.classList.toggle("image-circle-transition-grow", true);
        }

        // 3. Handle asynchronous fade safely
        await new Promise(resolve => {
            const onAnimationFinish = (event) => {
                if (event.target === this.topPictures[sliderId]) {
                    this.topPictures[sliderId]?.removeEventListener("animationend", onAnimationFinish);
                    resolve();
                }
            };
            this.topPictures[sliderId]?.addEventListener("animationend", onAnimationFinish);
            setTimeout(resolve, FADE_ANIMATION_TIMEOUT_MS);
        });

        // 4. Verify elements still exist after async delay
        const topImg = this.topPictures[sliderId]?.querySelector("img");
        if (topImg && bottomImg) {
            topImg.src = bottomImg.src;
            this.updateTextDescription(sliderId, true, nextPictureTarget);
            this.topPictures[sliderId].classList.toggle("image-fade-out", false);
            if (this.textDescriptionLayers[sliderId]?.[TOP_LAYER_ID]) {
                this.textDescriptionLayers[sliderId][TOP_LAYER_ID].classList.toggle("image-fade-out", false);
            }
        }

        this.isCurrentlyFading[sliderId] = false;
    }

    /**
     * Stops all running auto-scroll timers and cleans up resources.
     * Call this method when closing or switching project modals.
     */
    destroy() {
        for (let sliderId = 0; sliderId < this.automaticScrollTimers.length; sliderId++) {
            this.stopAutomaticTimer(sliderId);
        }
        this.automaticScrollTimers = [];
        this.isCurrentlyFading = [];
    }

}