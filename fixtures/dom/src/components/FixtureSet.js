import PropTypes from 'prop-types';
const React = window.React;

const propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
};

class FixtureSet extends React.Component {
  render() {
    const {title, description, children} = this.props;

    return (
      <div className="container">
        <h1>{title}</h1>
        {description && <p>{description}</p>}

        {children}
      </div>
    );
  }
}

FixtureSet.propTypes = propTypes;

export default FixtureSet;
