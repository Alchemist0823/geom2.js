import {Circle, Polygon, TestResult, Vector} from "../src";
import {expect} from "chai";



describe('Polygon', function() {
    describe('.getCentroid', function () {
        it('should calculate the correct value for a square', function () {
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let c = polygon.getCentroid();
            expect(c.x).to.equal(20);
            expect(c.y).to.equal(20);
        });

        it('should calculate the correct value for a triangle', function () {
            // A triangle
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(100, 0), new Vector(50, 99)
            ]);
            let c = polygon.getCentroid();
            expect(c.x).to.equal(50);
            expect(c.y).to.equal(33);
        });
    });

    describe('.intersect', function () {
        it('testPolygonCircle NoCollision', function () {

            let circle = new Circle(new Vector(50, 50), 20);
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let testResult = new TestResult();
            let collided = polygon.intersects(circle, testResult);

            expect(collided).to.be.true;
            expect(testResult.overlap.toFixed(2)).to.equal('5.86');
            expect(testResult.overlapV.x.toFixed(2)).to.equal('4.14');
            expect(testResult.overlapV.y.toFixed(2)).to.equal('4.14');
        });

        it('testPolygonPolygon NoCollision', function () {
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

            expect(collided).to.be.true;
            expect(response.overlap).to.equal(10);
            expect(response.overlapV.x).to.equal(10);
            expect(response.overlapV.y).to.equal(0);
        });

        it('testPolygonPolygon Collision', function () {

            let box1 = new Polygon(new Vector(0, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let box2 = new Polygon(new Vector(50, 0), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let collided = box1.intersects(box2, new TestResult());
            expect(collided).to.be.false;
        });
    });

    describe('.inPointIn', function () {
        it('Colinear', function () {

            let triangle = new Polygon(new Vector(10, 0), [
                new Vector(-10, 0), new Vector(30, 0), new Vector(0, 30)
            ]);
            expect(triangle.isPointIn(new Vector(0, 0))).to.be.true; // true
            expect(triangle.isPointIn(new Vector(10, 10))).to.be.true; // true
            expect(triangle.isPointIn(new Vector(0, -10))).to.be.false; // false
            expect(triangle.isPointIn(new Vector(35, 5))).to.be.false; // false
        });

        it('Polygon (small)', function () {

            let v1 = new Vector(1, 1.1);
            let p1 = new Polygon(new Vector(), [new Vector(2, 1), new Vector(2, 2), new Vector(1, 3), new Vector(0, 2), new Vector(0, 1), new Vector(1, 0)]);

            expect(p1.isPointIn(v1)).to.be.true;
        });
    });
});