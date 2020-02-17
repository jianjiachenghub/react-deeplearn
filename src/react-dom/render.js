import Component from "../react/component";
import { diff } from "./diff";
import { diff as diff2 } from "./diff-两颗虚拟树";

/**
 * @description 挂载我们解析出来的节点
 * @param {*} vnode createElement返回的节点数据
 * @param {*} container 我们的容器 root
 * @returns
 */
function render(vnode, container) {
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
}

function createComponent(component, props) {
  let inst;
  // 类定义的组件原型链式有render方法，而函数组件的render不是在原型上
  if (component.prototype && component.prototype.render) {
    inst = new component(props);
  } else {
    // 如果是函数定义组件，则将其扩展为类定义组件
    inst = new Component(props);
    inst.constructor = component;
    // 函数直接返回的VDOM转化为调用render执行后返回
    inst.render = function() {
      return this.constructor(props);
    };
  }

  return inst;
}

// 为组件设置props
function setComponentProps(component, props) {
  // 如果发现元素还没挂载就执行componentWillMount
  if (!component.base) {
    if (component.componentWillMount) component.componentWillMount();
  } else if (component.componentWillReceiveProps) {
    // 本来挂载了就证明这次是更新操作
    component.componentWillReceiveProps(props);
  }

  console.log("props: ", props);
  console.log("component.props: ", component.props);
  component.props = props;

  renderComponent(component);
}

// 渲染组件
export function renderComponent(component) {
  console.log(component);

  let base;
  // 执行内部render函数，解析出jsx语法树
  const renderer = component.render();

  console.log(renderer);

  if (component.base && component.componentWillUpdate) {
    component.componentWillUpdate();
  }

/*    let patches = diff2(component.current, renderer);
  console.log(patches);
  // 将变化打补丁，更新到el
 patch(component.base, patches); */

  //base = _render( renderer );
  // 然后根据解析出来的VDOM去渲染
  base = diff(component.base, renderer);
  console.log(base);

  if (component.base) {
    if (component.componentDidUpdate) component.componentDidUpdate();
  } else if (component.componentDidMount) {
    component.componentDidMount();
  }

  /*     if ( component.base && component.base.parentNode ) {
        component.base.parentNode.replaceChild( base, component.base );
    } */

  component.base = base;
  //component.current = renderer;
  base._component = component;
}

/**
 * @description 用于模拟React组件的合成事件、className、style等特殊属性
 * @param {*} dom 设置属性的节点
 * @param {*} key 属性类型值
 * @param {*} value 属性对应的值
 */
export function setAttribute(dom, key, value) {
  console.log(dom, key, value);
  if (key === "className") key = "class";
  if (/^on\w+/.test(key)) {
    key = key.toLowerCase();
    // 有的属性不用设值
    dom[key] = value || "";
  } else if (key === "style") {
    if (!value || typeof value === "string") {
      dom.style.cssText = value || ""; //!这段有疑问
    } else if (value && typeof value === "object") {
      for (let cssKey in value) {
        // 如果是number内类自动补上
        dom.style[cssKey] =
          typeof value[cssKey] === "number"
            ? value[cssKey] + "px"
            : value[cssKey];
      }
    }
  } else {
    if (key in dom) {
      console.log("key: ", key);
      // 如果元素节点有这个属性才添加
      dom[key] = value || "";
    }
    if (value) {
      dom.setAttribute(key, value);
    } else {
      dom.removeAttribute(key);
    }
  }
}

export default render;
