///////////////////////////////////////
// IMPORTING MODULES
///////////////////////////////////////

import React, { Component } from 'react';
import './Node.css';

///////////////////////////////////////
// CLASS: NODE
///////////////////////////////////////

interface nodeProps{
    row: number;
    col: number;
    isStart: boolean;
    isFinish: boolean;
    isWall: boolean;
    onMouseDown: (row: number, col: number) => void;
    onMouseUp: (row: number, col: number) => void;
    onMouseEnter: (row: number, col: number) => void;
}

export default class Node extends Component <nodeProps, {}> {
  render() {
    const {
      row, 
      col,
      isFinish,
      isStart,
      isWall,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
    } = this.props;
    const extraClassName = isFinish
      ? 'node-finish'
      : isStart
      ? 'node-start'
      : isWall
      ? 'node-wall'
      : '';

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={() => onMouseDown(row, col)}
        onMouseEnter={() => onMouseEnter(row, col)}
        onMouseUp={() => onMouseUp(row, col)}
        ></div>
    );
  }
}
