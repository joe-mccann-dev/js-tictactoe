// modules = [Gameboard, DisplayController];
// factories = [player, game];

// application flow:
// DisplayController listens for input from player;
// player clicks DOM element;
// DisplayController updates DOM;
// currentGame.update calls currentPlayer.markBoard;
// Gameboard object is updated.

// controls DOM manipulation
// updates DOM and then updates the game state 
const DisplayController = (() => {
  const boardElement = document.getElementById('gameboard');
  const resultElement = document.querySelector('.result');
  const resetButton = document.querySelector('.button_reset');
  const resetGame = document.querySelector('.button_reset_game');
  const formContainer = document.querySelector('.form_container');
  const form = document.querySelector('#form');
  const player1Input = document.querySelector('#player1_name');
  const player2Input = document.querySelector('#player2_name');
  const scoreContainers = document.querySelectorAll('.score_container');
  const player1NameDisplay = document.querySelector('#player1_name_display');
  const player2NameDisplay = document.querySelector('#player2_name_display');
  const player1Score = document.querySelector('#player1_score');
  const player2Score = document.querySelector('#player2_score');
  const playComputerCheckbox = document.querySelector('#play_computer');
  const modes = document.querySelectorAll('.mode');
  const easyMode = document.querySelector('#easy_mode');
  const hardMode = document.querySelector('#hard_mode');

  const highlightWinningLine = () => {
    Gameboard.winningLine['current'].forEach((index) => {
      const cellElement = document.getElementById(index);
      cellElement.classList.add('highlighted');
    });
  };

  const renderBoard = () => {
    scoreContainers.forEach(container => container.classList.remove('hidden'));
    showScores(currentGame.state);
    boardElement.classList.remove('hidden');
    boardElement.classList.add('gameboard_border');
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
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    player1NameDisplay.textContent = player1.name;
    if (gameState.AIGame) {
      player2NameDisplay.textContent = gameState.hardMode ?
        `${player2.name} (hard)` :
        `${player2.name} (easy)`
    } else {
      player2NameDisplay.textContent = player2.name;
    }
    player1Score.classList.add('highlighted');
    player2Score.classList.add('highlighted');
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
    resetGame,
    playComputerCheckbox,
    modes,
    easyMode,
    hardMode
  };
})();


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

      const winningLine = { current: [] };

      const lineOfThree = (marker, board = cells) => {
        return (
          winLines.some(line => {
            if (
              [board[line[0]], board[line[1]], board[line[2]]]
                .every(c => c === marker)
            ) {
              winningLine.current = line;
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

      const openSpaceCount = () => cells.filter(c => c === '').length;

      const availableIndexes = (board = cells) => {
        const openIndexes = [];
        for (let index = 0; index < board.length; index++) {
          if (board[index] === '') { openIndexes.push(index); }
        }
        return openIndexes;
      };

      return {
        cells,
        winningLine,
        update,
        lineOfThree,
        isFull,
        reset,
        openSpaceCount,
        availableIndexes
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

    const legalIndexes = Gameboard.availableIndexes();
    const randomIndex = _getRandomInt(legalIndexes.length);
    const indexToMark = legalIndexes[randomIndex];
    Gameboard.update(marker, indexToMark);
    DisplayController.updateDOM(indexToMark);
  };

  const smartMarkBoard = () => {
    if (currentGame.state.isOver()) { return; }

    const openSpaces = Gameboard.openSpaceCount();
    // calling minimax sets minimaxChoice within game's state object
    currentGame.minimax(Gameboard.cells, openSpaces, false);
    const indexToMark = currentGame.state.minimaxChoice;

    Gameboard.update(marker, indexToMark);
    DisplayController.updateDOM(indexToMark);
    return indexToMark;
  };

  const _getRandomInt = (max) => Math.floor(Math.random() * max);

  return Object.assign({}, cpu, { markBoard, smartMarkBoard });
};

// contains logic of tic tac toe
// controls turns
// allows players to mark board
// determines if there is a winner or game is tied
const game = (
  player1,
  player2,
  AI = false,
  hardMode = false
) => {

  const state = {
    players: [player1, player2],
    currentPlayer: player1,
    AIGame: AI,
    hardMode: hardMode,
    minimaxChoice: null,
    result: 'draw',
    isOver: function (board = Gameboard.cells) {
      return this.winnerExists(board) || this.isTied(board)
    },
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

  const _playComputer = (index) => {
    player1.markBoard(index);
    _toggleCurrentPlayer(player1);
    hardMode ? player2.smartMarkBoard() : player2.markBoard();
    _toggleCurrentPlayer(player2);
  };

  const _playHuman = (index) => {
    const player = state.currentPlayer;
    player.markBoard(index);
    _toggleCurrentPlayer(player);
  };

  const _performEndGameTasks = (state) => {
    if (!state.isOver()) { return; }

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

  const _evaluateBoard = (board) => {
    if (Gameboard.lineOfThree(player1.marker, board)) { return 1; }
    if (Gameboard.lineOfThree(player2.marker, board)) { return -1; }
    return 0;
  };

  const _nextBoardState = (board, move, marker) => {
    boardCopy = board.map(m => m);
    boardCopy[move] = marker;
    return boardCopy;
  };

  const minimax = (board, depth, maximizingPlayer) => {
    if (depth === 0 || state.isOver(board)) { return _evaluateBoard(board) }

    const scores = [];
    const moves = [];
    const availableMoves = Gameboard.availableIndexes(board);

    const gatherScoresForMoves = (marker, maximizingPlayer) => {
      availableMoves.forEach(move => {
        const potentialBoard = _nextBoardState(board, move, marker);
        const minimaxResult = minimax(potentialBoard, depth - 1, maximizingPlayer);
        scores.push(minimaxResult);
        moves.push(move);
      });
    };

    if (maximizingPlayer) {
      gatherScoresForMoves(player1.marker, false);
      const maxScoreIndex = scores.indexOf(Math.max(...scores));
      state.minimaxChoice = moves[maxScoreIndex];
      return scores[maxScoreIndex];
    } else {
      gatherScoresForMoves(player2.marker, true)
      const minScoreIndex = scores.indexOf(Math.min(...scores));
      state.minimaxChoice = moves[minScoreIndex];
      return scores[minScoreIndex];
    }
  };

  const currentPlayerMarker = () => state.currentPlayer.marker;

  const update = (index) => { 
    AI ? _playComputer(index) : _playHuman(index);
    _performEndGameTasks(state);
  }

  return {
    update,
    minimax,
    currentPlayerMarker,
    state,
  };
};

const togglePlayer2 = (e) => {
  DisplayController.player2Input.disabled = e.target.checked ? true : false;
  DisplayController.player2Input.value = '';
  DisplayController.modes.forEach((mode) => mode.disabled = mode.disabled ? false : true)
};
DisplayController.player2Input.disabled = true;
DisplayController.playComputerCheckbox.addEventListener('click', togglePlayer2);

let currentGame;
DisplayController.form.addEventListener('submit', (e) => {
  e.preventDefault();

  DisplayController.formContainer.classList.add('hidden');
  const player1Name = DisplayController.player1Input.value || 'Player1';
  const player2Name = DisplayController.player2Input.value || 'Player2';
  const wantsToPlayComputer = DisplayController.playComputerCheckbox.checked;
  if (wantsToPlayComputer) {
    const hardMode = DisplayController.hardMode.checked;
    currentGame = game(player('x', player1Name), computerPlayer(), wantsToPlayComputer, hardMode);
  } else {
    currentGame = game(player('x', player1Name), player('o', player2Name));
  }
  DisplayController.renderBoard();
  DisplayController.resetGame.classList.remove('hidden');
});

const startNewGame = () => {
  const state = currentGame.state
  currentGame = game(state.players[0], state.players[1], state.AIGame, state.hardMode);
  Gameboard.reset();
  DisplayController.resetButton.classList.add('hidden');
  DisplayController.resultElement.classList.add('hidden');
  DisplayController.boardElement.replaceChildren();
  DisplayController.renderBoard();
};
DisplayController.resetButton.addEventListener('click', startNewGame);

DisplayController.resetGame.addEventListener('click', () => {
  window.location.reload();
});
