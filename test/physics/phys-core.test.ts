import {CollisionResult, PhysMaterial, PhysProperty, resolveContact, Vector} from "../../src";

const delta = 0.0001;

describe('phys-core', () => {
    describe('resolveContact', () => {
        test('no Inertia - .5 restitution', ()=> {
            const aMat: PhysMaterial = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 1,
                restitution: .5,
            };
            const aState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(2, 0)
            };

            const bMat = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 1,
                restitution: .5,
            };
            const bState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(-2, 0),
            };

            const result = new CollisionResult();
            result.normal = new Vector(1, 0);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(-1, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.velocity.x).toBeCloseTo(1, delta);
            expect(bState.velocity.y).toBeCloseTo(0, delta);
        });

        test('no Inertia - reverse normal', ()=> {
            const aMat: PhysMaterial = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 1,
                restitution: 1,
            };
            const aState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(2, 0)
            };

            const bMat = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 1,
                restitution: 1,
            };
            const bState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(-2, 0),
            };

            const result = new CollisionResult();
            result.normal = new Vector(-1, 0);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(2, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.velocity.x).toBeCloseTo(-2, delta);
            expect(bState.velocity.y).toBeCloseTo(0, delta);
        });


        test('with Inertia - no angle', ()=> {
            const aMat: PhysMaterial = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 1,
                invMass: 1,
                restitution: .5,
            };
            const aState: PhysProperty = {
                position: new Vector(-1, 0),
                angularVelocity: 0,
                velocity: new Vector(2, 0)
            };

            const bMat = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 1,
                invMass: 1,
                restitution: .5,
            };
            const bState: PhysProperty = {
                position: new Vector(1 , 0),
                angularVelocity: 0,
                velocity: new Vector(-2, 0),
            };

            const result = new CollisionResult();
            result.normal = new Vector(1, 0);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(-1, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.velocity.x).toBeCloseTo(1, delta);
            expect(bState.velocity.y).toBeCloseTo(0, delta);
        });


        test('with Inertia - 90 angle', ()=> {
            const aMat: PhysMaterial = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 1,
                invMass: 1,
                restitution: 1,
            };
            const aState: PhysProperty = {
                position: new Vector(-1, 0),
                angularVelocity: 0,
                velocity: new Vector(1, 0)
            };

            const bMat = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 1,
                invMass: 1,
                restitution: 1,
            };
            const bState: PhysProperty = {
                position: new Vector(0, -1),
                angularVelocity: 0,
                velocity: new Vector(-1, 0),
            };

            const result = new CollisionResult();
            result.normal = new Vector(1, 0);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            console.log(aState);
            console.log(bState);
            expect(aState.velocity.x).toBeCloseTo(-1/3, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(aState.angularVelocity).toBeCloseTo(0, delta);

            expect(bState.velocity.x).toBeCloseTo(1/3, delta);
            expect(bState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.angularVelocity).toBeCloseTo(-4/3, delta);
        });
    });
});