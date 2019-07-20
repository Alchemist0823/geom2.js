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


        test('no Inertia - infinite mass', ()=> {
            const aMat: PhysMaterial = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 0,
                restitution: 1,
            };
            const aState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(0, 0)
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
                velocity: new Vector(-1, 1),
            };

            const result = new CollisionResult();
            result.normal = new Vector(1, 0);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(0, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.velocity.x).toBeCloseTo(1, delta);
            expect(bState.velocity.y).toBeCloseTo(1, delta);
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

        test('no Inertia - infinity mass - 45 degree', ()=> {
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
                velocity: new Vector(1, 1)
            };

            const bMat = {
                dynamicFriction: 0,
                staticFriction: 0,
                invInertia: 0,
                invMass: 0,
                restitution: 1,
            };
            const bState: PhysProperty = {
                position: new Vector(),
                angularVelocity: 0,
                velocity: new Vector(0, 0),
            };

            const result = new CollisionResult();
            result.normal = new Vector(0, 1);
            result.depth = 1;
            result.contacts.push(new Vector());

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(1, delta);
            expect(aState.velocity.y).toBeCloseTo(-1, delta);
            expect(bState.velocity.x).toBeCloseTo(0, delta);
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

            expect(aState.velocity.x).toBeCloseTo(-1/3, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(aState.angularVelocity).toBeCloseTo(0, delta);

            expect(bState.velocity.x).toBeCloseTo(1/3, delta);
            expect(bState.velocity.y).toBeCloseTo(0, delta);
            expect(bState.angularVelocity).toBeCloseTo(-4/3, delta);
        });

        test("real game data 1", () => {
            const result = new CollisionResult(
                new Vector ( 0,  -1 ),
                5.430510347170639,
                [
                    new Vector (959.1650536313684, 1980.1967083098991),
                    new Vector (959.6616254166729, 1980.255158819217),
                    new Vector (960.1581972019774, 1980.3136093285348),
                    new Vector (960.654768987282, 1980.3720598378527),
                    new Vector (961.1513407725864, 1980.4305103471706)
                ]
            );

            const aMat: PhysMaterial = {
              dynamicFriction: 0,
              staticFriction: 0,
              invInertia: 0,
              invMass: 0,
              restitution: 1,
            };
            const aState: PhysProperty = {
              position: new Vector(1000, 2000),
              angularVelocity: 0,
              velocity: new Vector(0, 0)
            };

            const bMat = {
              dynamicFriction: 0,
              staticFriction: 0,
              invInertia: 0,
              invMass: 10,
              restitution: 1,
            };
            const bState: PhysProperty = {
              position: new Vector(960.1581972019774, 1980.3136093285348),
              angularVelocity: 0,
              velocity: new Vector(-58.45050931787847, 496.57178530448203),
            };

            resolveContact(aMat, aState, bMat, bState, result);

            expect(aState.velocity.x).toBeCloseTo(0, delta);
            expect(aState.velocity.y).toBeCloseTo(0, delta);
            expect(aState.angularVelocity).toBeCloseTo(0, delta);

            expect(bState.velocity.x).toBeCloseTo(-58.45050931787847, delta);
            expect(bState.velocity.y).toBeCloseTo(-496.57178530448203, delta);
            expect(bState.angularVelocity).toBeCloseTo(0, delta);
        });
    });
});
