import {Vector} from './vector';
import {Shape} from './shape';
import {AABB} from "./aabb";
import {CollisionResult} from "./collision/collision-result";
import {epa, gjk, resolvePointsOfContact} from "./collision";
import {Segment} from "./segment";

const TEMP = new Vector();

export class Circle implements Shape{
    public c: Vector;
    public r: number;
    constructor(c: Vector, r: number) {
        this.c = c;
        this.r = r;
    }

    intersects(shape: Shape, result: CollisionResult): boolean {
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
        return new AABB(this.c.x - this.r, this.c.y - this.r, this.c.x + this.r, this.c.y + this.r);
    }

    isPointIn(v: Vector): boolean {
        return v.dist(this.c) <= this.r;
    }

    getArea(): number {
        return this.r * this.r * Math.PI;
    }

    public getOrigin(): Vector {
        return this.c;
    }

    getCentroid(): Vector {
        return this.c;
    }

    getFarthestPointInDirection(d: Vector): Vector {
        return d.clone().setLen(this.r).add(this.c);
    }

    getFarthestEdgeInDirection(d: Vector): Segment {
        TEMP.set(d).normalize();
        return new Segment(
            TEMP.clone().perp().scl(this.r * 0.01).addMul(TEMP, this.r).add(this.c),
            TEMP.clone().perp().scl(-this.r * 0.01).addMul(TEMP, this.r).add(this.c)
        );
    }
}
