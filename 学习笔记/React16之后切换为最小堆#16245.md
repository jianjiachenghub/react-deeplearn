## React调度器底层改为了最小堆
>[Pull Request#16245:](https://github.com/facebook/react/pull/16245)大致内容是把之前的Scheduler里面维护的双向循环链表(用于任务优先级调度的)修改为了最小堆。以前就寻思着为什么这个调度器的优先队列不用最小堆来实现，现在果然变成了最小堆了nb

作者Andrew Clark的原话(机器翻译)：
- 将调度程序的优先级队列实现（对于任务和计时器）切换到基于数组的最小二进制堆。

- 这将取代我们曾经用来调度React根目录的队列中遗留的天真的链接列表实现。 当列表仅用于根目录时，可以说很好，因为根目录的总数通常很小，在单页面应用程序的常见情况下只有1。

- 由于Scheduler现在用于许多类型的JavaScript任务（例如，包括计时器），因此任务总数可能会大得多。

- 堆是实现优先级队列的标准方法。 一般情况下（插入到末尾）插入为O（1），最坏情况下插入为O（log n）。 删除为O（log n）。 偷看是O（1）。

### React 最小堆的源码
```

type Heap = Array<Node>;
type Node = {
  id: number,
  sortIndex: number,
};

export function push(heap: Heap, node: Node): void {
  const index = heap.length;
  heap.push(node);
  siftUp(heap, node, index);
}

export function peek(heap: Heap): Node | null {
  const first = heap[0];
  return first === undefined ? null : first;
}

export function pop(heap: Heap): Node | null {
  const first = heap[0];
  if (first !== undefined) {
    const last = heap.pop();
    if (last !== first) {
      heap[0] = last;
      siftDown(heap, last, 0);
    }
    return first;
  } else {
    return null;
  }
}

function siftUp(heap, node, index) {
  while (true) {
    const parentIndex = Math.floor((index - 1) / 2);
    const parent = heap[parentIndex];
    if (parent !== undefined && compare(parent, node) > 0) {
      // The parent is larger. Swap positions.
      heap[parentIndex] = node;
      heap[index] = parent;
      index = parentIndex;
    } else {
      // The parent is smaller. Exit.
      return;
    }
  }
}

function siftDown(heap, node, index) {
  const length = heap.length;
  while (index < length) {
    const leftIndex = (index + 1) * 2 - 1;
    const left = heap[leftIndex];
    const rightIndex = leftIndex + 1;
    const right = heap[rightIndex];

    // If the left or right node is smaller, swap with the smaller of those.
    if (left !== undefined && compare(left, node) < 0) {
      if (right !== undefined && compare(right, left) < 0) {
        heap[index] = right;
        heap[rightIndex] = node;
        index = rightIndex;
      } else {
        heap[index] = left;
        heap[leftIndex] = node;
        index = leftIndex;
      }
    } else if (right !== undefined && compare(right, node) < 0) {
      heap[index] = right;
      heap[rightIndex] = node;
      index = rightIndex;
    } else {
      // Neither child is smaller. Exit.
      return;
    }
  }
}

function compare(a, b) {
  // Compare sort index first, then task id.
  const diff = a.sortIndex - b.sortIndex;
  return diff !== 0 ? diff : a.id - b.id;
}
```
### 最新的scheduleCallback调度器源码
>[代码来自Facebook的工程师Andrew Clark的厂库Scheduler.js](https://github.com/acdlite/react/blob/220ba25a3fb82d9379c5f6a267c9677498313113/packages/scheduler/src/Scheduler.js)

看重点新任务推入时： push(taskQueue, newTask);
到时候取优先级最高的直接pop就行了
```
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();

  var startTime;
  var timeout;
  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
    timeout =
      typeof options.timeout === 'number'
        ? options.timeout
        : timeoutForPriorityLevel(priorityLevel);
  } else {
    timeout = timeoutForPriorityLevel(priorityLevel);
    startTime = currentTime;
  }

  var expirationTime = startTime + timeout;

  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };

  if (startTime > currentTime) {
    // This is a delayed task.
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // All tasks are delayed, and this is the task with the earliest delay.
      if (isHostTimeoutScheduled) {
        // Cancel an existing timeout.
        cancelHostTimeout();
      } else {
        isHostTimeoutScheduled = true;
      }
      // Schedule a timeout.
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    // Schedule a host callback, if needed. If we're already performing work,
    // wait until the next time we yield.
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }

  return newTask;
}
```
数据结构是真的有用。。。