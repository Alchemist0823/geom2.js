import {Vector} from "./vector";


export class TestResult {
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
