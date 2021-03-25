import {Circle, Polygon, Segment, Vector} from "../src";
import {CollisionResult} from "../src/collision/collision-result";



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

    describe('.intersectSegment', () => {
        test('test collinear', () => {
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon.recenter();
            let testResult = new CollisionResult();
            let collided = polygon.intersectsSegment(new Segment(new Vector(-10, 0), new Vector(50, 0)), testResult);
            expect(collided).toBe(true);
            expect(testResult.depth).toBeCloseTo(10,0.01);
            expect(testResult.normal.x).toBeCloseTo(-1, 0.01);
            expect(testResult.normal.y).toBeCloseTo(0, 0.01);
            expect(testResult.contacts.length).toBe(1);
            expect(testResult.contacts[0].x).toBeCloseTo(0, 1);
            expect(testResult.contacts[0].y).toBeCloseTo(0, 1);
        });

        test('test reverse', () => {
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon.recenter();
            let testResult = new CollisionResult();
            let collided = polygon.intersectsSegment(new Segment(new Vector(50, 10), new Vector(-10, 10)), testResult);
            expect(collided).toBe(true);
            expect(testResult.depth).toBeCloseTo(10,0.01);
            expect(testResult.normal.x).toBeCloseTo(1, 0.01);
            expect(testResult.normal.y).toBeCloseTo(0, 0.01);
            expect(testResult.contacts.length).toBe(1);
            expect(testResult.contacts[0].x).toBeCloseTo(40, 1);
            expect(testResult.contacts[0].y).toBeCloseTo(10, 1);
        });

        test('no intersect', () => {
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon.recenter();
            let testResult = new CollisionResult();
            let collided = polygon.intersectsSegment(new Segment(new Vector(50, -10), new Vector(-10, -10)), testResult);
            expect(collided).toBe(false);
        });
    });

    describe('.intersect', () => {
        test('testPolygonCircle Collision', () => {

            let circle = new Circle(new Vector(50, 50), 20);
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon.recenter();
            let testResult = new CollisionResult();
            let collided = polygon.intersects(circle, testResult);

            expect(collided).toBe(true);
            expect(testResult.depth).toBeCloseTo(5.86,0.01);
            expect(testResult.normal.x).toBeCloseTo(Math.sqrt(1/2), 0.01);
            expect(testResult.normal.y).toBeCloseTo(Math.sqrt(1/2), 0.01);
            expect(testResult.contacts.length).toBe(2);
            expect(testResult.contacts[0].x).toBeCloseTo(40, 1);
            expect(testResult.contacts[0].y).toBeCloseTo(40, 1);
        });

        test('testPolygonPolygon Collision', () => {
            // A square
            let polygon1 = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon1.recenter();
            // A triangle
            let polygon2 = new Polygon(new Vector(), [
                new Vector(30, 0), new Vector(60, 0), new Vector(30, 30)
            ]);
            polygon2.recenter();
            let response = new CollisionResult();
            let collided = polygon1.intersects(polygon2, response);

            expect(collided).toBe(true);
            expect(response.depth).toBeCloseTo(10, 0.001);
            expect(response.normal.x).toBeCloseTo(1, 0.001);
            expect(response.normal.y).toBeCloseTo(0, 0.001);
            expect(response.contacts.length).toBe(2);
            expect(response.contacts[0].x).toBeCloseTo(30, 0.001);
            expect(response.contacts[0].y).toBeCloseTo(30, 0.001);
            expect(response.contacts[1].x).toBeCloseTo(30, 0.001);
            expect(response.contacts[1].y).toBeCloseTo(0, 0.001);
        });

        test('testPolygonPolygon Collision 1 ', () => {
            // A square
            let polygon1 = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            polygon1.recenter();
            // A triangle
            let polygon2 = new Polygon(new Vector(), [
                new Vector(20, -20), new Vector(60, -20), new Vector(60, 60), new Vector(20, 60)
            ]);
            polygon2.recenter();
            let response = new CollisionResult();
            let collided = polygon1.intersects(polygon2, response);

            expect(collided).toBe(true);
            expect(response.depth).toBeCloseTo(20, 0.001);
            expect(response.normal.x).toBeCloseTo(1, 0.001);
            expect(response.normal.y).toBeCloseTo(0, 0.001);
            expect(response.contacts.length).toBe(2);
            expect(response.contacts[0].x).toBeCloseTo(20, 0.001);
            expect(response.contacts[0].y).toBeCloseTo(0, 0.001);
            expect(response.contacts[1].x).toBeCloseTo(20, 0.001);
            expect(response.contacts[1].y).toBeCloseTo(40, 0.001);
        });

        test('testPolygonPolygon Collision 2 ', () => {
            // A square
            let polygon1 = new Polygon(new Vector(), [
                new Vector(-40, -40), new Vector(40, -40), new Vector(40, 40), new Vector(-40, 40)
            ]);
            polygon1.recenter();
            // A triangle
            let polygon2 = new Polygon(new Vector(), [
                new Vector(0, 20), new Vector(0, -20), new Vector(60, -80), new Vector(60, 80)
            ]);
            polygon2.recenter();
            let response = new CollisionResult();
            let collided = polygon1.intersects(polygon2, response);

            expect(collided).toBe(true);
            expect(response.depth).toBeCloseTo(40, 0.001);
            expect(response.normal.x).toBeCloseTo(1, 0.001);
            expect(response.normal.y).toBeCloseTo(0, 0.001);
            expect(response.contacts.length).toBe(2);
            expect(response.contacts[0].x).toBeCloseTo(0, 0.001);
            expect(response.contacts[0].y).toBeCloseTo(20, 0.001);
            expect(response.contacts[1].x).toBeCloseTo(0, 0.001);
            expect(response.contacts[1].y).toBeCloseTo(-20, 0.001);
        });


        test('testPolygonPolygon No Collision', () => {

            let box1 = new Polygon(new Vector(0, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            box1.recenter();
            let box2 = new Polygon(new Vector(50, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            box2.recenter();
            let collided = box1.intersects(box2);
            expect(collided).toBe(false);
        });
    });

    describe('.inPointIn', () => {
        test('Colinear', () => {

            let triangle = new Polygon(new Vector(10, 0), [
                new Vector(-10, 0), new Vector(30, 0), new Vector(0, 30)
            ]);
            expect(triangle.isPointIn(new Vector(0, 0))).toBe(true);
            expect(triangle.isPointIn(new Vector(10, 10))).toBe(true);
            expect(triangle.isPointIn(new Vector(0, -10))).toBe(false);
            expect(triangle.isPointIn(new Vector(35, 5))).toBe(true);
        });

        test('Polygon (small)', () => {

            let v1 = new Vector(1, 1.1);
            let p1 = new Polygon(new Vector(), [new Vector(2, 1), new Vector(2, 2), new Vector(1, 3), new Vector(0, 2), new Vector(0, 1), new Vector(1, 0)]);

            expect(p1.isPointIn(v1)).toBe(true);
        });
    });

    describe('.validate', () => {
        test('valid', () => {
            let square = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10),
                new Vector(10, 10), new Vector(-10, 10),
            ]);
            expect(square.validate()).toBe(true);
        });
        test('valid', () => {
            let square = new Polygon(new Vector(10, 10), [
                new Vector(-10, -10), new Vector(10, -10), new Vector(0, 0),
                new Vector(10, 10), new Vector(-10, 10),
            ]);
            expect(square.validate()).toBe(false);
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