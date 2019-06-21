import * as util from "../src/util";
import {Polygon, Vector as V} from "../src"
import {angleNormalize, angleNormalizePI2} from "../src/util";


describe('angle', function() {
    it('angleNormalizePI2', function () {
        expect(angleNormalizePI2(12)).toBeCloseTo(12 - Math.PI * 2, 0.00001);
    });

    it('angleNormalize', function () {
        expect(angleNormalize(12)).toBeCloseTo(12 - Math.PI * 4, 0.00001);
    });
});

describe('util.testSegmentSegment', function() {
    it('test general case', function () {
        expect(util.testSegmentSegment(new V(0, 0), new V(1, 1),
            new V(1, 0), new V(0, 1))).toBe(true);
        expect(util.testSegmentSegment(new V(0, 1), new V(1, 1),
            new V(0, 0), new V(1, 0))).toBe(false);
    });

    it('test colinear', function () {
        expect(util.testSegmentSegment(new V(0, 0), new V(1, 1),
            new V(0.5, 0.5), new V(1, 1))).toBe(true);
        expect(util.testSegmentSegment(new V(0, 0), new V(1, 1),
            new V(0.5, 0.5), new V(.8, .8))).toBe(true);
    });

    it('test 1 endpoint touch', function () {
        expect(util.testSegmentSegment(new V(0, 0), new V(1, 1),
            new V(0.5, 0.5), new V(0, 1))).toBe(false);
        expect(util.testSegmentSegment(new V(0.5, 0.5), new V(0, 1),
            new V(0, 0), new V(1, 1))).toBe(false);
    });

});

describe('util.point2segment', function() {
    it('test closest point on segment', function () {
        let cp = new V();
        let dist = util.point2segment(new V(1, 1), new V(0, 2), new V(2, 2), cp);

        expect(dist).toBeCloseTo(1, 0.01);
        expect(cp.x).toBeCloseTo(1, 0.01);
        expect(cp.y).toBeCloseTo(2, 0.01);
    });

    it('test closest point on start', function () {
        let cp = new V();
        let dist = util.point2segment(new V(1, 1), new V(2, 2), new V(3, 2), cp);

        expect(dist).toBeCloseTo(Math.sqrt(2), 0.01);
        expect(cp.x).toBeCloseTo(2, 0.01);
        expect(cp.y).toBeCloseTo(2, 0.01);
    });


    it('test closest point on end', function () {
        let cp = new V();
        let dist = util.point2segment(new V(4, 1), new V(2, 2), new V(3, 2), cp);

        expect(dist).toBeCloseTo(Math.sqrt(2), 0.01);
        expect(cp.x).toBeCloseTo(3, 0.01);
        expect(cp.y).toBeCloseTo(2, 0.01);
    });
});


describe('util.point2polygon', function() {
    it('test closest point on segment', function () {
        let cp = new V();
        let dist = util.point2polygon(new V(1, 1), [
            new V(0, 2), new V(1, 2), new V(2, 1), new V(2, 2), new V(1, 3), new V(0, 3)
        ], cp);

        expect(dist).toBeCloseTo(Math.sqrt(2) / 2, 0.01);
        expect(cp.x).toBeCloseTo(1.5, 0.01);
        expect(cp.y).toBeCloseTo(1.5, 0.01);
    });
});
