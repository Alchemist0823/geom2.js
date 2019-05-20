import {expect} from 'chai';
import * as util from "../src/util";
import {Polygon, Vector} from "../src";

describe('util.point2segment', function() {
    it('test closest point on segment', function () {
        let cp = new Vector();
        let dist = util.point2segment(new Vector(1, 1), new Vector(0, 2), new Vector(2, 2), cp);

        expect(dist).to.closeTo(1, 0.01);
        expect(cp.x).to.closeTo(1, 0.01);
        expect(cp.y).to.closeTo(2, 0.01);
    });

    it('test closest point on start', function () {
        let cp = new Vector();
        let dist = util.point2segment(new Vector(1, 1), new Vector(2, 2), new Vector(3, 2), cp);

        expect(dist).to.closeTo(Math.sqrt(2), 0.01);
        expect(cp.x).to.closeTo(2, 0.01);
        expect(cp.y).to.closeTo(2, 0.01);
    });


    it('test closest point on end', function () {
        let cp = new Vector();
        let dist = util.point2segment(new Vector(4, 1), new Vector(2, 2), new Vector(3, 2), cp);

        expect(dist).to.closeTo(Math.sqrt(2), 0.01);
        expect(cp.x).to.closeTo(3, 0.01);
        expect(cp.y).to.closeTo(2, 0.01);
    });
});


describe('util.point2polygon', function() {
    it('test closest point on segment', function () {
        let cp = new Vector();
        let dist = util.point2polygon(new Vector(1, 1), [
            new Vector(0, 2), new Vector(1, 2), new Vector(2, 1), new Vector(2, 2), new Vector(1, 3), new Vector(0, 3)
        ], cp);

        expect(dist).to.closeTo(Math.sqrt(2) / 2, 0.01);
        expect(cp.x).to.closeTo(1.5, 0.01);
        expect(cp.y).to.closeTo(1.5, 0.01);
    });
});
