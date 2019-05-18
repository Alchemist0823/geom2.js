import {assert, expect} from 'chai';
import Vector from "../src/vector";
import Polygon from "../src/polygon";
import TestResult from "../src/test-result";
import Circle from "../src/circle";

describe('Vector.dist', function() {
    it('dist should return correct result', function () {
        let v1 = new Vector(0, 0);
        let v2 = new Vector(0, 1);
        expect(v1.dist(v2)).to.equal(1);
    });
});

describe('Vector.scl', function() {
    it('should scl by zero properly', function() {
        let v1 = new Vector(5, 5);
        v1.scl(10, 10);
        expect(v1.x).to.equal(50);
        expect(v1.y).to.equal(50);

        v1.scl(0, 1);
        expect(v1.x).to.equal(0);
        expect(v1.y).to.equal(50);

        v1.scl(1, 0);
        expect(v1.x).to.equal(0);
        expect(v1.y).to.equal(0);
    });
});

describe("Polygon.getCentroid", function() {
    it("should calculate the correct value for a square", function() {
        // A square
        let polygon = new Polygon([
            new Vector(0,0), new Vector(40,0), new Vector(40,40), new Vector(0,40)
        ]);
        let c = polygon.getCentroid();
        expect(c.x).to.equal(20);
        expect(c.y).to.equal(20);
    });

    it("should calculate the correct value for a triangle", function() {
        // A triangle
        let polygon = new Polygon([
            new Vector(0,0), new Vector(100,0), new Vector(50,99)
        ]);
        let c = polygon.getCentroid();
        expect(c.x).to.equal(50);
        expect(c.y).to.equal(33);
    });
});

describe("Collision", function() {
    /*
    it("testCircleCircle", function() {

        let circle1 = new Circle(new Vector(0,0), 20);
        let circle2 = new Circle(new Vector(30,0), 20);
        let response = new TestResult();
        let collided = testCircleCircle(circle1, circle2, response);

        assert(collided);
        assert(response.overlap == 10);
        assert(response.overlapV.x == 10 && response.overlapV.y).to.equal(0);
    });

    it("testPolygonCircle", function() {

        let circle = new Circle(new Vector(50,50), 20);
        // A square
        let polygon = new Polygon([
            new Vector(0,0), new Vector(40,0), new Vector(40,40), new Vector(0,40)
        ]);
        let response = new TestResult();
        let collided = SAT.testPolygonCircle(polygon, circle, response);

        assert(collided);
        assert(response.overlap.toFixed(2) == "5.86");
        assert(
            response.overlapV.x.toFixed(2) == "4.14" &&
            response.overlapV.y.toFixed(2) == "4.14"
       );
    });*/

    it("testPolygonPolygon", function() {
        // A square
        let polygon1 = new Polygon([
            new Vector(0,0), new Vector(40,0), new Vector(40,40), new Vector(0,40)
        ]);
        // A triangle
        let polygon2 = new Polygon([
            new Vector(30,0), new Vector(60, 0), new Vector(30, 30)
        ]);
        let response = new TestResult();
        let collided = polygon1.intersect(polygon2, response);

        expect(collided).to.not.be.null;
        expect(response.overlap).to.equal(10);
        expect(response.overlapV.x).to.equal(10);
        expect(response.overlapV.y).to.equal(0);
    });
});

describe("No collision", function() {
    it("testPolygonPolygon", function(){

        let box1 = new Polygon([
            new Vector(0,0), new Vector(40,0), new Vector(40,40), new Vector(0,40)
        ]);
        let box2 = new Polygon([
            new Vector(50,0), new Vector(90,0), new Vector(90,40), new Vector(50,40)
        ]);
        let collided = box1.intersect(box2, new TestResult());
        assert(!collided);
    });
});

describe("Point testing", function() {
    it("pointInCircle", function(){

        let circle = new Circle(new Vector(100,100), 20);

        expect(circle.isPointIn(new Vector(0,0))).to.be.false; // false
        expect(circle.isPointIn(new Vector(110,110))).to.be.true; // true
    });

    it("pointInPolygon", function() {

        let triangle = new Polygon([
            new Vector(0,0), new Vector(30, 0), new Vector(0, 30)
        ]);
        expect(triangle.isPointIn(new Vector(0,0))).to.be.true; // true
        expect(triangle.isPointIn(new Vector(10,10))).to.be.true; // true
        expect(triangle.isPointIn(new Vector(0,-10))).to.be.false; // false
        expect(triangle.isPointIn(new Vector(35, 5))).to.be.false; // false
    });

    it("pointInPolygon (small)", function () {

        let v1 = new Vector(1, 1.1);
        let p1 = new Polygon([new Vector(2,1), new Vector(2,2), new Vector(1,3), new Vector(0,2),new Vector(0,1),new Vector(1,0)]);
        expect(p1.isPointIn(v1)).to.be.true;
    });
});