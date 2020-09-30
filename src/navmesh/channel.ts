// Mostly sourced from PatrolJS at the moment. TODO: come back and reimplement this as an incomplete
// funnel algorithm so astar checks can be more accurate.

import {Vector} from "../vector";
import {Segment} from "../segment";
import {crossProduct3, triarea2} from "../util";

/**
 * @private
 */
export class Channel {
    private portals: Array<Segment>;
    path: Vector[];
    constructor() {
        this.portals = [];
        this.path = [];
    }

    push(p1: Vector, p2: Vector | null = null) {
        if (p2 === null) p2 = p1;
        this.portals.push(new Segment( p1, p2 ));
        if (!p2) {
            console.log(p1, p2);
            console.error(new Error());
        }
    }

    stringPull() {
        let portals = this.portals;
        let pts = [];
        // Init scan state
        let portalApex, portalLeft, portalRight;
        let apexIndex = 0,
            leftIndex = 0,
            rightIndex = 0;

        portalApex = portals[0].v1;
        portalLeft = portals[0].v1;
        portalRight = portals[0].v2;

        // Add start point.
        pts.push(portalApex);

        for (let i = 1; i < portals.length; i++) {
            // Find the next portal vertices
            let left = portals[i].v1;
            let right = portals[i].v2;

            // Update right vertex.
            if (triarea2(portalApex, portalRight, right) <= 0.0) {
                if (portalApex.equalsTo(portalRight) || triarea2(portalApex, portalLeft, right) > 0.0) {
                    // Tighten the funnel.
                    portalRight = right;
                    rightIndex = i;
                } else {
                    // Right vertex just crossed over the left vertex, so the left vertex should
                    // now be part of the path.
                    pts.push(portalLeft);

                    // Restart scan from portal left point.

                    // Make current left the new apex.
                    portalApex = portalLeft;
                    apexIndex = leftIndex;
                    // Reset portal
                    portalLeft = portalApex;
                    portalRight = portalApex;
                    leftIndex = apexIndex;
                    rightIndex = apexIndex;
                    // Restart scan
                    i = apexIndex;
                    continue;
                }
            }

            // Update left vertex.
            if (triarea2(portalApex, portalLeft, left) >= 0.0) {
                if (portalApex.equalsTo(portalLeft) || triarea2(portalApex, portalRight, left) < 0.0) {
                    // Tighten the funnel.
                    portalLeft = left;
                    leftIndex = i;
                } else {
                    // Left vertex just crossed over the right vertex, so the right vertex should
                    // now be part of the path
                    pts.push(portalRight);

                    // Restart scan from portal right point.

                    // Make current right the new apex.
                    portalApex = portalRight;
                    apexIndex = rightIndex;
                    // Reset portal
                    portalLeft = portalApex;
                    portalRight = portalApex;
                    leftIndex = apexIndex;
                    rightIndex = apexIndex;
                    // Restart scan
                    i = apexIndex;
                    continue;
                }
            }
        }

        if (pts.length === 0 || !pts[pts.length - 1].equalsTo(portals[portals.length - 1].v1)) {
            // Append last point to path.
            pts.push(portals[portals.length - 1].v1);
        }

        this.path = pts;
        return pts;
    }
}
