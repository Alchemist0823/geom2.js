import {PhysMaterial, PhysProperty} from "./material";
import {CollisionResult} from "./collision-result";
import {Vector} from "../vector";
import {Comparator} from "../comparator";


export function applyImpulse(A: PhysMaterial & PhysProperty, impulse: Vector, contactVector: Vector) {
    A.velocity.addMul(impulse, A.invMass);
    A.angularVelocity += A.invInertia * contactVector.cross(impulse);
}

export function resolveContact(A: PhysMaterial & PhysProperty, B: PhysMaterial & PhysProperty, result: CollisionResult) {
    const rv = new Vector();
    const impulse = new Vector();

    const e = Math.min(A.restitution, B.restitution);
    // Calculate static and dynamic friction
    const sf = Math.sqrt( A.staticFriction * B.staticFriction );
    const df = Math.sqrt( A.dynamicFriction * B.dynamicFriction );

    for (let contact of result.contacts) {
        // Calculate radii from COM to contact
        let ra = contact.clone().sub(A.position);
        let rb = contact.clone().sub(B.position);

        // Relative velocity
        rv.set(B.velocity).addMul(rb, B.angularVelocity)
            .sub(A.velocity).subMul(ra, A.angularVelocity);

        // Relative velocity along the normal
        const contactVel = rv.dot(result.normal);

        // Do not resolve if velocities are separating
        if(contactVel > 0)
            return;

        let raCrossN = ra.cross(result.normal);
        let rbCrossN = rb.cross(result.normal);
        let invMassSum = A.invMass + B.invMass + Math.sqrt( raCrossN ) * A.invInertia + Math.sqrt( rbCrossN ) * B.invInertia;

        // Calculate impulse scalar
        let j = -(1.0 + e) * contactVel;
        j /= invMassSum;
        j /= result.contacts.length;

        // Apply impulse
        impulse.set(result.normal).scl(j);
        applyImpulse(B,  impulse, rb );
        applyImpulse(A, impulse.reverse(), ra );

        // Friction impulse
        rv.set(B.velocity).addMul(rb, B.angularVelocity)
            .sub(A.velocity).subMul(ra, A.angularVelocity);

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

        // Apply friction impulse
        applyImpulse(B,  impulse, rb );
        applyImpulse(A, impulse.reverse(), ra );
    }
}

// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331
export function positionalCorrection(A: PhysMaterial & PhysProperty, B: PhysMaterial & PhysProperty, penetration: number, normal: Vector)  {
    const percent = 0.2; // usually 20% to 80%
    const slop = 0.01; // usually 0.01 to 0.1
    const correction = normal.clone();
    correction.scl(Math.max( penetration - slop, 0.0 ) / (A.invMass + B.invMass) * percent);
    A.position.subMul(correction, A.invMass);
    B.position.addMul(correction, B.invMass);
}
