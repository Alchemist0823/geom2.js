import {Vector} from "./vector";
import {AABB} from "./aabb";
import {angleDiffPI2, angleNormalizePI2, Geom2Const} from "./util";
import {Line} from "./line";
import {Comparator} from "./comparator";

export class Arc implements Line {
    public c: Vector;
    public r: number;
    public startAngle: number;
    public endAngle: number;

    public constructor(center: Vector, r: number, startAngle: number = 0, endAngle: number = Geom2Const.PI2) {
        this.c = center.clone();
        this.r = r;
        this.startAngle = angleNormalizePI2(startAngle);
        this.endAngle = angleNormalizePI2(endAngle);
    }

    get sweep() {
        return angleDiffPI2(this.endAngle, this.startAngle);
    }

    /**
     * Get start point of arc
     * @returns {Point}
     */
    get start() {
        let p0 = new Vector(this.c.x + this.r, this.c.y);
        return p0.rotate(this.startAngle, this.c);
    }

    /**
     * Get end point of arc
     * @returns {Point}
     */
    get end() {
        let p0 = new Vector(this.c.x + this.r, this.c.y);
        return p0.rotate(this.endAngle, this.c);
    }

    get vertices() {
        return [this.start, this.end];
    }

    /**
     * Get arc length
     * @returns {number}
     */
    get length() {
        return Math.abs(this.sweep * this.r);
    }

    clone() {
        return new Arc(this.c.clone(), this.r, this.startAngle, this.endAngle);
    }

    /**
     * Returns true if arc contains point, false otherwise
     * @param {Point} pt - point to test
     * @returns {boolean}
     */
    contains(pt: Vector): boolean {
        // first check if  point on circle (pc,r)
        if (!Comparator.EQ(this.c.dist(pt), this.r))
            return false;
        let angle = pt.angle(this.c);
        return Comparator.LE(this.startAngle, angle) && Comparator.LE(angle, this.endAngle);
    }

    /**
     * Get bounding box of the arc
     * @returns {AABB}
     */
    getAABB(): AABB {
        let func_arcs = this.breakToFunctional();
        let box = func_arcs.reduce((acc, arc) => acc.includes(arc.start), new AABB(this.start.x, this.start.y));
        box = box.includes(this.end);
        return box;
    }

    /**
     * Breaks arc in extreme point 0, pi/2, pi, 3*pi/2 and returns array of sub-arcs
     * @returns {Arcs[]}
     */
    protected breakToFunctional(): Array<Arc> {
        let func_arcs_array: Array<Arc> = [];
        let angles = [0, Math.PI / 2, 2 * Math.PI / 2, 3 * Math.PI / 2];
        let pts = [
            this.c.clone().translate(this.r, 0),
            this.c.clone().translate(0, this.r),
            this.c.clone().translate(-this.r, 0),
            this.c.clone().translate(0, -this.r)
        ];

        // If arc contains extreme point,
        // create test arc started at start point and ended at this extreme point
        let test_arcs: Array<Arc> = [];
        for (let i = 0; i < 4; i++) {
            if (this.contains(pts[i])) {
                test_arcs.push(new Arc(this.c, this.r, this.startAngle, angles[i]));
            }
        }

        if (test_arcs.length == 0) {                  // arc does contain any extreme point
            func_arcs_array.push(this.clone());
        } else {                                        // arc passes extreme point
            // sort these arcs by length
            test_arcs.sort((arc1, arc2) => arc1.length - arc2.length);

            for (let i = 0; i < test_arcs.length; i++) {
                let prev_arc: Arc | undefined = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
                let new_arc;
                if (prev_arc) {
                    new_arc = new Arc(this.c, this.r, prev_arc.endAngle, test_arcs[i].endAngle);
                } else {
                    new_arc = new Arc(this.c, this.r, this.startAngle, test_arcs[i].endAngle);
                }
                if (!Comparator.EQ_0(new_arc.length)) {
                    func_arcs_array.push(new_arc.clone());
                }
            }

            // add last sub arc
            let prev_arc = func_arcs_array.length > 0 ? func_arcs_array[func_arcs_array.length - 1] : undefined;
            let new_arc;
            if (prev_arc) {
                new_arc = new Arc(this.c, this.r, prev_arc.endAngle, this.endAngle);
            } else {
                new_arc = new Arc(this.c, this.r, this.startAngle, this.endAngle);
            }
            // It could be 2*PI when occasionally start = 0 and end = 2*PI but this is not valid for breakToFunctional
            if (!Comparator.EQ_0(new_arc.length) && !Comparator.EQ(new_arc.sweep, 2*Math.PI)) {
                func_arcs_array.push(new_arc.clone());
            }
        }
        return func_arcs_array;
    }
}
