// modules = [Gameboard, DisplayController];
// factories = [player, game];

// application flow:
// DisplayController listens for input from player;
// player clicks DOM element;
// DisplayController updates DOM;
// currentGame.update calls currentPlayer.markBoard;
// Gameboard object is updated.

// contains the current board state, option to pass in updated board
// for testing purposes:
// const testBoard = ['', '', 'x', '', '', 'x', '', '', 'x'];
// const xWins = ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o', 'x'];
// const oWins = ['x', 'o', 'x', 'o', 'o', 'x', 'x', 'o', ''];
// const tied = ['o', 'o', 'x', 'x', 'x', 'o', 'o', 'x', 'x']
const Gameboard =
  (
    (
      cells = [
        '', '', '',
        '', '', '',
        '', '', ''
      ]
    ) => {
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
      ]

      const lineOfThree = (marker) => {
        return (
          winLines.some(line => {
            return [cells[line[0]], cells[line[1]], cells[line[2]]]
              .every(c => c === marker);
          })
        );
      };

      const isFull = () => cells.every(c => c !== '');

      const update = (marker, index) => {
        if (cells[index] === '') { cells[index] = marker; }
      };

      const reset = () => {
        for (let i in cells) {
          cells[i] = '';
        }
      };

      return { cells, update, lineOfThree, isFull, reset };
    })();

// controls DOM manipulation
// updates DOM and then updates the game state 
const DisplayController = (() => {
  const boardElement = document.getElementById('gameboard');
  const resultElement = document.querySelector('.result');
  const resetButton = document.querySelector('.button_reset');

  const _determineMarkerColor = (marker) => {
    return marker === 'x' ? 'indigo' : 'yellow';
  }

  const _setColor = (cellElement, marker) => {
    const color = _determineMarkerColor(marker);
    cellElement.classList.add(color);
  };

  const renderBoard = () => {
    Gameboard.cells.forEach((marker, index) => {
      const cellElement = document.createElement('div');
      _setColor(cellElement, marker);
      cellElement.classList.add('marker_container');
      cellElement.setAttribute('id', index);
      cellElement.addEventListener('click', updateCellElement);
      cellElement.textContent = marker;
      boardElement.appendChild(cellElement);
    });
  };

  const updateCellElement = (e) => {
    const index = e.target.id;
    if (Gameboard.cells[index] !== '' || currentGame.isOver()) { return; }

    const marker = currentGame.currentPlayerMarker()
    const cellElement = document.getElementById(`${index}`)
    cellElement.textContent = marker;
    _setColor(cellElement, marker);
    currentGame.update(index);
  };

  const showGameResult = (result) => {
    resultElement.textContent = result;
    resultElement.classList.remove('hidden');
    resetButton.classList.remove('hidden');
  };

  return { renderBoard, showGameResult, boardElement, resultElement, resetButton };
})();

// tells Gameboard where to mark
const player = (marker, name) => {
  const markBoard = (index) => Gameboard.update(marker, index);

  return { markBoard, marker, name };
};

// contains logic of tic tac toe
// controls turns
// allows players to mark board
// determines if there is a winner or game is tied
const game = (
  player1 = player('x', 'player1'),
  player2 = player('o', 'player2'),
) => {

  let currentPlayer = player1;
  let result = 'draw';

  const update = (index) => {
    currentPlayer.markBoard(index);
    if (winnerExists()) { result = `${currentPlayer.name} wins!`; }
    if (isOver()) { DisplayController.showGameResult(result) }
    setCurrentPlayer();
  };

  const setCurrentPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const currentPlayerMarker = () => currentPlayer.marker;

  const winnerExists = () => {
    return (player1Wins() || player2Wins());
  }

  const player1Wins = () => Gameboard.lineOfThree(player1.marker);
  const player2Wins = () => Gameboard.lineOfThree(player2.marker);

  const isTied = () => {
    return Gameboard.isFull() &&
      (!Gameboard.lineOfThree(player1.marker) && !Gameboard.lineOfThree(player2.marker));
  };

  const isOver = () => winnerExists() || isTied();

  return { update, currentPlayerMarker, setCurrentPlayer, isOver, currentPlayer };
};

const startNewGame = () => {
  currentGame = game();
  Gameboard.reset();
  DisplayController.resetButton.classList.add('hidden');
  DisplayController.resultElement.classList.add('hidden');
  DisplayController.boardElement.replaceChildren();
  DisplayController.renderBoard();
};

let currentGame = game();
DisplayController.renderBoard();
DisplayController.resetButton.addEventListener('click', startNewGame);
