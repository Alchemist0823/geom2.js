import Polygon from "./polygon";
import Vector from "./vector";
import Box from "./box";
import TestResult from "./test-result";


// ## Object Pools

// A pool of `Vector` objects that are used in calculations to avoid
// allocating memory.
let T_VECTORS: Array<Vector> = [];
for (let i = 0; i < 10; i++) { T_VECTORS.push(new Vector()); }

// A pool of arrays of numbers used in calculations to avoid allocating
// memory.
let T_ARRAYS: Array<Array<number>> = [];
for (let i = 0; i < 5; i++) { T_ARRAYS.push([]); }

// Temporary response used for polygon hit detection.
let T_TESTRESULT = new TestResult();

/**
 * Flattens the specified array of points onto a unit vector axis,
 * resulting in a one dimensional range of the minimum and
 * maximum value on that axis.
 * @param points The points to flatten.
 * @param normal The unit vector axis to flatten on.
 * @param result An array.  After calling this function,
 *   result[0] will be the minimum value,
 *   result[1] will be the maximum value.
 */
function flattenPointsOn(points: Array<Vector>, normal: Vector, result: Array<number>) {
    let min = Number.MAX_VALUE;
    let max = -Number.MAX_VALUE;
    let len = points.length;
    for (let i = 0; i < len; i++ ) {
        // The magnitude of the projection of the point onto the normal
        let dot = points[i].dot(normal);
        if (dot < min) { min = dot; }
        if (dot > max) { max = dot; }
    }
    result[0] = min; result[1] = max;
}

/**
 * Check whether two convex polygons are separated by the specified
 * axis (must be a unit vector).
 * @param aPoints The points in the first polygon.
 * @param bPoints The points in the second polygon.
 * @param axis The axis (unit sized) to test against.  The points of both polygons
 *   will be projected onto this axis.
 * @param testResult A Response object (optional) which will be populated
 *   if the axis is not a separating axis.
 * @return true if it is a separating axis, false otherwise.  If false,
 *   and a response is passed in, information about how much overlap and
 *   the direction of the overlap will be populated.
 */
export function isSeparatingAxis(aPoints: Array<Vector>, bPoints: Array<Vector>, axis: Vector, testResult: TestResult) {
    let rangeA = T_ARRAYS.pop();
    let rangeB = T_ARRAYS.pop();
    if (rangeA === undefined || rangeB === undefined)
        throw new Error('memory allocation error');

    // Project the polygons onto the axis.
    flattenPointsOn(aPoints, axis, rangeA);
    flattenPointsOn(bPoints, axis, rangeB);
    // Check if there is a gap. If there is, this is a separating axis and we can stop
    if (rangeA[0] > rangeB[1] || rangeB[0] > rangeA[1]) {
        T_ARRAYS.push(rangeA);
        T_ARRAYS.push(rangeB);
        return true;
    }
    // This is not a separating axis. If we're calculating a response, calculate the overlap.
    if (testResult) {
        let overlap = 0;
        // A starts further left than B
        if (rangeA[0] < rangeB[0]) {
            testResult.aInB = false;
            // A ends before B does. We have to pull A out of B
            if (rangeA[1] < rangeB[1]) {
                overlap = rangeA[1] - rangeB[0];
                testResult.bInA = false;
                // B is fully inside A.  Pick the shortest way out.
            } else {
                let option1 = rangeA[1] - rangeB[0];
                let option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
            }
            // B starts further left than A
        } else {
            testResult.bInA = false;
            // B ends before A ends. We have to push A out of B
            if (rangeA[1] > rangeB[1]) {
                overlap = rangeA[0] - rangeB[1];
                testResult.aInB = false;
                // A is fully inside B.  Pick the shortest way out.
            } else {
                let option1 = rangeA[1] - rangeB[0];
                let option2 = rangeB[1] - rangeA[0];
                overlap = option1 < option2 ? option1 : -option2;
            }
        }
        // If this is the smallest amount of overlap we've seen so far, set it as the minimum overlap.
        let absOverlap = Math.abs(overlap);
        if (absOverlap < testResult.overlap) {
            testResult.overlap = absOverlap;
            testResult.overlapN.set(axis);
            if (overlap < 0) {
                testResult.overlapN.reverse();
            }
        }
    }
    T_ARRAYS.push(rangeA);
    T_ARRAYS.push(rangeB);
    return false;
}

export function testPolygonPolygon(a: Polygon, b: Polygon, testResult: TestResult) {
    let aPoints = a.points;
    let aLen = aPoints.length;
    let bPoints = b.points;
    let bLen = bPoints.length;
    // If any of the edge normals of A is a separating axis, no intersection.
    for (let i = 0; i < aLen; i++) {
        let normal = T_VECTORS.pop();
        if (normal === undefined)
            throw new Error('memory allocation error');

        normal.set(aPoints[(i + 1) % aLen]).sub(aPoints[i]).perp().normalize();
        if (isSeparatingAxis(aPoints, bPoints, normal, testResult)) {
            return false;
        }
        T_VECTORS.push(normal);
    }
    // If any of the edge normals of B is a separating axis, no intersection.
    for (let i = 0;i < bLen; i++) {
        let normal = T_VECTORS.pop();
        if (normal === undefined)
            throw new Error('memory allocation error');

        normal.set(bPoints[(i + 1) % bLen]).sub(bPoints[i]).perp().normalize();
        if (isSeparatingAxis(aPoints, bPoints, normal, testResult)) {
            return false;
        }
        T_VECTORS.push(normal);
    }
    // Since none of the edge normals of A or B are a separating axis, there is an intersection
    // and we've already calculated the smallest overlap (in isSeparatingAxis).  Calculate the
    // final overlap vector.
    if (testResult) {
        testResult.overlapV.set(testResult.overlapN).scl(testResult.overlap);
    }
    return true;
}

export function lineHasPoint(v1:Vector, v2:Vector, p:Vector, tolerance:number = 0.1) {
    return Math.abs(v1.dist2(v2) - (v1.dist2(p) + v2.dist2(p))) <= tolerance;
}