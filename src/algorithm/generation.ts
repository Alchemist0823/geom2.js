import {Polygon} from "../polygon";
import {shuffle} from "../util";
import {Vector} from "../vector";

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