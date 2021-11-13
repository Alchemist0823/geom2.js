import {AABB} from '../aabb';
import {Segment} from "../segment";

class LQTreeElement<T> {
    public aabb: AABB;
    public data: T;

    public constructor (aabb: AABB, data: T) {
        this.aabb = aabb;
        this.data = data;
    }
}

class LQTreeNode<T> {
    public children: [LQTreeNode<T>, LQTreeNode<T>, LQTreeNode<T>, LQTreeNode<T>] | null;
    public baseBound: AABB;
    public count: number;
    // only if the count > 0, looseBound has meaning.
    public looseBound: AABB;
    protected elements: Array<LQTreeElement<T>>;

    public constructor(minX: number, minY: number, maxX: number, maxY: number) {
        this.children = null;
        this.baseBound = new AABB(minX, minY, maxX, maxY);
        this.looseBound = new AABB(0, 0, 0, 0);
        this.elements = [];
        this.count = 0;
    }

    public extendLooseBound(result: AABB) {
        if (this.count > 0)
            result.merge(this.looseBound);
    }

    public contains(aabb: AABB): boolean {
        if (this.count > 0)
            return this.looseBound.contains(aabb);
        return false;
    }

    public intersects(aabb: AABB): boolean {
        if (this.count > 0)
            return aabb.intersects(this.looseBound);
        return false;
    }

    public getRegion(aabb: AABB) {
        let index = 0;
        if (aabb.centerX > this.baseBound.centerX)
            index += 2;
        if (aabb.centerY > this.baseBound.centerY)
            index += 1;
        return index;
    }

    public addElement(element: LQTreeElement<T>) {
        this.elements.push(element);
        if (this.elements.length == 1)
            this.looseBound.set(element.aabb);
        this.looseBound.merge(element.aabb);
    }

    public recalcBound() {
        if (this.children === null) {
            // leaf
            if (this.elementCount > 0) {
                this.looseBound.set(this.elements[0].aabb);
                for (let i = 1; i < this.elements.length; i++) {
                    this.looseBound.merge(this.elements[i].aabb);
                }
            }
        } else {
            // branch
            for (let i = 0; i < 3; i ++) {
                this.children[i].extendLooseBound(this.looseBound);
            }
        }
    }

    public get elementCount() {
        return this.elements.length;
    }

    public getElements() {
        return this.elements;
    }

