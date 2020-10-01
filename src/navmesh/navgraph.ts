// See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

import {BinaryHeap} from "../structure/binary-heap";

export interface GraphNode {
    astar: AStarNode;
    weight: number;
    getCost(fromNeighbor: GraphNode): number;
    isWall(): boolean;
    neighbors(): Array<GraphNode>;
}

export class AStarNode {
    node: GraphNode;
    f: number = 0;
    g: number = 0;
    h: number = 0;
    visited: boolean = false;
    closed: boolean = false;
    parent: AStarNode|null = null;

    constructor(graphNode: GraphNode) {
        this.node = graphNode;
        this.node.astar = this;
    }

    clean() {
        this.f = 0;
        this.g = 0;
        this.h = 0;
        this.visited = false;
        this.closed = false;
        this.parent = null;
    }
}

/**
 * Graph for javascript-astar. It implements the functionality for astar. See GPS test from astar
 * repo for structure: https://github.com/bgrins/javascript-astar/blob/master/test/tests.js
 *
 * @class NavGraph
 * @private
 */
export class NavGraph {
    private nodes: AStarNode[];
    private dirtyNodes: AStarNode[];
    private heuristic: (n1: GraphNode, n2: GraphNode) => number;

    //return navPolygon1.centroidDistance(navPolygon2);
    constructor(nodes: Array<GraphNode>, navHeuristic: (n1: GraphNode, n2: GraphNode) => number) {
        this.dirtyNodes = [];
        this.nodes = [];
        this.heuristic = navHeuristic;
        for (let i = 0; i < nodes.length; i ++)
            this.nodes.push(new AStarNode(nodes[i]));
    }

    cleanDirty() {
        for (let i = 0; i < this.dirtyNodes.length; i++) {
            this.dirtyNodes[i].clean();
        }
        this.dirtyNodes = [];
    };

    markDirty(node: AStarNode) {
        this.dirtyNodes.push(node);
    }

    destroy() {
        this.cleanDirty();
        this.nodes = [];
    }

    /*toString() {
        let graphString = [];
        let nodes = this.nodes;
        for (let x = 0; x < nodes.length; x++) {
            let rowDebug = [];
            let row = nodes[x];
            for (let y = 0; y < row.length; y++) {
                rowDebug.push(row[y].weight);
            }
            graphString.push(rowDebug.join(" "));
        }
        return graphString.join("\n");
    }*/

    static pathTo(node: AStarNode) {
        var curr = node;
        var path = [];
        while (curr.parent) {
            path.unshift(curr);
            curr = curr.parent;
        }
        return path;
    }
    /**
     * Perform an A* Search on a graph given a start and end node.
     * @param {Graph} graph
     * @param {GridNode} start
     * @param {GridNode} end
     * @param {Object} [options]
     * @param {bool} [options.closest] Specifies whether to return the
     path to the closest node if the target is unreachable.
     * @param {Function} [options.heuristic] Heuristic function (see
     *          astar.heuristics).
     */
    search(startNode: GraphNode, endNode: GraphNode)
    {
        let graph = this;
        graph.cleanDirty();
        let closest = false;
        let heuristic = this.heuristic;
        let openHeap = new BinaryHeap<AStarNode>((node) => node.f);

        let start = new AStarNode(startNode);
        let end = new AStarNode(endNode);

        let closestNode = start; // set the start node to be the closest if required
        start.h = heuristic(start.node, end.node);

        graph.markDirty(start);
        openHeap.push(start);

        while (openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            let currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if (currentNode === end) {
                return NavGraph.pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node.
            let neighbors = currentNode.node.neighbors();

            for (let i = 0, il = neighbors.length; i < il; ++i) {
                let neighbor = neighbors[i];
                let neighborStatus = neighbor.astar;

                if (neighborStatus.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                let gScore = currentNode.g + neighbor.getCost(currentNode.node);
                let beenVisited = neighborStatus.visited;

                if (!beenVisited || gScore < neighborStatus.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighborStatus.visited = true;
                    neighborStatus.parent = currentNode;
                    neighborStatus.h = neighborStatus.h || heuristic(neighbor, end.node);
                    neighborStatus.g = gScore;
                    neighborStatus.f = neighborStatus.g + neighborStatus.h;
                    graph.markDirty(neighborStatus);
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighborStatus.h < closestNode.h || (neighborStatus.h === closestNode.h && neighborStatus.g < closestNode.g)) {
                            closestNode = neighborStatus;
                        }
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighborStatus);
                    } else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighborStatus);
                    }
                }
            }
        }

        if (closest) {
            return NavGraph.pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    }
}