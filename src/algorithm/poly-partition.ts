import {Polygon} from "../polygon";
import {Vector} from "../vector";
import {intersectingVertex, lineLineIntersection} from "../util";
import {Transform} from "../transform";
import {LQTree} from "../container";
import {AABB} from "../aabb";

export enum Orientation {
    CCW = 1,
    CW = -1,
    UNORDERED = 0,
}

export enum UnionStatus {
    // Already unioned.
    isDead = 1,
    // Being unioned.
    isActive = -1,
    // Intact.
    isAlive = 0,
}

/**
 * Polygon used in poly partition.
 * 1. It is a polygon.
 * 2. Can be either a normal polygon or a hole in outer polygon.
 * 3. Points are sorted in counter-clockwise order from it's center when it's a normal polygon, or clockwise if it's a hole.
 */
export class PartitionPolygon extends Polygon {
    public isHole: boolean;

    constructor(pos: Vector, points: Array<Vector>, isHole: boolean = false) {
        super(pos, points);
        this.isHole = isHole;
        this.setOrientation(isHole ? Orientation.CW : Orientation.CCW);
    }

    getOrientation(): Orientation {
        const self = this;
        let area = 0;
        self.calcPoints.forEach((v, i) => {
            const nexti = (i === self.calcPoints.length - 1) ? 0 : i + 1;
            area += self.calcPoints[i].x * self.calcPoints[nexti].y - self.calcPoints[i].y * self.calcPoints[nexti].x;
        });
        if (area > 0) return Orientation.CCW;
        if (area < 0) return Orientation.CW;
        return Orientation.UNORDERED;
    }

    setOrientation(orientation: Orientation.CCW | Orientation.CW) {
        const polyOrientation = this.getOrientation();
        if (polyOrientation && (polyOrientation != orientation)) {
            this.invert();
        }
    }

    invert() {
        this.points.reverse();
        this.recalc();
    }

    isValid() {
        return this.calcPoints.length >= 3;
    }
}

export class UnionPolygon extends Polygon {
    // used in partition union algorithm.
    public unionStatus: UnionStatus ;
    // top left vertex
    public startingVertex: PolyVertex|null = null;
    public vertices: Array<PolyVertex>;

    constructor(pos: Vector, points: Array<Vector>) {
        super(pos, points);
        let minx: number, miny: number;
        this.vertices = [];
        this.calcPoints.forEach((p, i) => {
            let newV = new PolyVertex(p.x, p.y);
            newV.parent = this;
            newV.indexInPolygon = i;
            this.vertices.push(newV);
            if (this.startingVertex === null || newV.x < minx || newV.x === minx && newV.y < miny) {
                this.startingVertex =  newV;
                minx = newV.x;
                miny = newV.y;
            }
        })
        this.vertices.forEach((v,i) => {
            v.next = this.vertices[(i+1)%this.vertices.length];
            v.normal = v.next.clone().sub(v).normalize();
            v.segmentLength = v.next.dist(v);
        });
        this.unionStatus = UnionStatus.isAlive;
    }
}

// Vertex in PartitionPolygon for Polygon Union. Since we don't consider holes, order is fixed as counter clockwise.
// So it also represents the segment starting from this Vertex.
export class PolyVertex extends Vector{
    // The length of segment this vertex formed with next vertex.
    public segmentLength: number = 0.0;
    // Segments this segment intersects with.
    public intersectingVertex: Array<PolyVertex> = [];
    public intersections: Array<Vector> = [];
    public parent: UnionPolygon | null = null;
    public next: PolyVertex | null = null;
    public normal: Vector | null = null;
    public indexInPolygon: number = 0;

    constructor (x: number = 0, y: number= 0) {
        super(x, y);
    }
}

export function preprocessIntersection(polys: Array<UnionPolygon>) {
    /*let tree = new LQTree(8000, 8000);
    for (let p1 = 0; p1 < polys.length; p1++) {
        tree.insert(polys[p1].getAABB(), p1);
    }*/
    for (let p1 = 0; p1 < polys.length; p1++) {
        for (let p2 = 0; p2 < polys.length; p2++) {
            if (p1===p2) continue;
            polys[p1].vertices.forEach(p1v => {
                polys[p2].vertices.forEach(p2v => {
                    let intersection = intersectingVertex(p1v, p1v.next!, p2v, p2v.next!);
                    if (intersection !== null) {
                        p1v.intersectingVertex.push(p2v);
                        //p2v.intersectingVertex.push(p1v);
                        p1v.intersections.push(intersection);
                        //p2v.intersections.push(intersectingVertex(p2v, p2v.next!, p1v, p1v.next!)!);
                    }
                })
            })
            if (polys[p1].startingVertex !== null && polys[p2].startingVertex !== null && polys[p2].isPointIn(polys[p1].startingVertex!)) {
                polys[p1].startingVertex = null;
            }
        }
    }
}

