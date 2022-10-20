# README

The primary purpose of this repo is to practice using JavaScript factory functions and modules. Project guidelines found here: https://www.theodinproject.com/lessons/javascript-tic-tac-toe

## Features

- Game modes
  - Play against AI that makes a random move (easy mode, default).
  - Play against AI that uses minimax algorithm to choose the best move (hard mode, unbeatable).
  - Alternate turns with a human player.
- Keeps track of each player's score
- Highlights winning line

## Code

Code is organized using IIFE modules (`Gameboard`, `DisplayController`) and JavaScript factory functions (`player`, `computerPlayer`, `game`).

I decided to keep important information within the game factory's `state` object.

### Getting minimax function to align with an optimal move

[My implementation of minimax](https://github.com/joe-mccann-dev/js-tictactoe/blob/main/script.js#L292)

This was the most challenging aspect of this project. I found that I could easily enough replace the pseudocode for the algorithm found on [Wikipedia](https://en.wikipedia.org/wiki/Minimax) with JavaScript, and I could get it to return a heuristic value of 1, -1, or 0. However, associating that value with the optimal move proved challenging. 

At first I thought I needed to generate the entire game tree prior to calling minimax, then I realized that minimax will do this for me if I generate next board states with legal moves within minimax. 

I was able to associate the return value with an optimal move when I realized that I could store moves and scores in two separate arrays: Each move's index would line up with its associated score in the scores array. Then, `minimaxChoice = moves[maxScoreIndex];` for the maximizing player, and `minimaxChoice = moves[minScoreIndex];` for the minimizing player.
