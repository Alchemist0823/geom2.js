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

    intersects(shape: ConvexShape, result: CollisionResult): boolean {
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
}
