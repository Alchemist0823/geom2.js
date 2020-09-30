/**
 * The workhorse that represents a navigation mesh built from a series of polygons. Once built, the
 * mesh can be asked for a path from one point to another point. Some internal terminology usage:
 * - neighbor: a polygon that shares part of an edge with another polygon
 * - portal: when two neighbor's have edges that overlap, the portal is the overlapping line segment
 * - channel: the path of polygons from starting point to end point
 * - pull the string: run the funnel algorithm on the channel so that the path hugs the edges of the
 *   channel. Equivalent to having a string snaking through a hallway and then pulling it taut.
 *
 * @class NavMesh
 */
import {Vector} from "../vector";
import NavPoly from "./navpoly";
import {NavGraph} from "./navgraph";
import {Segment} from "../segment";
import {angleDiff, clamp} from "../util";
import {Polygon} from "../polygon";
import {Channel} from "./channel";

export default class NavMesh {
    private _meshShrinkAmount: number;
    private _navPolygons: NavPoly[];
    private _graph: NavGraph;
    /**
     * Creates an instance of NavMesh.
     * @param {object[][]} meshPolygonPoints Array where each element is an array of point-like
     * objects that defines a polygon.
     * @param {number} [meshShrinkAmount=0] The amount (in pixels) that the navmesh has been
     * shrunk around obstacles (a.k.a the amount obstacles have been expanded)
     * @memberof NavMesh
     */
    constructor(meshPolygonPoints: Array<Array<Vector>>, meshShrinkAmount = 0) {
        this._meshShrinkAmount = meshShrinkAmount;

        const newPolys = meshPolygonPoints.map(polyPoints => {
            const vectors = polyPoints.map(p => new Vector(p.x, p.y));
            return new Polygon(new Vector(), vectors);
        });

        this._navPolygons = newPolys.map((polygon, i) => new NavPoly(i, polygon));

        this._calculateNeighbors();

        // Astar graph of connections between polygons
        this._graph = new NavGraph(this._navPolygons, (navPolygon1, navPolygon2) => {
            return (navPolygon1 as NavPoly).centroidDistance(navPolygon2 as NavPoly);
        });
    }

    /**
     * Get the NavPolys that are in this navmesh.
     *
     * @returns {NavPoly[]}
     * @memberof NavMesh
     */
    getPolygons() {
        return this._navPolygons;
    }

    /**
     * Cleanup method to remove references.
     *
     * @memberof NavMesh
     */
    destroy() {
        this._graph.destroy();
        for (const poly of this._navPolygons) poly.destroy();
        this._navPolygons = [];
    }

