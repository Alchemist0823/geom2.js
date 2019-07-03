import {Vector} from "./vector";
import {Shape} from "./shape";
import {AABB} from "./aabb";
import {lineHasPoint} from "./util";
import {Line} from "./line";


export enum VORONOI_REGION {
    LEFT = 0,
    UP = 1,
    DOWN = 2,
    RIGHT = 3,
}

export class Segment implements Line {
    public v1: Vector;
    public v2: Vector;
    constructor(v1: Vector, v2: Vector) {
        this.v1 = v1;
        this.v2 = v2;
    }

    getAABB(): AABB {
        return new AABB(Math.min(this.v1.x, this.v2.x), Math.min(this.v1.y, this.v2.y), Math.max(this.v1.x, this.v2.x), Math.max(this.v1.y, this.v2.y));
    }

    contains(v: Vector): boolean {
        return lineHasPoint(this.v1, this.v2, v, 1);
    }

    dot(dir: Vector): number {
        return (this.v2.x - this.v1.x) * dir.x + (this.v2.y - this.v1.y) * dir.y;
    }


    /**
    * Calculates which Voronoi region a point is on a line segment.
    * It is assumed that both the line and the point are relative to `(0,0)`
    *
    *            |       (1)      |
    *     (0)  [S]--------------[E]  (3)
    *            |       (2)      |
    * @param {Vector} point The point.
    * @return  {VORONOI_REGION} VORONOI_REGION.LEFT (0) if it is the left region,
    *          VORONOI_REGION.UP (1) if it is the up region,
    *          VORONOI_REGION.DOWN (2) if it is the down region.
    *          VORONOI_REGION.RIGHT (3) if it is the right region.
    */
    voronoiRegion(point: Vector): VORONOI_REGION {
        let len2 = this.len2();
        let dp = point.dotRef(this.v2, this.v1);
        // If the point is beyond the start of the line, it is in the
        // left voronoi region.
        if (dp < 0) { return VORONOI_REGION.LEFT; }
        // If the point is beyond the end of the line, it is in the
        // right voronoi region.
        else if (dp > len2) { return VORONOI_REGION.RIGHT; }
        // Otherwise, it's in the middle one.
        else {
            if (point.crossRef(this.v2, this.v1) < 0)
                return VORONOI_REGION.UP;
            else
                return VORONOI_REGION.DOWN;
        }
    }

    len2(): number {
        return this.v2.dist2(this.v1);
    }

    lerp(t: number) {
        return Vector.lerp(this.v1, this.v2, t);
    }
}
