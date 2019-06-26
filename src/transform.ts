import {Vector} from "./vector";

export class Transform {
    /** the cosine of the rotation angle */
    protected cost = 1.0;

    /** the sine of the rotation angle */
    protected sint = 0.0;

    /** The x,y translation */
    public _pos: Vector = new Vector();


    public constructor(transform?: Transform | Vector) {
        if (transform instanceof Transform) {
            this.cost = transform.cost;
            this.sint = transform.sint;
            this._pos.x = transform._pos.x;
            this._pos.y = transform._pos.y;
        } else if (transform instanceof Vector) {
            this.cost = 1;
            this.sint = 0;
            this._pos.x = transform.x;
            this._pos.y = transform.y;
        } else {
            this.cost = 1;
            this.sint = 0;
            this._pos.x = 0;
            this._pos.y = 0;
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

        let cx = this._pos.x - x;
        let cy = this._pos.y - y;
        this._pos.x = cos * cx - sin * cy + x;
        this._pos.y = sin * cx + cos * cy + y;
    }

    public set angle(theta: number) {
        this.cost = Math.cos(theta);
        this.sint = Math.sin(theta);
    }

    public set position(pos: Vector) {
        this._pos.set(pos);
    }

    public get position(): Vector {
        return this._pos;
    }

    public get x() {
        return this._pos.x;
    }

    public get y() {
        return this._pos.y;
    }

    public translate(x: number, y: number) {
        this._pos.x += x;
        this._pos.y += y;
    }

    public transform(vector: Vector, tv: Vector) {
        let x = vector.x;
        let y = vector.y;
        tv.x = this.cost * x - this.sint * y + this._pos.x;
        tv.y = this.sint * x + this.cost * y + this._pos.y;
        return tv;
    }

    public inverseTransform(vector: Vector, tv: Vector) {
        let tx = vector.x - this._pos.x;
        let ty = vector.y - this._pos.y;
        tv.x = this.cost * tx + this.sint * ty;
        tv.y = -this.sint * tx + this.cost * ty;
        return tv;
    }

}