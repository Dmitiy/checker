import { WAWKA } from './gameState.js';
import { checkMustCapture } from './gameLogic.js';
import { moveChecker } from './gameLogic.js';
import { redrawBoard } from './render.js';
import { setupClickHandler } from './events.js';

// Инициализация игры
function init() {
  // Настройка обработчика кликов
  setupClickHandler();

  // Проверка обязательных взятий
  WAWKA.mustCapture = checkMustCapture();

  // Первая отрисовка доски
  redrawBoard();

  // Экспорт функций в глобальную область для отладки
  window.WAWKA = WAWKA;
  WAWKA.moveChecker = moveChecker;
}

// Запуск игры после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
