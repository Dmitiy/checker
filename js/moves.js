import { board, getCell } from './board.js';
import { getIndex, isDarkCell } from './utils.js';
import { WAWKA } from './gameState.js';

/**
 * Проверить возможность взятия в направлении
 * Возвращает массив всех возможных взятий в этом направлении (для дамки может быть несколько)
 */
export function checkCapture(cellIndex, dx, dy, isKing) {
  const cell = board[cellIndex];
  const { x, y } = cell;
  const piece = cell.piece;

  // Для дамки проверяем дальние взятия
  if (isKing) {
    const captures = [];
    let currentX = x + dx;
    let currentY = y + dy;
    let foundEnemy = false;
    let enemyX = -1;
    let enemyY = -1;

    while (true) {
      const currentCell = getCell(currentX, currentY);
      if (!currentCell) break;

      if (currentCell.piece) {
        if (currentCell.piece.color === piece.color) {
          break; // Своя шашка на пути
        } else if (!foundEnemy) {
          foundEnemy = true;
          enemyX = currentX;
          enemyY = currentY;
        } else {
          break; // Уже нашли врага, дальше нельзя
        }
      } else if (foundEnemy && isDarkCell(currentX, currentY)) {
        // Нашли пустую темную ячейку после врага - добавляем как возможное взятие
        captures.push({
          to: getIndex(currentX, currentY),
          capture: getIndex(enemyX, enemyY),
          isCapture: true,
        });
      }

      currentX += dx;
      currentY += dy;
    }

    // Возвращаем все возможные взятия для дамки
    return captures.length > 0 ? captures : null;
  } else {
    // Для обычной шашки проверяем взятие через одну клетку
    // При взятии обычная шашка может брать в любом диагональном направлении
    const jumpX = x + dx * 2;
    const jumpY = y + dy * 2;
    const jumpCell = getCell(jumpX, jumpY);

    // Проверяем промежуточную ячейку
    const middleX = x + dx;
    const middleY = y + dy;
    const middleCell = getCell(middleX, middleY);

    if (
      middleCell &&
      middleCell.piece &&
      middleCell.piece.color !== piece.color &&
      jumpCell &&
      !jumpCell.piece &&
      isDarkCell(jumpX, jumpY)
    ) {
      return {
        to: getIndex(jumpX, jumpY),
        capture: getIndex(middleX, middleY),
        isCapture: true,
      };
    }
  }

  return null;
}

/**
 * Получить все возможные ходы для шашки
 */
export function getPossibleMoves(cellIndex) {
  const cell = board[cellIndex];
  if (!cell || !cell.piece || cell.piece.color !== WAWKA.currentPlayer) {
    return [];
  }

  const moves = [];
  const { x, y } = cell;
  const piece = cell.piece;
  const isKing = piece.isKing;

  // Для взятия обычные шашки могут ходить в любом диагональном направлении
  const captureDirections = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  // Для обычных ходов обычные шашки ходят только вперед
  const normalDirections = isKing
    ? captureDirections
    : piece.color === 'dark'
    ? [
        [1, 1],
        [-1, 1],
      ]
    : [
        [1, -1],
        [-1, -1],
      ];

  // Сначала проверяем обязательные взятия
  const captures = [];
  for (const [dx, dy] of captureDirections) {
    const captureMoves = checkCapture(cellIndex, dx, dy, isKing);
    if (captureMoves) {
      // Для дамки может быть несколько вариантов взятия в одном направлении
      if (Array.isArray(captureMoves)) {
        captures.push(...captureMoves);
      } else {
        captures.push(captureMoves);
      }
    }
  }

  // Если есть обязательные взятия, возвращаем только их
  if (captures.length > 0) {
    return captures;
  }

  // Обычные ходы (только если нет обязательных взятий)
  if (!WAWKA.mustCapture) {
    if (isKing) {
      // Дамка может ходить на любое количество клеток по диагонали
      for (const [dx, dy] of captureDirections) {
        let currentX = x + dx;
        let currentY = y + dy;

        while (true) {
          const targetCell = getCell(currentX, currentY);
          if (!targetCell) break;

          if (targetCell.piece) break; // На пути есть шашка

          if (isDarkCell(currentX, currentY)) {
            moves.push({
              to: getIndex(currentX, currentY),
              capture: null,
              isCapture: false,
            });
          }

          currentX += dx;
          currentY += dy;
        }
      }
    } else {
      // Обычная шашка ходит только на одну клетку вперед
      for (const [dx, dy] of normalDirections) {
        const newX = x + dx;
        const newY = y + dy;
        const targetCell = getCell(newX, newY);

        if (targetCell && !targetCell.piece && isDarkCell(newX, newY)) {
          moves.push({
            to: getIndex(newX, newY),
            capture: null,
            isCapture: false,
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Проверить, может ли шашка продолжить взятие
 */
export function canContinueCapture(cellIndex) {
  const cell = board[cellIndex];
  if (!cell || !cell.piece) return false;

  // При взятии обычные шашки могут ходить в любом диагональном направлении
  const directions = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ];

  for (const [dx, dy] of directions) {
    const captureMoves = checkCapture(cellIndex, dx, dy, cell.piece.isKing);
    if (captureMoves) {
      // Для дамки может быть массив, для обычной шашки - объект
      if (Array.isArray(captureMoves) ? captureMoves.length > 0 : true) {
        return true;
      }
    }
  }
  return false;
}
