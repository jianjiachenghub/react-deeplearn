import { renderComponent } from "../react-dom/render";
import enqueueSetState from './enqueueSetState'


class Component {
  constructor(props = {}) {
    this.isReactComponent = true;

    this.state = {};
    this.props = props; // props从外部传进来
  }

  // 同步setState
  setStateSync(stateChange) {
    Object.assign(this.state, stateChange);
    renderComponent(this);
  }

  // 异步setState
  setState(stateChange) {
    enqueueSetState(stateChange, this);
  }
}

export default Component;
