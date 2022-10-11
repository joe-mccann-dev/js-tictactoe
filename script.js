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
      ];

      const winningLine = { 'current': [] };


      const lineOfThree = (marker, board = cells) => {
        return (
          winLines.some(line => {
            if (
              [board[line[0]], board[line[1]], board[line[2]]]
                .every(c => c === marker)
            ) {
              winningLine['current'] = line;
              return true;
            }
          })
        );
      };

      const isFull = (board = cells) => board.every(c => c !== '');

      const update = (marker, index) => {
        if (cells[index] === '') { cells[index] = marker; }
        return cells;
      };

      const reset = () => {
        for (let i in cells) {
          cells[i] = '';
        }
      };

      return { cells, winningLine, update, lineOfThree, isFull, reset };
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

  const highlightWinningLine = () => {
    Gameboard.winningLine['current'].forEach((index) => {
      const cellElement = document.getElementById(index);
      cellElement.classList.add('highlighted');
    });
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
    const cellElement = document.getElementById(index);
    cellElement.textContent = marker;
    _setColor(cellElement, marker);
  };

  const showScores = (gameState) => {
    if (!gameState.players.some(p => p.score.wins > 0)) { return; }

    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    player1NameDisplay.textContent = player1.name;
    player2NameDisplay.textContent = player2.name;
    player1Score.classList.remove('hidden');
    player2Score.classList.remove('hidden');
    player1Score.textContent = player1.score.wins;
    player2Score.textContent = player2.score.wins;
  };

  const showGameResult = (result) => {
    resultElement.textContent = result;
    resultElement.classList.remove('hidden');
    resultElement.classList.add('highlighted');
    resetButton.classList.remove('hidden');
  };

  const _determineMarkerColor = (marker) => {
    return marker === 'x' ? 'indigo' : 'yellow';
  }

  const _setColor = (cellElement, marker) => {
    const color = _determineMarkerColor(marker);
    cellElement.classList.add(color);
  };

  return {
    renderBoard,
    updateCellElement,
    showGameResult,
    updateDOM,
    highlightWinningLine,
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
    incrementWins: function () { return this.wins += 1; }
  }

  return { markBoard, marker, name, score };
};

const computerPlayer = (marker = 'o') => {
  const cpu = player(marker, 'computer')

  const markBoard = () => {
    if (currentGame.state.isOver()) { return; }

    const legalIndexes = _findAvailableIndexes();
    const randomIndex = _getRandomInt(legalIndexes.length);
    const indexToMark = legalIndexes[randomIndex];
    Gameboard.update(marker, indexToMark);
    DisplayController.updateDOM(indexToMark);
  };

  const smartMarkBoard = () => {
    if (currentGame.state.isOver()) { return; }
    const comp = currentGame.state.players[1]
    const human = currentGame.state.players[0]
    const boards = currentGame.generateNextBoardStates(comp);
    const result = currentGame.negamax(boards, boards.length, 1, comp)
    console.log(currentGame.state.negamaxBoards);
    const indexToMark = determineNegamaxMove(result);
    Gameboard.update(marker, indexToMark);
    DisplayController.updateDOM(indexToMark);
    return result;
  };

  const determineNegamaxMove = (value) => {
    const board = currentGame.state.negamaxBoards[value];
    for (let i = 0; i < board.length; i++) {
      if (Gameboard.cells[i] === '') {
        return i
      }
    }
  };

  const _findAvailableIndexes = (cells = Gameboard.cells) => {
    const openIndexes = [];
    for (let index = 0; index < cells.length; index++) {
      if (cells[index] === '') { openIndexes.push(index); }
    }
    return openIndexes;
  };

  const _getRandomInt = (max) => Math.floor(Math.random() * max);

  return Object.assign({}, cpu, { markBoard, smartMarkBoard });
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
    negamaxPlayer: player2,
    negamaxBoards: {},
    isOver: function () { return this.winnerExists() || this.isTied() },
    winnerExists: (board = Gameboard.cells) => {
      return (
        Gameboard.lineOfThree(player1.marker, board) ||
        Gameboard.lineOfThree(player2.marker, board)
      )
    },
    isTied: (board = Gameboard.cells) => {
      return Gameboard.isFull() &&
        (
          !Gameboard.lineOfThree(player1.marker, board) &&
          !Gameboard.lineOfThree(player2.marker, board)
        );
    },
  };

  const currentPlayerMarker = () => state.currentPlayer.marker;

  const update = (index) => {
    AI ? _playComputer(index) : _playHuman(index);
    if (state.isOver()) { _performEndGameTasks(state); }
  };

  const generateNextBoardStates = (player, board = Gameboard.cells) => {
    const result = [];
    const gameBoardCopy = Gameboard.cells.map(m => m);
    for (let i = 0; i < gameBoardCopy.length; i++) {
      const copy = gameBoardCopy.map(m => m);
      if (gameBoardCopy[i] === '') {
        copy[i] = player.marker;
        result.push(copy);
      }
    };
    return result;
  };

  const evaluatePotentialBoard = (board) => {
    const otherPlayer = state.negamaxPlayer === state.players[0] ?
      state.players[1] :
      state.players[0]
    let result;
    if (Gameboard.lineOfThree(state.negamaxPlayer.marker, board)) {
      result = 1;
    } else if (Gameboard.lineOfThree(otherPlayer.marker, board)) {
      result = -1;
    } else {
      result = 0;
    }
    state.negamaxBoards[[result]] = board;
    return result;
  };

  const negamax = (nodes, depth, color) => {
    const node = nodes[0]
    if (
      nodes.length === 0 || depth === 0 ||
      Gameboard.isFull(node) || state.winnerExists(node)
    ) {
      return color * evaluatePotentialBoard(node)
    }

    let value = Number.NEGATIVE_INFINITY;
    value = Math.max(
      value,
      -negamax(nodes.slice(1, nodes.length), depth - 1, -color)
    )

    state.negamaxPlayer = state.negamaxPlayer === state.players[0] ? state.players[1] : state.players[0]

    return value
  };

  const _playComputer = (index) => {
    player1.markBoard(index);
    _toggleCurrentPlayer(player1);
    player2.smartMarkBoard();
    _toggleCurrentPlayer(player2);
  };

  const _playHuman = (index) => {
    const player = state.currentPlayer;
    player.markBoard(index);
    _toggleCurrentPlayer(player);
  };

  const _performEndGameTasks = (state) => {
    if (state.winnerExists()) { _declareWinner(state); }
    DisplayController.showGameResult(state.result);
  };

  const _declareWinner = (state) => {
    const player = state.currentPlayer;
    state.result = `${player.name} wins!`;
    player.score.incrementWins();
    DisplayController.highlightWinningLine();
  };

  const _toggleCurrentPlayer = (current) => {
    if (state.isOver()) { return; }

    return state.currentPlayer = current === player1 ? player2 : player1;
  };

  return {
    update,
    negamax,
    generateNextBoardStates,
    evaluatePotentialBoard,
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
