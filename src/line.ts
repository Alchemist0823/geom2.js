import {Vector} from "./vector";
import {Shape} from "./shape";
import {Box} from "./box";
import {TestResult} from "./test-result";
import {lineHasPoint} from "./util";

export  class Line implements Shape {
    public v1: Vector;
    public v2: Vector;
    constructor(v1: Vector, v2: Vector) {
        this.v1 = v1;
        this.v2 = v2;
    }

    getAABB(): Box {
        return new Box(Math.min(this.v1.x, this.v2.x), Math.max(this.v1.x, this.v2.x), Math.min(this.v1.y, this.v2.y), Math.max(this.v1.y, this.v2.y));
    }

    intersect(shape: Shape, result: TestResult): boolean {
        throw new Error("method is not implemented");
    }

    isPointIn(v: Vector): boolean {
        return lineHasPoint(this.v1, this.v2, v, 1);
    }
}
