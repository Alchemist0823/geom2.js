import {Circle, Polygon, TestResult, Vector} from "../src";
import {transform} from "@babel/core";



describe('Polygon', () => {
    describe('.getCentroid', () => {
        test('should calculate the correct value for a square', () => {
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let c = polygon.getCentroid();
            expect(c.x).toBe(20);
            expect(c.y).toBe(20);
        });

        test('should calculate the correct value for a triangle', () => {
            // A triangle
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(100, 0), new Vector(50, 99)
            ]);
            let c = polygon.getCentroid();
            expect(c.x).toBe(50);
            expect(c.y).toBe(33);
        });
    });


    describe('.getArea', () => {
        test('should calculate the correct value for a square', () => {
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let a = polygon.getArea();
            expect(a).toBe(1600);
        });

        test('should calculate the correct value for a triangle', () => {
            // A triangle
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(100, 0), new Vector(50, 99)
            ]);
            let c = polygon.getArea();
            expect(c).toBe(9900 / 2);
        });
    });

    describe('.intersect', () => {
        test('testPolygonCircle NoCollision', () => {

            let circle = new Circle(new Vector(50, 50), 20);
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let testResult = new TestResult();
            let collided = polygon.intersects(circle, testResult);

            expect(collided).toBe(true);
            expect(testResult.overlap.toFixed(2)).toBe('5.86');
            expect(testResult.overlapV.x.toFixed(2)).toBe('4.14');
            expect(testResult.overlapV.y.toFixed(2)).toBe('4.14');
        });

        test('testPolygonPolygon NoCollision', () => {
            // A square
            let polygon1 = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            // A triangle
            let polygon2 = new Polygon(new Vector(), [
                new Vector(30, 0), new Vector(60, 0), new Vector(30, 30)
            ]);
            let response = new TestResult();
            let collided = polygon1.intersects(polygon2, response);

            expect(collided).toBe(true);
            expect(response.overlap).toBeCloseTo(10, 0.001);
            expect(response.overlapV.x).toBeCloseTo(10, 0.001);
            expect(response.overlapV.y).toBeCloseTo(0, 0.001);
        });

        test('testPolygonPolygon Collision', () => {

            let box1 = new Polygon(new Vector(0, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let box2 = new Polygon(new Vector(50, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let collided = box1.intersects(box2, new TestResult());
            expect(collided).toBe(false);
        });
    });

    describe('.inPointIn', () => {
        test('Colinear', () => {

            let triangle = new Polygon(new Vector(10, 0), [
                new Vector(-10, 0), new Vector(30, 0), new Vector(0, 30)
            ]);
            expect(triangle.isPointIn(new Vector(0, 0))).toBe(true); // true
            expect(triangle.isPointIn(new Vector(10, 10))).toBe(true); // true
            expect(triangle.isPointIn(new Vector(0, -10))).toBe(false); // false
            expect(triangle.isPointIn(new Vector(35, 5))).toBe(false); // false
        });

        test('Polygon (small)', () => {

            let v1 = new Vector(1, 1.1);
            let p1 = new Polygon(new Vector(), [new Vector(2, 1), new Vector(2, 2), new Vector(1, 3), new Vector(0, 2), new Vector(0, 1), new Vector(1, 0)]);

            expect(p1.isPointIn(v1)).toBe(true);
        });
    });



    describe('.getFarthestPointInDirection', () => {

        test('square', () => {
            let square = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);
            let v = square.getFarthestPointInDirection(new Vector(1, 1));
            expect(v.x).toBe(20);
            expect(v.y).toBe(20);
            v = square.getFarthestPointInDirection(new Vector(1, .5));
            expect(v.x).toBe(20);
            expect(v.y).toBe(20);
            v = square.getFarthestPointInDirection(new Vector(1, 0));
            expect(v.x).toBe(20);
            expect(v.y).toBe(0);
        });

        test('triangle', () => {
            let triangle = new Polygon(new Vector(10, 10), [
                new Vector(-10, -1), new Vector(30, -1), new Vector(0, 30)
            ]);
            let v = triangle.getFarthestPointInDirection(new Vector(1, 0));
            expect(v.x).toBe(40);
            expect(v.y).toBe(9);
            v = triangle.getFarthestPointInDirection(new Vector(0, 1));
            expect(v.x).toBe(10);
            expect(v.y).toBe(40);
        });
    });

    describe('.recenter', () => {
        test('triangle', () => {
            let triangle = new Polygon(new Vector(0, 0), [
                new Vector(-10, -1), new Vector(30, -1), new Vector(0, 30)
            ]);
            triangle.recenter();
            const c = triangle.getCentroid();
            expect(triangle.getOrigin().x).toBeCloseTo(c.x);
            expect(triangle.getOrigin().y).toBeCloseTo(c.y);
            expect(triangle.calcPoints[0].x).toBe(-10);
            expect(triangle.calcPoints[0].y).toBe(-1);
            expect(triangle.calcPoints[1].x).toBe(30);
            expect(triangle.calcPoints[1].y).toBe(-1);
            expect(triangle.calcPoints[2].x).toBe(0);
            expect(triangle.calcPoints[2].y).toBe(30);
        });
    });
});