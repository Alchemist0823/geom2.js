import {ConvexShape} from "./convex-shape";
import {Vector} from "./vector";
import {AABB} from "./aabb";
import {lineLineIntersection, orientation, segmentHasPoint} from "./util";
import {Transform} from "./transform";
import { Segment } from "./segment";
import {CollisionResult} from "./collision/collision-result";
import {epa, gjk, resolvePointsOfContact} from "./collision";


const TEMP = new Vector();
/**
 * Polygon in this class satisfies:
 * 1. It must be a simple polygon.
 * 2. It contain the point (0, 0).
 * 3. Points are sorted in counter-clockwise order from it's center.
 */
export class Polygon implements ConvexShape {
    //public pos: Vector;
    public transform: Transform;
    protected points: Array<Vector>;
    public calcPoints: Array<Vector>;
    public centroid: Vector;

    constructor(pos: Vector, points: Array<Vector>) {
        this.transform = new Transform(pos);
        this.points = points;
        this.calcPoints = new Array<Vector>();
        this.centroid = new Vector();
        this.recalc();
    }

    public static fromAABB(aabb: AABB) {
        return new Polygon(aabb.getCenter(), [
            new Vector(-aabb.width / 2, -aabb.height /2),
            new Vector(aabb.width / 2, -aabb.height /2),
            new Vector(aabb.width / 2, aabb.height /2),
            new Vector(-aabb.width / 2, aabb.height /2),
        ]);
    }

    public get originPoints() {
        return this.points;
    }

    // Rotates this polygon counter-clockwise around the origin of *its local coordinate system* (i.e. `pos`).
    public rotate(angle: number, center: Vector = Vector.ZERO): this {
        this.transform.rotate(angle, center.x, center.y);
        return this;
    }

    // Translates the points of this polygon by a specified amount relative to the origin of *its own coordinate
    public translate(x: number, y: number): this {
        this.transform.translate(x, y);
        return this;
    };

    // Rotates this polygon counter-clockwise around the origin of *its local coordinate system* (i.e. `pos`).
    public rotateLocal(angle: number, center: Vector = Vector.ZERO) {
        for (let i = 0; i < this.points.length; i++) {
            this.points[i].rotate(angle, center);
        }
    }
    // Translates the points of this polygon by a specified amount relative to the origin of *its own coordinate
    public translateLocal(x: number, y: number) {
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
        this.centroid.set(this.getCentroid());
        return this;
    }

    public getOrigin(): Vector {
        return this.transform.position;
    }

    public getCentroid(): Vector {
        let points = this.calcPoints;
        let len = points.length;
        let cx = 0;
        let cy = 0;
        let ar = 0;
        for (let i = 0; i < len; i++) {
            let p1 = points[i];
            let p2 = i === len - 1 ? points[0] : points[i+1]; // Loop around if last point
            let a = p1.x * p2.y - p2.x * p1.y;
            cx += (p1.x + p2.x) * a;
            cy += (p1.y + p2.y) * a;
            ar += a;
        }
        ar = ar * 3; // we want 1 / 6 the area and we currently have 2*area
        cx = cx / ar;
        cy = cy / ar;
        return new Vector(cx, cy);
    }

    public intersectsSegment(line: Segment, result?: CollisionResult): boolean {
        let points = this.calcPoints;
        let segment = new Segment(new Vector(), new Vector());
        if (result) {
            result.depth = Number.MAX_VALUE;
        }
        for (let i = 0; i < points.length; i ++) {
            segment.v1 = points[i];
            segment.v2 = points[(i + 1) % points.length];
            if (line.intersects(segment)) {
                if (result) {
                    let p = lineLineIntersection(segment.v1, segment.v2, line.v1, line.v2);
                    let dist = p.dist(line.v1);
                    if (dist < result.depth) {
                        result.contacts = [p];
                        result.depth = dist;
                        result.normal.set(segment.v2).sub(segment.v1).normalize().perp();
                    }
                } else {
                    return true;
                }
            }
        }

        if (result) {
            return (result.depth !== Number.MAX_VALUE);
        }
        return false;
    }


