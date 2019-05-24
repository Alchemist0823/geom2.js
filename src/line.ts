import {Vector} from "./vector";
import {AABB} from "./aabb";

export interface Line {

    getAABB(): AABB;
    contains(pt: Vector): boolean;
}