import {expect} from 'chai';
import {Vector} from "../src/vector";
import {Polygon} from "../src/polygon";
import {TestResult} from "../src/test-result";
import {Circle} from "../src/circle";

describe("Circle", function() {
    describe(".intersect", function () {
        it("testCircleCircle", function () {

            let circle1 = new Circle(new Vector(0, 0), 20);
            let circle2 = new Circle(new Vector(30, 0), 20);
            let testResult = new TestResult();
            let collided = circle1.intersects(circle2, testResult);

            expect(collided).to.be.true;
            expect(testResult.overlap).to.equal(10);
            expect(testResult.overlapV.x).to.equal(10);
            expect(testResult.overlapV.y).to.equal(0);
        });
        it("testCirclePolygon", function () {
            let circle = new Circle(new Vector(50, 50), 20);
            // A square
            let polygon = new Polygon(new Vector(), [
                new Vector(0, 0), new Vector(40, 0), new Vector(40, 40), new Vector(0, 40)
            ]);
            let testResult = new TestResult();
            let collided = circle.intersects(polygon, testResult);

            expect(collided).to.be.true;
            expect(testResult.overlap.toFixed(2)).to.equal("5.86");
            expect(testResult.overlapV.x.toFixed(2)).to.equal("-4.14");
            expect(testResult.overlapV.y.toFixed(2)).to.equal("-4.14");

            circle = new Circle(new Vector(50, 50), 5);
            // A square
            polygon = new Polygon(new Vector(50, 50), [
                new Vector(0, 0), new Vector(0, 10)]);

            collided = circle.intersects(polygon, testResult);
            expect(collided).to.be.true;
        });
    });

    describe(".isPointIn", function () {
        it("pointInCircle", function () {

            let circle = new Circle(new Vector(100, 100), 20);

            expect(circle.isPointIn(new Vector(0, 0))).to.be.false; // false
            expect(circle.isPointIn(new Vector(110, 110))).to.be.true; // true
        });
    });
});