class SceneBuilder {
    constructor(app) {
        this.app = app;
    }
    build(scene) {
        scene.forEach((element) => {
            if (element.type == "Wall") {
                let segment = element.info;
                let vertexA = segment[0];
                let vertexB = segment[1];
                if (vertexA[0] == vertexB[0] && vertexA[1] != vertexB[1]) {
                    this.buildVerticalWall(vertexA, vertexB, segment[2], segment[3]);
                }
                else if (vertexA[1] == vertexB[1] && vertexA[0] != vertexB[0]) {
                    this.buildHorizontalWall(vertexA, vertexB, segment[2], segment[3]);
                }
                else {
                    console.warn(`Invalid vertex pair given: the vertices must be different and colinear`);
                }
            }
            else if (element.type == 'Circle') {
                this.buildCircle(...element.info);
            }
        });
        this.app.collectionManager.get("HorizontalWalls").sort((a, b) => {
            return a.posY - b.posY;
        });
        this.app.collectionManager.get("VerticalWalls").sort((a, b) => {
            return a.posX - b.posX;
        });
    }
    buildHorizontalWall(vertexA, vertexB, opacity, color) {
        return this.app.entityFactory.create('HorizontalWall', {
            startX: Math.min(vertexA[0], vertexB[0]),
            endX: Math.max(vertexA[0], vertexB[0]),
            posY: vertexA[1],
            opacity: opacity || 1,
            color: color || 'white'
        });
    }
    ;
    buildVerticalWall(vertexA, vertexB, opacity, color) {
        return this.app.entityFactory.create('VerticalWall', {
            startY: Math.min(vertexA[1], vertexB[1]),
            endY: Math.max(vertexA[1], vertexB[1]),
            posX: vertexA[0],
            opacity: opacity || 1,
            color: color || 'white'
        });
    }
    ;
    buildCircle(...args) {
        return this.app.entityFactory.create('Circle', {
            radius: args[1],
            center: args[0],
            opacity: args[2],
            color: args[3]
        });
    }
}
export default SceneBuilder;
//# sourceMappingURL=SceneBuilder.js.map