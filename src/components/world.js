import React from 'react';
import PropTypes from 'prop-types';
import Cell from './cell';

const comfortableButtonStyle = {
  height: '48px',
  width: '100px',
  margin: '10px'
};

class World extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      speed: 1,
      pause: true,
      theWorld: {},
      cells: this.createCells({ cellCount: props.rows * props.cols, cols: props.cols })
    };

    this.timeInterval = null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('GRID UPDATE!');
  }

  createGrid = () => {
    const cellsCount = this.props.rows * this.props.cols;
    return new Array(cellsCount).fill(0);
    // return new Array(this.props.rows)
    //   .fill(undefined)
    //   .map(() => new Array(this.props.cols).fill(0));
  };

  // toggleCellLife(rowIndex, columnIndex) {
  //   return () => {
  //     const { grid } = this.state;
  //     grid[rowIndex][columnIndex] = grid[rowIndex][columnIndex] === 1 ? 0 : 1;
  //     this.setState({ grid });
  //   }
  // }

  syncCellState = cellIndex => () => {
    const grid = { ...this.state.theWorld };

    if (!grid[cellIndex]) {
      grid[cellIndex] = true;
    } else {
      delete grid[cellIndex];
    }

    this.setState({ theWorld: grid });
  };

  adjustSpeed = () => {
    this.setState({
      speed: this.state.speed + 1 > 4 ? 1 : this.state.speed + 1
    })
  };

  toggleGameState = () => {
    this.setState({
      pause: !this.state.pause
    }, () => {
      if (!this.state.pause) {
        this.timeInterval = setInterval(this.stepInTime, 5000);
      } else {
        clearInterval(this.timeInterval);
      }
    });
  };

  stepInTime = () => {
    // const newGrid = JSON.parse(JSON.stringify(this.state.grid));
    // this.state.grid.forEach((slots, rowIndex) => {
    //   slots.forEach((slot, columnIndex) => {
    //     let aliveNeighbours = 0;
    //     if (this.state.grid[rowIndex - 1]) {
    //       aliveNeighbours +=
    //         (this.state.grid[rowIndex - 1][columnIndex - 1] || 0) +
    //         this.state.grid[rowIndex - 1][columnIndex] +
    //         (this.state.grid[rowIndex - 1][columnIndex + 1] || 0);
    //     }
    //     aliveNeighbours +=
    //       (this.state.grid[rowIndex][columnIndex - 1] || 0) +
    //       (this.state.grid[rowIndex][columnIndex + 1] || 0);
    //     if (this.state.grid[rowIndex + 1]) {
    //       aliveNeighbours +=
    //         (this.state.grid[rowIndex + 1][columnIndex - 1] || 0) +
    //         this.state.grid[rowIndex + 1][columnIndex] +
    //         (this.state.grid[rowIndex + 1][columnIndex + 1] || 0);
    //     }
    //
    //     if (slot === 1 && aliveNeighbours < 2) {
    //       // Any live cell with fewer than two live neighbours dies, as if by underpopulation.
    //       newGrid[rowIndex][columnIndex] = 0;
    //     } else if (slot === 1 && [2,3].includes(aliveNeighbours)) {
    //       // Any live cell with two or three live neighbours lives on to the next generation.
    //       newGrid[rowIndex][columnIndex] = 1;
    //     } else if (slot === 1 && aliveNeighbours > 3) {
    //       // Any live cell with more than three live neighbours dies, as if by overpopulation.
    //       newGrid[rowIndex][columnIndex] = 0;
    //     } else if (slot === 0 && aliveNeighbours === 3) {
    //       // Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
    //       newGrid[rowIndex][columnIndex] = 1;
    //     }
    //   });
    // });
    //
    // this.setState({ grid: newGrid });


    // Object.keys returns an array of strings
    const aliveCellsIndexes = Object.keys(this.state.theWorld).map(key => parseInt(key));
    const newWorld = { ...this.state.theWorld };
    aliveCellsIndexes.sort();

    let deadCellsOutline = [];
    for (const cellIndex of aliveCellsIndexes) {
      deadCellsOutline = new Set([...deadCellsOutline, ...this.getCellDeadNeighbours(cellIndex)]);
      const cellNeighbours = this.getCellAliveNeighbours(cellIndex, aliveCellsIndexes);
      if (this.isCellUnderpopulated(cellNeighbours) || this.isCellUnderpopulated(cellNeighbours)) {
        delete newWorld[cellIndex];
      }
    }

    for (const deadCellIndex of deadCellsOutline) {
      const cellNeighbours = this.getCellAliveNeighbours(deadCellIndex, aliveCellsIndexes);
      if (this.shouldDeadCellReproduce(cellNeighbours)) {
        newWorld[deadCellIndex] = true;
      }
    }

    console.log(newWorld);
    this.setState({ theWorld: newWorld });
  };

  getCellAliveNeighbours = (currentCellIndex, aliveCells) => {
    const { cols } = this.props;
    /*
     *   -cols-1  |    -cols    |  -cols+1  |
     * --------------------------------------
     *      -1    |      0      |     +1    |
     * --------------------------------------
     *   +cols-1  |    +cols    |  +cols+1  |
     *
     * */
    return aliveCells.filter(cellIndex =>
      (currentCellIndex - cols - 1 === cellIndex) ||
      (currentCellIndex - cols === cellIndex) ||
      (currentCellIndex - cols + 1 === cellIndex) ||
      (currentCellIndex - 1 === cellIndex) ||
      (currentCellIndex + 1 === cellIndex) ||
      (currentCellIndex + cols - 1 === cellIndex) ||
      (currentCellIndex + cols === cellIndex) ||
      (currentCellIndex + cols + 1 === cellIndex)
    );
  };

  isCellAlive = cellIndex => {
    return this.state.theWorld[cellIndex];
  };

  getCellDeadNeighbours = currentCellIndex => {
    const { cols } = this.props;

    return [
      currentCellIndex - cols - 1,
      currentCellIndex - cols,
      currentCellIndex - cols + 1,
      currentCellIndex - 1,
      currentCellIndex + 1,
      currentCellIndex + cols - 1,
      currentCellIndex + cols,
      currentCellIndex + cols + 1
    ].filter(index => !this.isCellAlive(index));
  };


  isCellUnderpopulated = neighbours => {
    return neighbours.length < 2;
  };

  isCellOverpopulated = neighbours => {
    return neighbours.length > 3;
  };

  shouldDeadCellReproduce = aliveNeighbours => {
    return aliveNeighbours.length === 3;
  };

  createCells = ({ cols, cellCount }) => {
    // return this.state.grid.map((slots, rowIndex) => (
    //   <tr key={ `row-${rowIndex}` }>
    //     { slots.map((slot, columnIndex) => (
    //       <Cell
    //         key={ `${rowIndex}-${columnIndex}` }
    //         syncCellState={ this.syncCellState(rowIndex, columnIndex) }
    //         // alive={ slot === 1 }
    //         // toggleLife={ this.toggleCellLife(rowIndex, columnIndex) }
    //         gamePaused={ this.state.pause } />
    //     )) }
    //   </tr>
    // ))

    console.log('render cells...');
    const cells = new Array(cellCount).fill(0);
    return cells.map((cellNumber, cellIndex) => (
      <Cell
        key={ `cell-${cellIndex}` }
        id={ `cell-${cellIndex}` }
        cellIndex={ cellIndex }
        cols={ cols }
        syncCellState={ this.syncCellState(cellIndex) }
        // alive={ slot === 1 }
        // toggleLife={ this.toggleCellLife(rowIndex, columnIndex) }
        gamePaused={ true } />
    ));
  };

  render() {
    return (
      <>
        <div>
          <button
            style={ comfortableButtonStyle }
            onClick={ this.toggleGameState }>
            { this.state.pause ? 'play' : 'pause' }
          </button>
          <button
            style={ comfortableButtonStyle }
            onClick={ this.adjustSpeed }>
            speed * { this.state.speed }
          </button>
        </div>
        <div className="grid">
          <pre>
            { this.state.cells }
          </pre>
        </div>
      </>
    );
  }
}

World.propTypes = {
  cols: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired
}

World.defaultProps = {
  cols: 4,
  rows: 4
};

export default World;
