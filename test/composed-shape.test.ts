import {ComposedShape, Polygon, Transform, Vector} from "../src";

describe('ComposedShape', () => {

    describe('constructor', () => {
        test('without transform', () => {
            // A square
            let composedShape = new ComposedShape([new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ])]);
            let c = composedShape.transform.position;
            expect(c.x).toBe(50);
            expect(c.y).toBe(50);
        });

        test('with transform', () => {
            let p1 = new Polygon(new Vector(0, 0), [
                new Vector(-20, -20), new Vector(20, -20), new Vector(20, 20), new Vector(-20, 20)
            ]);
            let p2 = new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let transform = new Transform(new Vector(25, 20));
            let composedShape = new ComposedShape([p1, p2], transform);
            let c = composedShape.transform.position;
            expect(c.x).toBe(25);
            expect(c.y).toBe(20);
        });
    });

    describe('.getCentroid', () => {
        test('should calculate the correct value for a single square', () => {
            // A square
            let composedShape = new ComposedShape([new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ])]);
            let c = composedShape.getCentroid();
            expect(c.x).toBe(50);
            expect(c.y).toBe(50);
        });

        test('should calculate the correct value for 2 squares', () => {
            let p1 = new Polygon(new Vector(0, 0), [
                new Vector(-20, -20), new Vector(20, -20), new Vector(20, 20), new Vector(-20, 20)
            ]);
            let p2 = new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let composedShape = new ComposedShape([p1, p2]);
            let c = composedShape.getCentroid();
            expect(c.x).toBe(25);
            expect(c.y).toBe(25);
        });
    });


    describe('.getArea', () => {
        test('should calculate the correct value for a square', () => {
            // A square
            let composedShape = new ComposedShape([new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ])]);
            let a = composedShape.getArea();
            expect(a).toBe(1600);
        });

        test('should calculate the correct value for a triangle', () => {
            let p1 = new Polygon(new Vector(0, 0), [
                new Vector(-20, -20), new Vector(20, -20), new Vector(20, 20), new Vector(-20, 20)
            ]);
            let p2 = new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let composedShape = new ComposedShape([p1, p2]);
            let c = composedShape.getArea();
            expect(c).toBe(3200);
        });
    });

    describe('.inPointIn', () => {
        test('Colinear', () => {
            let triangle = new ComposedShape([new Polygon(new Vector(10, 0), [
                new Vector(-10, 0), new Vector(30, 0), new Vector(0, 30)
            ])]);
            expect(triangle.isPointIn(new Vector(0, 0))).toBe(true); // true
            expect(triangle.isPointIn(new Vector(10, 10))).toBe(true); // true
            expect(triangle.isPointIn(new Vector(0, -10))).toBe(false); // false
            expect(triangle.isPointIn(new Vector(35, 5))).toBe(false); // false
        });
/*
        test('Polygon (small)', () => {
            let v1 = new Vector(1, 1.1);
            let p1 = new ComposedShape(new Vector(), [new Vector(2, 1), new Vector(2, 2), new Vector(1, 3), new Vector(0, 2), new Vector(0, 1), new Vector(1, 0)]);
            expect(p1.isPointIn(v1)).toBe(true);
        });*/
    });

    describe('.rotate', () => {
        test('rotate itself', () => {
            let p1 = new Polygon(new Vector(0, 0), [
                new Vector(-20, -20), new Vector(20, -20), new Vector(20, 20), new Vector(-20, 20)
            ]);
            let p2 = new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let composedShape = new ComposedShape([p1, p2]);
            composedShape.rotate(-Math.PI / 4);
            composedShape.recalc();

            expect(composedShape.transform.position.x).toBe(25);
            expect(composedShape.transform.position.y).toBe(25);
            // because reverse cos must be in [0, Math.PI]
            expect(composedShape.transform.angle).toBeCloseTo(-Math.PI/4, 0.0001);
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].x).toBeCloseTo(25 - 63.6396103068, 0.0001);
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].y).toBeCloseTo(25, 0.0001);
        });
    });

    describe('.translate', () => {
        test('translate and rotate', () => {
            let p1 = new Polygon(new Vector(0, 0), [
                new Vector(-20, -20), new Vector(20, -20), new Vector(20, 20), new Vector(-20, 20)
            ]);
            let p2 = new Polygon(new Vector(30, 30), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let composedShape = new ComposedShape([p1, p2]);
            composedShape.translate(10, 10);
            composedShape.recalc();
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].x).toBeCloseTo(-10, 0.0001);
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].y).toBeCloseTo(-10, 0.0001);
            composedShape.rotate(-Math.PI / 4);
            composedShape.recalc();
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].x).toBeCloseTo(35 - 63.6396103068, 0.0001);
            expect((composedShape.shapes[0] as Polygon).calcPoints[0].y).toBeCloseTo(35, 0.0001);
        });
    });
});