export function unionPolygons(polys: Array<UnionPolygon>): Array<Array<Vector>> {
    preprocessIntersection(polys);
    console.log("preprocess ok");
    let polysLeft = polys.length;
    let res = [];
    while(polysLeft > 0) {
        let start: PolyVertex|null = null;
        for (let i = polysLeft - 1; i >= 0; i--) {
            if(polys[i].unionStatus !== UnionStatus.isAlive) {
                polys[i].unionStatus = UnionStatus.isDead;
                polys.splice(i, 1);
                polysLeft--;
                continue;
            }
            if (polys[i].startingVertex === null) continue;
            let polyStart = polys[i].startingVertex!;
            if (start === null ||
                polyStart.x < start!.x ||
                polyStart.x === start!.x && polyStart.y < start!.y ||
                polyStart.x === start!.x && polyStart.y === start!.y && polyStart.segmentLength > start!.segmentLength) {
                start = polyStart;
            }
        }
        if(start === null) return res;
        // Start
        let curr:Vector = start, onSeg = start, points = [new Vector(curr.x, curr.y)];
        while(!curr.equalsTo(start) || points.length===1) {
            let next:Vector = onSeg.next!, nextSeg = onSeg.next!;
            for (let i = 0; i<onSeg.intersections.length; i++) {
                // Cases we should filter out
                const iSeg = onSeg.intersectingVertex[i];
                const iInt = onSeg.intersections[i];
                if(
                    iSeg.parent!.unionStatus === UnionStatus.isDead ||
                    // Intersection before curr
                    iInt.dist(onSeg) < curr.dist(onSeg) ||
                    // Go inward and not end.
                    !iInt.equalsTo(onSeg.next!) && onSeg.normal!.angleTo(iSeg.normal!) > 0 ||
                    // End on intersection
                    iInt.equalsTo(iSeg.next!) ||
                    // Same direction but shorter
                    iSeg.normal!.equalsTo(onSeg.normal!) && iSeg.next!.dist(onSeg) <= onSeg.segmentLength ||
                    // Reverse direction
                    iSeg.normal!.equalsTo(onSeg.normal!.clone().reverse())
                )  {
                    // console.log("from seg ", onSeg.toString(), " norm ", onSeg.normal!.toString(),
                    //     " skipped seg ", iSeg.toString(), " norm ", iSeg.normal!.toString(), " on ", iInt);
                    continue;
                }
                if (
                    iInt.dist(curr) < next.dist(curr) ||
                    iInt.dist(curr) === next.dist(curr) && onSeg.normal!.angleTo(iSeg.normal!) < onSeg.normal!.angleTo(nextSeg.normal!) ||
                    iInt.dist(curr) === next.dist(curr) && onSeg.normal!.angleTo(iSeg.normal!) === onSeg.normal!.angleTo(nextSeg.normal!) && iSeg.segmentLength > nextSeg.segmentLength
                ) {
                    next = iInt;
                    nextSeg = iSeg;
                }
            }
            if (!nextSeg.normal!.equalsTo(onSeg.normal!) && !next.equalsTo(start)) {
                points.push(new Vector(next.x, next.y));
                // console.log("from seg ", onSeg.toString(), " norm ", onSeg.normal!.toString(),
                //     " to seg ", nextSeg.toString(), " norm ", nextSeg.normal!.toString(), " adding ", points[points.length-1]);
            }
            curr = next;
            onSeg = nextSeg;
            // console.log("length ", points.length, " point: ", points[points.length-1]);
            //console.log("curr ", curr.toString(), " onSeg: ", onSeg.toString());
            onSeg.parent!.unionStatus = UnionStatus.isActive;
        }
        res.push(points);
    }
    return res;
}

