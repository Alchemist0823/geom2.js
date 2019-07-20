import {Vector} from '../vector';
import { Shape } from '../shape';
import {CollisionResult} from "./collision-result";

const MAX_POC_COUNT = 5;

export function resolvePointsOfContact(A: Shape, B: Shape, result: CollisionResult): void {
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
    //console.log(segmentInc);
    //console.log(segmentRef);
    //console.log(d1);
    //console.log(d2);
    //console.log(u1);
    //console.log(u2);

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

    //console.log(v1);
    //console.log(v2);

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
