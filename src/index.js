import render from "./react-dom/render";
import React from './react/index'



/* // babel会把一个一个的节点用createElement包裹
// 同一层的会被一个结构赋值给children字段
const element = (
  <div>
    hello<span>world!</span>
  </div>
);
console.log(element); */

const ReactDOM = {
  render: (vnode, container) => {
    container.innerHTML = "";
    return render(vnode, container);
  }
};

class Name extends React.Component {
  constructor(props) {
    super(props);
  }
    render() {
      let Name = this.props.name
      return (
        <div >
          <p>JJC</p>
          <p>{Name}</p>
        </div>
      );
    }
  }

class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      num: 0,
      arr:[1,2]
    };
  }

  componentWillUpdate() {
    console.log("update");
  }

  componentWillMount() {
    console.log("mount");
  }

  componentDidMount() {
    for (let i = 0; i < 100; i++) {
      this.setState({ num: this.state.num + 1 });
      console.log(this.state.num);
    }
  }
  onClick() {
    for (let i = 0; i < 100; i++) {
      this.setState(prevState => {
        console.log(prevState.num);
        return {
          num: prevState.num + 1
        };
      });
    }
  }

  render() {
    console.log(this.state.num);
    return (
      <div onClick={() => this.onClick()}>
        <h1>number: {this.state.num}</h1>
        <button>add</button>
        {this.state.num===101&&<button id='123'>add</button>}
        <Name name='简'/>
      </div>
    );
  }
}
console.log("1233333333",<Counter />)

ReactDOM.render(<Counter />, document.getElementById("root"));
