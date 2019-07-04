import {Polygon, Vector, gjk, Circle, epa} from "../../src";
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
});
