import {LQTree} from '../../src/container/lq-tree';
import {AABB} from '../../src/aabb';
import { performance, PerformanceObserver } from 'perf_hooks';

class NodeObject {
    public id: number;
    constructor() {
        this.id = -1;
    }
    setId(id: number) {
        this.id = id;
    }
    getId() {
        return this.id;
    }
}

describe('Loose QuadTree', () => {

    describe('edge test cases', () => {
        test('insert should adjust parent loose bound', () => {
            let tree = new LQTree(100, 100, 1);
            let node1 = new NodeObject();
            let node2 = new NodeObject();
            let node3 = new NodeObject();
            node1.setId(tree.insert(new AABB(1, 1, 10, 10), node1));
            node2.setId(tree.insert(new AABB(51, 1, 61, 10), node2));
            node3.setId(tree.insert(new AABB(100, 100, 110, 110), node3));
            expect(tree.root.looseBound.left).toBe(1);
            expect(tree.root.looseBound.bottom).toBe(1);
            expect(tree.root.looseBound.right).toBe(110);
            expect(tree.root.looseBound.top).toBe(110);
        });
    });

    describe('Loose QuadTree with branch maxChildren = 1', () => {

        let tree = new LQTree(100, 100, 1);
        let node1 = new NodeObject();
        let node2 = new NodeObject();
        let node3 = new NodeObject();
        let node4 = new NodeObject();

        beforeEach(() => {
            tree = new LQTree(100, 100, 1);
            node1.setId(tree.insert(new AABB(1, 1, 10, 10), node1));
            node2.setId(tree.insert(new AABB(20, 20, 30, 30), node2));
            node3.setId(tree.insert(new AABB(60, 60, 100, 100), node3));
            node4.setId(tree.insert(new AABB(80, 80, 100, 100), node4));
        });

        afterEach(() => {
          // runs after each test in this block
        });

        test('insert', () => {
            expect((tree.root.children![0].children![0].children![0].getElements()[0].data as NodeObject).getId()).toBe(1);
            expect((tree.root.children![0].children![0].children![3].getElements()[0].data as NodeObject).getId()).toBe(2);
            expect((tree.root.children![3].children![3].children![0].getElements()[0].data as NodeObject).getId()).toBe(3);
            expect((tree.root.children![3].children![3].children![3].getElements()[0].data as NodeObject).getId()).toBe(4);

            expect(tree.root.count).toBe(4);
            expect(tree.root.children![0].count).toBe(2);
            expect(tree.root.children![1].count).toBe(0);
            expect(tree.root.children![2].count).toBe(0);
            expect(tree.root.children![3].count).toBe(2);

            //console.log(tree.toString());
        });

        test('delete branch should collapse to leaf', () => {
            tree.delete(node1.getId());
            tree.delete(node2.getId());

            //console.log(tree.toString());
            expect(tree.root.count).toBe(2);
            expect(tree.root.children![0].count).toBe(0);
            expect(tree.root.children![0].children).toBeNull();
            expect(tree.root.children![1].count).toBe(0);
            expect(tree.root.children![2].count).toBe(0);
            expect(tree.root.children![3].count).toBe(2);
        });

        test('search', () => {
            let result: Array<NodeObject> = [];
            tree.getAll(new AABB(80, 80, 100, 100), result);
            expect(result.length).toBe(2);

            result.length = 0;
            tree.getAll(new AABB(0, 0, 100, 100), result);
            expect(result.length).toBe(4);

            result.length = 0;
            tree.getAll(new AABB(20, 20, 90, 90), result);
            expect(result.length).toBe(3);
        });
    });

    describe('Loose QuadTree with point insert', () => {
        test('insert', () => {
            let tree = new LQTree(1000, 1000, 4, 3);
            let nodes: Array<NodeObject> = [];
            for (let i = 0; i < 100; i ++)
                nodes.push(new NodeObject());
            nodes[0].setId(tree.insert(new AABB(1, 1, 1, 1), nodes[0]));
            tree.delete(nodes[0].getId());
            expect(tree.root.count).toBe(0);
            expect(tree.root.getElements().length).toBe(0);
            nodes[0].setId(tree.insert(new AABB(1, 1, 1, 1), nodes[0]));
            tree.delete(nodes[0].getId());
            expect(tree.root.count).toBe(0);
            expect(tree.root.getElements().length).toBe(0);

            for (let i = 0; i < 100; i ++) {
                nodes[i].setId(tree.insert(new AABB(1, 1, 1, 1), nodes[i]));
            }
            expect(tree.root.count).toBe(100);

        });
    });


    describe('Loose QuadTree with layer limitation', () => {

        let tree = new LQTree(1000, 1000, 4, 3);
        let nodes: Array<NodeObject> = [];
        for (let i = 0; i < 100; i ++)
            nodes.push(new NodeObject());

        test('insert', () => {
            for (let i = 0; i < 100; i ++) {
                nodes[i].setId(tree.insert(new AABB(1, 1, 2, 2), nodes[i]));
            }
            expect(tree.root.count).toBe(100);
            expect(tree.root.children![0].children![0].children![0].getElements().length).toBe(100);
        });
    });


    describe('Loose QuadTree with branch maxChildren = 4', () => {
        let tree = new LQTree(1000, 1000, 4);
        let nodes: Array<NodeObject> = [];
        for (let i = 0; i < 100; i ++)
            nodes.push(new NodeObject());

        beforeEach(() => {
            tree = new LQTree(1000, 1000, 4);
        });


        test('insert', () => {
            for (let i = 0; i < 50; i ++) {
                nodes[i * 2].setId(tree.insert(new AABB(i * 20, 100, i * 20 + 10, 100 + 10), nodes[i * 2]));
                nodes[i * 2 + 1].setId(tree.insert(new AABB(i * 20, 120, i * 20 + 10, 120 + 10), nodes[i * 2 + 1]));
            }
            expect(tree.root.count).toBe(100);
        });
    });

    /*
    fs.writeFile("temp.js", tree.toCanvasDraw(), (err: any) => {
        if (err) console.log(err);
        console.log("Successfully Written to File.");
    });*/

    describe('Benchmark QuadTree with branch maxChildren = ?', () => {

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
                nodes.push(new NodeObject());
                aabbs.push(new AABB(0,0,0,0));
            }

            let t0 = performance.now();
            for (let i = 0; i < num; i ++) {
                aabbs[i].left = Math.random() * width - bw;
                aabbs[i].bottom = Math.random() * height - bh;
                aabbs[i].right = aabbs[i].left + Math.random() * bw;
                aabbs[i].top = aabbs[i].bottom + Math.random() * bh;
                nodes[i].setId(tree.insert(aabbs[i], nodes[i]));
            }
            let t1 = performance.now();
            //console.log('insert: ' + (t1 - t0));
            expect(tree.root.count).toBe(num);

            let totalDeleteTime = 0;
            let totalReinsertTime = 0;
            let totalSearchTime = 0;
            for (let k = 0; k < iteration; k ++) {
                t0 = performance.now();
                for (let i = 0; i < num; i++) {
                    tree.delete(nodes[i].getId());
                }
                t1 = performance.now();
                totalDeleteTime += t1 - t0;
                expect(tree.root.count).toBe(0);

                t0 = performance.now();
                for (let i = 0; i < num; i ++) {
                    aabbs[i].left = Math.random() * width - bw;
                    aabbs[i].bottom = Math.random() * height - bh;
                    aabbs[i].right = aabbs[i].left + Math.random() * bw;
                    aabbs[i].top = aabbs[i].bottom + Math.random() * bh;
                    nodes[i].setId(tree.insert(aabbs[i], nodes[i]));
                }
                t1 = performance.now();
                totalReinsertTime += t1 - t0;
                expect(tree.root.count).toBe(num);

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

        test('maxChildren = 100', ()=>benchmark(100));
        test('maxChildren = 24', ()=>benchmark(24));
        test('maxChildren = 10', ()=>benchmark(10));
        test('maxChildren = 5', ()=>benchmark(4));
    });
});
