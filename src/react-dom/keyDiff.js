let obj={
    _updateChildren: function(nextNestedChildrenElements, transaction, context) {
    var prevChildren = this._renderedChildren;
    var nextChildren = this._reconcilerUpdateChildren(
      prevChildren, nextNestedChildrenElements, transaction, context
    );
    if (!nextChildren && !prevChildren) {
      return;
    }
    var name;
    var lastIndex = 0;
    var nextIndex = 0;
    // 首先对新集合的节点进行循环遍历
    for (name in nextChildren) {
      // 通过唯一 key 可以判断新老集合中是否存在相同的节点
      if (!nextChildren.hasOwnProperty(name)) {
        continue;
      }
      var prevChild = prevChildren && prevChildren[name];
      var nextChild = nextChildren[name];
      // 如果存在相同节点，则进行移动操作
      if (prevChild === nextChild) {
        // 移动节点
        this.moveChild(prevChild, nextIndex, lastIndex);
        // 更新lastIndex为新集合中的位置
        lastIndex = Math.max(prevChild._mountIndex, lastIndex);
        prevChild._mountIndex = nextIndex;
      } else {
        if (prevChild) {
          lastIndex = Math.max(prevChild._mountIndex, lastIndex);
          // 删除节点
          this._unmountChild(prevChild);
        }
        // 初始化并创建节点
        this._mountChildAtIndex(
          nextChild, nextIndex, transaction, context
        );
      }
      nextIndex++;
    }
    for (name in prevChildren) {
      if (prevChildren.hasOwnProperty(name) &&
          !(nextChildren && nextChildren.hasOwnProperty(name))) {
        this._unmountChild(prevChildren[name]);
      }
    }
    this._renderedChildren = nextChildren;
  },
  // 移动节点
  moveChild: function(child, toIndex, lastIndex) {
    // 移动前需要将当前节点在老集合中的位置与 lastIndex 进行比较
    // 这是一种顺序优化手段，lastIndex 一直在更新，表示访问过的节点在老集合中最右的位置
    if (child._mountIndex < lastIndex) {
      this.prepareToManageChildren();
      enqueueMove(this, child._mountIndex, toIndex);
    }
  },
  // 创建节点
  createChild: function(child, mountImage) {
    this.prepareToManageChildren();
    enqueueInsertMarkup(this, mountImage, child._mountIndex);
  },
  // 删除节点
  removeChild: function(child) {
    this.prepareToManageChildren();
    enqueueRemove(this, child._mountIndex);
  },
  
  _unmountChild: function(child) {
    this.removeChild(child);
    child._mountIndex = null;
  },
  
  _mountChildAtIndex: function(
    child,
    index,
    transaction,
    context) {
    var mountImage = ReactReconciler.mountComponent(
      child,
      transaction,
      this,
      this._nativeContainerInfo,
      context
    );
    child._mountIndex = index;
    this.createChild(child, mountImage);
  }}