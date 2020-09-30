import {Vector} from "./vector";
import {AABB} from "./aabb";

export interface Curve {

    getAABB(): AABB;
    contains(pt: Vector): boolean;
}