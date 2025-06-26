import Vector2D from './../physics/Vector2D.js';
class Camera {
    constructor() {
        this.initialized = false;
        this.wallIndices = { horizontal: NaN, vertical: NaN };
        this.FOV = NaN;
        this.pos = new Vector2D(NaN, NaN);
    }
    ;
    init(app, info) {
        var { x, y, fov, dx, dy } = info;
        this.FOV = fov;
        this.pos = new Vector2D(x, y);
        if (this.initialized) {
            console.warn("Attempted to initialize an already initialized instance of 'Camera'");
            return false;
        }
        camera.castCenter = app.entityFactory.create('Ray', {
            source: camera.pos,
            direction: Vector2D.normalize(new Vector2D(dx, dy))
        });
        camera.castEdge = app.entityFactory.create('Ray', {
            source: camera.pos,
            direction: Vector2D.complexRotate(Vector2D.normalize(new Vector2D(dx, dy)), [Math.cos(camera.FOV * Math.PI / 360), Math.sin(camera.FOV * Math.PI / 360)])
        });
        return this.initialized = true;
    }
}
;
const camera = new Camera();
export { Camera, camera };
//# sourceMappingURL=Camera.js.map