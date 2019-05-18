import {Shape} from "./shape";
import {TestResult} from "./test-result";
import {Vector} from "./vector";

export class Box implements Shape{
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;
    constructor(left: number, right: number, bottom: number, top: number) {
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
    }

    intersect(shape: Shape, result: TestResult): boolean {
        throw new Error("Method not implemented.");
    }
    getAABB() {
        return this;
    }

    isPointIn(vector: Vector): boolean {
        return false;
    }
}
