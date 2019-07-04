import {PhysMaterial, PhysProperty} from "./material";
import {CollisionResult} from "../collision/collision-result";
import {Vector} from "../vector";
import {Comparator} from "../comparator";


export function applyImpulse(material: PhysMaterial, state: PhysProperty, impulse: Vector, contactVector: Vector) {
    state.velocity.addMul(impulse, material.invMass);
    state.angularVelocity += material.invInertia * contactVector.cross(impulse);
}

export function resolveContact(aMat: PhysMaterial, aState: PhysProperty, bMat: PhysMaterial, bState: PhysProperty, result: CollisionResult) {
    const rv = new Vector();
    const impulse = new Vector();

    const e = Math.min(aMat.restitution, bMat.restitution);
    // Calculate static and dynamic friction
    const sf = Math.sqrt( aMat.staticFriction * bMat.staticFriction );
    const df = Math.sqrt( aMat.dynamicFriction * bMat.dynamicFriction );

    for (let contact of result.contacts) {
        // Calculate radii from COM to contact
        let ra = contact.clone().sub(aState.position);
        let rb = contact.clone().sub(bState.position);

        // Relative velocity
        rv.set(bState.velocity).addMul(rb, bState.angularVelocity)
            .sub(aState.velocity).subMul(ra, aState.angularVelocity);

        // Relative velocity along the normal
        const contactVel = rv.dot(result.normal);

        // Do not resolve if velocities are separating
        if(contactVel > 0)
            return;

        let raCrossN = ra.cross(result.normal);
        let rbCrossN = rb.cross(result.normal);
        let invMassSum = aMat.invMass + bMat.invMass + raCrossN * raCrossN * aMat.invInertia + rbCrossN * rbCrossN * bMat.invInertia;

        // Calculate impulse scalar
        let j = -(1.0 + e) * contactVel;
        j /= invMassSum;
        j /= result.contacts.length;

        // apply impulse
        impulse.set(result.normal).scl(j);
        applyImpulse(bMat, bState, impulse, rb );
        applyImpulse(aMat, aState, impulse.reverse(), ra );

        // Friction impulse
        rv.set(bState.velocity).addMul(rb, bState.angularVelocity)
            .sub(aState.velocity).subMul(ra, aState.angularVelocity);

        const t = rv.clone().subMul(result.normal, rv.dot(result.normal));
        t.normalize();

        // j tangent magnitude
        let jt = -rv.dot(t);
        jt /= invMassSum;
        jt /= result.contacts.length;

        // Don't apply tiny friction impulses
        if(Comparator.EQ( jt, 0.0 ))
            return;

        // Coulumb's law tangent impulse
        if(Math.abs( jt ) < j * sf)
            impulse.set(t).scl(jt);
        else
            impulse.set(t).scl(-j * df);

        // aMatpply friction impulse
        applyImpulse(bMat, bState, impulse, rb );
        applyImpulse(aMat, aState, impulse.reverse(), ra );
    }
}

// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331
export function positionalCorrection(aMat: PhysMaterial & PhysProperty, bMat: PhysMaterial & PhysProperty, result: CollisionResult)  {
    const percent = 0.2; // usually 20% to 80%
    const slop = 0.01; // usually 0.01 to 0.1
    const correction = result.normal.clone();
    correction.scl(Math.max( result.depth - slop, 0.0 ) / (aMat.invMass + bMat.invMass) * percent);
    aMat.position.subMul(correction, aMat.invMass);
    bMat.position.addMul(correction, bMat.invMass);
}
