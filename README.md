# geom2.js
**geom2.js** is a high-performance javascript **2d geometry** library.

It is written in modern **TypeScript**.

## Structure:
* Vector
* Segment
* AABB (Axis-Aligned Bounding Box)
* Circle
* Polygon

## Algorithm:
* Convex Polygon test
* Random convex polygon generation
* Collision between shapes. Resolution distance and normal.

## Container:
* Loose QuadTree
    * High-quality quadtree implementation
    * It can store AABB (Axis-Aligned Bounding Box).
    * No elements on branch nodes, all data on leaves.
    * It maintains loose boundary on all nodes.
    * It outperforms simple-quadtree and all other available js quadtree.

## Addition Feature:
* Physics Collision Resolution