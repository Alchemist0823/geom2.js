import {Vector} from "../vector";
import * as util from "../util";

/**
 * Determine whether a simple polygon is a convex polygon
 * @param points points buffer
 * @param base start index of the polygon on points
 * @param n end index of the polygon on points
 * @param tolerance tolerance
 */
export function isConvex(points: Array<Vector>, base: number = 0, n: number = points.length - base, tolerance: number = 0.00001) {
    if (n < 4)
        return true;
    let sign = undefined;
    if (points[base].x === points[n - 1].x && points[base].y === points[n - 1].y) // if its a closed polygon, ignore last vertex
        n--;
    for (let i = 0; i < n; i++) {
        let i1 = base + (i + 1) % n;
        let i2 = base + (i + 2) % n;
        let crossproduct = util.crossProduct3(points[i], points[i1], points[i2]);
        if (Math.abs(crossproduct) > tolerance) {
            if (sign === undefined)
                sign = crossproduct > 0;
            else if (sign != (crossproduct > 0)) {
                return false;
            }
        }
    }
    return true;
}

// Returns a new array of points representing the convex hull of
// the given set of points. The convex hull excludes collinear points.
// This algorithm runs in O(n log n) time.
export function makeHull(points: Array<Vector>): Array<Vector> {
    let newPoints = points.slice();
    newPoints.sort(POINT_COMPARATOR);
    return makeHullPresorted(newPoints);
}


// Returns the convex hull, assuming that each points[i] <= points[i + 1]. Runs in O(n) time.
function makeHullPresorted(points: Array<Vector>): Array<Vector> {
    if (points.length <= 1)
        return points.slice();

    // Andrew's monotone chain algorithm. Positive y coordinates correspond to "up"
    // as per the mathematical convention, instead of "down" as per the computer
    // graphics convention. This doesn't affect the correctness of the result.

    let upperHull: Array<Vector> = [];
    for (let i = 0; i < points.length; i++) {
        const p: Vector = points[i];
        while (upperHull.length >= 2) {
            const q: Vector = upperHull[upperHull.length - 1];
            const r: Vector = upperHull[upperHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                upperHull.pop();
            else
                break;
        }
        upperHull.push(p);
    }
    upperHull.pop();

    let lowerHull: Array<Vector> = [];
    for (let i = points.length - 1; i >= 0; i--) {
        const p: Vector = points[i];
        while (lowerHull.length >= 2) {
            const q: Vector = lowerHull[lowerHull.length - 1];
            const r: Vector = lowerHull[lowerHull.length - 2];
            if ((q.x - r.x) * (p.y - r.y) >= (q.y - r.y) * (p.x - r.x))
                lowerHull.pop();
            else
                break;
        }
        lowerHull.push(p);
    }
    lowerHull.pop();

    if (upperHull.length == 1 && lowerHull.length == 1 && upperHull[0].x == lowerHull[0].x && upperHull[0].y == lowerHull[0].y)
        return upperHull;
    else
        return upperHull.concat(lowerHull);
}

function POINT_COMPARATOR(a: Vector, b: Vector): number {
    if (a.x < b.x)
        return -1;
    else if (a.x > b.x)
        return +1;
    else if (a.y < b.y)
        return -1;
    else if (a.y > b.y)
        return +1;
    else
        return 0;
}