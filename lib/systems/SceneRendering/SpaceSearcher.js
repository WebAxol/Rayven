class SpaceSearcher {
    constructor(sys) {
        this.sys = sys;
        this.sys.attachToEvent("__start", (e) => { this.loadGeometry(); });
    }
    loadGeometry() {
        this.verticalWalls = this.sys.getCollection('VerticalWalls').asArray();
        this.horizontalWalls = this.sys.getCollection('HorizontalWalls').asArray();
    }
    execute() { }
    getIndicesOfClosest(camera) {
        const wallIndices = { horizontal: -1, vertical: -1 };
        if (this.verticalWalls.length > 0) {
            let xPositions = this.verticalWalls.map((wall) => wall.posX);
            wallIndices.vertical = this.BinarySearchForClosest(xPositions, camera.pos.x);
        }
        if (this.horizontalWalls.length > 0) {
            let yPositions = this.horizontalWalls.map((wall) => wall.posY);
            wallIndices.horizontal = this.BinarySearchForClosest(yPositions, camera.pos.y);
        }
        return wallIndices;
    }
    BinarySearchForClosest(arr, value) {
        if (arr.length <= 0)
            return -1;
        let leftIndex = 0;
        let rightIndex = arr.length - 1;
        let inBetweenIndex = Math.ceil((leftIndex + rightIndex) / 2);
        let index = inBetweenIndex;
        let exec = 0;
        while (leftIndex < rightIndex && exec < 100) {
            exec++;
            if (rightIndex == inBetweenIndex) {
                index = rightIndex;
                break;
            }
            if (arr[inBetweenIndex] < value) {
                leftIndex = inBetweenIndex;
            }
            else if (arr[inBetweenIndex] > value) {
                rightIndex = inBetweenIndex;
                index = rightIndex;
            }
            else if (arr[inBetweenIndex] == value) {
                index = inBetweenIndex;
                break;
            }
            ;
            inBetweenIndex = Math.ceil((leftIndex + rightIndex) / 2);
        }
        while (arr[index] >= value)
            index--;
        if (exec >= 100)
            throw Error('Binary Search went out of control');
        return index;
    }
}
export default SpaceSearcher;
//# sourceMappingURL=SpaceSearcher.js.map