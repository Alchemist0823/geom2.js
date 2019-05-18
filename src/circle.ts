import Vector from './vector';
import Shape from './shape';
import TestResult from './test-result';
import Box from "./box";
import Polygon from "./polygon";

export default class Circle implements Shape{
    public c: Vector;
    public r: number;
    constructor(c: Vector, r: number) {
        this.c = c;
        this.r = r;
    }

    intersect(shape: Shape, result: TestResult): boolean {
        if (shape instanceof Polygon) {

        }
        return false;
    }

    getAABB() {
        return new Box(this.c.x - this.r, this.c.x + this.r, this.c.y - this.r, this.c.y + this.r);
    }

    isPointIn(vector: Vector): boolean {
        return vector.dist(this.c) <= this.r;
    }
}