    /**
     * Find a path from the start point to the end point using this nav mesh.
     *
     * @param {object} startPoint A point-like object in the form {x, y}
     * @param {object} endPoint A point-like object in the form {x, y}
     * @returns {Vector[]|null} An array of points if a path is found, or null if no path
     *
     * @memberof NavMesh
     */
    findPath(startPoint: Vector, endPoint: Vector) {
        let startPoly = null;
        let endPoly = null;
        let startDistance = Number.MAX_VALUE;
        let endDistance = Number.MAX_VALUE;
        let d, r;
        const startVector = new Vector(startPoint.x, startPoint.y);
        const endVector = new Vector(endPoint.x, endPoint.y);

        // Find the closest poly for the starting and ending point
        for (const navPoly of this._navPolygons) {
            r = navPoly.boundingRadius;
            // Start
            d = navPoly.centroid.dist(startVector);
            if (d <= startDistance && d <= r && navPoly.contains(startVector)) {
                startPoly = navPoly;
                startDistance = d;
            }
            // End
            d = navPoly.centroid.dist(endVector);
            if (d <= endDistance && d <= r && navPoly.contains(endVector)) {
                endPoly = navPoly;
                endDistance = d;
            }
        }

        // If the start point wasn't inside a polygon, run a more liberal check that allows a point
        // to be within meshShrinkAmount radius of a polygon
        if (!startPoly && this._meshShrinkAmount > 0) {
            for (const navPoly of this._navPolygons) {
                // Check if point is within bounding circle to avoid extra projection calculations
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = navPoly.centroid.dist(startVector);
                if (d <= r) {
                    // Check if projected point is within range of a polgyon and is closer than the
                    // previous point
                    const { distance } = this._projectPointToPolygon(startVector, navPoly);
                    if (distance <= this._meshShrinkAmount && distance < startDistance) {
                        startPoly = navPoly;
                        startDistance = distance;
                    }
                }
            }
        }

        // Same check as above, but for the end point
        if (!endPoly && this._meshShrinkAmount > 0) {
            for (const navPoly of this._navPolygons) {
                r = navPoly.boundingRadius + this._meshShrinkAmount;
                d = navPoly.centroid.dist(endVector);
                if (d <= r) {
                    const { distance } = this._projectPointToPolygon(endVector, navPoly);
                    if (distance <= this._meshShrinkAmount && distance < endDistance) {
                        endPoly = navPoly;
                        endDistance = distance;
                    }
                }
            }
        }

        // No matching polygons locations for the start or end, so no path found
        if (!startPoly || !endPoly) return null;

        // If the start and end polygons are the same, return a direct path
        if (startPoly === endPoly) return [startVector, endVector];

        // Search!
        const astarPath = this._graph.search(startPoly, endPoly);

        // While the start and end polygons may be valid, no path between them
        if (astarPath.length === 0) return null;

        // jsastar drops the first point from the path, but the funnel algorithm needs it
        astarPath.unshift(startPoly.astar);

        // We have a path, so now time for the funnel algorithm
        const channel = new Channel();
        channel.push(startVector);
        for (let i = 0; i < astarPath.length - 1; i++) {
            const navPolygon = astarPath[i];
            const nextNavPolygon = astarPath[i + 1];

            // Find the portal
            let portal: Segment|null = null;
            for (let i = 0; i < navPolygon.node.neighbors().length; i++) {
                if ((navPolygon.node.neighbors()[i] as NavPoly).id === (nextNavPolygon.node as NavPoly).id) {
                    portal = (navPolygon.node as NavPoly).portals[i];
                }
            }

            // Push the portal vertices into the channel
            channel.push(portal!.v1, portal!.v2);
        }
        channel.push(endVector);

        // Pull a string along the channel to run the funnel
        channel.stringPull();

        // Clone path, excluding duplicates
        let lastPoint = null;
        const phaserPath = [];
        for (const p of channel.path) {
            const newPoint = p.clone();
            if (!lastPoint || !newPoint.equalsTo(lastPoint)) phaserPath.push(newPoint);
            lastPoint = newPoint;
        }

        return phaserPath;
    }

    static areCollinear(edge1: Segment, edge2: Segment) {
        return edge1.isPointOnLine(edge2.v1) && edge1.isPointOnLine(edge2.v2);
    }