export class PartitionVertex {
    public isActive: boolean;
    public isConvex: boolean;
    public isEar: boolean;
    public p: Vector;
    public angle: number;
    public prev: PartitionVertex | null;
    public next: PartitionVertex | null;

    constructor() {
        this.isActive = false;
        this.isConvex = false;
        this.isEar = false;
        this.p = new Vector();
        this.angle = 0.0;
        this.prev = null;
        this.next = null;
    }
}


export function inCone(p1: Vector, p2: Vector, p3: Vector, p: Vector): boolean {

    let convex = isConvex(p1, p2, p3);
    if (convex) {
        if (!isConvex(p1, p2, p)) return false;
        if (!isConvex(p2, p3, p)) return false;
        return true;
    } else {
        if (isConvex(p1, p2, p)) return true;
        if (isConvex(p2, p3, p)) return true;
        return false;
    }
}

//checks if two lines intersect.
export function intersects(p11: Vector, p12: Vector, p21: Vector, p22: Vector): boolean {
    if ((p11.x == p21.x) && (p11.y == p21.y)) return false;
    if ((p11.x == p22.x) && (p11.y == p22.y)) return false;
    if ((p12.x == p21.x) && (p12.y == p21.y)) return false;
    if ((p12.x == p22.x) && (p12.y == p22.y)) return false;

    let v1ort = new Vector();
    let v2ort = new Vector();
    let v = new Vector();

    v1ort.x = p12.y - p11.y;
    v1ort.y = p11.x - p12.x;

    v2ort.x = p22.y - p21.y;
    v2ort.y = p21.x - p22.x;

    v = p21.clone().sub(p11);
    let dot21 = v.x * v1ort.x + v.y * v1ort.y;
    v = p22.clone().sub(p11);
    let dot22 = v.x * v1ort.x + v.y * v1ort.y;

    v = p11.clone().sub(p21);
    let dot11 = v.x * v2ort.x + v.y * v2ort.y;
    v = p12.clone().sub(p21);
    let dot12 = v.x * v2ort.x + v.y * v2ort.y;

    if (dot11 * dot12 > 0) return false;
    if (dot21 * dot22 > 0) return false;

    return true;
}
/*
export function fastRemoveHoles(holes: Array<PartitionPolygon>) {
    let connectedHoles = [];
    let aabbs = [];
    //O(n)
    for (let i = 0; i < holes.length; i ++) {
        aabbs.push(holes[i].getAABB());
    }

    for (let i = 0; i < holes.length; i ++) {
        connectedHoles.push(i);

        let possibleShortest
        for (let j = 0; j < holes.length; j ++) {
            if (connectedHoles[j] === connectedHoles[i])
                continue;
            holes[i].calcPoints[0].dist(holes[j].calcPoints[0]);
        }
    }
}*/

/**
 * Remove holes from a list of PartitionPolygon.
 * Creates a diagonal from the rightmost hole vertex to some visible vertex.
 * Time complexity: O(h*(n^2)), h is the number of holes, n is the number of vertices.
 * space complexity: O(n)
 * @param {Array} inpolys a list of polygons that can contain holes
 *  vertices of all non-hole polys have to be in counter-clockwise order
 *  vertices of all hole polys have to be in clockwise order
 * @return {boolean} if removing is successful.
 */
