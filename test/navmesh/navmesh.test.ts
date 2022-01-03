import {NavMesh} from "../../src/navmesh";
import {Vector} from "../../src";

const v2 = (...args: number[]) => new Vector(...args);

describe("NavMesh", () => {

    describe("An empty NavMesh instance", () => {
        let emptyNavMesh: NavMesh;
        beforeAll(() => (emptyNavMesh = new NavMesh([])));

        it("should not throw an error on construction", () => {
            expect(() => emptyNavMesh).not.toThrow();
        });

        it("should always return null when queried for a path", () => {
            const path = emptyNavMesh.findPath(v2(10, 20), v2(30, 50));
            expect(path).toBeNull();
        });
    });

    describe("A simple, fully connected NavMesh instance", () => {
        let navMesh: NavMesh;
        /*
          - - - - -
          - 1 - 2 -
          - - - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(10, 0), v2(20, 0), v2(20, 10), v2(10, 10)] // 2
        ];
        beforeAll(() => (navMesh = new NavMesh(polygons)));

        it("should return a direct path when points are in the same polygon", () => {
            const path = navMesh.findPath(v2(0, 0), v2(5, 5));
            expect(path).toEqual([v2(0, 0), v2(5, 5)]);
        });

        it("should return null when a point is outside all polygon", () => {
            const path = navMesh.findPath(v2(-10, 0), v2(5, 5));
            expect(path).toBeNull();
        });

        it("should return a path when points are in neighboring polygons", () => {
            const path = navMesh.findPath(v2(5, 5), v2(15, 5));
            expect(path).toEqual([v2(5, 5), v2(15, 5)]);
        });

        it("should return a path when points are on the edges of the polygons", () => {
            const path = navMesh.findPath(v2(0, 0), v2(20, 10));
            expect(path).toEqual([v2(0, 0), v2(20, 10)]);
        });
    });

    describe("A NavMesh instance with two islands", () => {
        let navMesh: NavMesh;
        /*
          - - -   - - -
          - 1 -   - 2 -
          - - -   - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(40, 0), v2(50, 0), v2(50, 10), v2(40, 10)], // 2
        ];
        beforeAll(() => (navMesh = new NavMesh(polygons)));

        it("should return null when queried for a path between islands", () => {
            const path = navMesh.findPath(v2(0, 0), v2(40, 0));
            expect(path).toBeNull();
        });
    });

    describe("A NavMesh instance with a corner", () => {
        let navMesh: NavMesh;
        /*
          - - - - -
          - 1 - 2 -
          - - - - -
              - 3 -
              - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(10, 0), v2(20, 0), v2(20, 10), v2(10, 10)], // 2
            [v2(10, 10), v2(20, 10), v2(20, 20), v2(10, 20)] // 3
        ];
        beforeAll(() => (navMesh = new NavMesh(polygons)));

        it("should return a path that hugs the corner", () => {
            const path = navMesh.findPath(v2(0, 0), v2(10, 20));
            expect(path).toEqual([v2(0, 0), v2(10, 10), v2(10, 20)]);
        });
    });


    describe("A NavMesh instance with triangles", () => {
        let navMesh: NavMesh;
        /*
                    -
                    -
          - - -     - 5
          - 1 - 2   - -
          - - - - - - - -
              - 3 - - 4 -
              - - - - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(10, 0), v2(20, 10), v2(10, 10)], // 2
            [v2(10, 10), v2(20, 10), v2(20, 20), v2(10, 20)],// 3
            [v2(20, 10), v2(30, 10), v2(30, 20), v2(20, 20)],// 4
            [v2(20, -10), v2(30, 10), v2(20, 10)],// 5
        ];
        beforeAll(() => (navMesh = new NavMesh(polygons)));

        it("should return a path that hugs the corner", () => {
            const path = navMesh.findPath(v2(0, 0), v2(20, -10));
            expect(path).toEqual([v2(0, 0), v2(20, 10), v2(20, -10)]);
        });
    });

    describe("#getReachableNearTarget", () => {

        let navMesh: NavMesh;
        /*
                    -
                    -
          - - -     - 5
          - 1 - 2   - -
          - - - - - - - -
              - 3 - - 4 -
              - - - - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(10, 0), v2(20, 10), v2(10, 10)], // 2
            [v2(10, 10), v2(20, 10), v2(20, 20), v2(10, 20)],// 3
            [v2(20, 10), v2(30, 10), v2(30, 20), v2(20, 20)],// 4
            [v2(20, -10), v2(30, 10), v2(20, 10)],// 5
        ];

        beforeAll(() => (navMesh = new NavMesh(polygons)));
        it("should return the point in navMesh", () => {
            const targetPoint = navMesh.getReachableNearTarget(new Vector(10, 10), 1, 1);
            expect(targetPoint).toEqual(v2(10, 10));
        });


        it("should return the point in navmesh that is the closest to target", () => {
            const targetPoint = navMesh.getReachableNearTarget(new Vector(0, -10), 22, 22);
            expect(targetPoint).toEqual(v2(0, 0));
        });
    });

    describe("A NavMesh instance with holes", () => {
        let navMesh: NavMesh;
        /*
                    -
              6 - - -
          - - - - - - 5
          - 1 - 2   - -
          - - - - - - - -
              - 3 - - 4 -
              - - - - - -
        */
        // prettier-ignore
        const polygons = [
            [v2(0, 0), v2(10, 0), v2(10, 10), v2(0, 10)], // 1
            [v2(10, 0), v2(20, 10), v2(10, 10)], // 2
            [v2(10, 10), v2(20, 10), v2(20, 20), v2(10, 20)],// 3
            [v2(20, 10), v2(30, 10), v2(30, 20), v2(20, 20)],// 4
            [v2(20, -10), v2(30, 10), v2(20, 10), v2(20, 0)],// 5
            [v2(0, 0), v2(20, -10), v2(20, 0), v2(10, 0)],// 6
        ];
        beforeAll(() => (navMesh = new NavMesh(polygons)));

        it("should return a straight line", () => {
            const path = navMesh.findPath(v2(0, 0), v2(25, 5));
            expect(path).toEqual([v2(0, 0), v2(20, 0), v2(25, 5)]);
        });
    });
});
