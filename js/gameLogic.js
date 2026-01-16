import { board } from './board.js';
import { DASHBOARD_ROWS } from './config.js';
import { WAWKA } from './gameState.js';
import { getPossibleMoves, canContinueCapture } from './moves.js';
import { redrawBoard } from './render.js';

/**
 * Проверить, есть ли обязательные взятия для текущего игрока
 */
export function checkMustCapture() {
  for (let i = 0; i < board.length; i++) {
    const cell = board[i];
    if (
      cell.piece &&
      cell.piece.color === WAWKA.currentPlayer &&
      getPossibleMoves(i).some((move) => move.isCapture)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Переместить шашку
 */
export function moveChecker(fromIndex, toIndex) {
  const fromCell = board[fromIndex];
  const toCell = board[toIndex];

  if (!fromCell || !fromCell.piece) return false;

  // Проверяем, что это ход текущего игрока
  if (fromCell.piece.color !== WAWKA.currentPlayer) return false;

  // Проверяем, что это валидный ход
  const moves = getPossibleMoves(fromIndex);
  const move = moves.find((m) => m.to === toIndex);

  if (!move) return false;

  // Если есть обязательные взятия, но этот ход не взятие - запрещаем
  if (WAWKA.mustCapture && !move.isCapture) return false;

  // Выполняем ход
  toCell.piece = { ...fromCell.piece };
  fromCell.piece = null;

  // Если было взятие, удаляем взятую шашку
  if (move.isCapture && move.capture !== null) {
    board[move.capture].piece = null;
  }

  // Проверяем превращение в дамку (в том числе во время боя)
  if (!toCell.piece.isKing) {
    if (
      (toCell.piece.color === 'dark' && toCell.y === DASHBOARD_ROWS - 1) ||
      (toCell.piece.color === 'white' && toCell.y === 0)
    ) {
      toCell.piece.isKing = true;
      // Если шашка превратилась в дамку во время боя, нужно пересчитать возможные ходы
      // с учетом того, что теперь это дамка
    }
  }

  // Проверяем, может ли шашка продолжить взятие
  // Важно: если шашка только что превратилась в дамку, проверяем по правилам дамки
  if (move.isCapture && canContinueCapture(toIndex)) {
    WAWKA.captureChain = toIndex;
    WAWKA.selectedChecker = toIndex;
    WAWKA.possibleMoves = getPossibleMoves(toIndex).filter(
      (m) => m.isCapture
    );
  } else {
    // Ход завершен, переключаем игрока
    WAWKA.captureChain = null;
    WAWKA.selectedChecker = null;
    WAWKA.possibleMoves = [];
    WAWKA.currentPlayer = WAWKA.currentPlayer === 'dark' ? 'white' : 'dark';
    WAWKA.mustCapture = checkMustCapture();
  }

  redrawBoard();
  return true;
}
