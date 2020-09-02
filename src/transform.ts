import {Vector} from "./vector";
import * as Util from "util";
import {Geom2Const} from "./util";

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

    /**
     * Internal helper method to rotate this {@link Transform} by an angle &thetasym; around a point
     * @param theta theta
     * @param x the x coordinate of the point
     * @param y the y coordinate of the point
     * @since 3.3.1
     */
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
    /**
     * Returns the rotation.
     * @return double angle in the range [-&pi;, &pi;]
     */
    public get angle(): number {
        return Math.atan2(this.sint, this.cost);
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

    /**
     * Sets this transform to the given transform.
     * @param transform the transform to copy
     */
    public set(transform: Transform) {
        this.cost = transform.cost;
        this.sint = transform.sint;
        this._pos.x = transform._pos.x;
        this._pos.y = transform._pos.y;
        return this;
    }

    public mulTransform(transform: Transform) {
        transform.transform(this._pos, this._pos);
        let cost = transform.cost * this.cost - transform.sint * this.sint;
        let sint = transform.sint * this.cost + transform.cost * this.sint;
        this.cost = cost;
        this.sint = sint;
        return this;
    }

    public inverse() {
        let sint = this.sint;
        let cost = this.cost;
        let x = this._pos.x;
        let y = this._pos.y;
        this._pos.x = -sint * y - cost * x;
        this._pos.y = sint * x - cost * y;
        this.sint = -sint;
        return this;
    }

    /* A * B = C
       C * B^(-1) = A
        [cost, -sint, x] [x] = [cost * x - sint * y + x]
        [sint, cost,  y] [y]   [sint * x + cost * y + x]
        [0,    0,     1] [1]   [1]

        [cost, -sint, x] [x] = [cost * x - sint * y + x]
        [sint, cost,  y] [y]   [sint * x + cost * y + x]
        [0,    0,     1] [1]   [1]

        [cost, -sint, x] [coss, -sins, x] = [cost * coss - sint * sins, , cost * x - sint * y + x]
        [sint, cost,  y] [sins, coss,  y]   [sint * coss + cost * sins, , sint * x + cost * y + x]
        [0,    0,     1] [0,    0,     1]   [0, 0, 1]

        [cost, -sint, x] ^1 = [cost,  sint, -sint * y - cost * x]
        [sint, cost,  y]      [-sint, cost, sint * x - cost * y]
        [0,    0,     1]      [0,     0,     1]

     */
    public mulInverseTransform(transform: Transform) {
        return this.mulTransform(transform.clone().inverse());
    }

    public clone() {
        return new Transform(this);
    }

    /**
     * Interpolates linearly by alpha towards the given end transform placing
     * the result in the given transform.
     * <p>
     * Interpolating from one angle to another can have two results depending on the
     * direction of the rotation.  If a rotation was from 30 to 200 the rotation could
     * be 170 or -190.  This interpolation method will always choose the smallest
     * rotation (regardless of sign) as the rotation direction.
     * @param end the end transform
     * @param alpha the amount to interpolate
     * @param result the transform to place the result
     * @since 1.2.0
     */
    public lerp(end: Transform, alpha: number, result: Transform) {
        // interpolate the position
        let x = this.x + alpha * (end.x - this.x);
        let y = this.y + alpha * (end.y - this.y);

        // compute the angle
        // get the start and end rotations
        // its key that these methods use atan2 because
        // it ensures that the angles are always within
        // the range -pi < theta < pi therefore no
        // normalization has to be done
        let rs = this.angle;
        let re = end.angle;
        // make sure we use the smallest rotation
        // as described in the comments above, there
        // are two possible rotations depending on the
        // direction, we always choose the smaller
        let diff = re - rs;
        if (diff < -Math.PI) diff += Geom2Const.PI2;
        if (diff > Math.PI) diff -= Geom2Const.PI2;
        // interpolate
        // its ok if this method produces an angle
        // outside the range of -pi < theta < pi
        // since the rotate method uses sin and cos
        // which are not bounded
        let a = diff * alpha + rs;

        // set the result transform to the interpolated transform
        // the following performs the following calculations:
        // result.identity();
        // result.rotate(a);
        // result.translate(x, y);

        result.cost = Math.cos(a);
        result.sint = Math.sin(a);
        result.position.x   = x;
        result.position.y   = y;
    }

    toString() {
        return `[x:${this.position.x}, y:${this.position.y}, a:${this.angle / Math.PI * 180}]`;
    }
}
