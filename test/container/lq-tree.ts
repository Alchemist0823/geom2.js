import {expect} from 'chai';
import {LQTree,  Identifiable} from '../../src/container/lq-tree';
import {AABB} from '../../src/aabb';

class NodeObject implements Identifiable {
    public id: number;
    constructor(id: number) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
}

describe('Loose QuadTree', function() {
    before(function() {
      // runs before all tests in this block
    });

    after(function() {
      // runs after all tests in this block
    });

    describe('Loose QuadTree with branch maxChildren = 1', function() {

        let tree = new LQTree(100, 100, 1);
        let node1 = new NodeObject(1);
        let node2 = new NodeObject(2);
        let node3 = new NodeObject(3);
        let node4 = new NodeObject(4);

        beforeEach(function() {
            tree = new LQTree(100, 100, 1);
            tree.insert(new AABB(1, 1, 10, 10), node1);
            tree.insert(new AABB(20, 20, 30, 30), node2);
            tree.insert(new AABB(60, 60, 100, 100), node3);
            tree.insert(new AABB(80, 80, 100, 100), node4);
        });

        afterEach(function() {
          // runs after each test in this block
        });

        it('insert', function () {
            expect(tree.root.children![0].children![0].children![0].getElements()[0].data.getId()).to.equals(1);
            expect(tree.root.children![0].children![0].children![3].getElements()[0].data.getId()).to.equals(2);
            expect(tree.root.children![3].children![3].children![0].getElements()[0].data.getId()).to.equals(3);
            expect(tree.root.children![3].children![3].children![3].getElements()[0].data.getId()).to.equals(4);

            expect(tree.root.count).to.equals(4);
            expect(tree.root.children![0].count).to.equals(2);
            expect(tree.root.children![1].count).to.equals(0);
            expect(tree.root.children![2].count).to.equals(0);
            expect(tree.root.children![3].count).to.equals(2);

            //console.log(tree.toString());
        });

        it('delete branch should claspe to leaf', function () {
            tree.delete(node1);
            tree.delete(node2);

            //console.log(tree.toString());
            expect(tree.root.count).to.equals(2);
            expect(tree.root.children![0].count).to.equals(0);
            expect(tree.root.children![0].children).to.be.null;
            expect(tree.root.children![1].count).to.equals(0);
            expect(tree.root.children![2].count).to.equals(0);
            expect(tree.root.children![3].count).to.equals(2);
        });

        it('search', function () {
            let result: Array<NodeObject> = [];
            tree.search(new AABB(80, 80, 100, 100), result);
            expect(result.length).to.equals(2);

            result.length = 0;
            tree.search(new AABB(0, 0, 100, 100), result);
            expect(result.length).to.equals(4);

            result.length = 0;
            tree.search(new AABB(20, 20, 90, 90), result);
            expect(result.length).to.equals(3);
        });
    });


    describe('Loose QuadTree with branch maxChildren = 4', function() {
        let tree = new LQTree(1000, 1000, 4);
        let nodes: Array<NodeObject> = [];
        for (let i = 0; i < 100; i ++)
            nodes.push(new NodeObject(i));

        beforeEach(function() {
            tree = new LQTree(1000, 1000, 4);
        });


        it('insert', function () {
            for (let i = 0; i < 50; i ++) {
                tree.insert(new AABB(i * 20, 100, i * 20 + 10, 100 + 10), nodes[i * 2]);
                tree.insert(new AABB(i * 20, 120, i * 20 + 10, 120 + 10), nodes[i * 2 + 1]);
            }
            expect(tree.root.count).to.equals(100);
            //console.log(tree.toCanvasDraw());
        });
    });
});
