# Схема логики игры в шашки

## Основной поток игры

```mermaid
flowchart TD
    Start([Начало игры]) --> Init[Инициализация доски]
    Init --> Setup["Создание массива board и расстановка шашек"]
    Setup --> CheckCapture[Проверка обязательных взятий]
    CheckCapture --> Draw[Отрисовка доски]
    Draw --> WaitClick[Ожидание клика игрока]

    WaitClick --> ClickHandler[Обработчик клика]
    ClickHandler --> CheckChain{Есть цепочка взятий?}

    CheckChain -->|Да| ChainMove[Ход в цепочке взятий]
    CheckChain -->|Нет| CheckSelected{Шашка выбрана?}

    CheckSelected -->|Нет| SelectChecker[Выбор шашки]
    CheckSelected -->|Да| CheckSame{Клик по той же шашке?}

    CheckSame -->|Да| Deselect[Снятие выделения]
    CheckSame -->|Нет| CheckValid{Валидный ход?}

    CheckValid -->|Да| Move[Выполнение хода]
    CheckValid -->|Нет| CheckOther{Другая своя шашка?}

    CheckOther -->|Да| SelectChecker
    CheckOther -->|Нет| Deselect

    SelectChecker --> GetMoves[Получение возможных ходов]
    GetMoves --> Draw

    ChainMove --> Move
    Deselect --> Draw

    Move --> ValidateMove[Проверка валидности хода]
    ValidateMove --> ExecuteMove[Выполнение перемещения]
    ExecuteMove --> CheckCaptureMove{Это взятие?}

    CheckCaptureMove -->|Да| RemovePiece[Удаление взятой шашки]
    CheckCaptureMove -->|Нет| CheckKing

    RemovePiece --> CheckKing[Проверка превращения в дамку]
    CheckKing --> CheckContinue{Можно продолжить взятие?}

    CheckContinue -->|Да| SetChain[Установка цепочки взятий]
    CheckContinue -->|Нет| SwitchPlayer[Переключение игрока]

    SetChain --> Draw
    SwitchPlayer --> CheckCapture
```

## Логика проверки возможных ходов

```mermaid
flowchart TD
    Start([getPossibleMoves]) --> CheckPiece{Есть шашка текущего игрока?}
    CheckPiece -->|Нет| ReturnEmpty[Возврат пустого массива]
    CheckPiece -->|Да| CheckCaptures[Проверка обязательных взятий]

    CheckCaptures --> LoopDirections[Цикл по направлениям]
    LoopDirections --> CheckCaptureDir[checkCapture для направления]
    CheckCaptureDir --> HasCapture{Есть взятие?}

    HasCapture -->|Да| AddCapture[Добавить в массив взятий]
    HasCapture -->|Нет| NextDirection{Есть еще направления?}

    AddCapture --> NextDirection
    NextDirection -->|Да| LoopDirections
    NextDirection -->|Нет| CheckCapturesFound{Найдены взятия?}

    CheckCapturesFound -->|Да| ReturnCaptures[Возврат только взятий]
    CheckCapturesFound -->|Нет| CheckMustCapture{Обязательное взятие?}

    CheckMustCapture -->|Да| ReturnEmpty
    CheckMustCapture -->|Нет| CheckKing{Это дамка?}

    CheckKing -->|Да| KingMoves["Проверка ходов дамки на любое расстояние"]
    CheckKing -->|Нет| NormalMoves["Проверка ходов обычной шашки на одну клетку вперед"]

    KingMoves --> AddNormalMove[Добавить обычный ход]
    NormalMoves --> AddNormalMove
    AddNormalMove --> ReturnMoves[Возврат массива ходов]
```

## Логика взятия шашек

```mermaid
flowchart TD
    Start([checkCapture]) --> CheckKing{Это дамка?}

    CheckKing -->|Да| KingCapture[Логика взятия дамки]
    CheckKing -->|Нет| NormalCapture[Логика взятия обычной шашки]

    KingCapture --> KingLoop[Цикл по диагонали]
    KingLoop --> CheckCell{Проверка ячейки}
    CheckCell --> CheckPiece{Есть шашка?}

    CheckPiece -->|Своя| Break[Прервать цикл]
    CheckPiece -->|Вражеская| SetEnemy[Запомнить врага]
    CheckPiece -->|Пустая после врага| AddCapture["Добавить позицию для взятия"]

    SetEnemy --> NextCell[Следующая ячейка]
    AddCapture --> NextCell
    NextCell --> CheckCell

    NormalCapture --> CheckMiddle[Проверка промежуточной ячейки]
    CheckMiddle --> CheckEnemy{Вражеская шашка?}
    CheckEnemy -->|Нет| ReturnNull[Возврат null]
    CheckEnemy -->|Да| CheckJump[Проверка ячейки через одну]
    CheckJump --> CheckEmpty{Пустая?}
    CheckEmpty -->|Да| ReturnCapture[Возврат хода взятия]
    CheckEmpty -->|Нет| ReturnNull

    Break --> ReturnCaptures["Возврат массива взятий для дамки"]
    ReturnCaptures --> End
    ReturnCapture --> End
    ReturnNull --> End([Конец])
```

