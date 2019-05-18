import {expect} from 'chai';
import * as algo from "../src/algo";
import {Polygon, Vector} from "../src";

describe('algo.generateRandomConvexPolygon', function() {
    it('should be centered', function () {
        let polygon = algo.generateRandomConvexPolygon(10, 1);
        let box = polygon.getAABB();
        expect(box.centerX).to.closeTo(0, 0.01);
        expect(box.centerY).to.closeTo(0, 0.01);
    });

    it('should be convex', function () {
        let polygon = algo.generateRandomConvexPolygon(10, 1);
        for (let point of polygon.points) {
            console.log("(" + point.x.toFixed(2) + "," + point.y.toFixed(2) + ")");

        }
        expect(algo.isConvex(polygon.points)).to.be.true;
    });

    it('should be sized', function () {
        for (let i = 0; i < 10; i ++) {
            let polygon = algo.generateRandomConvexPolygon(10, 10);
            expect(polygon.getAABB().left).to.lessThan(0);
            expect(polygon.getAABB().left).to.greaterThan(-5);
            expect(polygon.getAABB().right).to.lessThan(5);
            expect(polygon.getAABB().right).to.greaterThan(0);
            expect(polygon.getAABB().bottom).to.lessThan(0);
            expect(polygon.getAABB().bottom).to.greaterThan(-5);
            expect(polygon.getAABB().top).to.lessThan(5);
            expect(polygon.getAABB().top).to.greaterThan(0);
        }
    });
});


describe('algo.isConvex', function() {
    it('should work', function () {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0),new Vector(10,0),new Vector(10,10),new Vector(5,5),new Vector(0,10)
        ]);
        expect(algo.isConvex(polygon.points)).to.be.false;
        expect(algo.isConvex(polygon.points, 0, 4)).to.be.true;
        expect(algo.isConvex(polygon.points, 1, 4)).to.be.true;
    });


    it('should work with colinear edge polygon', function () {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0), new Vector(5,0), new Vector(10,0), new Vector(10,5),
            new Vector(10,10),new Vector(5,5),new Vector(0,10),new Vector(0,5)
        ]);
        expect(algo.isConvex(polygon.points)).to.be.false;
        expect(algo.isConvex(polygon.points, 0, 5)).to.be.true;
    });
});

