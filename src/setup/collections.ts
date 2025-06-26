import { HorizontalWall } from "../proto/HorizontalWall.js";
import { VerticalWall } from "../proto/VerticalWall.js";
import { Circle } from "../proto/Circle.js";
import { ArrayList } from "/kernox.js";

export class HorizontalWalls extends ArrayList<HorizontalWall> {};
export class VerticalWalls   extends ArrayList<VerticalWall>   {};
export class Circles         extends ArrayList<Circle>         {};

export const collections = [
    HorizontalWalls,
    VerticalWalls,
    Circles
];
