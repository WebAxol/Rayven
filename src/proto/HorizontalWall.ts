import type { Entity, PrototypeSchema } from "/kernox.js";

interface HorizontalWall extends Entity {
    color  : string,
    startX : number,
    endX   : number,
    posY   : number,
    opacity: number
}

const horizontalWallPrototype :PrototypeSchema<HorizontalWall> = {
    name: "HorizontalWall",
    attributes: {
        color  : 'white',
        startX : NaN,
        endX   : NaN,
        posY   : NaN,
        opacity: 1
    } as HorizontalWall,
    collections: new Set([ "HorizontalWalls" ])
};

export {HorizontalWall, horizontalWallPrototype};