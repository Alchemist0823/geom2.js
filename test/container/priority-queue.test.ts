import {Comparable, PriorityQueue} from "../../src/container/priority-queue";

class NumberItem implements Comparable {
    constructor(public value: number) {
    }
    compare(other: NumberItem): boolean {
        return this.value < other.value;
    }
}

describe('Priority Queue', () => {
    describe('enqueue', () => {
        test('', () => {
            const queue = new PriorityQueue<NumberItem>();
            queue.enqueue(new NumberItem(7));
            queue.enqueue(new NumberItem(3));
            queue.enqueue(new NumberItem(9));
            queue.enqueue(new NumberItem(6));
            queue.enqueue(new NumberItem(4));
            queue.enqueue(new NumberItem(5));
            queue.enqueue(new NumberItem(1));
            queue.enqueue(new NumberItem(2));

            expect(queue.items[0].value).toBe(1);
            expect(queue.items[1].value).toBe(2);
            expect(queue.items[2].value).toBe(3);
            expect(queue.items[3].value).toBe(4);
            expect(queue.items[4].value).toBe(6);
            expect(queue.items[5].value).toBe(9);
            expect(queue.items[6].value).toBe(5);
            expect(queue.items[7].value).toBe(7);
        });
    });

    describe('dequeue', () => {
        test('', () => {
            const queue = new PriorityQueue<NumberItem>();
            queue.enqueue(new NumberItem(7));
            queue.enqueue(new NumberItem(3));
            queue.enqueue(new NumberItem(9));
            queue.enqueue(new NumberItem(6));
            queue.enqueue(new NumberItem(4));
            queue.enqueue(new NumberItem(5));
            queue.enqueue(new NumberItem(1));
            queue.enqueue(new NumberItem(2));

            expect(queue.dequeue().value).toBe(1);
            expect(queue.dequeue().value).toBe(2);
            expect(queue.dequeue().value).toBe(3);

            expect(queue.items[0].value).toBe(4);
            expect(queue.items[1].value).toBe(6);
            expect(queue.items[2].value).toBe(5);
            expect(queue.items[3].value).toBe(7);
            expect(queue.items[4].value).toBe(9);

            expect(queue.dequeue().value).toBe(4);
            expect(queue.dequeue().value).toBe(5);
            expect(queue.dequeue().value).toBe(6);
            expect(queue.dequeue().value).toBe(7);
            expect(queue.dequeue().value).toBe(9);
        });
    });
});
