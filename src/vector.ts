import {Transform} from "./transform";
import {Comparator} from "./comparator";

export class Vector {
    public static ZERO: Vector = new Vector();

    public x: number;
    public y: number;
    constructor(x: number = 0, y: number= 0) {
        this.x = x;
        this.y = y;
    }
    // set this value of this one to another vector.
    public set(x: number | Vector, y: number = 0) {
        if (x instanceof Vector) {
            this.x = x.x;
            this.y = x.y;
        } else {
            this.x = x;
            this.y = y;
        }
        return this;
    }
    // scale another vector first then add to this vector
    public addMul(v: Vector, scl: number) {
        this.x += v.x * scl;
        this.y += v.y * scl;
        return this;
    }

    // scale a vector first then subtract the vector
    public subMul(v: Vector, scl: number) {
        this.x -= v.x * scl;
        this.y -= v.y * scl;
        return this;
    }
    // Scale this vector. An independent scaling factor can be provided
    // for each axis, or a single scaling factor that will scale both `x` and `y`.
    public scl(x: number, y: number = x) {
        this.x *= x;
        this.y *= y;
        return this;
    }
    // Add another vector to this one.
    public add(v: Vector) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    // Add (x,y) to this one.
    public translate(x: number, y: number) {
        this.x += x;
        this.y += y;
        return this;
    }

    // Subtract another vector from this one.
    public sub(v: Vector | Transform) {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    // Change this vector to be perpendicular to what it was before. (Effectively
    // rotates it 90 degrees in a clockwise direction)
    public perp() {
        let x = this.x;
        this.x = this.y;
        this.y = -x;
        return this;
    }

    // Rotate this vector (counter-clockwise) by the specified angle (in radians).
    public rotate(angle: number, center: Vector = Vector.ZERO) {
        let x = this.x;
        let y = this.y;
        this.x = center.x + (x - center.x) * Math.cos(angle) - (y - center.y) * Math.sin(angle);
        this.y = center.y + (x - center.x) * Math.sin(angle) + (y - center.y) * Math.cos(angle);
        return this;
    }

    //  the angle v looks at this
    public angle(v: Vector) {
        return Math.atan2(this.y - v.y, this.x - v.x);
    }

    public reverse() {
        this.x = -this.x;
        this.y = -this.y;
        return this;
    }
    // Get the dot product of this vector and another.
    public dot(v: Vector) :number {
        return this.x * v.x + this.y * v.y;
    }

    /**
     * @param v the other vector
     * @param ref reference vector
     * @return dot product of (this - ref), (v - ref)
     * result > 0 the angle between (this - ref), (v - ref) < 90
     * result < 0 the angle between (this - ref), (v - ref) > 90
     */
    public dotRef(v: Vector, ref:Vector) :number {
        return (this.x - ref.x) * (v.x - ref.x) + (this.y - ref.y) * (v.y - ref.y);
    }

    /**
     * @param v
     * @return cross product
     */
    public cross(v: Vector) :number {
        return this.x * v.y - this.y * v.x;
    }

    /**
     * @param v the other vector
     * @param ref reference vector
     * @return cross product of (this - ref), (v - ref)
     * result < 0 if (v - ref) is on the right side of (this - ref)
     * result > 0 if (v - ref) is on the left side of (this - ref)
     */
    public crossRef(v: Vector, ref:Vector) :number {
        return (this.x - ref.x) * (v.y - ref.y) - (this.y - ref.y) * (v.x - ref.x);
    }
    // Project this vector on to another vector.
    public project(v: Vector) {
        let amt = this.dot(v) / v.len2();
        this.x = amt * v.x;
        this.y = amt * v.y;
        return this;
    }
    // Project this vector onto a vector of unit length. This is slightly more efficient
    // than `project` when dealing with unit vectors.
    public projectN(v: Vector) {
        let amt = this.dot(v);
        this.x = amt * v.x;
        this.y = amt * v.y;
        return this;
    };
    // Reflect this vector on an arbitrary axis.
    public reflect(axis: Vector) {
        let x = this.x;
        let y = this.y;
        this.project(axis).scl(2);
        this.x -= x;
        this.y -= y;
        return this;
    };
    // Reflect this vector on an arbitrary axis (represented by a unit vector). This is
    // slightly more efficient than `reflect` when dealing with an axis that is a unit vector.
    public reflectN (axis: Vector) {
        let x = this.x;
        let y = this.y;
        this.projectN(axis).scl(2);
        this.x -= x;
        this.y -= y;
        return this;
    };

    // Normalize this vector.  (make it have length of `1`)
    public normalize() {
        let d = this.len();
        if(d > 0) {
            this.x = this.x / d;
            this.y = this.y / d;
        }
        return this;
    }
    // Get the squared length of this vector.
    public len2() {
        return this.x * this.x + this.y * this.y;
    }
    // Get the length of this vector.
    public len() {
        return Math.sqrt(this.len2());
    }

    public setLen(len: number) {
        return this.normalize().scl(len);
    }

    // Create a new vector with the same coordinates as this on.
    public clone() {
        return new Vector(this.x, this.y);
    }

    public dist2(v: Vector) {
        return (v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y);
    }

    public dist(v: Vector) {
        return Math.sqrt(this.dist2(v));
    }

    public equalsTo(v: Vector): boolean {
        return Comparator.EQ(this.x, v.x) && Comparator.EQ(this.y, v.y);
    }

    public static lerp(start: Vector, end: Vector, t: number): Vector {
        return new Vector(t * (end.x - start.x) + start.x,  t * (end.y - start.y) + start.y);
    }

    public toString(): string {
        return `[${this.x}, ${this.y}]`;
    }

    public angleTo(v: Vector) {
        let res = Math.acos(this.dot(v)/v.len()/this.len());
        return (this.cross(v) < 0 ? -1 : 1)*res;
    }
}