    public intersects(shape: ConvexShape, result?: CollisionResult): boolean {
        const simplex: [Vector, Vector, Vector] = [new Vector(), new Vector(), new Vector()];
        const collided = gjk(this, shape, simplex);

        if (result && collided) {
            epa(this, shape, simplex, result);
            resolvePointsOfContact(this, shape, result);
            //throw new Error("shape intersects unavailable");
            return true;
        }
        return collided;
    }

    public isPointIn(v: Vector): boolean {
        let points = this.calcPoints;
        let length = points.length;
        let c = false;
        for (let i = 0; i < length; i ++) {
            if (((points[i].y > v.y) !== (points[(i + 1) % length].y > v.y)) &&
                (v.x < (points[(i + 1) % length].x - points[i].x) * (v.y - points[i].y) / (points[(i + 1) % length].y - points[i].y) + points[i].x)) {
                c = !c;
            }
        }
        if (c) {
            return true;
        }
        return this.isPointOn(v);
    }

    public isPointOn(v: Vector): boolean {
        let points = this.calcPoints;
        let length = points.length;
        for (let i = 0; i < length; i ++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % length];
            if (segmentHasPoint(p1, p2, v)) {
                return true;
            }
        }
        return false;
    }

    public getAABB(): AABB {
        return Polygon.getAABBFromPoints(this.calcPoints);
    }

    public getOriginAABB(): AABB {
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

    getArea() {
        let points = this.points;
        let len = points.length;
        let ar = 0;
        for (let i = 0; i < len; i++) {
            let p1 = points[i];
            let p2 = i === len - 1 ? points[0] : points[i+1]; // Loop around if last point
            let a = p1.x * p2.y - p2.x * p1.y;
            ar += a;
        }
        return ar / 2;
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

    private getFarthestIndexInDirection(d: Vector): number {
        const vertices = this.calcPoints;

        TEMP.set(vertices[0]).sub(this.transform.position);
        let maxProduct = d.dot(TEMP);
        let index = 0;
        for (let i = 1; i < vertices.length; i++) {
            TEMP.set(vertices[i]).sub(this.transform.position);
            let product = d.dot(TEMP);
            if (product > maxProduct) {
                maxProduct = product;
                index = i;
            }
        }
        return index;
    }

    getFarthestPointInDirection(d: Vector): Vector {
        return this.calcPoints[this.getFarthestIndexInDirection(d)].clone();
    }

    getFarthestEdgeInDirection(d: Vector): Segment {
        const vertices = this.calcPoints;

        const index = this.getFarthestIndexInDirection(d);

        const p0 = vertices[(index - 1 + vertices.length) % vertices.length];
        const p1 = vertices[index];
        const p2 = vertices[(index + 1) % vertices.length];

        let l = p1.clone().sub(p0).normalize();
        let r = p1.clone().sub(p2).normalize();
        if (r.dot(d) < l.dot(d)) {
            return new Segment(p1, p2);
        } else {
            return new Segment(p0, p1);
        }
    }

    validate(): boolean {
        let points = this.calcPoints;
        let length = points.length;
        let temp = new Vector();
        let temp2 = new Vector();
        for (let i = 0; i < length; i ++) {
            let p1 = points[i];
            let p2 = points[(i + 1) % length];
            let p3 = points[(i + 2) % length];
            temp2.set(p3).sub(p2);
            if (temp.set(p2).sub(p1).cross(temp2) <= 0) {
                return false;
            }
        }
        return true;
    }

    recenter() {
        const c = this.getCentroid();
        for(let p of this.points) {
            p.sub(c);
        }
        this.transform.translate(c.x, c.y);
        this.recalc();
    }
}
