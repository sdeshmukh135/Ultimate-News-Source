// Priority Queue Implementation (Max Heap specifically)
export class Node {
  constructor(id, value) {
    this.id = id; // e.g. newsId
    this.value = value; // e.g. ranking
  }
}

export class PriorityQueue {
  constructor() {
    this.heap = []; // heap implemention
  }

  heapifyDown = () => {
    // when we remove (for logn time complexity)
    // we removed the root node of the tree --> start at top and fix the priority order of the rest to the bottom
    let index = 0;
    while (this.hasLeftNode(index)) {
      let smallerIndex = this.getLeftIndex(index); // should be smaller
      if (
        this.hasRightNode(index) &&
        this.heap[this.getRightIndex(index)].value >
          this.heap[this.getLeftIndex(index)].value
      ) {
        // the successor if the current index is not in the right spot
        smallerIndex = this.getRightIndex(index);
      }

      if (this.heap[index].value > this.heap[smallerIndex].value) {
        // correct order
        break;
      } else {
        this.swap(index, smallerIndex);
      }

      index = smallerIndex;
    }
  };

  heapifyUp = () => {
    // when we add (for logn time complexity)
    // added leaf node to the tree, heapify to the correct position
    let index = this.heap.length - 1; // last possible index
    while (
      this.hasParent(index) &&
      this.heap[this.getParentIndex(index)].value < this.heap[index].value
    ) {
      this.swap(this.getParentIndex(index), index);
      index = this.getParentIndex(index);
    }
  };

  swap = (index1, index2) => {
    // swap two positions
    const temp = this.heap[index1];
    this.heap[index1] = this.heap[index2];
    this.heap[index2] = temp;
  };

  hasLeftNode = (index) => {
    return this.getLeftIndex(index) < this.heap.length; // index is a valid index
  };

  hasRightNode = (index) => {
    return this.getRightIndex(index) < this.heap.length; // index is a valid index
  };

  hasParent = (index) => {
    return this.getParentIndex(index) >= 0; // exists
  };

  getRightIndex = (index) => {
    return 2 * index + 2; // index in an array implementation
  };

  getLeftIndex = (index) => {
    return 2 * index + 1; // index in array implementation
  };

  getParentIndex = (index) => {
    return Math.floor((index - 1) / 2); // index in array implementation
  };

  peek = () => {
    // look at the element at the front of the heap (max priority)
    if (this.heap.length == 0) {
      return null;
    }

    return this.heap[0]; // no changes to the actual heap
  };

  poll = () => {
    // returns element of max priority
    if (this.heap.length === 0) {
      return null;
    }

    const max = this.heap[0];
    this.heap[0] = this.heap[this.heap.length - 1];
    this.heap.pop(); // remove the empty space
    this.heapifyDown();
    return max;
  };

  add = (item) => {
    // adds element to priority queue (returns nothing)
    this.heap.push(item);
    this.heapifyUp();
  };

  display = () => {
    // get the underlying array from the queue (for testing purposes)
    return this.heap;
  };
}
