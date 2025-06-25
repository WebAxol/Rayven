import Vector2D           from "../utils/physics/Vector2D.js"
import { Circle }         from "./Circle.js"
import { HorizontalWall } from "./HorizontalWall.js"
import { VerticalWall }   from "./VerticalWall.js"

interface SceneChunk {
    
    leftTop  : { x : number, y : number },
    size     : { x : number, y : number },
    distance : number,

    // Information of item with which ray collided

    point    : Vector2D,
    item     : Circle | HorizontalWall | VerticalWall | null
}

const SceneChunkPrototype : SceneChunk = {

    leftTop  : { x : NaN, y : NaN },
    size     : { x : NaN, y : NaN },
    distance : NaN,

    // Information of item with which ray collided

    point    : new Vector2D(NaN,NaN),
    item     : null

}

export { SceneChunk, SceneChunkPrototype };