import Vector2D from '../utils/physics/Vector2D.js';
import type { Entity, PrototypeSchema } from '/kernox.js';

interface Circle extends Entity{
    center : Vector2D,
    radius : number,
    color : string,
    opacity : number
};

const circlePrototype :PrototypeSchema<Circle> = {
    name : "Circle",
    attributes: {
        center : new Vector2D(0,0),
        radius : 1,
        color  : '255,0,0',
        opacity : 1
    } as Circle,
    collections: new Set([ "Circles" ])
};

export { Circle, circlePrototype };