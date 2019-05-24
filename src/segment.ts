import {Vector} from "./vector";
import {Shape} from "./shape";
import {AABB} from "./aabb";
import {TestResult} from "./test-result";
import {lineHasPoint} from "./util";
import {Line} from "./line";

export  class Segment implements Line {
    public v1: Vector;
    public v2: Vector;
    constructor(v1: Vector, v2: Vector) {
        this.v1 = v1;
        this.v2 = v2;
    }

    getAABB(): AABB {
        return new AABB(Math.min(this.v1.x, this.v2.x), Math.min(this.v1.y, this.v2.y), Math.max(this.v1.x, this.v2.x), Math.max(this.v1.y, this.v2.y));
    }

    contains(v: Vector): boolean {
        return lineHasPoint(this.v1, this.v2, v, 1);
    }
}
