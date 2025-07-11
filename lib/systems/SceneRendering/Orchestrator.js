import { System } from "/kernox.js";
import SpaceSearcher from "./SpaceSearcher.js";
import RayCaster from "./RayCaster.js";
import DataModeller from "./DataModeller.js";
import Renderer from "./Renderer.js";
import LocatorGL from "../../utils/rendering/LocatorGL.js";
import { locatorPromise } from "../../setup/webGL.js";
import { camera } from "../../utils/scene/Camera.js";
import Vector2D from "../../utils/physics/Vector2D.js";
import { rayvenConfig } from "../../config.js";
import canvases from "../../setup/canvases.js";
const ctx = canvases.canvas2d.getContext('2d');
class RenderingPipeline extends System {
    init() {
        this.spaceSearcher = new SpaceSearcher(this);
        this.rayCaster = new RayCaster(this);
        this.dataModeller = new DataModeller(this);
        this.renderer = new Renderer(this);
    }
    __debugRay__(ray) {
        if (!camera.castCenter)
            return;
        const deg = camera.castCenter?.direction.angle() * (180 / Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.01)';
        ctx.lineWidth = 1;
        let from = Vector2D.rotate(ray.source, camera.pos, deg);
        let to = Vector2D.rotate(ray.collidesAt, camera.pos, deg);
        from = Vector2D.sub(Vector2D.sub(from, camera.pos), { x: -10, y: -10 }).scale(1.5 * 3);
        to = Vector2D.sub(Vector2D.sub(to, camera.pos), { x: -10, y: -10 }).scale(1.5 * 3);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.closePath();
        ctx.stroke();
        if (!ray.reflected || !ray.reflected.active)
            return;
        this.__debugRay__(ray.reflected);
    }
    execute() {
        if (!this.locator)
            return false;
        if (!camera || !camera.castEdge || !camera.castCenter)
            return false;
        const wallIndices = this.spaceSearcher.getIndicesOfClosest(camera);
        const ray = camera.castEdge;
        const rotationAngle = (camera.FOV / rayvenConfig.resolution) * (Math.PI / 180) * -1;
        const complexRotator = [Math.cos(rotationAngle), Math.sin(rotationAngle)];
        const direction = Vector2D.copy(ray.direction);
        this.dataModeller.reset();
        for (let i = 0; i < rayvenConfig.resolution; i++) {
            ray.direction.complexRotate(complexRotator);
            if (ray.reflected)
                ray.reflected.active = false;
            this.rayCaster.castRay(ray, Object.assign({}, wallIndices));
            this.__debugRay__(ray);
            let angle = Vector2D.angleBetween(camera.castCenter.direction, ray.direction);
            this.dataModeller.model(ray, angle, i);
        }
        let amount = this.dataModeller.memoryIndex;
        this.renderer.render(amount);
        ray.direction = direction;
        return true;
    }
}
;
locatorPromise
    .then((locator) => { if (locator instanceof LocatorGL)
    RenderingPipeline.prototype.locator = locator; })
    .catch((err) => { throw Error(err); });
export default RenderingPipeline;
//# sourceMappingURL=Orchestrator.js.map