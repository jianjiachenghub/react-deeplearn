
## 需要解析JSX语法

用babel来编译即可

## 实现createElement方法

createElement的参数

- tag是标签名
- attrs是属性对象
- children是 0 到多个子结点（解构赋值实现

```
function createElement(tag, attrs, ...children) {
  return {
    tag,
    attrs,
    children
  };
}
```

## 需要一个Render函数来渲染

```
ReactDOM.render(<App/>,document.getElementById('root'));
```
App这个组件是要被babel用createElement解析成一个多层嵌套的对象，这个对象就是我们页面UI描述，也就是虚拟DOM树，我们对这个对象递归渲染即可得到页面。

需要注意的细节：

- 如果一层的类型是string或number，则表示文本节点（这里已经到底了
- 如果一层类型是function，表示我们定义的组件，需要执行返回实例
- 递归往下遍历的时候注意要把这一层的节点带下去，因为要作为下层的父节点
- 替换部分React的特殊属性如className、style、合成事件等
- render里可以挂载的话最好抽离出_render来专门解析出DOM树，因为类组件第一次直接不能挂载就好调用_render


## 类组件的实现

这是一个标准的React组件写法
```
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
      arr:[1,2]
    };
  }
  render() {
  console.log(this.state.num);
  return (
    <div onClick={() => this.onClick()}>
    </div>
    );
  }
}

```
实现这种React组件需要注意一些问题

- 渲染前需要先生成类的实例
- 需要收集组件的属性也就是props给类构造函数

将初始化props和渲染组件封装成两个函数，并且内部可以执行部分生命周期

- setComponentProps 
  - componentWillMount
  - componentWillReceiveProps
- renderComponent 
  - componentWillUpdate
  - componentDidUpdate
  - componentDidMount

成功生成真实的dom树后再组件内部用一个组件指向它，方便后面diff

## diff算法的问题

如果我们setSate直接把dom树从头到尾渲染效率会很低，于是我们可以把两次的dom树来做对比，只更新修改的部分，但常规对比算法复杂度是O(n^3),所以就需要一些特殊的设定。

- 同层对比，如果不同直接销毁之前的节点重新生成
- 节点类型不同直接删除然后生成
- 组件对比可以用钩子函数确认是否改变了
- 孩子节点的比对可以增加Key来解决只是顺序变了也销毁从新生成的问题

## setState批量更新

首先我们可以使用一个队列存更新函数，另一个队列存组件，存组件的队列判断一下，不能重复就行了。
我们需要确定一个合适的时间来吧队列的更新函数执行了，这个时间可以等到本次事件循环的宏任务执行完成的时候，也就是代码基本跑了一遍，该setState的地方都setState了，于是再微任务阶段调用就满足这个条件，于是可以使用Promise.resolve().then(fn)
fn可以用一个循环去取所有的setState函数出来合并计算出最终的state,然后去render

