import TestResult from "./test-result";
import Box from "./box";
import Vector from "./vector";

export default interface Shape {
    intersect(shape: Shape, result: TestResult): boolean;
    isPointIn(vector: Vector): boolean;
    getAABB(): Box;
}
