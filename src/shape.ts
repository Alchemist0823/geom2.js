import {AABB} from "./aabb";
import {Vector} from "./vector";
import {CollisionResult} from "./collision/collision-result";
import {Segment} from "./segment";

export interface Shape {
    /**
     * whether the shape intersects with another shape
     * @param shape another shape
     * @param result collision information that includes contact normal, penetration depth
     *               and the points of contact. It can be used in rigid body physics
     */
    intersects(shape: Shape, result?: CollisionResult): boolean;

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

    /**
     * get a newly allocated farthest point in direction d.
     * the center of the shape must be inside.
     * used in GJK
     * @param d direction
     */
    getFarthestPointInDirection(d: Vector): Vector;


    getFarthestEdgeInDirection(d: Vector): Segment;
}
