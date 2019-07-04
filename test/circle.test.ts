import {Vector} from "../src/vector";
import {Polygon} from "../src/polygon";
import {Circle} from "../src/circle";
import {CollisionResult} from "../src/collision/collision-result";

describe("Circle", () => {
    describe(".intersect", () => {
        test("testCircleCircle", () => {

            let circle1 = new Circle(new Vector(0, 0), 20);
            let circle2 = new Circle(new Vector(30, 0), 20);
            let testResult = new CollisionResult();
            let collided = circle1.intersects(circle2, testResult);

            expect(collided).toBe(true);
            expect(testResult.depth).toBeCloseTo(10, 0.001);
            expect(testResult.normal.x).toBeCloseTo(1, 0.001);
            expect(testResult.normal.y).toBeCloseTo(0, 0.001);
            expect(testResult.contacts.length).toBe(5);
            expect(testResult.contacts[0].x).toBeCloseTo(10, 0.01);
            expect(testResult.contacts[0].y).toBeCloseTo(0, 0.01);
        });
        test("testCirclePolygon", () => {
            let circle = new Circle(new Vector(50, 50), 20);
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon.recenter();
            let testResult = new CollisionResult();
            let collided = circle.intersects(polygon, testResult);

            expect(collided).toBe(true);
            expect(testResult.depth).toBeCloseTo(5.86,0.01);
            expect(testResult.normal.x).toBeCloseTo(-Math.sqrt(1/2), 0.01);
            expect(testResult.normal.y).toBeCloseTo(-Math.sqrt(1/2), 0.01);

            circle = new Circle(new Vector(50, 50), 5);
            // A square
            polygon = new Polygon(new Vector(50, 50), [
                new Vector(0, 0), new Vector(0, 10)]);

            collided = circle.intersects(polygon, testResult);
            expect(collided).toBe(true);
        });
    });

    describe(".isPointIn", () => {
        test("pointInCircle", () => {

            let circle = new Circle(new Vector(100, 100), 20);

            expect(circle.isPointIn(new Vector(0, 0))).toBe(false); // false
            expect(circle.isPointIn(new Vector(110, 110))).toBe(true); // true
        });
    });


    describe('.getCentroid', () => {
        test('should calculate the correct value for a circle', () => {
            let circle = new Circle(new Vector(10, 10), 10);
            const c = circle.getCentroid();
            expect(c.x).toBeCloseTo(10, 0.001);
            expect(c.y).toBeCloseTo(10, 0.001);
        });
    });


    describe('.getArea', () => {
        test('should calculate the correct value for a circle', () => {
            let circle = new Circle(new Vector(0, 0), 10);
            expect(circle.getArea()).toBeCloseTo(100 * Math.PI, 0.001);
        });
    });
});