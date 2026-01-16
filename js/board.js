import { DASHBOARD_SIZE, DASHBOARD_COLS, DASHBOARD_ROWS, DARK_ROWS, WHITE_ROWS } from './config.js';
import { getIndex } from './utils.js';

// Инициализация доски
export const board = Array(DASHBOARD_SIZE)
  .fill(null)
  .map((_, i) => ({
    x: i % DASHBOARD_COLS,
    y: Math.floor(i / DASHBOARD_ROWS),
    piece:
      (i < DARK_ROWS * DASHBOARD_COLS ||
        i >= (DASHBOARD_ROWS - WHITE_ROWS) * DASHBOARD_COLS) &&
      (Math.floor(i / DASHBOARD_COLS) + (i % DASHBOARD_COLS)) % 2 === 1
        ? {
            type: 'checker',
            color: i < DARK_ROWS * DASHBOARD_COLS ? 'dark' : 'white',
            isKing: false,
          }
        : null,
  }));

/**
 * Получить ячейку по координатам
 */
export function getCell(x, y) {
  const index = getIndex(x, y);
  return index >= 0 ? board[index] : null;
}
