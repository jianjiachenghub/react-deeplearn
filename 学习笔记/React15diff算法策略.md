## React diff原理

传统diff算法通过循环递归对节点进行依次对比，效率低下，算法复杂度达到 O(n^3)，其中 n 是树中节点的总数。

react却利用其特殊的diff算法做到了O(n^3)到O(n)的飞跃性的提升，而完成这一壮举的法宝就是下面这三条看似简单的diff策略：

- Web UI中DOM节点跨层级的移动操作特别少，可以忽略不计。（tree diff）
- 拥有相同类的两个组件将会生成相似的树形结构，拥有不同类的两个组件将会生成不同的树形结构。（component diff）
- 对于同一层级的一组子节点，它们可以通过唯一 id 进行区分。（element diff）

## tree diff （同层比较，不同直接删）

基于策略一，React 对树的算法进行了简洁明了的优化，即对树进行分层比较，两棵树只会对同一层次的节点进行比较。

<img src='./img/React15diff同层比较策略.png'>

既然 DOM 节点跨层级的移动操作少到可以忽略不计，针对这一现象，React只会对相同层级的 DOM 节点进行比较，即同一个父节点下的所有子节点。当发现节点已经不存在时，则该节点及其子节点会被完全删除掉，不会用于进一步的比较。这样只需要对树进行一次遍历，便能完成整个 DOM 树的比较。

策略一的前提是Web UI中DOM节点跨层级的移动操作特别少，但还是有，由于 React 只会简单地考虑同层级节点的位置变换，而对于不 同层级的节点，只有创建和删除操作，所以如果是跨层级移动就是把之前的销毁，然后在重新创建，这非常消耗性能。

<img src='./img/React15diff删除节点.png'>


## component diff （同类比较，不同直接删）


- 如果是同一类型的组件，按照原策略继续比较 Virtual DOM 树即可。
- 如果不是，则将该组件判断为 dirty component，从而替换整个组件下的所有子节点。
- 对于同一类型的组件，可通过props的浅比较shouldComponentUpdate()来判断是否变了。但是如果调用了forceUpdate方法，shouldComponentUpdate则失效。


## element diff （加key判断是否需要删除）

当节点处于同一层级时，diff 提供了 3 种节点操作，分别为 INSERT_MARKUP (插入)、MOVE_EXISTING (移动)和 REMOVE_NODE (删除)。

- INSERT_MARKUP :新的组件类型不在旧集合里，即全新的节点，需要对新节点执行插入操作。
- MOVE_EXISTING :旧集合中有新组件类型，且 element 是可更新的类型，- generateComponentChildren 已调用receiveComponent ，这种情况下 - prevChild=nextChild ，就需要做移动操作，可以复用以前的 DOM 节点。
- REMOVE_NODE :旧组件类型，在新集合里也有，但对应的 element 不同则不能直接复用和更新，需要执行删除操作，或者旧组件不在新集合里的，也需要执行删除操作。


如果两颗树的同一层仅仅是位置不对，但diff的时候是对比的相同位置的节点，就会认为节点不同而选择删除并创建新的。

React针对这一现象提出了一种优化策略：允许开发者对同一层级的同组子节点，添加唯一 key 进行区分。

通过key可以准确地发现新旧集合中的节点都是相同的节点，因此无需进行节点删除和创建，只需要将旧集合中节点的位置进行移动，更新为新集合中节点的位置。

<img src='./img/React15diffKey.png'>

**注意**：在开发过程中，尽量减少类似将最后一个节点移动到列表首部的操作。当节点数量过大或更新操作过于频繁时，这在一定程度上会影响React的渲染性能。


## 总结

<img src='./img/React15diff策略.png'>