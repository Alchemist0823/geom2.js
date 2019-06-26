import {Arc, Vector} from "../src";

describe("Arc", () => {
    describe(".contains", () => {
        test("point on Arc", () => {

            let arc = new Arc(new Vector(100, 100), 10, 0, Math.PI / 2);

            expect(arc.contains(new Vector(100, 100))).toBe(false);
            expect(arc.contains(new Vector(100, 110))).toBe(true);
            expect(arc.contains(new Vector(110, 100))).toBe(true);
            expect(arc.contains(new Vector(90, 100))).toBe(false);
        });
    });


    describe(".getAABB", () => {
        test("Math.PI", () => {
            let arc = new Arc(new Vector(100, 100), 10, 0, Math.PI);

            const aabb = arc.getAABB();

            expect(aabb.left).toBe(90);
            expect(aabb.right).toBe(110);
            expect(aabb.bottom).toBe(100);
            expect(aabb.top).toBe(110);
        });

        test("Math.PI / 2", () => {
            let arc = new Arc(new Vector(100, 100), 10, Math.PI / 4, Math.PI / 4 * 3);

            const aabb = arc.getAABB();

            expect(aabb.left).toBeCloseTo(100 - 10 / Math.sqrt(2), 0.001);
            expect(aabb.right).toBeCloseTo(100 + 10 / Math.sqrt(2), 0.001);
            expect(aabb.bottom).toBeCloseTo(100 + 10 / Math.sqrt(2), 0.001);
            expect(aabb.top).toBeCloseTo(110, 0.001);
        });
    });
});