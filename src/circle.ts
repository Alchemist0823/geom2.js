import {Vector} from './vector';
import {Shape} from './shape';
import {TestResult} from './test-result';
import {Box} from "./box";
import {Polygon} from "./polygon";
import {testCircleCircle, testPolygonCircle} from "./util";

export class Circle implements Shape{
    public c: Vector;
    public r: number;
    constructor(c: Vector, r: number) {
        this.c = c;
        this.r = r;
    }

    intersect(shape: Shape, result: TestResult): boolean {
        if (shape instanceof Polygon) {
            let ret = testPolygonCircle(shape, this, result);
            let swap = result.aInB;
            result.aInB = result.bInA;
            result.bInA = swap;
            result.overlapN.reverse();
            result.overlapV.reverse();
            return ret;
        } else if (shape instanceof Circle) {
            return testCircleCircle(this, shape, result);
        }
        return false;
    }

    getAABB() {
        return new Box(this.c.x - this.r, this.c.x + this.r, this.c.y - this.r, this.c.y + this.r);
    }

    isPointIn(v: Vector): boolean {
        return v.dist(this.c) <= this.r;
    }
}
