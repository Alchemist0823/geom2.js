import {Vector} from '../vector';
import { Shape } from '../shape';
import { Polygon } from '../polygon';
import { Segment } from '../segment';

export function resolvePointsOfContact(A: Shape, B: Shape, normal: Vector, depth: number): Array<Vector> {
    let segmentA, segmentB;
    if (A instanceof Polygon) {
        segmentA = A.getFarthestEdgeInDirection(normal);
    } else {
        let p = A.getFarthestPointInDirection(normal);
        segmentA = new Segment(p, p.clone());
    }
    if (B instanceof Polygon) {
        segmentB = B.getFarthestEdgeInDirection(normal.clone().reverse());
    } else {
        let p = B.getFarthestPointInDirection(normal);
        segmentB = new Segment(p, p.clone());
    }
    let segmentRef, segmentInc;
    if (Math.abs(segmentA.dot(normal)) <= Math.abs(segmentB.dot(normal))) {
        segmentRef = segmentA;
        segmentInc = segmentB;
    } else {
        segmentInc = segmentA;
        segmentRef = segmentB;
    }

    let d1 = segmentInc.v1.dotRef(segmentRef.v1, segmentRef.v2);
    let d2 = segmentInc.v2.dotRef(segmentRef.v1, segmentRef.v2);

    if (d1 > d2) {
        let swap = d1;
        d1 = d2;
        d2 = swap;
        let swapP = segmentInc.v1
        segmentInc.v1 = segmentInc.v2;
        segmentInc.v2 = swapP;
    }

    let u1 = - d1 / (d2 - d1);
    let u2 = segmentRef.len2() - d1 / (d2 - d1);

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

    let v1c = v1.crossRef(segmentRef.v1, segmentRef.v2);
    let v2c = v2.crossRef(segmentRef.v1, segmentRef.v2);
    let startV, endV;
    if (v1c >= 0) {
        if (v2c >= 0) {
            startV = v1;
            endV = v2;
        } else {
            startV = v1;
            endV = v1;
        }
    } else {
        if (v2c >= 0) {
            startV = v2;
            endV = v2;
        } else {
            console.log("error: impossible situation");
            return [];
        }
    }

    if (startV === endV) {
        return [startV];
    } else {
        let res = [];
        for (let i = 0; i <= 1; i += 1/5) {
            res.push(Vector.lerp(startV, endV, i));
        }
        return res;
    }
}