export function removeHoles(polys: Array<PartitionPolygon>): boolean {
    let hasHoles = false;
    for (const poly of polys) {
        if (poly.isHole) {
            hasHoles = true;
            break;
        }
    }
    if (!hasHoles) {
        return true;
    }

    let holeIndex = 0;
    let holePointIndex = 0;

    let holePoint: Vector;
    let polyPoint: Vector;
    let bestPolyPoint = new Vector();
    let pointVisible = false;
    let polyIndex = 0;
    let polyPointIndex = 0;

    while (1) {
        //find the hole point with the largest x
        hasHoles = false;

        for (let polyIndex = 0; polyIndex < polys.length; polyIndex++) {
            const poly = polys[polyIndex];
            if (!poly.isHole) continue;
            if (!hasHoles) {
                hasHoles = true;
                holeIndex = polyIndex;
                holePointIndex = 0;
            }

            poly.calcPoints.forEach((point, index) => {
                if (point.x > polys[holeIndex].calcPoints[holePointIndex].x) {
                    holeIndex = polyIndex;
                    holePointIndex = index;
                }
            });
        }

        if (!hasHoles) break;
        holePoint = polys[holeIndex].calcPoints[holePointIndex];

        let pointFound = false;
        for (let index = 0; index < polys.length; index++) {
            const poly = polys[index];
            if (poly.isHole) continue;
            // If candidate point in cone of previous, this, next.
            for (let pointIndex = 0; pointIndex < poly.calcPoints.length; pointIndex++) {
                const point = poly.calcPoints[pointIndex];
                if (point.x <= holePoint.x) continue;
                if (!inCone(poly.calcPoints[(pointIndex + poly.calcPoints.length - 1) % poly.calcPoints.length],
                    point,
                    poly.calcPoints[(pointIndex + 1) % poly.calcPoints.length],
                    holePoint)) continue;
                polyPoint = point;
                if (pointFound) {
                    let v1 = polyPoint.clone().sub(holePoint).normalize();
                    let v2 = bestPolyPoint.clone().sub(holePoint).normalize();
                    if (v2.x > v1.x) continue;
                }
                pointVisible = true;
                for (let poly2 of polys) {
                    if (poly2.isHole) continue;
                    for (let pointIndex2 = 0; pointIndex2 < poly2.calcPoints.length; pointIndex2++) {
                        let lineP1 = poly2.calcPoints[pointIndex2];
                        let lineP2 = poly2.calcPoints[(pointIndex2 + 1) % poly2.calcPoints.length];
                        if (intersects(holePoint, polyPoint, lineP1, lineP2)) {
                            pointVisible = false;
                            break;
                        }
                    }
                    if (!pointVisible) break;
                }
                if (pointVisible) {
                    pointFound = true;
                    bestPolyPoint = polyPoint;
                    polyIndex = index;
                    polyPointIndex = pointIndex;
                }
            }
        }

        if (!pointFound) return false;

        // Number of points = points of hole + points of poly + 2
        let points = [];
        // console.log(polyIndex, polyPointIndex);
        // console.log(holeIndex, holePointIndex);
        for (let i = 0; i <= polyPointIndex; i++) {
            points.push(polys[polyIndex].calcPoints[i]);
        }
        for (let i = 0; i <= polys[holeIndex].calcPoints.length; i++) {
            points.push(polys[holeIndex].calcPoints[(i + holePointIndex) % polys[holeIndex].calcPoints.length]);
        }
        for (let i = polyPointIndex; i < polys[polyIndex].calcPoints.length; i++) {
            points.push(polys[polyIndex].calcPoints[i]);
        }
        polys.splice(Math.max(polyIndex, holeIndex), 1);
        polys.splice(Math.min(polyIndex, holeIndex), 1);

        polys.push(new PartitionPolygon(new Vector(), points));
        //console.log("pushed ", polys.push(new PartitionPolygon(new Vector(), points)), " length of ", polys[polys.length-1].calcPoints.length);
    }
    return true;
}


function isReflex(p1: Vector, p2: Vector, p3: Vector) {
    let tmp = (p3.y-p1.y)*(p2.x-p1.x)-(p3.x-p1.x)*(p2.y-p1.y);
    if(tmp<0) return 1;
    else return 0;
}

function isInside(p1: Vector, p2: Vector, p3: Vector, p: Vector) {
    if (isConvex(p1, p, p2)) return false;
    if (isConvex(p2, p, p3)) return false;
    if (isConvex(p3, p, p1)) return false;
    return true;
}

function updateVertex(vertices: Array<PartitionVertex>, v: PartitionVertex) {

    let v1 = v.prev!, v3 = v.next!;

    v.isConvex = isConvex(v1.p, v.p, v3.p);

    let vec1 = v1.p.clone().sub(v.p).normalize();
    let vec3 = v3.p.clone().sub(v.p).normalize();
    v.angle = vec1.x * vec3.x + vec1.y * vec3.y;

    if (v.isConvex) {
        v.isEar = true;
        for (let i = 0; i < vertices.length; i++) {
            if ((vertices[i].p.x === v.p.x) && (vertices[i].p.y === v.p.y)) continue;
            if ((vertices[i].p.x === v1.p.x) && (vertices[i].p.y === v1.p.y)) continue;
            if ((vertices[i].p.x === v3.p.x) && (vertices[i].p.y === v3.p.y)) continue;
            if (isInside(v1.p, v.p, v3.p, vertices[i].p)) {
                v.isEar = false;
                break;
            }
        }
    } else {
        v.isEar = false;
    }
}

