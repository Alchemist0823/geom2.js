import {expect} from 'chai';
import {LQTree,  Identifiable} from '../../src/container/lq-tree';
import {AABB} from '../../src/aabb';
import { performance, PerformanceObserver } from 'perf_hooks';
import * as fs from 'fs';

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
            tree.getAll(new AABB(80, 80, 100, 100), result);
            expect(result.length).to.equals(2);

            result.length = 0;
            tree.getAll(new AABB(0, 0, 100, 100), result);
            expect(result.length).to.equals(4);

            result.length = 0;
            tree.getAll(new AABB(20, 20, 90, 90), result);
            expect(result.length).to.equals(3);
        });
    });

    describe('Loose QuadTree with point insert', function() {
        it('insert', function () {
            let tree = new LQTree(1000, 1000, 4, 3);
            let nodes: Array<NodeObject> = [];
            for (let i = 0; i < 100; i ++)
                nodes.push(new NodeObject(i));
            tree.insert(new AABB(1, 1, 1, 1), nodes[0]);
            tree.delete(nodes[0]);
            expect(tree.root.count).to.equals(0);
            expect(tree.root.getElements().length).to.equals(0);
            tree.insert(new AABB(1, 1, 1, 1), nodes[0]);
            tree.delete(nodes[0]);
            expect(tree.root.count).to.equals(0);
            expect(tree.root.getElements().length).to.equals(0);

            for (let i = 0; i < 100; i ++) {
                tree.insert(new AABB(1, 1, 1, 1), nodes[i]);
            }
            expect(tree.root.count).to.equals(100);

        });
    });


    describe('Loose QuadTree with layer limitation', function() {

        let tree = new LQTree(1000, 1000, 4, 3);
        let nodes: Array<NodeObject> = [];
        for (let i = 0; i < 100; i ++)
            nodes.push(new NodeObject(i));

        it('insert', function () {
            for (let i = 0; i < 100; i ++) {
                tree.insert(new AABB(1, 1, 2, 2), nodes[i]);
            }
            expect(tree.root.count).to.equals(100);
            expect(tree.root.children![0].children![0].children![0].getElements().length).to.equals(100);
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
        });
    });

    /*
    fs.writeFile("temp.js", tree.toCanvasDraw(), (err: any) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });*/

    describe('Benchmark QuadTree with branch maxChildren = ?', function() {

        function benchmark(maxChildren: number = 24) {
            const iteration = 3;
            const num = 10000;
            const width = 1000;
            const height = 1000;
            const bw = 20;
            const bh = 20;
            let tree = new LQTree(width, height, maxChildren);
            let nodes: Array<NodeObject> = [];
            let aabbs: Array<AABB> = [];
            for (let i = 0; i < num; i ++) {
                nodes.push(new NodeObject(i));
                aabbs.push(new AABB(0,0,0,0));
            }

            let t0 = performance.now();
            for (let i = 0; i < num; i ++) {
                aabbs[i].left = Math.random() * width - bw;
                aabbs[i].bottom = Math.random() * height - bh;
                aabbs[i].right = aabbs[i].left + Math.random() * bw;
                aabbs[i].top = aabbs[i].bottom + Math.random() * bh;
                tree.insert(aabbs[i], nodes[i]);
            }
            let t1 = performance.now();
            //console.log('insert: ' + (t1 - t0));
            expect(tree.root.count).to.equals(num);

            let totalDeleteTime = 0;
            let totalReinsertTime = 0;
            let totalSearchTime = 0;
            for (let k = 0; k < iteration; k ++) {
                t0 = performance.now();
                for (let i = 0; i < num; i++) {
                    tree.delete(nodes[i]);
                }
                t1 = performance.now();
                totalDeleteTime += t1 - t0;
                expect(tree.root.count).to.equals(0);

                t0 = performance.now();
                for (let i = 0; i < num; i ++) {
                    aabbs[i].left = Math.random() * width - bw;
                    aabbs[i].bottom = Math.random() * height - bh;
                    aabbs[i].right = aabbs[i].left + Math.random() * bw;
                    aabbs[i].top = aabbs[i].bottom + Math.random() * bh;
                    tree.insert(aabbs[i], nodes[i]);
                }
                t1 = performance.now();
                totalReinsertTime += t1 - t0;
                expect(tree.root.count).to.equals(num);

                t0 = performance.now();
                for (let i = 0; i < num; i ++) {
                    //let x = Math.random() * width - bw;
                    //let y = Math.random() * height - bh;
                    let result: Array<NodeObject> = [];
                    tree.getAll(aabbs[i], result);
                }
                t1 = performance.now();
                totalSearchTime += t1 - t0;
            }
            //console.log('delete: ' + totalDeleteTime / iteration);
            //console.log('reinsert: ' + totalReinsertTime / iteration);
            //console.log('search: ' + totalSearchTime  / iteration);
        }

        it('maxChildren = 100', ()=>benchmark(100));
        it('maxChildren = 24', ()=>benchmark(24));
        it('maxChildren = 10', ()=>benchmark(10));
        it('maxChildren = 5', ()=>benchmark(4));
    });
});
