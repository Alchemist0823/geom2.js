import {Vector} from "../src";
import {expect} from "chai";

describe("Vector", function() {
    it(".addMul", function() {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.addMul(v2, 2);
        expect(v1).to.eql(new Vector(2, 1));
    });

    it(".subMul", function() {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.subMul(v2, 2);
        expect(v1).to.eql(new Vector(-2, 1));
    });

    it(".dist", function() {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        expect(v1.dist(v2)).to.be.closeTo(Math.sqrt(2), 0.001);
    });

    it(".dist2", function() {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        expect(v1.dist2(v2)).to.be.closeTo(2, 0.001);
    });

    it('.scl', function() {
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