import * as algo from "../../src/algorithm";
import {Polygon, Segment, Vector} from "../../src";
import {PartitionPolygon} from "../../src/algorithm/poly-partition";
import {preprocessIntersection, UnionPolygon, unionPolygons} from "../../src/algorithm";

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
    })
});

describe('algo.removeHole', () => {
    test('adjacent hole', () => {
        let outPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(-1000,-1000),
                new Vector(5000,-1000),
                new Vector(5000,5000),
                new Vector(-1000,5000),
            ]);
        let holePolygon1 = new PartitionPolygon(new Vector(),
            [
                new Vector(3000,100),
                new Vector(3000,0),
                new Vector(0,0),
                new Vector(0,100),
            ], true);
        let holePolygon2 = new PartitionPolygon(new Vector(),
            [
                new Vector(3000,100),
                new Vector(2900,100),
                new Vector(2900,3000),
                new Vector(3000,3000),
            ], true);
        let holePolygon3 = new PartitionPolygon(new Vector(),
            [
                new Vector(100,2900),
                new Vector(100,3000),
                new Vector(3000,3000),
                new Vector(3000,2900),
            ], true);
        let polys = [holePolygon1, holePolygon2, holePolygon3, outPolygon];
        expect(algo.removeHoles(polys)).toBe(true);;
        expect(polys.length).toBe(1);
        expect(polys[0].calcPoints.length).toBe(22);
        expect(polys[0].calcPoints).toStrictEqual([
            new Vector(-1000,-1000),
            new Vector(5000,-1000),
            new Vector(3000,100),
            new Vector(3000,0),
            new Vector(0,0),
            new Vector(0,100),
            new Vector(3000,100),
            new Vector(5000,-1000),
            new Vector(5000,5000),
            new Vector(3000,100),
            new Vector(2900,100),
            new Vector(2900,3000),
            new Vector(3000,3000),
            new Vector(3000,100),
            new Vector(5000,5000),
            new Vector(3000,3000),
            new Vector(3000,2900),
            new Vector(100,2900),
            new Vector(100,3000),
            new Vector(3000,3000),
            new Vector(5000,5000),
            new Vector(-1000,5000),]);
    })
});

describe('algo.getEnlargedPolygon', () => {
    test('should work', () => {
        let outPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(-4,4),
                new Vector(-4,-4),
                new Vector(4,-4),
                new Vector(4,4),
            ]);

        let points = algo.getEnlargedPolygon(outPolygon.calcPoints, 1);
        expect(points[0].x).toBeCloseTo(-4.414213562373098);
        expect(points[0].y).toBeCloseTo(5);
    })

    test('should work 1', () => {
        let outPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(702.537317276001,11388.220491409302),
                new Vector(701.9085550308228,11387.933893203735),
                new Vector(687.5196647644043,11364.027523994446),
            ]);

        let points = algo.getEnlargedPolygon(outPolygon.calcPoints, 18);
        expect(points.length).toEqual(6);
    })

    test('should work 2', () => {
        let outPolygon = new PartitionPolygon(new Vector(),
            [
                new Vector(15,25),
                new Vector(14,24),
                new Vector(0,0),
            ]);

        let points = algo.getEnlargedPolygon(outPolygon.calcPoints, 18);
        expect(points.length).toEqual(6);
    })

});

describe('algo.inCone', () => {
    test('should work', () => {

        let inCone = algo.inCone(
            new Vector(3000, 100),
            new Vector(5000, -1000),
            new Vector(5000, 5000),
            new Vector(3000, 100));
        expect(inCone).toEqual(false);
    })
});

describe('algo.preprocessIntersection', () => {
    test('should work', () => {
        let poly1 = new UnionPolygon(new Vector(), [
            new Vector(0,0), new Vector(10,0), new Vector(10,10), new Vector(0,10)]);
        let poly2 = new UnionPolygon(new Vector(), [
            new Vector(10,10), new Vector(10,0), new Vector(20,0), new Vector(20,10)]);
        let polys = [poly1, poly2];
        preprocessIntersection(polys);
        expect(polys[0].startingVertex!.equalsTo(new Vector(0,0))).toEqual(true);
        expect(polys[0].startingVertex!.intersections.length).toEqual(2);
    })
});

describe('algo.unionPolygons', () => {
    test('adjacent', () => {
        let poly1 = new UnionPolygon(new Vector(), [
            new Vector(0,0), new Vector(10,0), new Vector(10,10), new Vector(0,10)]);
        let poly2 = new UnionPolygon(new Vector(), [
            new Vector(10,10), new Vector(10,0), new Vector(20,0), new Vector(20,10)]);
        let polys = [poly1, poly2];
        let res = unionPolygons(polys);
        expect(res.length).toEqual(1);
        expect(res[0].length).toEqual(4);
    })

    test('coincident intersects', () => {
        let poly1 = new UnionPolygon(new Vector(), [
            new Vector(0,0), new Vector(10,0), new Vector(10,10), new Vector(0,10)]);
        let poly2 = new UnionPolygon(new Vector(), [
            new Vector(5,10), new Vector(5,0), new Vector(20,0), new Vector(20,10)]);
        let polys = [poly1, poly2];
        let res = unionPolygons(polys);
        expect(res.length).toEqual(1);
        //res[0].calcPoints.forEach(p => console.log(p.toString()));
        expect(res[0].length).toEqual(4);
    })

    test('collinear intersects', () => {
        let poly0 = new UnionPolygon(new Vector(), [
            new Vector(1,1), new Vector(2,3), new Vector(1,4)]);
        let poly1 = new UnionPolygon(new Vector(), [
            new Vector(0,0), new Vector(10,0), new Vector(10,10), new Vector(0,10)]);
        let poly2 = new UnionPolygon(new Vector(), [
            new Vector(5,20), new Vector(5,-20), new Vector(20,-20), new Vector(20,20)]);
        let poly3 = new UnionPolygon(new Vector(), [
            new Vector(9,10), new Vector(9,0), new Vector(22,0), new Vector(22,10)]);

        let poly4 = new UnionPolygon(new Vector(), [
            new Vector(-1,-1), new Vector(-2,-1), new Vector(-2,-2), new Vector(-1,-2)]);
        let polys = [poly0, poly1, poly2, poly3, poly4];
        let res = unionPolygons(polys);
        expect(res.length).toEqual(2);
        expect(res[1].length).toEqual(12);
    })

    test('Ignore holes', () => {
        let poly1 = new UnionPolygon(new Vector(), [
            new Vector(0,0), new Vector(10,0), new Vector(10,10), new Vector(0,10)]);
        let poly2 = new UnionPolygon(new Vector(), [
            new Vector(5,5), new Vector(5,-5), new Vector(15,-5), new Vector(15,5)]);
        let poly3 = new UnionPolygon(new Vector(), [
            new Vector(15,5), new Vector(15,10), new Vector(10,10)]);

        let poly4 = new UnionPolygon(new Vector(), [
            new Vector(-1,-1), new Vector(-2,-1), new Vector(-2,-2), new Vector(-1,-2)]);
        let polys = [ poly1, poly2, poly3, poly4];
        let res = unionPolygons(polys);
        expect(res.length).toEqual(2);
        expect(res[1].length).toEqual(6);
    })
});