/**
 * Triangulates a polygon by ear clipping
 * Time complexity: O(n^2), n is the number of vertices
 * space complexity: O(n)
 * @param {PartitionPolygon} poly an input polygon to be triangulated
 *  vertices have to be in counter-clockwise order
 * @return {Array} an array of triangles or empty array when failed
 */
export function triangulateEC(poly: PartitionPolygon): Array<PartitionPolygon> {
    if (!poly.isValid()) return [];
    let triangles = [];
    if (poly.calcPoints.length === 3) {
        return [new PartitionPolygon(new Vector(), poly.calcPoints)]
    }

    //let vertices = Array(poly.calcPoints.length).fill(new PartitionVertex());
    let vertices = [];
    for (let i = 0; i < poly.calcPoints.length; i++) vertices.push(new PartitionVertex());
    for (let i = 0; i < poly.calcPoints.length; i++) {
        vertices[i].isActive = true;
        vertices[i].p = poly.calcPoints[i];
        vertices[i].next = vertices[(i + 1)%poly.calcPoints.length];
        vertices[i].prev = vertices[(i-1+poly.calcPoints.length) % poly.calcPoints.length];
    }
    for (let i = 0; i < poly.calcPoints.length; i++) updateVertex(vertices, vertices[i]);

    let earIndex = 0;
    for (let i = 0; i < poly.calcPoints.length - 3; i++) {
        let earFound = false;
        //find the most extruded ear
        for (let j = 0; j < poly.calcPoints.length; j++) {
            if (!vertices[j].isActive) continue;
            if (!vertices[j].isEar) continue;
            if (!earFound) {
                earFound = true;
                earIndex = j;
            } else {
                if (vertices[j].angle > vertices[earIndex].angle) {
                    earIndex = j;
                }
            }
        }
        if (!earFound) {
            return [];
        }


        triangles.push(new PartitionPolygon(new Vector(),
            [vertices[earIndex].prev!.p, vertices[earIndex].p, vertices[earIndex].next!.p]));

        vertices[earIndex].isActive = false;
        vertices[earIndex].prev!.next = vertices[earIndex].next;
        vertices[earIndex].next!.prev = vertices[earIndex].prev;

        if (i == poly.calcPoints.length - 4) break;

        updateVertex(vertices, vertices[earIndex].prev!);
        updateVertex(vertices, vertices[earIndex].next!);
    }
    for (let i = 0; i < poly.calcPoints.length; i++) {
        if (vertices[i].isActive) {
            triangles.push(new PartitionPolygon(new Vector(), [vertices[i].prev!.p, vertices[i].p, vertices[i].next!.p]));
            break;
        }
    }
    return triangles;
}

function isConvex(p1: Vector, p2: Vector, p3: Vector): boolean {
    return p2.crossRef(p3, p1) > 0;
}
/**
 * Partitions a polygon into convex polygons by using Hertel-Mehlhorn algorithm
 * The algorithm gives at most four times the number of parts as the optimal algorithm.
 * However, in practice it works much better than that and often gives optimal partition.
 * Uses triangulation obtained by ear clipping as intermediate result
 * Time complexity O(n^2), n is the number of vertices
 * space complexity: O(n)
 * @param {PartitionPolygon} poly an input polygon to be partitioned
 *  vertices have to be in counter-clockwise order
 * @return {Array} an array convex polygons or empty array when failed
 */
