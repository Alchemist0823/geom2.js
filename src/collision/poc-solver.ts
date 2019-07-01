import {Vector} from '../vector';
import { Shape } from '../shape';


export function resolvePointsOfContact(A: Shape, B: Shape, normal: Vector, depth: number): Array<Vector> {
    A.getFarthestPointInDirection(normal);
    B.getFarthestPointInDirection(normal.clone().reverse());

    return [];
}

//(A - B)
