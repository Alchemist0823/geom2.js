import {Shape} from "./shape";
import {TestResult} from "./test-result";
import {Vector} from "./vector";

export class AABB implements Shape {
    public left: number;
    public right: number;
    public top: number;
    public bottom: number;
    constructor(left: number, bottom: number, right: number, top: number) {
        this.left = left;
        this.bottom = bottom;
        this.right = right;
        this.top = top;
    }

    public set(other: AABB) {
        this.left = other.left;
        this.bottom = other.bottom;
        this.right = other.right;
        this.top = other.top;
    }

    public getCenter() {
        return new Vector((this.left + this.right) / 2, (this.top + this.bottom) / 2);
    }

    public get centerX() {
        return (this.left + this.right) / 2;
    }

    public get centerY() {
        return (this.bottom + this.top) / 2;
    }

    intersect(shape: Shape, result?: TestResult): boolean {
        if (shape instanceof AABB) {
            return this.left <= shape.right &&
                this.right >= shape.left &&
                this.bottom <= shape.top &&
                this.top >= shape.bottom;
        }
        throw new Error("shape intersect unavailable")
    }

    contains(aabb: AABB): boolean {
        return this.left <= aabb.left &&
            this.right >= aabb.right &&
            this.bottom <= aabb.bottom &&
            this.top >= aabb.top;
    }

    extend(other: AABB): this {
        this.left = Math.min(this.left, other.left);
        this.bottom = Math.min(this.bottom, other.bottom);
        this.right = Math.max(this.right, other.right);
        this.top = Math.max(this.top, other.top);
        return this;
    }

    getAABB() {
        return this;
    }

    isPointIn(vector: Vector): boolean {
        return false;
    }

    toString() {
        return '[' + this.left + ', '+ this.bottom + ', '+ this.right + ', '+ this.top + ']';
    }
}
