import {Vector} from "./vector";

export class Transform {
    /** the cosine of the rotation angle */
    protected cost = 1.0;

    /** the sine of the rotation angle */
    protected sint = 0.0;

    /** The x translation */
    public x = 0.0;

    /** The y translation */
    public y = 0.0;


    public constructor(transform?: Transform | Vector) {
        if (transform instanceof Transform) {
            this.cost = transform.cost;
            this.sint = transform.sint;
            this.x = transform.x;
            this.y = transform.y;
        } else if (transform instanceof Vector) {
            this.cost = 1;
            this.sint = 0;
            this.x = transform.x;
            this.y = transform.y;
        } else {
            this.cost = 1;
            this.sint = 0;
            this.x = 0;
            this.y = 0;
        }
    }

    public rotate(theta: number, x: number, y: number) {
        // pre-compute cos/sin of the given angle
        let cos = Math.cos(theta);
        let sin = Math.sin(theta);

        // perform an optimized version of the matrix multiplication:
        // M(new) = inverse(T) * R * T * M(old)
        let cost = cos * this.cost - sin * this.sint;
        let sint = sin * this.cost + cos * this.sint;
        this.cost = cost;
        this.sint = sint;

        let cx = this.x - x;
        let cy = this.y - y;
        this.x = cos * cx - sin * cy + x;
        this.y = sin * cx + cos * cy + y;
    }

    public set angle(theta: number) {
        this.cost = Math.cos(theta);
        this.sint = Math.sin(theta);
    }

    public set position(pos: Vector) {
        this.x = pos.x;
        this.y = pos.y;
    }

    public translate(x: number, y: number) {
        this.x += x;
        this.y += y;
    }

    public transform(vector: Vector, tv: Vector) {
        let x = vector.x;
        let y = vector.y;
        tv.x = this.cost * x - this.sint * y + this.x;
        tv.y = this.sint * x + this.cost * y + this.y;
        return tv;
    }

    public inverseTransform(vector: Vector, tv: Vector) {
        let tx = vector.x - this.x;
        let ty = vector.y - this.y;
        tv.x = this.cost * tx + this.sint * ty;
        tv.y = -this.sint * tx + this.cost * ty;
        return tv;
    }

}