let allPatches;
let index = 0; // 默认哪个需要打补丁

function patch(node, patches) {
  allPatches = patches;
  // 给某个元素打补丁
  walk(node);
}

function walk(node) {
  let current = allPatches[index++];
  let childNodes = node.childNodes;

  // 先序深度，继续遍历递归子节点
  childNodes.forEach(child => walk(child));

  if (current) {
    doPatch(node, current); // 如果存在差异就更新
  }
}

function doPatch(node, patches) {
  // 遍历所有的差异然后再执行相关函数
  patches.forEach(patch => {
    switch (patch.type) {
      case "ATTR":
        for (let key in patch.attr) {
          let value = patch.attr[key];
          if (value) {
            setAttr(node, key, value);
          } else {
            node.removeAttribute(key);
          }
        }
        break;
      case "TEXT":
        node.textContent = patch.text;
        break;
      case "REPLACE":
        let newNode = patch.newNode;
        newNode =
          newNode instanceof Element
            ? render(newNode)
            : document.createTextNode(newNode);
        node.parentNode.replaceChild(newNode, node);
        break;
      case "REMOVE":
        node.parentNode.removeChild(node);
        break;
      default:
        break;
    }
  });
}

/**
 * @description 挂载我们解析出来的节点
 * @param {*} vnode createElement返回的节点数据
 * @param {*} container 我们的容器 root
 * @returns
 */
/* function render(vnode, container) {
  console.log(vnode);
  console.log(_render(vnode));
  return container.appendChild(_render(vnode));
}

// 抽离出_render的原因是如果是类第一次_render时是不能挂载的，因为是一个方法
// 调用这个方法返回类的实例，然后解析出VDOM，再调用render挂载
function _render(vnode) {
  console.log(vnode);
  if (typeof vnode.tag === "function") {
    //  vnode.tag 是我们类或方法组件的名称,最终都被转为实例
    const component = createComponent(vnode.tag, vnode.attrs);
    console.log(component);
    setComponentProps(component, vnode.attrs);
    console.log(component.base);
    // component.base是组件类
    return component.base;
  }
  if (typeof vnode === "string" || typeof vnode === "number") {
    // 创建文本节点
    const textNode = document.createTextNode(vnode);
    return textNode;
  }
  // 不是文本就是标签
  let domNode = document.createElement(vnode.tag);
  if (vnode.attrs) {
    // 遍历属性对象
    for (let [key, value] of Object.entries(vnode.attrs)) {
      setAttribute(domNode, key, value);
    }
  }
  // 如果是这个节点还有孩子节点，就递归渲染就行了，注意把父节点domNode带进入
  vnode.children &&
    vnode.children.forEach(childNode => render(childNode, domNode));
  return domNode;
} */


// render方法可以将虚拟DOM转化成真实DOM
function render(domObj) {
  // 根据type类型来创建对应的元素
  let el = document.createElement(domObj.type);
  
  // 再去遍历props属性对象，然后给创建的元素el设置属性
  for (let key in domObj.props) {
      // 设置属性的方法
      setAttr(el, key, domObj.props[key]);
  }
  
  // 遍历子节点
  // 如果是虚拟DOM，就继续递归渲染
  // 不是就代表是文本节点，直接创建
  domObj.children.forEach(child => {
      child = (child instanceof Element) ? render(child) : document.createTextNode(child);
      // 添加到对应元素内
      el.appendChild(child);
  });

  return el;
}
