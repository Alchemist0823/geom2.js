import {Shape} from "./shape";
import {Vector} from "./vector";
import {AABB} from "./aabb";
import { Polygon } from "./polygon";
import { Circle } from "./circle";
import { Transform } from "./transform";

export class ComposedShape implements Shape {

  public transform: Transform;
  //private localTransforms: Array<Transform> = [];

  constructor(public shapes: Array<Polygon | Circle>, subshapeWorldTransform: boolean) {
      if (subshapeWorldTransform) {
          let centroid = this.getCentroid();
          this.transform = new Transform(centroid);
      } else {
          this.transform = new Transform(new Vector());
      }
      for(var i = 0; i < shapes.length; i ++) {
          if (subshapeWorldTransform) {
              //this.localTransforms.push(new Transform(shapes.transform));
          }
      }
  };

  public recalc() {
      for (let k = 0; k < this.shapes.length; k++) {
          if (this.shapes[k] instanceof Polygon) {
              (this.shapes[k] as Polygon).recalc();
          }
      }
  }

  // Rotates this polygon counter-clockwise around the center
  public rotate(angle: number, center: Vector = this.transform.position): this {
      for (let k = 0; k < this.shapes.length; k++) {
          this.shapes[k].rotate(angle, center);
      }
      this.transform.rotate(angle, this.transform.position.x, this.transform.position.y);
      return this;
  }

  // Translates this shape by a specified amount
  public translate(x: number, y: number): this {
      for (let k = 0; k < this.shapes.length; k++) {
          this.shapes[k].translate(x, y);
      }
      this.transform.translate(x, y);
      return this;
  };

  public rotateLocal(angle: number): this {
      return this;
  }

  public translateLocal(x: number, y: number): this {
      return this;
  };

  public isPointIn(vector: Vector): boolean {
      for (let k = 0; k < this.shapes.length; k++) {
          if (this.shapes[k].isPointIn(vector))
            return true;
      }
      return false;
  }

  public getArea(): number {
      var area = 0;
      for (let k = 0; k < this.shapes.length; k++) {
          area += this.shapes[k].getArea();
      }
      return area;
  }

  public getCentroid(): Vector {
      let v = new Vector();
      var c = 0;
      for (let k = 0; k < this.shapes.length; k++) {
          let area = this.shapes[k].getArea();
          v.addMul(this.shapes[k].getCentroid(), area);
          c += area;
      }
      v.scl(1.0 / c);
      return v;
  }

  public getOrigin(): Vector {
      return this.transform.position;
  }

  public getAABB(): AABB {
    let aabb = this.shapes[0].getAABB();
    for (let k = 1; k < this.shapes.length; k++) {
        aabb.merge(this.shapes[k].getAABB());
    }
    return aabb;
  }
}
