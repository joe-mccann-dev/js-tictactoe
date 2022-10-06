// modules = [Gameboard, DisplayController];
// factories = [player, game];

// application flow:
// DisplayController listens for input from player;
// player clicks DOM element;
// DisplayController updates DOM;
// currentGame.update calls currentPlayer.markBoard;
// Gameboard object is updated.

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
        return cells;
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
  const formContainer = document.querySelector('.form_container');
  const form = document.querySelector('#form');
  const player1Input = document.querySelector('#player1_name');
  const player2Input = document.querySelector('#player2_name');
  const player1NameDisplay = document.querySelector('#player1_name_display');
  const player2NameDisplay = document.querySelector('#player2_name_display');
  const player1Score = document.querySelector('#player1_score');
  const player2Score = document.querySelector('#player2_score');
  const playComputerCheckbox = document.querySelector('#play_computer');

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
    if (Gameboard.cells[index] !== '' || currentGame.state.isOver()) { return; }

    updateDOM(index);
    currentGame.update(index);
    showScores(currentGame.state);
  };

  const updateDOM = (index) => {
    const marker = currentGame.currentPlayerMarker();
    const cellElement = document.getElementById(index)
    cellElement.textContent = marker;
    _setColor(cellElement, marker);
  };

  const showScores = (gameState) => {
    if (!gameState.players.some(p => p.score.wins > 0)) { return; }

    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    player1NameDisplay.textContent = `${player1.name}`;
    player2NameDisplay.textContent = `${player2.name}`;
    player1Score.textContent = `${player1.score.wins}`;
    player2Score.textContent = `${player2.score.wins}`;
  };

  const showGameResult = (result) => {
    resultElement.textContent = result;
    resultElement.classList.remove('hidden');
    resetButton.classList.remove('hidden');
  };

  return {
    renderBoard,
    updateCellElement,
    showGameResult,
    updateDOM,
    boardElement,
    resultElement,
    formContainer,
    form,
    player1Input,
    player2Input,
    resetButton,
    playComputerCheckbox
  };
})();

// tells Gameboard where to mark
const player = (marker, name) => {
  const markBoard = (index) => Gameboard.update(marker, index);

  const score = {
    wins: 0,
    incrementWins: () => {
      return score.wins += 1;
    }
  }

  return { markBoard, marker, name, score };
};

const computerPlayer = (marker = 'o') => {
  const cpu = player(marker, 'computer')

  const markBoard = () => {
    if (currentGame.state.isOver()) { return; }

    const legalIndexes = _findAvailableIndexes();
    const randomIndex = _getRandomInt(legalIndexes.length);
    const indexToMark = legalIndexes[randomIndex]
    Gameboard.update(marker, indexToMark);
    DisplayController.updateDOM(indexToMark);
  }

  const _findAvailableIndexes = () => {
    const openIndexes = [];
    const cells = Gameboard.cells;
    for (let index = 0; index < cells.length; index++) {
      if (cells[index] === '') { openIndexes.push(index); }
    }
    return openIndexes;
  };

  const _getRandomInt = (max) => Math.floor(Math.random() * max);

  return Object.assign({}, cpu, { markBoard })
};

// contains logic of tic tac toe
// controls turns
// allows players to mark board
// determines if there is a winner or game is tied
const game = (player1, player2, AI = false) => {

  const state = {
    players: [player1, player2],
    currentPlayer: player1,
    result: 'draw',
    AIGame: AI,
    isOver: () => state.winnerExists() || state.isTied(),
    winnerExists: () => {
      return (
        Gameboard.lineOfThree(player1.marker) ||
        Gameboard.lineOfThree(player2.marker)
      )
    },
    isTied: () => {
      return Gameboard.isFull() &&
        (
          !Gameboard.lineOfThree(player1.marker) &&
          !Gameboard.lineOfThree(player2.marker)
        );
    },
  }

  const update = (index) => {
    if (AI) {
      _playComputer(index);
    } else {
      _playHuman(index);
    }
    if (state.isOver()) { _doFinalTasks(state) }
  };

  const _playComputer = (index) => {
    player1.markBoard(index);
    _toggleCurrentPlayer(player1);
    player2.markBoard();
    _toggleCurrentPlayer(player2);
  };

  const _playHuman = (index) => {
    const player = state.currentPlayer;
    player.markBoard(index);
    _toggleCurrentPlayer(player);
  };

  const _doFinalTasks = (state) => {
    if (state.winnerExists()) { _declareWinner(state); }
    _showGameResult(state);
  };

  const _declareWinner = (state) => {
    const player = state.currentPlayer;
    state.result = `${player.name} wins!`;
    player.score.incrementWins();
  };

  const _showGameResult = (state) => {
    DisplayController.showGameResult(state.result)
  }

  const _toggleCurrentPlayer = (current) => {
    if (state.isOver()) { return; }

    return state.currentPlayer = current === player1 ? player2 : player1;
  };

  const currentPlayerMarker = () => state.currentPlayer.marker;

  return {
    update,
    currentPlayerMarker,
    state,
  };
};

const togglePlayer2 = (e) => {
  DisplayController.player2Input.disabled = e.target.checked ? true : false;
};
DisplayController.playComputerCheckbox.addEventListener('click', togglePlayer2);

let currentGame;
DisplayController.form.addEventListener('submit', () => {
  DisplayController.formContainer.classList.add('hidden');
  const player1Name = DisplayController.player1Input.value || 'Player1';
  const player2Name = DisplayController.player2Input.value || 'Player2';
  const wantsToPlayComputer = DisplayController.playComputerCheckbox.checked;
  if (wantsToPlayComputer) {
    currentGame = game(player('x', player1Name), computerPlayer(), true);
  } else {
    currentGame = game(player('x', player1Name), player('o', player2Name));
  }
  DisplayController.renderBoard();
});

const startNewGame = () => {
  const state = currentGame.state
  currentGame = game(state.players[0], state.players[1], state.AIGame);
  Gameboard.reset();
  DisplayController.resetButton.classList.add('hidden');
  DisplayController.resultElement.classList.add('hidden');
  DisplayController.boardElement.replaceChildren();
  DisplayController.renderBoard();
};
DisplayController.resetButton.addEventListener('click', startNewGame);
