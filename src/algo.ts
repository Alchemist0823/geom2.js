import {Vector} from "./vector";
import {Polygon} from "./polygon";

/**
 * Randomly shuffle an array
 * https://stackoverflow.com/a/2450976/1293256
 * @param  {Array} array The array to shuffle
 * @return {String}      The first item in the shuffled array
 */
export function shuffle(array: Array<any>) {
    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

/**
 * Randomly generate convex polygon
 * https://cglab.ca/~sander/misc/ConvexGeneration/convex.html
 * @param  {Array} n the vertex num of polygon
 * @param  {Number} maxSize the maxSize of polygon
 * @return {Polygon} the random convex polygon
 */
export function generateRandomConvexPolygon(n: number, maxSize: number): Polygon {
    if (maxSize === undefined) {
        maxSize = 1;
    }

    let xPool = [];
    let yPool = [];

    for (let i = 0; i < n; i++) {
        xPool.push(Math.random());
        yPool.push(Math.random());
    }

    xPool.sort();
    yPool.sort();

    // Isolate the extreme points
    let minX = xPool[0];
    let maxX = xPool[n - 1];
    let minY = yPool[0];
    let maxY = yPool[n - 1];

    // Divide the interior points into two chains & Extract the vector components
    let xVec = [];
    let yVec = [];

    let lastTop = minX, lastBot = minX;

    for (let i = 1; i < n - 1; i++) {
        let x = xPool[i];

        if (Math.random() < 0.5) {
            xVec.push(x - lastTop);
            lastTop = x;
        } else {
            xVec.push(lastBot - x);
            lastBot = x;
        }
    }

    xVec.push(maxX - lastTop);
    xVec.push(lastBot - maxX);

    let lastLeft = minY, lastRight = minY;

    for (let i = 1; i < n - 1; i++) {
        let y = yPool[i];

        if (Math.random() < 0.5) {
            yVec.push(y - lastLeft);
            lastLeft = y;
        } else {
            yVec.push(lastRight - y);
            lastRight = y;
        }
    }

    yVec.push(maxY - lastLeft);
    yVec.push(lastRight - maxY);

    // Randomly pair up the X- and Y-components
    shuffle(yVec);

    // Combine the paired up components into vectors
    let vec = [];

    for (let i = 0; i < n; i++) {
        vec.push(new Vector(xVec[i], yVec[i]));
    }

    // Sort the vectors by angle
    vec.sort((v1, v2) => Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x));

    // Lay them end-to-end
    let x = 0, y = 0;
    let minPolygonX = 0;
    let minPolygonY = 0;
    let points = [];

    for (let i = 0; i < n; i++) {
        points.push(new Vector(x, y));
        x += vec[i].x;
        y += vec[i].y;

        minPolygonX = Math.min(minPolygonX, x);
        minPolygonY = Math.min(minPolygonY, y);
    }

    // Move the polygon to the original min and max coordinates
    let xShift = minX - minPolygonX;
    let yShift = minY - minPolygonY;

    points.forEach(p => {
        p.x += xShift - 0.5;
        p.y += yShift - 0.5;

        p.x *= maxSize;
        p.y *= maxSize;
    });

    let polygon = new Polygon(new Vector(), points);
    let aabb = polygon.getAABB();
    polygon.translate(-aabb.centerX, -aabb.centerY);

    return polygon;
}

/**
 * Determine whether a simple polygon is a convex polygon
 * @param points points buffer
 * @param base start index of the polygon on points
 * @param n end index of the polygon on points
 * @param tolerance tolerance
 */
export function isConvex(points: Array<Vector>, base: number = 0, n: number = points.length - base, tolerance: number = 0.0001) {
    if (n < 4)
        return true;
    let sign = undefined;
    if (points[base].x === points[n - 1].x && points[base].y === points[n - 1].y) // if its a closed polygon, ignore last vertex
        n--;
    for (let i = 0; i < n; i++) {
        let i1 = base + (i + 1) % n;
        let i2 = base + (i + 2) % n;
        let dx1 = points[i1].x - points[i].y;
        let dy1 = points[i1].y - points[i].y;
        let dx2 = points[i2].x - points[i1].x;
        let dy2 = points[i2].y - points[i1].y;
        let crossproduct = dx1 * dy2 - dy1 * dx2;
        if (Math.abs(crossproduct) > tolerance) {
            if (sign === undefined)
                sign = crossproduct > 0;
            else if (sign != (crossproduct > 0)) {
                console.log(i);
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
export function makeHullPresorted(points: Array<Vector>): Array<Vector> {
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


export function POINT_COMPARATOR(a: Vector, b: Vector): number {
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
