import { board } from './board.js';
import { DASHBOARD_COLS, DASHBOARD_ROWS, DASHBOARD_SIZE } from './config.js';
import { WAWKA, canvas } from './gameState.js';
import { range } from './utils.js';

/**
 * Перерисовать доску
 */
export function redrawBoard() {
  canvas.context.clearRect(0, 0, canvas.element.width, canvas.element.height);

  // Рисуем доску
  range(0, DASHBOARD_SIZE, 1).forEach((i) => {
    const x = i % DASHBOARD_COLS;
    const y = Math.floor(i / DASHBOARD_ROWS);
    const posX = x * WAWKA.cell.width;
    const posY = y * WAWKA.cell.height;

    // Цвет клетки
    if ((x + y) % 2 === 0) {
      canvas.context.fillStyle = '#f0d9b5';
    } else {
      canvas.context.fillStyle = '#b58863';
    }
    canvas.context.fillRect(posX, posY, WAWKA.cell.width, WAWKA.cell.height);

    // Подсветка выбранной шашки
    if (WAWKA.selectedChecker === i) {
      canvas.context.fillStyle = 'rgba(255, 255, 0, 0.5)';
      canvas.context.fillRect(posX, posY, WAWKA.cell.width, WAWKA.cell.height);
    }

    // Подсветка возможных ходов
    if (WAWKA.possibleMoves.some((move) => move.to === i)) {
      canvas.context.fillStyle = 'rgba(0, 255, 0, 0.3)';
      canvas.context.fillRect(posX, posY, WAWKA.cell.width, WAWKA.cell.height);
    }
  });

  // Рисуем шашки
  range(0, DASHBOARD_SIZE, 1).forEach((i) => {
    const cell = board[i];
    if (!cell.piece) return;

    const x = cell.x;
    const y = cell.y;
    const posX = x * WAWKA.cell.width;
    const posY = y * WAWKA.cell.height;
    const centerX = posX + WAWKA.cell.width / 2;
    const centerY = posY + WAWKA.cell.height / 2;
    const radius = WAWKA.cell.width / 2 - 5;

    // Рисуем шашку
    canvas.context.fillStyle =
      cell.piece.color === 'dark' ? '#2c2c2c' : '#ff4444';
    canvas.context.beginPath();
    canvas.context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    canvas.context.fill();

    // Обводка
    canvas.context.strokeStyle =
      cell.piece.color === 'dark' ? '#000000' : '#cc0000';
    canvas.context.lineWidth = 2;
    canvas.context.stroke();

    // Если дамка, рисуем корону
    if (cell.piece.isKing) {
      canvas.context.fillStyle =
        cell.piece.color === 'dark' ? '#ffd700' : '#ffff00';
      canvas.context.font = 'bold 20px Arial';
      canvas.context.textAlign = 'center';
      canvas.context.textBaseline = 'middle';
      canvas.context.fillText('♔', centerX, centerY);
    }
  });
}
