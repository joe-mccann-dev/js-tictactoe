// modules: [displayController, Gameboard]

// contains the current board state
// option to pass in updated board for testing purposes
// const testBoard = ['', '', 'x', '', '', 'x', '', '', 'x']
const Gameboard =
  (
    (
      cells = [
        '', '', '',
        '', '', '',
        '', '', ''
      ]
    ) => {
      const update = (marker, index) => {
        if (cells[index] === '') {
          displayController.updateCellElement(marker, index);
        }
        cells[index] = marker;
      };

      return { cells, update }
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

  const renderBoard = () => {
    Gameboard.cells.forEach((marker, index) => {
      const cellElement = document.createElement('div');
      _setColor(cellElement, marker);
      cellElement.classList.add('marker_container');
      cellElement.setAttribute('id', index);
      cellElement.textContent = marker;
      boardElement.appendChild(cellElement);
    });
  };

  const updateCellElement = (marker, index) => {
    console.log('updating cell...')
    const cellElement = document.getElementById(`${index}`)
    cellElement.textContent = marker;
    _setColor(cellElement, marker);
  };

  return { renderBoard, updateCellElement }
})();


// factories: [player, game]

// tells Gameboard where to mark
// has marker (string) attribute
const player = (marker) => {

  const markBoard = (index) => {
    Gameboard.update(marker, index);
  };

  return { markBoard }
};

// contains logic of tic tac toe
// controls turns
// determines if there is a winner or game is tied
const game = (
  player1 = player('x'),
  player2 = player('o'),
) => {
  displayController.renderBoard(Gameboard);

  const play = () => {

  };

  const winnerExists = () => {

  };

  const isTied = () => {

  };

  const isOver = () => {
  };

  return { play }

};


const newGame = game()
player1 = player('x')
player1.markBoard(0)
newGame.play();
