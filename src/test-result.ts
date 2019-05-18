import Vector from "./vector";
import Shape from "./shape";

export default class TestResult {
    public overlapN: Vector;
    public overlapV: Vector;
    public aInB: boolean;
    public bInA: boolean;
    public overlap: number;

    constructor() {
        this.overlapN = new Vector();
        this.overlapV = new Vector();
        this.aInB = true;
        this.bInA = true;
        this.overlap = Number.MAX_VALUE;
    }
}