import {Shape} from './shape';
import {TestResult} from "./test-result";
import {Vector} from "./vector";
import {AABB} from "./aabb";

export class Arc implements Shape {
    public c: Vector;
    public r: number;
    public start: number;
    public end: number;

    intersects(shape: Shape, result: TestResult): boolean {
        throw new Error("Method not implemented.");
    }

    isPointIn(vector: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    getAABB(): AABB {
        throw new Error("Method not implemented.");
    }
}
