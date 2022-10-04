// modules: [displayController, Gameboard]

// contains the current board state
// option to pass in updated board for testing purposes
// const testBoard = ['', '', 'x', '', '', 'x', '', '', 'x'];
// const xWins = ['x', 'o', 'x', 'o', 'x', 'o', 'x', 'o', 'x'];
// const oWins = ['x', 'o', 'x', 'o', 'o', 'x', 'x', 'o', ''];
const tied = ['o', 'o', 'x', 'x', 'x', 'o', 'o', 'x', 'x']
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

      const lineOfX = () => {
        return (
          winLines.some(line => {
            return [cells[line[0]], cells[line[1]], cells[line[2]]]
              .every(c => c === 'x')
          })
        );
      };

      const lineOfO = () => {
        return (
          winLines.some(line => {
            return [cells[line[0]], cells[line[1]], cells[line[2]]]
              .every(c => c === 'o')
          })
        );
      };

      const isFull = () => {
        return (cells.every(c => c !== ''));
      };

      const update = (marker, index) => {
        if (cells[index] === '') { cells[index] = marker; }
      };

      return { cells, update, lineOfX, lineOfO, isFull }
    })();

// controls DOM manipulation
const displayController = (() => {
  const boardElement = document.getElementById('gameboard');

  const _determineMarkerColor = (marker) => {
    return marker === 'x' ? 'indigo' : 'yellow'
  }

  const _setColor = (cellElement, marker) => {
    const color = _determineMarkerColor(marker);
    cellElement.classList.add(color);
  };

  const renderBoard = (board) => {
    board.cells.forEach((marker, index) => {
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
    const index = e.target.id
    if (Gameboard.cells[index] !== '') { return; }

    const marker = currentGame.currentPlayerMarker()
    const cellElement = document.getElementById(`${index}`)
    cellElement.textContent = marker;
    _setColor(cellElement, marker);
    currentGame.update(index);
  };

  return { renderBoard }
})();


// factories: [player, game]

// tells Gameboard where to mark
// has marker (string) attribute
const player = (marker) => {

  const markBoard = (index) => Gameboard.update(marker, index);

  return { markBoard, marker }
};

// contains logic of tic tac toe
// controls turns
// allows players to mark board
// determines if there is a winner or game is tied
const game = (
  player1 = player('x'),
  player2 = player('o'),
) => {

  let currentPlayer = player1;

  const update = (index) => {
    currentPlayer.markBoard(index);
    setCurrentPlayer();
    if (winnerExists()) {
      console.log('winner')
    }

    if (isOver()) { 
      console.log('game over')
    }

    if (isTied()) {
      console.log('game is a draw')
    }
  };

  const setCurrentPlayer = () => {
    currentPlayer = currentPlayer === player1 ? player2 : player1;
  };

  const currentPlayerMarker = () => currentPlayer.marker;

  const winnerExists = () => {
    return ( player1Wins() || player2Wins() );
  }

  const player1Wins = () => Gameboard.lineOfX();
  const player2Wins = () => Gameboard.lineOfO();

  const isTied = () => {
    return Gameboard.isFull() && (!Gameboard.lineOfX() && !Gameboard.lineOfO())
  };

  const isOver = () => {
    return (winnerExists() || isTied()) 
  };

  return { update, currentPlayerMarker, setCurrentPlayer, currentPlayer }

};

let currentGame = game()
displayController.renderBoard(Gameboard);