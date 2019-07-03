import {Vector} from "../vector";

export interface CollisionResult {
    normal: Vector;
    contacts: Array<Vector>;
    depth: number;
}