    _calculateNeighbors() {
        // Fill out the neighbor information for each navpoly
        for (let i = 0; i < this._navPolygons.length; i++) {
            const navPoly = this._navPolygons[i];

            for (let j = i + 1; j < this._navPolygons.length; j++) {
                const otherNavPoly = this._navPolygons[j];

                // Check if the other navpoly is within range to touch
                const d = navPoly.centroidDistance(otherNavPoly);
                if (d > navPoly.boundingRadius + otherNavPoly.boundingRadius) continue;

                // The are in range, so check each edge pairing
                for (const edge of navPoly.edges) {
                    for (const otherEdge of otherNavPoly.edges) {
                        // If edges aren't collinear, not an option for connecting navpolys
                        if (!NavMesh.areCollinear(edge, otherEdge)) continue;

                        // If they are collinear, check if they overlap
                        const overlap = this._getSegmentOverlap(edge, otherEdge);
                        if (!overlap) continue;

                        // Connections are symmetric!
                        navPoly.neighbors().push(otherNavPoly);
                        otherNavPoly.neighbors().push(navPoly);

                        // Calculate the portal between the two polygons - this needs to be in
                        // counter-clockwise order, relative to each polygon
                        const [p1, p2] = overlap;
                        let edgeStartAngle = navPoly.centroid.angle(edge.v1);
                        let a1 = navPoly.centroid.angle(overlap[0]);
                        let a2 = navPoly.centroid.angle(overlap[1]);
                        let d1 = angleDiff(edgeStartAngle, a1);
                        let d2 = angleDiff(edgeStartAngle, a2);
                        if (d1 < d2) {
                            navPoly.portals.push(new Segment(p1, p2));
                        } else {
                            navPoly.portals.push(new Segment(p2, p1));
                        }

                        edgeStartAngle = otherNavPoly.centroid.angle(otherEdge.v1);
                        a1 = otherNavPoly.centroid.angle(overlap[0]);
                        a2 = otherNavPoly.centroid.angle(overlap[1]);
                        d1 = angleDiff(edgeStartAngle, a1);
                        d2 = angleDiff(edgeStartAngle, a2);
                        if (d1 < d2) {
                            otherNavPoly.portals.push(new Segment(p1, p2));
                        } else {
                            otherNavPoly.portals.push(new Segment(p2, p1));
                        }

                        // Two convex polygons shouldn't be connected more than once! (Unless
                        // there are unnecessary vertices...)
                    }
                }
            }
        }
    }

    // Check two collinear line segments to see if they overlap by sorting the points.
    // Algorithm source: http://stackoverflow.com/a/17152247
    _getSegmentOverlap(line1: Segment, line2: Segment) {
        const points = [
            { line: line1, point: line1.v1 },
            { line: line1, point: line1.v2 },
            { line: line2, point: line2.v1 },
            { line: line2, point: line2.v2 }
        ];
        points.sort(function(a, b) {
            if (a.point.x < b.point.x) return -1;
            else if (a.point.x > b.point.x) return 1;
            else {
                if (a.point.y < b.point.y) return -1;
                else if (a.point.y > b.point.y) return 1;
                else return 0;
            }
        });
        // If the first two points in the array come from the same line, no overlap
        const noOverlap = points[0].line === points[1].line;
        // If the two middle points in the array are the same coordinates, then there is a
        // single point of overlap.
        const singlePointOverlap = points[1].point.equalsTo(points[2].point);
        if (noOverlap || singlePointOverlap) return null;
        else return [points[1].point, points[2].point];
    }

    /**
     * Project a point onto a polygon in the shortest distance possible.
     *
     * @param {Phaser.Point} point The point to project
     * @param {NavPoly} navPoly The navigation polygon to test against
     * @returns {{point: Phaser.Point, distance: number}}
     *
     * @private
     * @memberof NavMesh
     */
    _projectPointToPolygon(point: Vector, navPoly: NavPoly) {
        let closestProjection = null;
        let closestDistance = Number.MAX_VALUE;
        for (const edge of navPoly.edges) {
            const projectedPoint = this._projectPointToEdge(point, edge);
            const d = point.dist(projectedPoint);
            if (closestProjection === null || d < closestDistance) {
                closestDistance = d;
                closestProjection = projectedPoint;
            }
        }
        return { point: closestProjection, distance: closestDistance };
    }

    // Project a point onto a line segment
    // JS Source: http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment
    _projectPointToEdge(point: Vector, line: Segment) {
        const a = line.v1;
        const b = line.v2;
        // Consider the parametric equation for the edge's line, p = a + t (b - a). We want to find
        // where our point lies on the line by solving for t:
        //  t = [(p-a) . (b-a)] / |b-a|^2
        const l2 = a.dist2(b);
        let t = ((point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)) / l2;
        // We clamp t from [0,1] to handle points outside the segment vw.
        t = clamp(t, 0, 1);
        // Project onto the segment
        const p = new Vector(a.x + t * (b.x - a.x), a.y + t * (b.y - a.y));
        return p;
    }
}