## Логика выполнения хода

```mermaid
flowchart TD
    Start([moveChecker]) --> Validate[Проверка валидности]
    Validate --> CheckPlayer{Шашка текущего игрока?}
    CheckPlayer -->|Нет| ReturnFalse[Возврат false]
    CheckPlayer -->|Да| CheckValidMove{Валидный ход?}

    CheckValidMove -->|Нет| ReturnFalse
    CheckValidMove -->|Да| CheckMust{Обязательное взятие?}

    CheckMust -->|Да| CheckIsCapture{Это взятие?}
    CheckMust -->|Нет| MovePiece
    CheckIsCapture -->|Нет| ReturnFalse
    CheckIsCapture -->|Да| MovePiece[Перемещение шашки]

    MovePiece --> CheckCapture{Это взятие?}
    CheckCapture -->|Да| RemoveEnemy[Удаление вражеской шашки]
    CheckCapture -->|Нет| CheckKing

    RemoveEnemy --> CheckKing[Проверка превращения в дамку]
    CheckKing --> CheckEdge{Достигла края доски?}

    CheckEdge -->|Да| MakeKing[Превращение в дамку]
    CheckEdge -->|Нет| CheckContinue

    MakeKing --> CheckContinue{Можно продолжить взятие?}
    CheckContinue -->|Да| SetChain["Установка цепочки взятий: captureChain = toIndex"]
    CheckContinue -->|Нет| SwitchPlayer[Переключение игрока]

    SetChain --> UpdateMoves["Обновление возможных ходов только для взятий"]
    SwitchPlayer --> ClearSelection[Очистка выделения]
    ClearSelection --> CheckNewCapture["Проверка обязательных взятий для нового игрока"]

    UpdateMoves --> Redraw[Отрисовка доски]
    CheckNewCapture --> Redraw
    Redraw --> ReturnTrue[Возврат true]
```

## Состояния игры

```mermaid
stateDiagram-v2
    [*] --> Инициализация
    Инициализация --> ОжиданиеХода: Доска создана

    ОжиданиеХода --> ВыборШашки: Клик по своей шашке
    ОжиданиеХода --> ОжиданиеХода: Клик вне доски

    ВыборШашки --> ОжиданиеХода: Клик по той же шашке
    ВыборШашки --> ВыполнениеХода: Клик по валидному ходу
    ВыборШашки --> ВыборШашки: Клик по другой своей шашке

    ВыполнениеХода --> ЦепочкаВзятий: Есть продолжение взятия
    ВыполнениеХода --> ОжиданиеХода: Ход завершен

    ЦепочкаВзятий --> ЦепочкаВзятий: Продолжение взятия
    ЦепочкаВзятий --> ОжиданиеХода: Нет продолжения

    ОжиданиеХода --> КонецИгры: Нет возможных ходов
    ОжиданиеХода --> КонецИгры: Все шашки противника взяты

    КонецИгры --> [*]
```

## Структура данных

```mermaid
classDiagram
    class WAWKA {
        +object cell
        +string currentPlayer
        +number selectedChecker
        +array possibleMoves
        +boolean mustCapture
        +number captureChain
    }

    class Board {
        +array board
        +number DASHBOARD_SIZE
    }

    class Cell {
        +number x
        +number y
        +Piece piece
    }

    class Piece {
        +string type
        +string color
        +boolean isKing
    }

    class Move {
        +number to
        +number capture
        +boolean isCapture
    }

    WAWKA --> Board : использует
    Board --> Cell : содержит
    Cell --> Piece : содержит
    WAWKA --> Move : хранит возможные ходы
```

## Алгоритм проверки обязательных взятий

```mermaid
flowchart TD
    Start([checkMustCapture]) --> Loop[Цикл по всем ячейкам доски]
    Loop --> CheckPiece{Есть шашка текущего игрока?}

    CheckPiece -->|Нет| NextCell[Следующая ячейка]
    CheckPiece -->|Да| GetMoves[getPossibleMoves для ячейки]

    GetMoves --> CheckHasCapture{Есть ходы со взятием?}
    CheckHasCapture -->|Да| ReturnTrue[Возврат true]
    CheckHasCapture -->|Нет| NextCell

    NextCell --> CheckEnd{Все ячейки проверены?}
    CheckEnd -->|Нет| Loop
    CheckEnd -->|Да| ReturnFalse[Возврат false]
```