export function convexPartitionHM(poly: PartitionPolygon): Array<PartitionPolygon> {
    if (!poly.isValid()) return [];
    let parts = [];

    //check if the poly is already convex
    let numreflex = 0, i11 = 0, i12 = 0, i21 = 0, i22 = 0, i13 = 0, i23 = 0, i = 0, j = 0, k = 0, l = 0;
    for (i11 = 0; i11 < poly.calcPoints.length; i11++) {
        if (i11 == 0) i12 = poly.calcPoints.length - 1;
        else i12 = i11 - 1;
        if (i11 === (poly.calcPoints.length - 1)) i13 = 0;
        else i13 = i11 + 1;
        if (isReflex(poly.calcPoints[i12], poly.calcPoints[i11], poly.calcPoints[i13])) {
            numreflex = 1;
            break;
        }
    }

    if(numreflex == 0) {
        parts.push(new PartitionPolygon(new Vector(), poly.calcPoints));
        return parts;
    }

    let triangles = triangulateEC(poly);
    if(triangles.length === 0) return triangles;
    for(i = 0; i<triangles.length; i++) {
        let poly1 = triangles[i];

        for(i11=0;i11<poly1.calcPoints.length;i11++) {
            let d1 = poly1.calcPoints[i11];
            i12 = (i11+1)%poly1.calcPoints.length;
            let d2 = poly1.calcPoints[i12];

            let isDiagonal = false;
            let poly2 = triangles[i];
            for(j = i; j < triangles.length; j++) {
                if(i == j) continue;
                poly2 = triangles[j];

                for(i21=0;i21<poly2.calcPoints.length;i21++) {
                    if((d2.x !== poly2.calcPoints[i21].x)||(d2.y !== poly2.calcPoints[i21].y)) continue;
                    i22 = (i21+1)%(poly2.calcPoints.length);
                    if((d1.x !== poly2.calcPoints[i22].x)||(d1.y !== poly2.calcPoints[i22].y)) continue;
                    isDiagonal = true;
                    break;
                }
                if(isDiagonal) break;
            }

            if(!isDiagonal) continue;

            let p2 = poly1.calcPoints[i11];
            if(i11 == 0) i13 = poly1.calcPoints.length-1;
            else i13 = i11-1;
            let p1 = poly1.calcPoints[i13];
            if(i22 == (poly2.calcPoints.length-1)) i23 = 0;
            else i23 = i22+1;
            let p3 = poly2.calcPoints[i23];

            if(!isConvex(p1,p2,p3)) continue;

            p2 = poly1.calcPoints[i12];
            if(i12 == (poly1.calcPoints.length-1)) i13 = 0;
            else i13 = i12+1;
            p3 = poly1.calcPoints[i13];
            if(i21 == 0) i23 = poly2.calcPoints.length-1;
            else i23 = i21-1;
            p1 = poly2.calcPoints[i23];

            if(!isConvex(p1,p2,p3)) continue;

            let newPolyPoints = [];
            k = 0;
            for(l=i12; l!=i11; l=(l+1)%(poly1.calcPoints.length)) {
                newPolyPoints[k] = poly1.calcPoints[l];
                k++;
            }
            for(l=i22;l!=i21;l=(l+1)%(poly2.calcPoints.length)) {
                newPolyPoints[k] = poly2.calcPoints[l];
                k++;
            }

            triangles.splice(j, 1);
            triangles[i] = new PartitionPolygon(new Vector(), newPolyPoints);
            poly1 = triangles[i];
            i11 = -1;
            continue;
        }
    }

    for(let part of triangles) {
        parts.push(part);
    }
    return parts;
}

/**
 * Partitions a polygon into convex polygons by using Hertel-Mehlhorn algorithm
 * The algorithm gives at most four times the number of parts as the optimal algorithm.
 * However, in practice it works much better than that and often gives optimal partition.
 * Uses triangulation obtained by ear clipping as intermediate result
 * Time complexity O(n^2), n is the number of vertices
 * space complexity: O(n)
 * @param {PartitionPolygon} inpolys a list of polygons to be partitioned
 *  vertices of all non-hole polys have to be in counter-clockwise order
 *  vertices of all hole polys have to be in clockwise order
 * @return {Array} an array convex polygons or empty array when failed
 */
export function convexPartitionHMList(inpolys: Array<PartitionPolygon>): Array<PartitionPolygon> {
    let outPolys = [];

    console.log("start remove holes");
    if(!removeHoles(inpolys)) return [];
    console.log("start partition " + " concaves");
    let i = 0;
    for(let poly of inpolys) {
        const polyResult = convexPartitionHM(poly);
        if (polyResult.length === 0) return [];
        outPolys.push(...polyResult);
        console.log("finished " + i);
        i ++
    }
    return outPolys;
}


/**
 * Triangulates a list of polygons that may contain holes by ear clipping algorithm
 * first calls RemoveHoles to get rid of the holes, and then Triangulate_EC for each resulting polygon
 * Time complexity: O(h*(n^2)), h is the number of holes, n is the number of vertices
 * Space complexity: O(n)
 * @param {PartitionPolygon} inpolys a list of polygons to be partitioned
 *  vertices of all non-hole polys have to be in counter-clockwise order
 *  vertices of all hole polys have to be in clockwise order
 * @return {Array} an array triangles or empty array when failed
 */
