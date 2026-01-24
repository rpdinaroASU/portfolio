export class FSMFunctions {
     static mod(targetNumber, FSMLength) {
        return ((targetNumber % FSMLength) + FSMLength) % FSMLength;
    }
}