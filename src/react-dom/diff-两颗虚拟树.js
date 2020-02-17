// 索引记录节点的序号
let serialNumber = 0;

export function diff(oldTree, newTree) {
  // 声明变量patches用来存放补丁的对象
  let patches = {};
  // 深度优先搜索，并把sum带下去
  dfsWalk(oldTree, newTree, serialNumber, patches);
  return patches;
}

function dfsWalk(oldNode, newNode, index, patches) {
  // 收集该元素的差异
  let current = [];
  if (!newNode) {
    // 如何新的树没有这个节点那么直接把老树的这个节点以及下面的节点销毁
    current.push({ type: "REMOVE", index });
  } else if (isString(oldNode) && isString(newNode)) {
    // 判断文本是否一致
    if (oldNode !== newNode) {
      current.push({ type: "TEXT", text: newNode });
    }
  } else if (oldNode.type === newNode.type) {
    // 比较属性是否有更改
    let attr = diffAttr(oldNode.props, newNode.props);
    // 如果存在变化属性就推入
    if (Object.keys(attr).length > 0) {
      current.push({ type: "ATTR", attr });
    }
    // 如果有子节点，遍历子节点
    diffChildren(oldNode.children, newNode.children, patches);
  } else {
    // 说明节点被替换了
    current.push({ type: "REPLACE", newNode });
  }

  // 当前元素确实有补丁存在
  if (current.length) {
    // 将元素和补丁对应起来，放到大补丁包中
    patches[index] = current;
  }
}

function isString(obj) {
  return typeof obj === "string";
}

function diffAttr(oldAttrs, newAttrs) {
  let patch = {};
  // 判断老的属性中和新的属性的关系
  for (let key in oldAttrs) {
    if (oldAttrs[key] !== newAttrs[key]) {
      patch[key] = newAttrs[key]; // 有可能还是undefined
    }
  }

  for (let key in newAttrs) {
    // 老节点没有新节点的属性
    if (!oldAttrs.hasOwnProperty(key)) {
      patch[key] = newAttrs[key];
    }
  }
  return patch;
}

// diff子节点时应该用key来比较这里简化了
function diffChildren(oldChildren, newChildren, patches) {
  // 比较老的第一个和新的第一个
  oldChildren.forEach((child, index) => {
    dfsWalk(child, newChildren[index], ++serialNumber, patches);
  });
}

class Element {
  constructor(type, props, children) {
    this.type = type;
    this.props = props;
    this.children = children;
  }
}
// 创建虚拟DOM，返回虚拟节点(object)
function createElement(type, props, children) {
  return new Element(type, props, children);
}

let virtualDom = createElement("ul", { class: "list" }, [
  createElement("li", { class: "item" }, ["周杰伦"]),
  createElement("li", { class: "item" }, ["林俊杰"]),
  createElement("li", { class: "item" }, ["王力宏"])
]);
console.log(virtualDom)

// +++
// 创建另一个新的虚拟DOM
let virtualDom2 = createElement("ul", { class: "list-group" }, [
  createElement("li", { class: "item active" }, ["七里香"]),
  createElement("li", { class: "item" }, ["一千年以后"]),
  createElement("li", { class: "item" }, ["需要人陪"])
]);
// diff一下两个不同的虚拟DOM
let patches = diff(virtualDom, virtualDom2);

console.log(patches);
