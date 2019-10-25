import {Shape} from "./shape";
import { CollisionResult } from "./collision/collision-result";
import { Vector } from "./vector";
import { Segment } from "./segment";

export interface ConvexShape extends Shape {
  /**
   * whether the shape intersects with another shape
   * @param shape another shape
   * @param result collision information that includes contact normal, penetration depth
   *               and the points of contact. It can be used in rigid body physics
   */
  intersects(shape: ConvexShape, result?: CollisionResult): boolean;

  /**
   * get a newly allocated farthest point in direction d.
   * the center of the shape must be inside.
   * used in GJK
   * @param d direction
   */
  getFarthestPointInDirection(d: Vector): Vector;

  /**
   * get a newly allocated farthest Segment in direction d.
   * used in point of contact resolver.
   * @param d direction
   */
  getFarthestEdgeInDirection(d: Vector): Segment;
}
