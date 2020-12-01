import React from 'react';
import PropTypes from 'prop-types';

class Cell extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alive: false };
  }

  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return this.state.alive !== nextState.alive;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('CELL UPDATE!');
  }

  toggleStateLife = () => {
    if (!this.props.gamePaused) {
      return;
    }

    this.setState({ alive: !this.state.alive });
    this.props.syncCellState();
  };

  render() {
    const { alive } = this.state;
    const { cellIndex, cols } = this.props;
    const className = [alive ? 'alive' : 'dead', 'cell'].join(' ');

    const cell = (
      <span
        id={ this.props.id }
        onClick={ this.toggleStateLife }
        className={ className } />
    );

    if ((cellIndex + 1) % cols === 0) {
      return (
        <>
          { cell }
          <br />
        </>
      );
    }

    return cell;
  }
};

Cell.propTypes = {
  gamePaused: PropTypes.bool.isRequired,
  syncCellState: PropTypes.func,
  cols: PropTypes.number,
  id: PropTypes.string,
  cellIndex: PropTypes.number.isRequired
  // alive: PropTypes.bool
};

Cell.defaultProps = {
  alive: false
};

export default Cell;
