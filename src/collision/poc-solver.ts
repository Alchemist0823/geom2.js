import {Vector} from '../vector';
import { ConvexShape } from '../convex-shape';
import {CollisionResult} from "./collision-result";

const MAX_POC_COUNT = 5;

export function resolvePointsOfContact(A: ConvexShape, B: ConvexShape, result: CollisionResult): void {
    const normal = result.normal;
    const depth = result.depth;

    let segmentA, segmentB;
    segmentA = A.getFarthestEdgeInDirection(normal);
    segmentB = B.getFarthestEdgeInDirection(normal.clone().reverse());

    let segmentRef, segmentInc;
    if (Math.abs(segmentA.dot(normal)) <= Math.abs(segmentB.dot(normal))) {
        segmentRef = segmentA;
        segmentInc = segmentB;
    } else {
        segmentInc = segmentA;
        segmentRef = segmentB;
    }

    let refv = segmentRef.v2.clone().sub(segmentRef.v1);
    refv.normalize();

    let o1 = refv.dot(segmentRef.v1);
    // clip the incident edge by the first
    // vertex of the reference edge
    let cp = clip(segmentInc.v1, segmentInc.v2, refv, o1);
    // if we dont have 2 points left then fail

    if (cp.length < 2) {
        console.log("error: impossible poc situation");
        return;
    }

    // clip whats left of the incident edge by the
    // second vertex of the reference edge
    // but we need to clip in the opposite direction
    // so we flip the direction and offset
    let o2 = refv.dot(segmentRef.v2);
    cp = clip(cp[0], cp[1], refv.clone().scl(-1), -o2);
    // if we dont have 2 points left then fail
    if (cp.length < 2) {
        console.log("error: impossible poc situation");
        return;
    }
    for (let i = 0; i < 2; i ++) {
        let vcp = cp[i].crossRef(segmentRef.v2, segmentRef.v1);
        if (vcp < 0.01)
            result.contacts.push(cp[i]);
    }
    if (result.contacts.length < 1) {
        console.log(A);
        console.log(B);
        console.log(result);
        console.log(cp[0]);
        console.log(cp[1]);
        console.log(segmentRef.v2);
        console.log(segmentRef.v1);
        console.log(cp[0].crossRef(segmentRef.v2, segmentRef.v1));
        console.log(cp[1].crossRef(segmentRef.v2, segmentRef.v1));
        console.log("error: impossible poc situation");
    }
}

export function clip(v1: Vector, v2: Vector, n: Vector, o: number) {
    let cp = new Array<Vector>();
    let d1 = n.dot(v1) - o;
    let d2 = n.dot(v2) - o;
    // if either point is past o along n
    // then we can keep the point
    if (d1 >= 0.0) cp.push(v1);
    if (d2 >= 0.0) cp.push(v2);
    // finally we need to check if they
    // are on opposing sides so that we can
    // compute the correct point
    if (d1 * d2 < 0.0) {
        // if they are on different sides of the
        // offset, d1 and d2 will be a (+) * (-)
        // and will yield a (-) and therefore be
        // less than zero
        // get the vector for the edge we are clipping
        let e = v2.clone().sub(v1);
        // compute the location along e
        let u = d1 / (d1 - d2);
        e.scl(u);
        e.add(v1);
        // add the point
        cp.push(e);
    }
    return cp;
}

export function resolvePointsOfContact2(A: ConvexShape, B: ConvexShape, result: CollisionResult): void {
    const normal = result.normal;
    const depth = result.depth;

    let segmentA, segmentB;
    segmentA = A.getFarthestEdgeInDirection(normal);
    segmentB = B.getFarthestEdgeInDirection(normal.clone().reverse());

    let segmentRef, segmentInc;
    if (Math.abs(segmentA.dot(normal)) <= Math.abs(segmentB.dot(normal))) {
        segmentRef = segmentA;
        segmentInc = segmentB;
    } else {
        segmentInc = segmentA;
        segmentRef = segmentB;
    }

    let d1 = segmentInc.v1.dotRef(segmentRef.v2, segmentRef.v1);
    let d2 = segmentInc.v2.dotRef(segmentRef.v2, segmentRef.v1);

    if (d1 > d2) {
        let swap = d1;
        d1 = d2;
        d2 = swap;
        let swapP = segmentInc.v1;
        segmentInc.v1 = segmentInc.v2;
        segmentInc.v2 = swapP;
    }

    let u1 = - d1 / (d2 - d1);
    let u2 = (segmentRef.len2() - d1) / (d2 - d1);

    let v1, v2;
    if (u1 > 0 && u1 < 1) {
        v1 = segmentInc.lerp(u1);
    } else {
        v1 = segmentInc.v1.clone();
    }
    if (u2 > 0 && u2 < 1) {
        v2 = segmentInc.lerp(u2);
    } else {
        v2 = segmentInc.v2.clone();
    }

    console.log(v1);
    console.log(v2);

    let v1c = v1.crossRef(segmentRef.v2, segmentRef.v1);
    let v2c = v2.crossRef(segmentRef.v2, segmentRef.v1);
    let startV, endV;
    if (v1c <= 0.01) {
        if (v2c <= 0.01) {
            startV = v1;
            endV = v2;
        } else {
            startV = v1;
            endV = v1;
        }
    } else {
        if (v2c <= 0.01) {
            startV = v2;
            endV = v2;
        } else {
            // TODO: replace with logger
            console.log(A);
            console.log(B);
            console.log(result);
            console.log("error: impossible poc situation");
            return;
        }
    }

    //console.log(startV);
    //console.log(endV);
    if (startV === endV) {
        result.contacts.push(startV);
    } else {
        for (let i = 0; i < 1 - 0.001; i += 1 / (MAX_POC_COUNT - 1)) {
            result.contacts.push(Vector.lerp(startV, endV, i));
        }
        result.contacts.push(endV);
    }
}
