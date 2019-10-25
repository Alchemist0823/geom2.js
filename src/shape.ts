import {AABB} from "./aabb";
import {Vector} from "./vector";
import {CollisionResult} from "./collision/collision-result";
import {Segment} from "./segment";
import { Transform } from "./transform";

export interface Shape {

    transform: Transform;
    /**
     * test whether a point is in the shape (including the edge)
     * @param vector the point
     */
    isPointIn(vector: Vector): boolean;

    /**
     * get the area of the shape
     */
    getArea(): number;

    /**
     * get the centroid as a new vector
     * readonly
     */
    getCentroid(): Vector;

    /**
     * return the reference of the origin
     * the pivot of rotation
     * readonly
     */
    getOrigin(): Vector;

    /**
     * get the axis aligned bounding box of the shape
     * readonly
     */
    getAABB(): AABB;
}
