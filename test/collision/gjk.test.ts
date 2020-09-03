import {Polygon, Vector, gjk, Circle, epa, resolvePointsOfContact} from "../../src";
import {CollisionResult} from "../../src/collision/collision-result";


describe('gjk', () => {
    describe('Square - Square', () => {
        test('no collision', () => {
            let square1 = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            let square2 = new Polygon(new Vector(-15, -10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            expect(gjk(square1, square2)).toBe(false);

        });

        test('collision', () => {
            let square1 = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            let square2 = new Polygon(new Vector(0, 0), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            expect(gjk(square1, square2)).toBe(true);
        });
    });



    describe('Poly', () => {
        test('collision', () => {
            let triangle = new Polygon(new Vector(0, 0), [
                new Vector(4, 11), new Vector(9, 9),
                new Vector(4, 5),
            ]);
            triangle.recenter();

            let square = new Polygon(new Vector(0, 0), [
                new Vector(5, 7), new Vector(12, 7),
                new Vector(7, 3), new Vector(10, 2),
            ]);
            square.recenter();

            expect(gjk(triangle, square)).toBe(true);
        });
    });


    describe('Circle-Square', () => {
        test('collision', () => {
            let square = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            let circle = new Circle(new Vector(10, 10), 5);
            expect(gjk(square, circle)).toBe(true);

            circle = new Circle(new Vector(24, 10), 5);
            expect(gjk(square, circle)).toBe(true);
        });

        test('no collision', () => {
            let square = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);

            let circle = new Circle(new Vector(26, 10), 5);
            expect(gjk(square, circle)).toBe(false);
        });

    });
});


describe('epa', () => {
    test('Square - Square', () => {
        let square1 = new Polygon(new Vector(10, 10), [
            new Vector(-10, -10), new Vector(10, -10),
            new Vector(10, 10), new Vector(-10, 10),
        ]);

        let square2 = new Polygon(new Vector(0, 0), [
            new Vector(-10, -10), new Vector(10, -10),
            new Vector(10, 10), new Vector(-10, 10),
        ]);

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(square1, square2, simplex)).toBe(true);

        const result = new CollisionResult();
        epa(square1, square2, simplex, result);
        expect(result.normal).toEqual({x: 0, y: -1});
        expect(result.depth).toEqual(10);
    });

    test('Triangle Square', () => {
        let triangle = new Polygon(new Vector(0, 0), [
            new Vector(4, 11), new Vector(9, 9),
            new Vector(4, 5),
        ]);
        triangle.recenter();

        let square = new Polygon(new Vector(0, 0), [
            new Vector(5, 7), new Vector(12, 7),
            new Vector(7, 3), new Vector(10, 2),
        ]);
        square.recenter();

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(triangle, square, simplex)).toBe(true);

        const result = new CollisionResult();
        epa(triangle, square, simplex, result);
        const res = new Vector(5, 4).perp().normalize();
        expect(result.normal.x).toBeCloseTo(res.x, 0.00001);
        expect(result.normal.y).toBeCloseTo(res.y, 0.00001);
        expect(result.depth).toBeCloseTo(0.9370425713316364, 0.00001);
    });


    test('Large Rect - Small Rect', () => {
        let square1 = new Polygon(new Vector(100, 0), [
            new Vector(-10, 100), new Vector(-10, -100),
            new Vector(10, -100), new Vector(10, 100),
        ]);

        let square2 = new Polygon(new Vector(85, 0), [
            new Vector(9, 10), new Vector(-10, -9),
            new Vector(-9, -10), new Vector(10, 9),
        ]);

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(square1, square2, simplex)).toBe(true);

        const result = new CollisionResult();
        epa(square1, square2, simplex, result);
        expect(result.normal).toEqual({x: -1, y: 0});
        expect(result.depth).toEqual(5);
    });

    test("real game - case 1", () => {
        let square1 = new Polygon(new Vector(1000, 2000), [
            new Vector(-1000, -25), new Vector(1000, -25),
            new Vector(1000, 25), new Vector(-1000, 25),
        ]);

        let square2 = new Polygon(new Vector(1493.375491567283, 1976.3265662622332), [
            new Vector(1.5155526763598095, -4.008018362768531), new Vector(3.16954014403402, -2.8835960858740117),
            new Vector(-1.5155526763598095, 4.008018362768531), new Vector(-3.16954014403402, 2.8835960858740117),
        ]);

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(square1, square2, simplex)).toBe(true);

        const result = new CollisionResult();
        epa(square1, square2, simplex, result);
        resolvePointsOfContact(square1, square2, result);

        expect(result.normal).toEqual({x: 0, y: -1});
    });


    test("real game - case 2", () => {
        let square1 = new Polygon(new Vector(500, 1000), [
            new Vector(-500, -50), new Vector(500, -50),
            new Vector(500, 50), new Vector(-500, 50),
        ]);

        let square2 = new Polygon(new Vector(338.2566265047601, 952.6661404366357), [
            new Vector(-0.09537967299469441, -4.283925049424947 ),
            new Vector(-2.02928311985077, -3.774005979142035 ),
            new Vector(0.09537967299469441, 4.283925049424947 ),
            new Vector(2.02928311985077, 3.774005979142035)
        ]);

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(square1, square2, simplex)).toBe(true);

        const result = new CollisionResult();
        epa(square1, square2, simplex, result);
        resolvePointsOfContact(square1, square2, result);

        expect(result.normal).toEqual({x: 0, y: -1});
        expect(result.contacts.length).toEqual(2);
    });

    /*Polygon {
  transform: Transform { cost: 1, sint: 0, _pos: Vector { x: 500, y: 1000 } },
  points: [
    Vector { x: 500, y: 50 },
    Vector { x: 500, y: -50 },
    Vector { x: -500, y: -50 },
    Vector { x: -500, y: 50 }
  ],
  calcPoints: [
    Vector { x: 1000, y: 1050 },
    Vector { x: 1000, y: 950 },
    Vector { x: 0, y: 950 },
    Vector { x: 0, y: 1050 }
  ]
}
Polygon {
  transform: Transform {
    cost: 1,
    sint: 0,
    _pos: Vector { x: 338.2566265047601, y: 952.6661404366357 }
  },
  points: [
    Vector { x: -0.09537967299469441, y: -4.283925049424947 },
    Vector { x: -2.02928311985077, y: -3.774005979142035 },
    Vector { x: 0.09537967299469441, y: 4.283925049424947 },
    Vector { x: 2.02928311985077, y: 3.774005979142035 }
  ],
  calcPoints: [
    Vector { x: 338.1612468317654, y: 948.3822153872107 },
    Vector { x: 336.2273433849093, y: 948.8921344574936 },
    Vector { x: 338.3520061777548, y: 956.9500654860607 },
    Vector { x: 340.2859096246109, y: 956.4401464157778 }
  ]
}
CollisionResult {
  normal: Vector { x: 0, y: -1 },
  depth: 6.95006548606068,
  contacts: []
}*/
});
