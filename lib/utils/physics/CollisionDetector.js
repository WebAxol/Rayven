import Vector2D from './Vector2D.js';
class CollisionDetector {
    static segmentVsSegment(x1, x2, y1, y2, l1, l2) {
        const dy = y2 - y1;
        const dl = l2 - l1;
        const denom = dy - dl;
        if (denom === 0)
            return null;
        const t = (l1 - y1) / denom;
        if (t < 0 || t > 1)
            return null;
        const x = x1 + t * (x2 - x1);
        const y = y1 + t * dy;
        return [x, y];
    }
    static RayVsVerticalLine(ray, x) {
        const lambda = (x - ray.source.x) / ray.direction.x;
        return lambda > 0 ? lambda : false;
    }
    static RayVsVerticalWall(ray, wall) {
        const lambda = CollisionDetector.RayVsVerticalLine(ray, wall.posX);
        if (!lambda)
            return false;
        const point = Vector2D.add(ray.source, Vector2D.scale(ray.direction, lambda));
        return (point.y >= wall.startY && point.y <= wall.endY) ? point : false;
    }
    static RayVsHorizontalLine(ray, y) {
        const lambda = (y - ray.source.y) / ray.direction.y;
        return lambda > 0 ? lambda : false;
    }
    static RayVsHorizontalWall(ray, wall) {
        const lambda = CollisionDetector.RayVsHorizontalLine(ray, wall.posY);
        if (!lambda)
            return false;
        const point = Vector2D.add(ray.source, Vector2D.scale(ray.direction, lambda));
        return (point.x >= wall.startX && point.x <= wall.endX) ? point : false;
    }
    static RayVsCircle(ray, circle) {
        if (circle.radius <= 0)
            throw Error("Invalid circle radius: it must be a positive number");
        let rayOrigin = ray.source;
        let OC = Vector2D.sub(circle.center, rayOrigin);
        let rayDirection = Vector2D.normalize(ray.direction);
        let OAmag = Vector2D.dot(rayDirection, OC);
        let CAmagSq = OC.magSq() - OAmag * OAmag;
        let BAmag = Math.sqrt(circle.radius * circle.radius - CAmagSq);
        let lambda = OAmag - BAmag;
        if (!lambda || lambda <= 0)
            return false;
        let RayToCircle = rayDirection.scale(lambda);
        let point = Vector2D.add(rayOrigin, RayToCircle);
        return { point, lambda };
    }
}
export default CollisionDetector;
//# sourceMappingURL=CollisionDetector.js.map