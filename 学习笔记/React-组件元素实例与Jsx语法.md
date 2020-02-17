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
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner,
  };
  // ...
  return element;
};

ReactElement.createElement = function(type, config, children) {
  // ...
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
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

然而，元素类型type也可以是对应到一个React组件的一个函数或者类：

```
{
  type: Button,
  props: {
    color: 'blue',
    children: 'OK!'
  }
}

```
React会问Button要渲染什么，Button返回：
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
嵌套的话，React会重复第一种的过程，直到它知道页面上所有的组件想渲染出什么DOM nodes。



## instance 实例


instance是组件的实例，但是注意function形式的component没有实例， React只会对使用ES6 class语法创建的组件进行实例化，并且instance的创建完全对开发者隐藏，开发者只需关心组件自身的逻辑。 

## 总结

对React组件来说，props是输入，元素树（Elements tree）是输出。
在React框架中，不管是渲染组件还是DOM节点，创建的都是element对象，React依据自身渲染规则将element对象映射到真实的DOM节点。