export function triangulateECList(inpolys: Array<PartitionPolygon>): Array<PartitionPolygon> {
    let outPolys = [];

    if(!removeHoles(inpolys)) return [];
    for(let poly of inpolys) {
        const polyResult = triangulateEC(poly);
        if (polyResult.length === 0) return [];
        outPolys.push(...polyResult);
    }
    return outPolys;
}

/**
 * Offset Polygon by offsetting edges without rounding. Assuming old_points is counter-clockwise. Shrink by 'offset' if otherwise.
 * @param {Array} old_points a list of points
 * @param {number} offset distance to edges
 * @return {Array} an array of points of resulting Polygon.
 */
export function getEnlargedPolygon(old_points: Array<Vector>, offset: number) : Array<Vector>{

    let enlarged_points = [];
    const num_points = old_points.length;
    for (let j = 0; j < num_points; j++) {
        // Find the new location for point j.
        // Find the points before and after j.
        let i = (j - 1);
        if (i < 0) i += num_points;
        let k = (j + 1) % num_points;

        // Move the points by the offset.
        let v1 = new Vector(
        old_points[j].x - old_points[i].x,
        old_points[j].y - old_points[i].y);
        v1.normalize();
        v1.scl(-offset);
        let n1 = new Vector(-v1.y, v1.x);

        let pij1 = new Vector(
        old_points[i].x + n1.x,
        old_points[i].y + n1.y);
        let pij2 = new Vector(
        old_points[j].x + n1.x,
        old_points[j].y + n1.y);

        let v2 = new Vector(
        old_points[k].x - old_points[j].x,
        old_points[k].y - old_points[j].y);
        v2.normalize();
        v2.scl(-offset);
        let n2 = new Vector(-v2.y, v2.x);

        let pjk1 = new Vector(
        old_points[j].x + n2.x,
        old_points[j].y + n2.y);
        let pjk2 = new Vector(
        old_points[k].x + n2.x,
        old_points[k].y + n2.y);

        let mid = old_points[i].clone().sub(old_points[j]).normalize().add(old_points[k].clone().sub(old_points[j]).normalize()).normalize();
        let rev_mid = mid.clone().scl(-offset).add(old_points[j]);
        let p = mid.clone().perp().add(rev_mid);

        enlarged_points.push(lineLineIntersection(pij1, pij2, rev_mid, p));
        enlarged_points.push(lineLineIntersection(rev_mid, p, pjk1, pjk2));
    }

    return enlarged_points;
}

// export function getEnlargedPolygon2(old_points: Array<Vector>, offset: number) : Array<Vector>{
//
//     let enlarged_points = [];
//     const num_points = old_points.length;
//     for (let j = 0; j < num_points; j++) {
//         // Find the new location for point j.
//         // Find the points before and after j.
//         let i = (j - 1);
//         if (i < 0) i += num_points;
//         let k = (j + 1) % num_points;
//
//         // Move the points by the offset.
//         let v1 = new Vector(
//             old_points[j].x - old_points[i].x,
//             old_points[j].y - old_points[i].y);
//         v1.normalize();
//         v1.scl(-offset);
//         let n1 = new Vector(-v1.y, v1.x);
//
//         let pij1 = new Vector(
//             old_points[i].x + n1.x,
//             old_points[i].y + n1.y);
//         let pij2 = new Vector(
//             old_points[j].x + n1.x,
//             old_points[j].y + n1.y);
//
//         let v2 = new Vector(
//             old_points[k].x - old_points[j].x,
//             old_points[k].y - old_points[j].y);
//         v2.normalize();
//         v2.scl(-offset);
//         let n2 = new Vector(-v2.y, v2.x);
//
//         let pjk1 = new Vector(
//             old_points[j].x + n2.x,
//             old_points[j].y + n2.y);
//         let pjk2 = new Vector(
//             old_points[k].x + n2.x,
//             old_points[k].y + n2.y);
//
//         enlarged_points.push(lineIntersection(pij1, pij2, pjk1, pjk2));
//     }
//
//     return enlarged_points;
// }


