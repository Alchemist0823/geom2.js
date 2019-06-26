import {Vector} from "../vector";

export interface Manifold {
    normal: Vector;
    contact: Vector;
    depth: number;
}