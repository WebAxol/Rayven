import Vector2D from '../utils/physics/Vector2D.js';
;
const circlePrototype = {
    name: "Circle",
    attributes: {
        center: new Vector2D(0, 0),
        radius: 1,
        color: '255,0,0',
        opacity: 1
    },
    collections: new Set(["Circles"])
};
export { circlePrototype };
//# sourceMappingURL=Circle.js.map