import {Vector} from "../vector";

export class CollisionResult {
    normal: Vector;
    depth: number;
    contacts: Array<Vector> = new Array<Vector>();

    constructor(normal: Vector = new Vector(), depth: number = 0) {
        this.normal = normal;
        this.depth = depth;
    }
}
