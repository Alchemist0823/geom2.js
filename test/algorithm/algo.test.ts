import * as algo from "../../src/algorithm";
import {Polygon, Vector} from "../../src";
import {PartitionPolygon} from "../../src/algorithm/poly-partition";

describe('algo.generateRandomConvexPolygon', () => {
    test('should be centered', () => {
        let polygon = algo.generateRandomConvexPolygon(10, 1);
        let box = polygon.getAABB();
        expect(box.centerX).toBeCloseTo(0, 0.01);
        expect(box.centerY).toBeCloseTo(0, 0.01);
    });

    test('should be convex', () => {
        for (let i = 0; i < 100; i ++) {
            let polygon = algo.generateRandomConvexPolygon(10, 1);
            let isConvex = algo.isConvex(polygon.calcPoints);
            expect(isConvex).toBe(true);
        }
    });

    test('should be sized', () => {
        for (let i = 0; i < 10; i ++) {
            let polygon = algo.generateRandomConvexPolygon(10, 10);
            //console.log(polygon.calcPoints);
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


describe('algo.isConvex', () => {
    test('should work', () => {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0),new Vector(10,0),new Vector(10,10),new Vector(5,5),new Vector(0,10)
        ]);
        expect(algo.isConvex(polygon.calcPoints)).toBe(false);
        expect(algo.isConvex(polygon.calcPoints, 0, 4)).toBe(true);
        expect(algo.isConvex(polygon.calcPoints, 1, 4)).toBe(true);
    });


    test('should work with colinear edge polygon', () => {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0), new Vector(5,0), new Vector(10,0), new Vector(10,5),
            new Vector(10,10),new Vector(5,5),new Vector(0,10),new Vector(0,5)
        ]);
        expect(algo.isConvex(polygon.calcPoints)).toBe(false);
        expect(algo.isConvex(polygon.calcPoints, 0, 5)).toBe(true);
    });
});

describe('algo.makeHull', () => {
    test('should work', () => {
        let polygon = new Polygon(new Vector(), [
            new Vector(0,0), new Vector(5,0), new Vector(10,0), new Vector(10,5),
            new Vector(10,10),new Vector(5,5),new Vector(0,10),new Vector(0,5)
        ]);
        let newPoints = algo.makeHull(polygon.calcPoints);
        expect(algo.isConvex(newPoints)).toBe(true);
        expect(newPoints.length).toBe(4);
    })
});

describe('algo.removeHole', () => {
    test('should work', () => {
        let outterPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(0,0),
                new Vector(10,0),
                new Vector(10,10),
                new Vector(0,10),
            ]);
        let innerPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(1,1),
                new Vector(1,2),
                new Vector(2,1),
            ],
            true);
        let polys = [outterPolygon, innerPolygon];
        expect(algo.removeHoles(polys)).toBe(true);
        expect(polys.length).toBe(1);
        expect(polys[0].calcPoints).toStrictEqual([
            new Vector(0,0),
            new Vector(10,0),
            new Vector(2,1),
            new Vector(1,1),
            new Vector(1,2),
            new Vector(2,1),
            new Vector(10,0),
            new Vector(10,10),
            new Vector(0,10),]);
    })
});

describe('algo.triangulateEC', () => {
    test('should work', () => {
        let inputPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(170,75),
                new Vector(179,87),
                new Vector(178,108),
                new Vector(180,125),
                new Vector(190,138),
                new Vector(212,144),
                new Vector(230,99),
                new Vector(230,80),
                new Vector(254,79),
                new Vector(254,98),
                new Vector(235,163),
                new Vector(212,173),
                new Vector(170,172),
            ]);

        let polys = algo.triangulateEC(inputPolygon);
        expect(polys.length).toBe(11);
    })
});

describe('algo.convexPartitionHM', () => {
    test('should work', () => {
        let inputPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(170,75),
                new Vector(179,87),
                new Vector(178,108),
                new Vector(180,125),
                new Vector(190,138),
                new Vector(212,144),
                new Vector(230,99),
                new Vector(230,80),
                new Vector(254,79),
                new Vector(254,98),
                new Vector(235,163),
                new Vector(212,173),
                new Vector(170,172),
            ]);

        let polys = algo.convexPartitionHM(inputPolygon);
        expect(polys.length).toBe(6);
    })
});

describe('algo.convexPartitionHMList', () => {
    test('should work', () => {
        let outPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(170,75),
                new Vector(179,87),
                new Vector(178,108),
                new Vector(180,125),
                new Vector(190,138),
                new Vector(212,144),
                new Vector(230,99),
                new Vector(230,80),
                new Vector(254,79),
                new Vector(254,98),
                new Vector(235,163),
                new Vector(212,173),
                new Vector(170,172),
            ]);
        let holePolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(220,166),
                new Vector(205,148),
                new Vector(180,150),
                new Vector(179,160),
            ], true);

        let polys = algo.convexPartitionHMList([outPolygon, holePolygon]);
        expect(polys.length).toBe(9);
        // for(let poly of polys)
        //     for (let point of poly.calcPoints) console.error(point);
    })
});
