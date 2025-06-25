import type { Entity, PrototypeSchema } from "/kernox";

interface VerticalWall extends Entity {
    color  : string,
    startY : number,
    endY   : number,
    posX   : number,
    opacity: number
}

const verticalWallPrototype :PrototypeSchema<VerticalWall> = {
    name: "VerticalWall",
    attributes: {
        color  : 'white',
        startY : NaN,
        endY   : NaN,
        posX   : NaN,
        opacity: 1
    } as VerticalWall,
    collections: new Set([ "VerticalWalls" ])
};

export {VerticalWall, verticalWallPrototype};