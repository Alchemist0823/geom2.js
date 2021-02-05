import {Vector} from "../src";

describe("Vector", () => {
    test(".addMul", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.addMul(v2, 2);
        expect(v1).toEqual(new Vector(2, 1));
    });

    test(".subMul", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.subMul(v2, 2);
        expect(v1).toEqual(new Vector(-2, 1));
    });

    test(".dist", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        expect(v1.dist(v2)).toBeCloseTo(Math.sqrt(2), 0.001);
    });

    test(".dist2", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        expect(v1.dist2(v2)).toBeCloseTo(2, 0.001);
    });

    test('.scl', () => {
        let v1 = new Vector(5, 5);
        v1.scl(10, 10);
        expect(v1.x).toBe(50);
        expect(v1.y).toBe(50);

        v1.scl(0, 1);
        expect(v1.x).toBe(0);
        expect(v1.y).toBe(50);

        v1.scl(1, 0);
        expect(v1.x).toBe(0);
        expect(v1.y).toBe(0);
    });

    test(".rotate(r)", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.rotate(Math.PI / 2);
        expect(v1.x).toBeCloseTo(-1, 0.0001);
        expect(v1.y).toBeCloseTo(0, 0.0001);
        v2.rotate(Math.PI / 2);
        expect(v2.x).toBeCloseTo(0, 0.0001);
        expect(v2.y).toBeCloseTo(1, 0.0001);
    });


    test(".rotate(r, v)", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        v1.rotate(Math.PI / 2, v2);
        expect(v1.x).toBeCloseTo(0, 0.0001);
        expect(v1.y).toBeCloseTo(-1, 0.0001);
    });

    test(".dotRef", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        let ref = new Vector(0, 0);
        expect(v1.dotRef(v2, ref)).toBeCloseTo(0, 0.00001);

        v1 = new Vector(0, 1);
        v2 = new Vector(0, 1);
        ref = new Vector(0, 0);
        expect(v1.dotRef(v2, ref)).toBeCloseTo(1, 0.00001);
    });


    test(".crossRef", () => {
        let v1 = new Vector(0, 1);
        let v2 = new Vector(1, 0);
        let ref = new Vector(0, 0);
        expect(v1.crossRef(v2, ref)).toBeCloseTo(-1, 0.00001);

        v1 = new Vector(0, 1);
        v2 = new Vector(0, 1);
        ref = new Vector(0, 0);
        expect(v1.crossRef(v2, ref)).toBeCloseTo(0, 0.00001);
    });

    test(".angleTo", () => {
        let v1 = new Vector(0, 4);
        let v2 = new Vector(1, 0);
        expect(v1.angleTo(v2)).toBeCloseTo(-Math.PI/2);

        v1 = new Vector(0, 1);
        v2 = new Vector(-5, 0);
        expect(v1.angleTo(v2)).toBeCloseTo(Math.PI/2);

        v1 = new Vector(0, 1);
        v2 = new Vector(5, 5);
        expect(v1.angleTo(v2)).toBeCloseTo(-Math.PI/4);

        v1 = new Vector(0, 1);
        v2 = new Vector(1, 999999);
        expect(v1.angleTo(v2)).toBeCloseTo(0);

        v1 = new Vector(0, 1);
        v2 = new Vector(0, 5);
        expect(v1.angleTo(v2)).toBeCloseTo(0);

        v1 = new Vector(0, 1);
        v2 = new Vector(0, -1);
        expect(v1.angleTo(v2)).toBeCloseTo(Math.PI);
    });
});