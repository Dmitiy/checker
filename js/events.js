import { board } from './board.js';
import { moveChecker } from './gameLogic.js';
import { WAWKA, canvas } from './gameState.js';
import { getPossibleMoves } from './moves.js';
import { redrawBoard } from './render.js';
import { getIndex } from './utils.js';

/**
 * Обработчик клика
 */
export function setupClickHandler() {
  canvas.element.addEventListener('click', (e) => {
    const rect = canvas.element.getBoundingClientRect();
    const clickX = Math.floor((e.clientX - rect.left) / WAWKA.cell.width);
    const clickY = Math.floor((e.clientY - rect.top) / WAWKA.cell.height);
    const clickIndex = getIndex(clickX, clickY);

    if (clickIndex < 0) return;

    const clickedCell = board[clickIndex];

    // Если есть цепочка взятий, можно ходить только этой шашкой
    if (WAWKA.captureChain !== null) {
      // Во время цепочки взятий клик по той же шашке не должен снимать выделение
      // Можно только сделать ход на одну из возможных ячеек для взятия
      if (WAWKA.possibleMoves.some((move) => move.to === clickIndex)) {
        // Ход в возможную ячейку
        moveChecker(WAWKA.selectedChecker, clickIndex);
      }
      // Игнорируем все остальные клики во время цепочки взятий
      redrawBoard();
      return;
    }

    // Если шашка уже выбрана
    if (WAWKA.selectedChecker !== null) {
      // Если кликнули по той же шашке - снимаем выделение
      if (WAWKA.selectedChecker === clickIndex) {
        WAWKA.selectedChecker = null;
        WAWKA.possibleMoves = [];
      }
      // Если кликнули по возможному ходу - делаем ход
      else if (WAWKA.possibleMoves.some((move) => move.to === clickIndex)) {
        moveChecker(WAWKA.selectedChecker, clickIndex);
      }
      // Если кликнули по другой своей шашке - выбираем её
      else if (
        clickedCell.piece &&
        clickedCell.piece.color === WAWKA.currentPlayer
      ) {
        WAWKA.selectedChecker = clickIndex;
        WAWKA.possibleMoves = getPossibleMoves(clickIndex);
      }
      // Иначе снимаем выделение
      else {
        WAWKA.selectedChecker = null;
        WAWKA.possibleMoves = [];
      }
    }
    // Если шашка не выбрана
    else {
      // Выбираем шашку текущего игрока
      if (
        clickedCell.piece &&
        clickedCell.piece.color === WAWKA.currentPlayer
      ) {
        WAWKA.selectedChecker = clickIndex;
        WAWKA.possibleMoves = getPossibleMoves(clickIndex);
      }
    }

    redrawBoard();
  });
}
