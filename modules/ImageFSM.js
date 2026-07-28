import { FSMFunctions } from './FSMFunctions.js';

const IMAGE_CHANGE_INTERVAL = 7000;

export class ImageFSM {
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

            // 2. Create the wrappers
            this.bottomWrapper[index] = document.createElement("div");
            this.bottomWrapper[index].className = "slide-wrapper bottom-slide-wrapper";

            this.topWrapper[index] = document.createElement("div");
            this.topWrapper[index].className = "slide-wrapper top-slide-wrapper";

            // 3. Initialize Captions (0 for bottom, 1 for top)
            for (let i = 0; i < 2; i++) {
                this.caption[index][i] = document.createElement("div");
                this.caption[index][i].className = "image-caption";
                if (this.captionArr && this.captionArr[index]) {
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

            this.imgCount[index] = 0;
            this.right[index] = true;
            this.circles[index] = [];
            this.createImageSelector(imageNameArray[index], index);
        }
    }

    mod(targetNumber, index) {
        return FSMFunctions.mod(targetNumber, this.circles[index].length);
    }

    createImageSelector(imageArrayList, scrollIndex) {
        if (!imageArrayList || typeof imageArrayList[0] !== 'string') {
            return;
        }
        const documentFragment = document.createDocumentFragment();

        this.circles[scrollIndex] = [];
        documentFragment.appendChild(this.makeArrow(false, 1, scrollIndex));

        for (let i = 1; i < imageArrayList.length; i++) {
            const col = i + 2;
            const backgroundCircle = this.makeSelectorElement(col);
            backgroundCircle.addEventListener("click", () => {
                this.imgCount[scrollIndex] = this.mod(i - 2, scrollIndex);
                this.startAutoScroll(scrollIndex);
                this.arrowClick(scrollIndex).catch(() => {});
            });

            documentFragment.appendChild(backgroundCircle);

            const selector = this.makeSelectorElement(col);
            selector.classList.add("image-circle-selector");
            this.circles[scrollIndex].push(selector);
            documentFragment.appendChild(selector);
        }

        documentFragment.appendChild(this.makeArrow(true, imageArrayList.length + 2, scrollIndex));
        this.scrollContainer[scrollIndex].appendChild(documentFragment);

        this.startAutoScroll(scrollIndex);
    }

    makeSelectorElement(column) {
        const circle = document.createElement("div");
        circle.className = "image-circle";
        circle.style.gridArea = `1 / ${column} / 2 / ${column + 1}`;
        return circle;
    }

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

    setUpVisibleStageImages(isTopImage, index) {
        const node = document.createElement("img");
        node.src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][1];
        node.alt = "Carousel Image";
        node.classList.toggle("stage-description-image", true);
        node.classList.toggle(isTopImage ? "top-stage-image" : "bottom-stage-image", true);
        return node;
    }

    setCaption(index, isTop, captionNumber) {
        let pos = isTop ? 1 : 0;
        if (this.captionArr && this.captionArr[index]) {
            this.caption[index][pos].innerText = this.captionArr[index][captionNumber] || "";
        }
    }

    startAutoScroll(index) {
        this.stopAutoScroll(index);

        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        this.rollingInterval[index] = setInterval(() => {
            this.arrowClick(index).catch(() => {});
        }, IMAGE_CHANGE_INTERVAL);
    }

    stopAutoScroll(index) {
        if (this.rollingInterval[index]) {
            clearInterval(this.rollingInterval[index]);
            this.rollingInterval[index] = 0;
        }
    }

    async arrowClick(index) {
        if (this.isAnimating && this.isAnimating[index]) return;
        if (!this.isAnimating) this.isAnimating = [];
        this.isAnimating[index] = true;

        if (this.circles[index]) {
            this.circles[index].forEach(node => {
                node.classList.toggle("image-circle-transition-grow", false);
            });
        }

        this.imgCount[index] = this.mod(this.imgCount[index] + (this.right[index] ? 1 : -1), index);

        this.bottomImage[index].src = this.imagePath + this.imageNameArray[index][0] + this.imageNameArray[index][this.imgCount[index] + 1];
        this.setCaption(index, false, this.imgCount[index] + 1);

        this.topImage[index].classList.toggle("image-fade-out", true);
        this.caption[index][1].classList.toggle("image-fade-out", true);

        const currentNode = this.circles[index][this.mod(this.imgCount[index], index)];
        if (currentNode) {
            currentNode.classList.toggle("image-circle-transition-grow", true);
        }

        await new Promise(resolve => {
            const handleAnimationEnd = (e) => {
                if (e.target === this.topImage[index]) {
                    this.topImage[index].removeEventListener("animationend", handleAnimationEnd);
                    resolve();
                }
            };
            this.topImage[index].addEventListener("animationend", handleAnimationEnd);
            setTimeout(resolve, 1000);
        });

        this.topImage[index].src = this.bottomImage[index].src;
        this.setCaption(index, true, this.imgCount[index] + 1);

        this.topImage[index].classList.toggle("image-fade-out", false);
        this.caption[index][1].classList.toggle("image-fade-out", false);

        this.isAnimating[index] = false;
    }
}