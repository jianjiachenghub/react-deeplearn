## 首先是配置Babel

```
{
    "presets": ["env"],
    "plugins": [
        ["transform-react-jsx", {
            "pragma": "React.createElement"
        }]
    ]
}
```

## createElement的参数

- tag是标签名
- attrs是属性对象
- children是 0 到多个子结点

```
React.createElement(tag, attrs, ...children);
```


## 嵌套编译JSX

```
const App = (
  <div className="container">
    <h1 style={style}>{greet('scott')} hah</h1>
    <p>This is a JSX demo</p>
    <div>
      <input type="button" value="click me" />
    </div>
  </div>
);
```
编译后

```
var App = React.createElement(
  'div',
  { className: 'container' },
  React.createElement(
    'h1',
    { style: style },
    (0, _utils.greet)('scott'),
    ' hah'
  ),
  React.createElement(
    'p',
    null,
    'This is a JSX demo'
  ),
  React.createElement(
    'div',
    null,
    React.createElement(
      'input',
      { type: 'button', value: 'click me' }
    )
  )
);

```