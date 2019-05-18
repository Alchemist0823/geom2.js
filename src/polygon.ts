import Shape from "./shape";
import Vector from "./vector";
import TestResult from "./test-result";
import Box from "./box";
import {lineHasPoint, testPolygonCircle, testPolygonPolygon} from "./util";
import Circle from "./circle";

export default class Polygon implements Shape {
    public pos: Vector;
    public points:Array<Vector>;
    constructor(pos: Vector, points: Array<Vector>) {
        this.pos = pos;
        this.points = points;
    }

    // Rotates this polygon counter-clockwise around the origin of *its local coordinate system* (i.e. `pos`).
    public rotate(angle: number) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].rotate(angle);
        }
    }
    // Translates the points of this polygon by a specified amount relative to the origin of *its own coordinate
    public translate(x: number, y: number) {
        let points = this.points;
        let len = points.length;
        for (let i = 0; i < len; i++) {
            points[i].x += x;
            points[i].y += y;
        }
        return this;
    };

    // Calculated points - this is what is used for underlying collisions and takes into account
    // the angle/offset set on the polygon.
    public calcPolygon(angle: number, offset: Vector, calcPolygon: Polygon){

        let lengthChanged = this.points.length !== calcPolygon.points.length;
        if (lengthChanged) {
            while(this.points.length < calcPolygon.points.length) {
                calcPolygon.points.pop();
            }
            while(this.points.length > calcPolygon.points.length) {
                calcPolygon.points.push(new Vector());
            }
        }

        // Copy the original points array and apply the offset/angle
        let points = this.points;
        let len = points.length;
        let i;
        for (i = 0; i < len; i++) {
            let calcPoint = calcPolygon.points[i].set(points[i]);
            calcPoint.x += offset.x;
            calcPoint.y += offset.y;
            if (angle !== 0) {
                calcPoint.rotate(angle);
            }
        }
        return this;
    }

    public getCentroid(): Vector {
        let points = this.points;
        let len = points.length;
        let cx = 0;
        let cy = 0;
        let ar = 0;
        for (let i = 0; i < len; i++) {
            let p1 = points[i];
            let p2 = i === len - 1 ? points[0] : points[i+1]; // Loop around if last point
            let a = p1["x"] * p2["y"] - p2["x"] * p1["y"];
            cx += (p1["x"] + p2["x"]) * a;
            cy += (p1["y"] + p2["y"]) * a;
            ar += a;
        }
        ar = ar * 3; // we want 1 / 6 the area and we currently have 2*area
        cx = cx / ar;
        cy = cy / ar;
        return new Vector(cx, cy);
    }

    public intersect(shape: Shape, result: TestResult): boolean {
        if (shape instanceof Polygon) {
            return testPolygonPolygon(this, shape, result);
        } else if (shape instanceof Circle) {
            return testPolygonCircle(this, shape, result);
        }
        throw new Error("shape intersect unavailable")
    }

    public isPointIn(v: Vector): boolean {
        let rv = v.clone().sub(this.pos);
        let points = this.points;
        let length = points.length;
        let c = false;
        let i;
        for (i = 0; i < length; i ++) {
            if (((points[i].y > rv.y) !== (points[(i + 1) % length].y > rv.y)) &&
                (rv.x < (points[(i + 1) % length].x - points[i].x) * (rv.y - points[i].y) / (points[(i + 1) % length].y - points[i].y) + points[i].x)) {
                c = !c;
            }
        }
        if (c) {
            return true;
        }
        for (i = 0; i < length; i ++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % length];
            if (lineHasPoint(p1, p2, rv, 1)) {
                return true;
            }
        }
        return false;
    }

    public getAABB(): Box {
        let points = this.points;
        let len = points.length;
        let xMin = points[0].x;
        let yMin = points[0].y;
        let xMax = points[0].x;
        let yMax = points[0].y;
        for (let i = 1; i < len; i++) {
            let point = points[i];
            if (point.x < xMin) {
                xMin = point.x;
            }
            else if (point.x > xMax) {
                xMax = point.x;
            }
            if (point.y < yMin) {
                yMin = point.y;
            }
            else if (point.y > yMax) {
                yMax = point.y;
            }
        }
        return new Box(xMin, xMax, yMin, yMax);
    }
}
