import { CELL_SIZE } from './config.js';

// Состояние игры
export const WAWKA = {
  cell: CELL_SIZE,
  currentPlayer: 'dark', // 'dark' или 'white'
  selectedChecker: null,
  possibleMoves: [],
  mustCapture: false,
  captureChain: null, // для множественных взятий
};

// Canvas
export const canvas = {
  element: document.querySelector('canvas'),
  context: document.querySelector('canvas').getContext('2d'),
};
