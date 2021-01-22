import logo from './logo.svg';
import './App.css';
import React from 'react';
import ReactDOM from 'react-dom';

function Square(props) {
    return (
      <button
        className="square"
        style = {{ background: props.color }}
        onClick={props.onClick}
      >
        {props.value}
      </button>
    );
  }

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        key={i}
        color = {i+1 === this.props.latest ? 'red':'white'}
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    var i = 0
    var rows = []
    for(let j=0; j<3; j++){
      var row = []
      for(let k=0; k<3; k++){
        row.push(this.renderSquare(i))
        i++
      }
      rows.push(<div className='board-row' key={j*i}>{row}</div>)
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

function calculateWinner(squares){
  const lines = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [2,4,6]
  ]
  for (let i=0; i<lines.length; i++){
    const [a,b,c] = lines[i]
    if (squares[a] && squares[a] === squares[b] && squares[b] === squares[c]){
      return squares[a];
    }
  }
  return null;
}

class Game extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      index: [],
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const index = this.state.index.slice()
    if (calculateWinner(squares) || squares[i]){
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    index.push(i+1)
    this.setState({
      history: history.concat([{
      squares: squares,
    }]),
      xIsNext: !this.state.xIsNext,
      stepNumber: history.length,
      index: index,
    });
  }

  jumpTo(i){
    const index = this.state.index.slice(0,i)
    this.setState ({
      stepNumber: i,
      xIsNext: (i % 2) === 0,
      index: index
    });
  }
  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const index = this.state.index
    const moves = history.slice(0,history.length-1).map((whoCares, i) => {
      const desc = i ?
            'Go to move #' + i :
            'Go to game start';
      return (
        <li key={i}>
          <button onClick={() => this.jumpTo(i)}>{desc}</button> Slot {index[i]}
        </li>
      );
    });
    let status;
    if (winner){
      status = 'Winner: ' + winner
    } else if (current.squares.every((x) => x)) {
      status = 'Draw'
    } else {
      status = 'Next Player: ' + (this.state.xIsNext ? 'X':'O');
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares = {current.squares}
            latest = {index.slice(index.length-1)[0]}
            onClick = {(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

export default Game;
