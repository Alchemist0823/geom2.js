import {Shape} from "./shape";
import {Vector} from "./vector";
import {TestResult} from "./test-result";
import {AABB} from "./aabb";
import {lineHasPoint, testPolygonCircle, testPolygonPolygon} from "./util";
import {Circle} from "./circle";
import {Transform} from "./transform";

/**
 * Polygon in this class satisfies:
 * 1. It must be a simple polygon.
 * 2. It contain the point (0, 0).
 * 3. Points are sorted in counter-clockwise order from it's center.
 */
export class Polygon implements Shape {
    //public pos: Vector;
    public transform: Transform;
    protected points: Array<Vector>;
    public calcPoints: Array<Vector>;

    constructor(pos: Vector, points: Array<Vector>) {
        this.transform = new Transform(pos);
        this.points = points;
        this.calcPoints = new Array<Vector>();
        this.recalc();
    }

    public get originPoints() {
        return this.points;
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
    public recalc(){
        let lengthChanged = this.points.length !== this.calcPoints.length;
        if (lengthChanged) {
            while(this.points.length < this.calcPoints.length) {
                this.calcPoints.pop();
            }
            while(this.points.length > this.calcPoints.length) {
                this.calcPoints.push(new Vector());
            }
        }

        // Copy the original points array and apply the offset/angle
        let points = this.points;
        let len = points.length;
        let i;
        for (i = 0; i < len; i++) {
            this.transform.transform(points[i], this.calcPoints[i]);
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

    public intersects(shape: Shape, result: TestResult): boolean {
        if (shape instanceof Polygon) {
            return testPolygonPolygon(this, shape, result);
        } else if (shape instanceof Circle) {
            return testPolygonCircle(this, shape, result);
        }
        throw new Error("shape intersects unavailable")
    }

    public isPointIn(v: Vector): boolean {
        //let rv = v.clone().sub(this.pos);
        let points = this.calcPoints;
        let length = points.length;
        let c = false;
        let i;
        for (i = 0; i < length; i ++) {
            if (((points[i].y > v.y) !== (points[(i + 1) % length].y > v.y)) &&
                (v.x < (points[(i + 1) % length].x - points[i].x) * (v.y - points[i].y) / (points[(i + 1) % length].y - points[i].y) + points[i].x)) {
                c = !c;
            }
        }
        if (c) {
            return true;
        }
        for (i = 0; i < length; i ++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % length];
            if (lineHasPoint(p1, p2, v, 1)) {
                return true;
            }
        }
        return false;
    }

    public getAABB(): AABB {
        return Polygon.getAABBFromPoints(this.points);
    }

    public getCalcAABB(): AABB {
        return Polygon.getAABBFromPoints(this.calcPoints);
    }

    public static getAABBFromPoints(points: Array<Vector>) {
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
        return new AABB(xMin, yMin, xMax, yMax);
    }

    public toCanvasDraw(scale: number = 1) {
        let points = this.points;
        let len = points.length;
        let str = 'ctx.beginPath();\n';
        str += 'ctx.strokeStyle = "black";\n';
        str += 'ctx.moveTo(' + (points[0].x + this.transform.x) * scale + ',' + (points[0].y + this.transform.y) * scale + ');\n';
        for (let i = 1; i < len; i++) {
            str += 'ctx.lineTo(' + (points[i].x + this.transform.x) * scale + ',' + (points[i].y + this.transform.y) * scale + ');\n';
        }
        str += 'ctx.lineTo(' + (points[0].x + this.transform.x) * scale + ',' + (points[0].y + this.transform.y) * scale + ');\n';
        str += 'ctx.stroke();';
        return str;
    }
}
