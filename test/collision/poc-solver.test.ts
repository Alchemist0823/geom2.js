import {epa, gjk, Polygon, resolvePointsOfContact, Vector} from "../../src";

describe('poc-solver', () => {

    test('Square - Square', () => {
        let square1 = new Polygon(new Vector(10, 10), [
            new Vector(-10, -10), new Vector(10, -10),
            new Vector(10, 10), new Vector(-10, 10),
        ]);

        let square2 = new Polygon(new Vector(0, 0), [
            new Vector(-10, -10), new Vector(10, -10),
            new Vector(10, 10), new Vector(-10, 10),
        ]);

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(square1, square2, simplex)).toBe(true);

        const result = epa(square1, square2, simplex);
        expect(result.normal).toEqual({x: 0, y: -1});
        expect(result.depth).toEqual(10);

        resolvePointsOfContact(square1, square2, result);
        expect(result.contacts.length).toBe(5);
        expect(result.contacts[0]).toEqual({x: 0, y: 10});
        expect(result.contacts[4]).toEqual({x: 10, y: 10});

    });

    test('Triangle Square', () => {
        let triangle = new Polygon(new Vector(0, 0), [
            new Vector(4, 11),
            new Vector(4, 5),
            new Vector(9, 9),
        ]);
        triangle.recenter();

        let square = new Polygon(new Vector(0, 0), [
            new Vector(5, 7), new Vector(7, 3),
            new Vector(10, 2), new Vector(12, 7),

        ]);
        square.recenter();

        const simplex: [Vector,Vector,Vector] = [new Vector(), new Vector(), new Vector()];
        expect(gjk(triangle, square, simplex)).toBe(true);

        const result = epa(triangle, square, simplex);
        const res = new Vector(5, 4).perp().normalize();
        expect(result.normal.x).toBeCloseTo(res.x, 0.00001);
        expect(result.normal.y).toBeCloseTo(res.y, 0.00001);
        expect(result.depth).toBeCloseTo(0.9370425713316364, 0.00001);

        resolvePointsOfContact(triangle, square, result);
        expect(result.contacts.length).toBe(1);
        expect(result.contacts[0]).toEqual({x: 5, y: 7});
    });
});