    public removeElement(element: LQTreeElement<T>): boolean {
        for (let i = 0; i < this.elements.length; i ++) {
            if (element === this.elements[i]) {
                this.elements.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    public clearElements() {
        this.elements.length = 0;
    }


    public toString(indentNum: number = 0): string {
        let str = '';
        let indent = '';
        for (let i = 0; i < indentNum; i ++) indent += ' ';

        str += indent + 'count: ' + this.count + '\n';
        str += indent + 'baseBound: ' + this.baseBound + '\n';
        str += indent + 'looseBound: ' + this.looseBound + '\n';
        if (this.children === null) {
            str += indent + 'element: \n';
            for (let element of this.elements) {
                str += indent + '  ' + element.aabb + ' data: ' + element.data + '\n';
            }
        } else {
            for (let i = 0; i < 4; i ++) {
                str += indent + 'node' + i + ':\n' + this.children[i].toString(indentNum + 2);
            }
        }
        return str;
    }
    public toCanvasParameter(aabb :AABB) {
        return aabb.left + ', ' + aabb.bottom + ', ' + (aabb.right - aabb.left) + ', ' + (aabb.top - aabb.bottom);
    }

    public toCanvasDraw() {
        let str = '';
        str += 'ctx.beginPath();';
        str += 'ctx.strokeStyle = "green";\n';
        str += 'ctx.rect(' + this.toCanvasParameter(this.baseBound) + ');\n';
        str += 'ctx.stroke();\n';
        if (this.count > 0) {
            str += 'ctx.beginPath();';
            str += 'ctx.strokeStyle = "blue";\n';
            str += 'ctx.rect(' + this.toCanvasParameter(this.looseBound) + ');\n';
            str += 'ctx.stroke();\n';
        }
        if (this.children === null) {
            str += 'ctx.beginPath();';
            str += 'ctx.strokeStyle = "red";\n';
            for (let element of this.elements) {
                str += 'ctx.rect(' + this.toCanvasParameter(element.aabb) + ');\n';
            }
            str += 'ctx.stroke();\n';
        } else {
            for (let i = 0; i < 4; i ++) {
                str += this.children[i].toCanvasDraw();
            }
        }
        return str;
    }
}

/**
 * Loose QuadTree
 */
export class LQTree<T> {
    public readonly maxChildren: number;
    public readonly maxLayer: number;
    public root: LQTreeNode<T>; // public for testing
    public idGenerator: number;
    protected elementMap: Map<number, LQTreeElement<T>>;

    public constructor(width: number, height: number, maxChildren: number = 4, maxLayer: number = 10) {
        this.root = new LQTreeNode(0, 0, width, height);
        this.elementMap = new Map();
        this.maxChildren = maxChildren;
        this.maxLayer = maxLayer;
        this.idGenerator = 1;
    }

    public insert(aabb: AABB, data:T) {
        let element = new LQTreeElement(aabb, data);
        this.insertNode(this.root, element, 0);
        this.elementMap.set(this.idGenerator, element);
        this.idGenerator ++;
        return this.idGenerator - 1;
    }

    protected insertNode(node: LQTreeNode<T>, element: LQTreeElement<T>, layer: number) {
        if (node.children === null) {
            node.addElement(element);
            if (node.elementCount > this.maxChildren && layer < this.maxLayer)
                this.split(node, layer + 1);
        } else {
            let index = node.getRegion(element.aabb);
            this.insertNode(node.children[index], element, layer + 1);
            node.looseBound.merge(element.aabb);
        }
        node.count ++;
    }

    public split(node: LQTreeNode<T>, layer: number) {
        node.children = [
            new LQTreeNode(node.baseBound.left, node.baseBound.bottom, node.baseBound.centerX, node.baseBound.centerY),
            new LQTreeNode(node.baseBound.left, node.baseBound.centerY, node.baseBound.centerX, node.baseBound.top),
            new LQTreeNode(node.baseBound.centerX, node.baseBound.bottom, node.baseBound.right, node.baseBound.centerY),
            new LQTreeNode(node.baseBound.centerX, node.baseBound.centerY, node.baseBound.right, node.baseBound.top)
        ];
        for (let element of node.getElements()) {
            let index = node.getRegion(element.aabb);
            node.children[index].addElement(element);
            node.children[index].count ++;

            if (node.children[index].elementCount > this.maxChildren && layer < this.maxLayer) {
                this.split(node.children[index], layer + 1);
            }
        }
        node.clearElements();
    }

    public delete(id: number) {
        let element = this.elementMap.get(id);
        if (element !== undefined) {
            if (this.deleteInNode(this.root, element)) {
                this.elementMap.delete(id);
                return true;
            }
            return false;
        }
        return false;
    }

    protected deleteInNode(node: LQTreeNode<T>, element: LQTreeElement<T>): boolean {
        if (node.children === null) {
            // leaf
            if (node.removeElement(element)) {
                node.count --;
                node.recalcBound();
                return true;
            }
            return false;
        } else {
            // branch
            let index = node.getRegion(element.aabb);
            let succeed = this.deleteInNode(node.children[index], element);
            if (succeed) {
                node.count --;
                if (node.count > 0)
                    node.recalcBound();
                else {
                    // no node in children, convert to leaf
                    node.children = null;
                }
            }
            return succeed;
        }
    }

    public getAll(query: AABB, result: Array<T>): Array<T>{
        this.searchNode(this.root, query, (data:T) => {
            result.push(data);
            return false;
        });
        return result;
    }

    // callBack if return true stop search
    public search(query: AABB, callBack: (data:T) => boolean) {
        this.searchNode(this.root, query, callBack);
    }

    // callBack if return true stop search
    public searchSeg(query: Segment, callBack: (data:T) => boolean) {
        this.searchNodeSeg(this.root, query, callBack);
    }

    protected searchNode(node: LQTreeNode<T>, query: AABB, callBack: (data:T)=>boolean) {
        if (node.children === null) {
            for (let element of node.getElements()) {
                if (query.intersects(element.aabb)) {
                    if (callBack(element.data)) {
                        return true;
                    }
                }
            }
        } else {
            for (let i = 0; i < 4; i ++) {
                if (node.children[i].intersects(query)) {
                    let stop = this.searchNode(node.children[i], query, callBack);
                    if (stop) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    protected searchNodeSeg(node: LQTreeNode<T>, query: Segment, callBack: (data:T)=>boolean) {
        if (node.children === null) {
            for (let element of node.getElements()) {
                if (AABB.fromSegment(query).intersects(element.aabb)) {
                    if (callBack(element.data)) {
                        return true;
                    }
                }
            }
        } else {
            for (let i = 0; i < 4; i ++) {
                if (node.children[i].intersects(AABB.fromSegment(query))) {
                    let stop = this.searchNodeSeg(node.children[i], query, callBack);
                    if (stop) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public toString() {
        return this.root.toString(0);
    }

    public toCanvasDraw() {
        let str = '';
        str += 'const canvas = document.getElementById("canvas")\n';
        str += 'const ctx = canvas.getContext("2d");\n';
        return str + this.root.toCanvasDraw();
    }

}
