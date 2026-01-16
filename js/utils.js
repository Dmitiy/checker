import { DASHBOARD_COLS, DASHBOARD_ROWS } from './config.js';

/**
 * Создать массив чисел от start до stop с шагом step
 * @param {Number} start
 * @param {Number} stop
 * @param {Number} step
 * @returns {Array<Number>}
 */
export function range(start, stop, step = 1) {
  return Array.from(
    { length: Math.ceil((stop - start) / step) },
    (_, i) => start + i * step
  );
}

/**
 * Получить индекс ячейки по координатам
 */
export function getIndex(x, y) {
  if (x < 0 || x >= DASHBOARD_COLS || y < 0 || y >= DASHBOARD_ROWS) {
    return -1;
  }
  return y * DASHBOARD_COLS + x;
}

/**
 * Проверить, является ли ячейка темной (игровой)
 */
export function isDarkCell(x, y) {
  return (x + y) % 2 === 1;
}
