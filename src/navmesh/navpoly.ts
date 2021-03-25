/**
 * A class that represents a navigable polygon with a navmesh. It is built on top of a
 * {@link Polygon}. It implements the properties and fields that javascript-astar needs - weight,
 * toString, isWall and getCost. See GPS test from astar repo for structure:
 * https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavPoly
 */
import {Polygon} from "../polygon";
import {Vector} from "../vector";
import {AStarNode, GraphNode} from "./navgraph";
import {Segment} from "../segment";

export class NavPoly implements GraphNode {
    id: number;
    private polygon: Polygon;
    boundingRadius: number;
    centroid: Vector;
    private connected: Array<NavPoly>;
    portals: Segment[];
    weight: number;
    astar!: AStarNode;
    edges: Segment[];

    /**
     * Creates an instance of NavPoly.
     * @param {number} id
     * @param {Polygon} polygon
     *
     * @memberof NavPoly
     */
    constructor(id: number, polygon: Polygon) {
        this.id = id;
        this.polygon = polygon;
        this.connected = [];
        this.portals = [];
        this.boundingRadius = this.calculateRadius();
        this.weight = 1; // jsastar property

        this.centroid = polygon.getCentroid();
        this.edges = [];
        for (let i = 0; i < polygon.calcPoints.length; i ++) {
            this.edges.push(new Segment(polygon.calcPoints[i], polygon.calcPoints[(i + 1) % polygon.calcPoints.length]));
        }

    }

    /**
     * Returns an array of points that form the polygon.
     *
     * @returns {Vector[]}
     * @memberof NavPoly
     */
    getPoints() {
        return this.polygon.calcPoints;
    }

    /**
     * Check if the given point-like object is within the polygon
     *
     * @param {object} point Object of the form {x, y}
     * @returns {boolean}
     * @memberof NavPoly
     */
    contains(point: Vector) {
        // Phaser's polygon check doesn't handle when a point is on one of the edges of the line. Note:
        // check numerical stability here. It would also be good to optimize this for different shapes.
        return this.polygon.isPointIn(point);
    }


    /**
     * Calculate the radius of a circle that circumscribes the polygon.
     *
     * @returns {number}
     * @memberof NavPoly
     */
    calculateRadius() {
        let boundingRadius = 0;
        let centroid = this.polygon.getCentroid();
        for (const point of this.polygon.calcPoints) {
            const d = centroid.dist(point);
            if (d > boundingRadius) boundingRadius = d;
        }
        return boundingRadius;
    }

    /**
     * Check if the given point-like object is on one of the edges of the polygon.
     *
     * @param {object} Point-like object in the form { x, y }
     * @returns {boolean}
     * @memberof NavPoly
     */
    isPointOnEdge(p: Vector) {
        return this.polygon.isPointOn(p);
    }

    destroy() {
        this.connected = [];
        this.portals = [];
    }

    // jsastar methods
    toString() {
        let centroid = this.polygon.getCentroid();
        return `NavPoly(id: ${this.id} at: ${centroid})`;
    }
    isWall() {
        return this.weight === 0;
    }

    centroidDistance(navPolygon: NavPoly) {
        return this.centroid.dist(navPolygon.centroid);
    }

    getCost(navPolygon: GraphNode) {
        return this.centroidDistance(navPolygon as unknown as NavPoly);
    }

    neighbors(): Array<GraphNode> {
        return this.connected as unknown as Array<GraphNode>;
    }
}
