import {Vector} from "../vector";

export interface PhysMaterial {
    dynamicFriction: number;
    staticFriction: number;
    restitution: number;
    invMass: number;
    invInertia: number;
}

export interface PhysProperty {
    position: Vector;
    velocity: Vector;
    angularVelocity: number;
}