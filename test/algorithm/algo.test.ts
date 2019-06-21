import * as algo from "../../src/algorithm";
import {Polygon, Vector} from "../../src";

describe('algo.generateRandomConvexPolygon', function() {
    it('should be centered', function () {
        let polygon = algo.generateRandomConvexPolygon(10, 1);
        let box = polygon.getAABB();
        expect(box.centerX).toBeCloseTo(0, 0.01);
        expect(box.centerY).toBeCloseTo(0, 0.01);
    });

    it('should be convex', function () {
        for (let i = 0; i < 100; i ++) {
            let polygon = algo.generateRandomConvexPolygon(10, 1);
            let isConvex = algo.isConvex(polygon.calcPoints);
            expect(isConvex).toBe(true);
        }
    });

    it('should be sized', function () {
        for (let i = 0; i < 10; i ++) {
            let polygon = algo.generateRandomConvexPolygon(10, 10);
            expect(polygon.getAABB().left).toBeLessThan(0);
            expect(polygon.getAABB().left).toBeGreaterThan(-5);
            expect(polygon.getAABB().right).toBeLessThan(5);
            expect(polygon.getAABB().right).toBeGreaterThan(0);
            expect(polygon.getAABB().bottom).toBeLessThan(0);
            expect(polygon.getAABB().bottom).toBeGreaterThan(-5);
            expect(polygon.getAABB().top).toBeLessThan(5);
            expect(polygon.getAABB().top).toBeGreaterThan(0);
        }
    });
});


describe('algo.isConvex', function() {
    it('should work', function () {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0),new Vector(10,0),new Vector(10,10),new Vector(5,5),new Vector(0,10)
        ]);
        expect(algo.isConvex(polygon.calcPoints)).toBe(false);
        expect(algo.isConvex(polygon.calcPoints, 0, 4)).toBe(true);
        expect(algo.isConvex(polygon.calcPoints, 1, 4)).toBe(true);
    });


    it('should work with colinear edge polygon', function () {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0), new Vector(5,0), new Vector(10,0), new Vector(10,5),
            new Vector(10,10),new Vector(5,5),new Vector(0,10),new Vector(0,5)
        ]);
        expect(algo.isConvex(polygon.calcPoints)).toBe(false);
        expect(algo.isConvex(polygon.calcPoints, 0, 5)).toBe(true);
    });
});

describe('algo.makeHull', function () {
    it('should work', function () {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0), new Vector(5,0), new Vector(10,0), new Vector(10,5),
            new Vector(10,10),new Vector(5,5),new Vector(0,10),new Vector(0,5)
        ]);
        let newPoints = algo.makeHull(polygon.calcPoints);
        expect(algo.isConvex(newPoints)).toBe(true);
        expect(newPoints.length).toBe(4);
    })
});
