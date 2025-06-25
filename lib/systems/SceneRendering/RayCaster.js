import CollisionDetector from "../../utils/physics/CollisionDetector.js";
import Vector2D from "../../utils/physics/Vector2D.js";
class RayCaster {
    constructor(sys) {
        this.sys = sys;
        this.sys.attachToEvent("__start", (e) => { this.loadGeometry(); });
    }
    loadGeometry() {
        this.horizontalWalls = this.sys.getCollection('HorizontalWalls').asArray();
        this.verticalWalls = this.sys.getCollection('VerticalWalls').asArray();
        this.circles = this.sys.getCollection('Circles').asArray();
    }
    castRay(ray, indices) {
        if (ray.reflected)
            ray.reflected.active = false;
        ray.collidesWith = null;
        ray.lambda = Infinity;
        const wallCollision = this.iterativeWallCollisionTest(ray, indices);
        const circleCollision = this.testAgainstCircles(ray);
        if (!wallCollision && !circleCollision)
            return;
        if (ray.level < 15 && ray.collidesWith.opacity < 1 && this.reflect(ray))
            this.castRay(ray.reflected, indices);
    }
    reflect(ray) {
        if (!ray.collidesWith)
            return false;
        if (!ray.reflected) {
            ray.reflected = this.sys.__kernox.entityFactory.create('Ray', {});
            ray.reflected.level = ray.level + 1;
        }
        ray.reflected.source = Vector2D.copy(ray.collidesAt);
        ray.reflected.direction = Vector2D.copy(ray.direction);
        ray.reflected.active = true;
        const surfaceType = ray.collidesWith.type;
        const strategy = {
            HorizontalWall: (reflected) => { reflected.direction.y *= -1; },
            VerticalWall: (reflected) => { reflected.direction.x *= -1; },
            Circle: (reflected) => {
                const circle = ray.collidesWith;
                const pointToCenter = Vector2D.sub(circle.center, ray.collidesAt);
                const angleBetween = Vector2D.angleBetween(Vector2D.scale(ray.direction, -1), pointToCenter);
                const sense = (ray.direction.x > 0 ? 1 : -1);
                reflected.direction
                    .complexRotate([
                    Math.cos(sense * angleBetween * 2),
                    Math.sin(sense * angleBetween * 2)
                ]);
                reflected.source.add(Vector2D.scale(reflected.direction, 0.01));
                reflected.direction.scale(-1);
            }
        };
        const reflectStrategy = strategy[surfaceType];
        if (!reflectStrategy)
            return false;
        reflectStrategy(ray.reflected);
        return true;
    }
    iterativeWallCollisionTest(ray, indices) {
        const sense = { x: ray.direction.x > 0 ? 1 : -1, y: ray.direction.y > 0 ? 1 : -1 };
        var wallH, wallV, lambdaH, lambdaV, collision;
        while ((indices.horizontal < this.horizontalWalls.length && sense.y == 1) || (indices.horizontal >= 0 && sense.y == -1) ||
            (indices.vertical < this.verticalWalls.length && sense.x == 1) || (indices.vertical >= 0 && sense.x == -1)) {
            wallH = this.horizontalWalls[indices.horizontal + (sense.y == 1 ? 1 : 0)];
            wallV = this.verticalWalls[indices.vertical + (sense.x == 1 ? 1 : 0)];
            lambdaH = wallH ? CollisionDetector.RayVsHorizontalLine(ray, wallH.posY) : Infinity;
            lambdaV = wallV ? CollisionDetector.RayVsVerticalLine(ray, wallV.posX) : Infinity;
            if (lambdaV === lambdaH)
                break;
            collision = (lambdaH < lambdaV) ? CollisionDetector.RayVsHorizontalWall(ray, wallH) : CollisionDetector.RayVsVerticalWall(ray, wallV);
            if (collision) {
                ray.collidesAt = collision;
                ray.lambda = Math.min(lambdaH, lambdaV);
                ray.collidesWith = (lambdaH <= lambdaV) ? wallH : wallV;
                break;
            }
            indices.horizontal += (lambdaH <= lambdaV) ? sense.y : 0;
            indices.vertical += (lambdaH >= lambdaV) ? sense.x : 0;
        }
        ;
        return collision ? true : false;
    }
    testAgainstCircles(ray) {
        var collided = false, collision;
        for (let i = 0; i < this.circles.length; i++) {
            collision = CollisionDetector.RayVsCircle(ray, this.circles[i]);
            if (!collision)
                continue;
            if (ray.lambda <= collision.lambda)
                continue;
            collided = true;
            ray.collidesAt = collision.point;
            ray.lambda = collision.lambda;
            ray.collidesWith = this.circles[i];
        }
        return collided;
    }
}
;
export default RayCaster;
//# sourceMappingURL=RayCaster.js.map