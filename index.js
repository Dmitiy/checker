(function () {
  /** @type {HTMLCanvasElement}
   * @type CanvasRenderingContext2D
   * */

  const DASHBOARD_ROWS = 8;
  const DASHBOARD_COLS = 8;
  const DASHBOARD_SIZE = DASHBOARD_COLS * DASHBOARD_ROWS;
  const DARK_ROWS = 2;
  const WHITE_ROWS = 2;

  const WAWKA = {
    cell: { width: 50, height: 50 },
    currentPlayer: 'dark', // 'dark' или 'white'
    selectedChecker: null,
    possibleMoves: [],
    mustCapture: false,
    captureChain: null, // для множественных взятий
  };

  const canvas = {
    element: document.querySelector('canvas'),
    context: document.querySelector('canvas').getContext('2d'),
  };

  /**
   *
   * @param {Number} start
   * @param {Number} stop
   * @param {Number} step
   * @returns {Array<Number>}
   */
  function range(start, stop, step = 1) {
    return Array.from(
      { length: Math.ceil((stop - start) / step) },
      (_, i) => start + i * step
    );
  }

  const board = Array(DASHBOARD_SIZE)
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
   * Получить индекс ячейки по координатам
   */
  function getIndex(x, y) {
    if (x < 0 || x >= DASHBOARD_COLS || y < 0 || y >= DASHBOARD_ROWS) {
      return -1;
    }
    return y * DASHBOARD_COLS + x;
  }

  /**
   * Получить ячейку по координатам
   */
  function getCell(x, y) {
    const index = getIndex(x, y);
    return index >= 0 ? board[index] : null;
  }

  /**
   * Проверить, является ли ячейка темной (игровой)
   */
  function isDarkCell(x, y) {
    return (x + y) % 2 === 1;
  }

  /**
   * Получить все возможные ходы для шашки
   */
  function getPossibleMoves(cellIndex) {
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
   * Проверить возможность взятия в направлении
   * Возвращает массив всех возможных взятий в этом направлении (для дамки может быть несколько)
   */
  function checkCapture(cellIndex, dx, dy, isKing) {
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
   * Проверить, есть ли обязательные взятия для текущего игрока
   */
  function checkMustCapture() {
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
   * Проверить, может ли шашка продолжить взятие
   */
  function canContinueCapture(cellIndex) {
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

  /**
   * Переместить шашку
   */
  function moveChecker(fromIndex, toIndex) {
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

  /**
   * Перерисовать доску
   */
  function redrawBoard() {
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
        canvas.context.fillRect(
          posX,
          posY,
          WAWKA.cell.width,
          WAWKA.cell.height
        );
      }

      // Подсветка возможных ходов
      if (WAWKA.possibleMoves.some((move) => move.to === i)) {
        canvas.context.fillStyle = 'rgba(0, 255, 0, 0.3)';
        canvas.context.fillRect(
          posX,
          posY,
          WAWKA.cell.width,
          WAWKA.cell.height
        );
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

  /**
   * Обработчик клика
   */
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

  // Инициализация
  window.WAWKA = WAWKA;
  WAWKA.mustCapture = checkMustCapture();
  redrawBoard();
  WAWKA.moveChecker = moveChecker;
})();
