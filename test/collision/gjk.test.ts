import {Polygon, Vector, gjk, Circle} from "../../src";


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
