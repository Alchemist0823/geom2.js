export interface Comparable<T> {
    // < is min queue
    compare(other: T): boolean;
}

// implement using
export class PriorityQueue<T extends Comparable<T>> {
    items: Array<T>;
    size: number;

    constructor() {
        this.items = [];
        this.size = 0;
    }

    enqueue(item: T) {
        this.items.push(item);
        this.sink(this.items.length - 1);
    }

    sink(index: number) {
        const item = this.items[index];
        // sink the current node to base
        while (index > 0 && item.compare(this.items[Math.floor((index - 1) / 2)])) {
            this.items[index] = this.items[Math.floor((index - 1) / 2)];
            index = Math.floor((index - 1) / 2);
        }
        this.items[index] = item;
    }

    dequeue(): T {
        const result = this.items[0];
        let cur = 0;

        // fill the bottom
        // does the current node has child
        while(cur * 2 + 1 < this.items.length) {
            if (cur * 2 + 2 >= this.items.length ||
                this.items[cur * 2 + 1].compare(this.items[cur * 2 + 2])) {
                this.items[cur] = this.items[cur * 2 + 1];
                cur = cur * 2 + 1;
            } else {
                this.items[cur] = this.items[cur * 2 + 2];
                cur = cur * 2 + 2;
            }
        }
        if (cur < this.items.length - 1) {
            this.items[cur] = this.items[this.items.length - 1];
            this.sink(cur);
        }
        this.items.pop();
        return result;
    }
}
