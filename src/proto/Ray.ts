import Vector2D                         from "../utils/physics/Vector2D.js"
import type { VerticalWall }            from "./VerticalWall.js"
import type { HorizontalWall }          from "./HorizontalWall.js"
import type { Entity, PrototypeSchema } from "/kernox.js";
import { Circle } from "./Circle.js";

interface Ray extends Entity {
    active     : boolean,
    level      : number,
    lambda     : number, 
    source     : Vector2D,
    direction  : Vector2D,
    collidesAt : Vector2D,
    collidesWith : VerticalWall | HorizontalWall | Circle | undefined,
    reflected  : undefined | Ray,
};

const rayPrototype :PrototypeSchema<Ray> = {
    name: "Ray",
    attributes: {
        active      : true,
        lambda      : NaN,
        source      : new Vector2D(NaN,NaN),
        direction   : new Vector2D(NaN,NaN),
        reflected   : undefined,
        level       : 1,

        // for collision detection and response

        collidesWith: undefined,
        collidesAt  : (new Vector2D(NaN,NaN))
    } as Ray
};

export { Ray, rayPrototype };