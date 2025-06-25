import { HorizontalWall } from "../proto/HorizontalWall.js";
import { VerticalWall } from "../proto/VerticalWall.js";
import { Circle } from "../proto/Circle.js";
import { ArrayList } from "/kernox.js";

class HorizontalWalls extends ArrayList<HorizontalWall> {};
class VerticalWalls   extends ArrayList<VerticalWall>   {};
class Circles         extends ArrayList<Circle>         {};

export const collections = [
    HorizontalWalls,
    VerticalWalls,
    Circles
];
