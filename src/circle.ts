import {Vector} from './vector';
import {ConvexShape} from './convex-shape';
import {AABB} from "./aabb";
import {CollisionResult} from "./collision/collision-result";
import {epa, gjk, resolvePointsOfContact} from "./collision";
import {Segment} from "./segment";
import { Transform } from './transform';

const TEMP = new Vector();

export class Circle implements ConvexShape {
    public transform: Transform;
    public r: number;

    public get center() {
        return this.transform.position;
    }

    constructor(c: Vector, r: number) {
        this.transform = new Transform(c);
        this.r = r;
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


    //(ray.v2.x * t + ray.v1.x * (1 - t) - this.center.x) ^ 2 +
    //(ray.v2.y * t + ray.v1.y * (1 - t) - this.center.y) ^ 2 = this.r ^ 2
    intersectsSegment(ray: Segment, result?: CollisionResult): boolean {
        let a = ray.v2.x;
        let b = ray.v1.x;
        let c = this.center.x;
        let d = ray.v2.y;
        let e = ray.v1.y;
        let f = this.center.y;

        let aa = ((a - b) * (a - b) + (d - e) * (d - e));
        let bb = (a * b - b * b - a * c + b * c - e * e + e * d - d * f + e * f) * 2;
        let cc = (b - c) * (b - c) + (e - f) * (e - f) - this.r * this.r;

        let det = bb * bb - 4 * aa * cc;
        if (det >= 0) {
            let t1 = (- bb - Math.sqrt(det)) / (2 * aa);
            let t2 = (- bb + Math.sqrt(det)) / (2 * aa);
            let t = NaN;
            if (t1 >= 0 && t1 <= 1) {
                t = t1;
            }
            if (t2 >= 0 && t2 <= 1 && t2 < t) {
                t = t2;
            }
            if (!isNaN(t)) {
                if (result) {
                    result.contacts = [new Vector(a * t + b * (1 - t), d * t + e * (1 - t))];
                    result.depth = result.contacts[0].dist(ray.v1);
                    result.normal = result.contacts[0].clone().sub(this.center).normalize();
                }
                return true;
            }
        }
        return false;
    }

    intersects(shape: ConvexShape, result?: CollisionResult): boolean {
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

    getAABB() {
        return new AABB(this.center.x - this.r, this.center.y - this.r, this.center.x + this.r, this.center.y + this.r);
    }

    isPointIn(v: Vector): boolean {
        return v.dist(this.center) <= this.r;
    }

    getArea(): number {
        return this.r * this.r * Math.PI;
    }

    public getOrigin(): Vector {
        return this.center;
    }

    getCentroid(): Vector {
        return this.center;
    }

    getFarthestPointInDirection(d: Vector): Vector {
        return d.clone().setLen(this.r).add(this.center);
    }

    getFarthestEdgeInDirection(d: Vector): Segment {
        TEMP.set(d).normalize();
        return new Segment(
            TEMP.clone().perp().scl(this.r * 0.01).addMul(TEMP, this.r).add(this.center),
            TEMP.clone().perp().scl(-this.r * 0.01).addMul(TEMP, this.r).add(this.center)
        );
    }

    public toString(): string {
        return `{p:${this.transform.position}, rot:${this.transform.angle}, rad:${this.r}}`;
    }
}
