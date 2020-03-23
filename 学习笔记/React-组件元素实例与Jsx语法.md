
## React其实是一个对象

提供了一些API，其中有一个createElement就是用来生成Element对象，描述Virtual DOM的
```
var React = {
  Children: {
    map: ReactChildren.map,
    forEach: ReactChildren.forEach,
    count: ReactChildren.count,
    toArray: ReactChildren.toArray,
    only: onlyChild,
  },
  Component: ReactComponent,
  PureComponent: ReactPureComponent,
  createElement: createElement,
  cloneElement: cloneElement,
  isValidElement: ReactElement.isValidElement,
  PropTypes: ReactPropTypes,
  createClass: ReactClass.createClass,
  createFactory: createFactory,
  createMixin: function(mixin) {
    return mixin;
  },
  DOM: ReactDOMFactories,
  version: ReactVersion,
  __spread: __spread,
};

```


## React的JSX语法

```
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```
借助babel-plugin-transform-react-jsx，上面的JSX将被转译成：

```
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```
React.createElement是在做什么？看下相关部分代码：
```
var ReactElement = function(type, key, ref, self, source, owner, props) {
  var element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  };
  // ...
  return element;
};

/**
 * React的创建元素方法
 * @param type 标签名字符串(如’div‘或'span')，也可以是React组件类型，或是React fragment类型
 * @param config 包含元素各个属性键值对的对象
 * @param children 包含元素的子节点或者子元素
 */
ReactElement.createElement = function(type, config, children) {
  //....这里省略了处理的逻辑，内部会对ref等一些特殊的属性做处理，并且会生成props包含属性和孩子节点
  return ReactElement(
    type,//组件的标识信息
    key,//DOM结构标识，提升update性能
    ref,//ref属性特殊处理，真实DOM的引用
    self,
    source,
    ReactCurrentOwner.current,
    props//子结构相关信息(有则增加children字段/没有为空)和组件属性(如style)
  );
};
```

## Elements Tree 
由源码可知ReactElement.createElement最终返回了一个对象，这个对象大概是这样的形状：
```
{
  type,
  key,
  props: {
    children
  }
}
```
我们知道了react的render方法是返回一个Elements Tree

```
class Header extends Component {
  render () {
    return (
      <div>
        <h1 className='title'>React 小书</h1>
      </div>
    )
  }
}

ReactDOM.render(
  <Header />,
  document.getElementById('root')
)
```
被JSX解析：
```
class Header extends Component {
  render () {
    return (
     React.createElement(
        "div",
        null,
        React.createElement(
          "h1",
          { className: 'title' },
          "React 小书"
        )
      )
    )
  }
}

ReactDOM.render(
  React.createElement(Header, null), 
  document.getElementById('root')
);
```

## React用Elements Tree描述UI

一个元素（Element）是一个普通对象，他描述一个组件实例和它所要求的属性，或者一个DOM节点和它所要求的属性。它仅仅包含以下有关信息 :

- 组件类型 (比如，这是一个按钮 Button)
- 属性 (比如，它的颜色 color)
- 它所包含的若干个子元素

优点：React元素很容易遍历，不需要分析，而且他们显然比真正的DOM元素更轻量级，因为他们只是普通的对象(object)！

## DOM元素 DOM Elements

当一个元素类型type是字符串(string)时，该元素表示一个DOM节点,其类型字符串是该DOM节点的标签名称,另外一个属性props对应地表示DOM节点属性。这是React要往屏幕上渲染的内容。例子如下 :

```
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}

```

描述的HTML如下

```
<button class='button button-blue'>
  <b>
    OK!
  </b>
</button>
```

值得一提的是，父子节点都是描述，而不是真正的实例。当你创建它们时，他们不指向屏幕上的任何东西。

## 组件元素 Component Elements

然而，元素类型type也可以是对应到一个React组件的一个函数或者类，嵌套的话，React会重复第一种的过程，直到它知道页面上所有的组件想渲染出什么DOM nodes。
```
class Home extends React.Component {
  render() {
    return (
      <div>
        <Welcome name='老干部' />
        <p>Anything you like</p>
      </div>
    )
  }
}
//Home 组件使用了Welcome组件，返回的React元素为：
{
  type: 'div',
  props: {
    children: [
      {
        type: Welcome,
        props: {
          name: '老干部'
        }
      },
      {
        type: 'p',
        props: {
          children: 'Anything you like'
        }
      }，
    ]
  }
}

```
React 知道如何渲染type = 'div' 和 type = 'p' 的节点，但不知道如何渲染type=Welcome的节点，当React 发现Welcome 是一个React 组件时（首先Welcome首字母为大写，内部好像会使用一个typeof来看是不是function），会根据Welcome组件render函数返回的React 元素决定如何渲染Welcome节点。Welcome组件返回的React 元素为：
```
{
  type: 'h1',
  props: {
  	children: 'Hello, 老干部'
  }
}

```

描述组件的元素也还是元素，跟描述DOM节点的元素一样。他们也可以跟其他元素嵌套或者混在一起使用。
```
const DeleteAccount = () => ({
  type: 'div',//DOM元素
  props: {
    children: [{
      type: 'p',//DOM元素
      props: {
        children: 'Are you sure?'
      }
    }, {
      type: DangerButton,//组件元素
      props: {
        children: 'Yep'
      }
    }, {
      type: Button,//组件元素
      props: {
        color: 'blue',
        children: 'Cancel'
      }
   }]
});

```


## 组件在虚拟树中的比对

如果type是对函数或类的引用（即常规的React组件），并且我们启动了tree diff的过程，则React会持续地去检查组件的内部逻辑，以确保render返回的值不会改变（类似对副作用的预防措施）。对树中的每个组件进行遍历和扫描 —— 是的，在复杂的渲染场景下，成本可能会非常昂贵！
```
// before update:
{ type: Welcome , props: { className: 'cn' } }

// after update:
{ type: Welcome , props: { className: 'cn' } }
```

也就是说在之前的Elements Tree中是没有组件内部的结构的，是要在组件被执行实例化然后执行内部render函数才会形成完整的虚拟树结构，更新后再比对

## instance 实例


instance是组件的实例，但是注意function形式的component没有实例， React只会对使用ES6 class语法创建的组件进行实例化，并且instance的创建完全对开发者隐藏，开发者只需关心组件自身的逻辑。 

## 总结

对React组件来说，props是输入，元素树（Elements tree）是输出。
在React框架中，不管是渲染组件还是DOM节点，创建的都是element对象，React依据自身渲染规则将element对象映射到真实的DOM节点。

