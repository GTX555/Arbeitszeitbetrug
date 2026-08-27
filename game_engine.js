/**
 * Game Engine: Logic for Tic-Tac-Toe and 4-Gewinnt (Connect 4)
 * Supports move validation, win checking, minimax AI for solo play, and state resetting.
 */

// ==========================================
// 1. TIC-TAC-TOE ENGINE (3x3 Grid)
// ==========================================
class TicTacToeEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = Array(9).fill('');
    this.turn = 'X'; // 'X' or 'O'
    this.winner = null; // 'X', 'O', 'TIE', or null
    this.winningLine = null; // Array of 3 indices if won
    this.moveCount = 0;
  }

  makeMove(index) {
    if (index < 0 || index > 8) return false;
    if (this.board[index] !== '' || this.winner) return false;

    this.board[index] = this.turn;
    this.moveCount++;

    const winResult = this.checkWin(this.board);
    if (winResult) {
      this.winner = winResult.winner;
      this.winningLine = winResult.line;
    } else if (this.moveCount === 9) {
      this.winner = 'TIE';
    } else {
      this.turn = this.turn === 'X' ? 'O' : 'X';
    }
    return true;
  }

  checkWin(boardState) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], line };
      }
    }
    return null;
  }

  getAvailableMoves(boardState = this.board) {
    const moves = [];
    for (let i = 0; i < 9; i++) {
      if (boardState[i] === '') moves.push(i);
    }
    return moves;
  }

  // Minimax AI for Tic-Tac-Toe
  getAIMove(difficulty = 'hard') {
    const available = this.getAvailableMoves();
    if (available.length === 0) return null;

    if (difficulty === 'easy' && Math.random() < 0.6) {
      return available[Math.floor(Math.random() * available.length)];
    }

    const aiSymbol = this.turn;
    const huSymbol = aiSymbol === 'X' ? 'O' : 'X';

    let bestScore = -Infinity;
    let bestMove = available[0];

    for (let move of available) {
      this.board[move] = aiSymbol;
      let score = this.minimax(this.board, 0, false, aiSymbol, huSymbol);
      this.board[move] = '';
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, aiSymbol, huSymbol) {
    const winResult = this.checkWin(board);
    if (winResult) {
      if (winResult.winner === aiSymbol) return 10 - depth;
      if (winResult.winner === huSymbol) return depth - 10;
    }
    if (this.getAvailableMoves(board).length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let move of this.getAvailableMoves(board)) {
        board[move] = aiSymbol;
        let evaluation = this.minimax(board, depth + 1, false, aiSymbol, huSymbol);
        board[move] = '';
        maxEval = Math.max(maxEval, evaluation);
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of this.getAvailableMoves(board)) {
        board[move] = huSymbol;
        let evaluation = this.minimax(board, depth + 1, true, aiSymbol, huSymbol);
        board[move] = '';
        minEval = Math.min(minEval, evaluation);
      }
      return minEval;
    }
  }
}

// ==========================================
// 2. 4-GEWINNT / CONNECT 4 ENGINE (6 Rows x 7 Cols)
// ==========================================
class Connect4Engine {
  constructor() {
    this.ROWS = 6;
    this.COLS = 7;
    this.reset();
  }

  reset() {
    // 6 rows x 7 cols grid. Board[row][col], row 0 is top, row 5 is bottom.
    this.board = Array(this.ROWS).fill(null).map(() => Array(this.COLS).fill(0));
    this.turn = 1; // 1 = Player 1 (Red), 2 = Player 2 (Yellow)
    this.winner = null; // 1, 2, 'TIE', or null
    this.winningCoords = null; // Array of {r, c} objects
    this.moveHistory = [];
  }

  dropToken(col) {
    if (col < 0 || col >= this.COLS || this.winner) return null;

    // Find lowest empty row in column
    let targetRow = -1;
    for (let r = this.ROWS - 1; r >= 0; r--) {
      if (this.board[r][col] === 0) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return null; // Column is full

    this.board[targetRow][col] = this.turn;
    this.moveHistory.push({ row: targetRow, col, player: this.turn });

    const winResult = this.checkWin(this.board);
    if (winResult) {
      this.winner = winResult.winner;
      this.winningCoords = winResult.coords;
    } else if (this.isBoardFull()) {
      this.winner = 'TIE';
    } else {
      this.turn = this.turn === 1 ? 2 : 1;
    }

    return { row: targetRow, col, player: this.board[targetRow][col] };
  }

  isBoardFull() {
    for (let c = 0; c < this.COLS; c++) {
      if (this.board[0][c] === 0) return false;
    }
    return true;
  }

  getValidColumns(grid = this.board) {
    const valid = [];
    for (let c = 0; c < this.COLS; c++) {
      if (grid[0][c] === 0) valid.push(c);
    }
    return valid;
  }

  checkWin(grid) {
    // Horizontal check
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const val = grid[r][c];
        if (val !== 0 && val === grid[r][c+1] && val === grid[r][c+2] && val === grid[r][c+3]) {
          return { winner: val, coords: [{r,c}, {r,c:c+1}, {r,c:c+2}, {r,c:c+3}] };
        }
      }
    }

    // Vertical check
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const val = grid[r][c];
        if (val !== 0 && val === grid[r+1][c] && val === grid[r+2][c] && val === grid[r+3][c]) {
          return { winner: val, coords: [{r,c}, {r:r+1,c}, {r:r+2,c}, {r:r+3,c}] };
        }
      }
    }

    // Diagonal Down-Right (\)
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const val = grid[r][c];
        if (val !== 0 && val === grid[r+1][c+1] && val === grid[r+2][c+2] && val === grid[r+3][c+3]) {
          return { winner: val, coords: [{r,c}, {r:r+1,c:c+1}, {r:r+2,c:c+2}, {r:r+3,c:c+3}] };
        }
      }
    }

    // Diagonal Up-Right (/)
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        const val = grid[r][c];
        if (val !== 0 && val === grid[r-1][c+1] && val === grid[r-2][c+2] && val === grid[r-3][c+3]) {
          return { winner: val, coords: [{r,c}, {r:r-1,c:c+1}, {r:r-2,c:c+2}, {r:r-3,c:c+3}] };
        }
      }
    }

    return null;
  }

  // Connect 4 Minimax AI with Heuristic Evaluation
  getAIMove(difficulty = 'hard') {
    const validCols = this.getValidColumns();
    if (validCols.length === 0) return null;

    if (difficulty === 'easy' && Math.random() < 0.5) {
      return validCols[Math.floor(Math.random() * validCols.length)];
    }

    const depth = difficulty === 'hard' ? 4 : 2;
    let bestCol = validCols[0];
    let maxScore = -Infinity;

    const aiPlayer = this.turn;

    for (let col of validCols) {
      // Simulate move
      const tempBoard = this.board.map(row => [...row]);
      let r = -1;
      for (let row = this.ROWS - 1; row >= 0; row--) {
        if (tempBoard[row][col] === 0) { r = row; break; }
      }
      tempBoard[r][col] = aiPlayer;

      let score = this.minimaxConnect4(tempBoard, depth - 1, -Infinity, Infinity, false, aiPlayer);
      if (score > maxScore) {
        maxScore = score;
        bestCol = col;
      }
    }

    return bestCol;
  }

  minimaxConnect4(grid, depth, alpha, beta, isMaximizing, aiPlayer) {
    const winResult = this.checkWin(grid);
    const huPlayer = aiPlayer === 1 ? 2 : 1;

    if (winResult) {
      if (winResult.winner === aiPlayer) return 100000 + depth;
      if (winResult.winner === huPlayer) return -100000 - depth;
    }
    if (depth === 0 || this.getValidColumns(grid).length === 0) {
      return this.evaluateBoard(grid, aiPlayer);
    }

    const validCols = this.getValidColumns(grid);

    if (isMaximizing) {
      let value = -Infinity;
      for (let col of validCols) {
        const nextGrid = grid.map(row => [...row]);
        let r = -1;
        for (let row = this.ROWS - 1; row >= 0; row--) {
          if (nextGrid[row][col] === 0) { r = row; break; }
        }
        nextGrid[r][col] = aiPlayer;

        value = Math.max(value, this.minimaxConnect4(nextGrid, depth - 1, alpha, beta, false, aiPlayer));
        alpha = Math.max(alpha, value);
        if (alpha >= beta) break; // Pruning
      }
      return value;
    } else {
      let value = Infinity;
      for (let col of validCols) {
        const nextGrid = grid.map(row => [...row]);
        let r = -1;
        for (let row = this.ROWS - 1; row >= 0; row--) {
          if (nextGrid[row][col] === 0) { r = row; break; }
        }
        nextGrid[r][col] = huPlayer;

        value = Math.min(value, this.minimaxConnect4(nextGrid, depth - 1, alpha, beta, true, aiPlayer));
        beta = Math.min(beta, value);
        if (alpha >= beta) break; // Pruning
      }
      return value;
    }
  }

  evaluateBoard(grid, aiPlayer) {
    let score = 0;
    const huPlayer = aiPlayer === 1 ? 2 : 1;

    // Center column preference
    const centerArray = [];
    for (let r = 0; r < this.ROWS; r++) {
      centerArray.push(grid[r][3]);
    }
    const centerCount = centerArray.filter(v => v === aiPlayer).length;
    score += centerCount * 3;

    // Evaluate 4-cell windows
    const evaluateWindow = (windowArr) => {
      let windowScore = 0;
      const aiCount = windowArr.filter(v => v === aiPlayer).length;
      const emptyCount = windowArr.filter(v => v === 0).length;
      const huCount = windowArr.filter(v => v === huPlayer).length;

      if (aiCount === 4) windowScore += 100;
      else if (aiCount === 3 && emptyCount === 1) windowScore += 5;
      else if (aiCount === 2 && emptyCount === 2) windowScore += 2;

      if (huCount === 3 && emptyCount === 1) windowScore -= 4;

      return windowScore;
    };

    // Horizontal windows
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        score += evaluateWindow([grid[r][c], grid[r][c+1], grid[r][c+2], grid[r][c+3]]);
      }
    }

    // Vertical windows
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c < this.COLS; c++) {
        score += evaluateWindow([grid[r][c], grid[r+1][c], grid[r+2][c], grid[r+3][c]]);
      }
    }

    // Diagonals
    for (let r = 0; r <= this.ROWS - 4; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        score += evaluateWindow([grid[r][c], grid[r+1][c+1], grid[r+2][c+2], grid[r+3][c+3]]);
      }
    }
    for (let r = 3; r < this.ROWS; r++) {
      for (let c = 0; c <= this.COLS - 4; c++) {
        score += evaluateWindow([grid[r][c], grid[r-1][c+1], grid[r-2][c+2], grid[r-3][c+3]]);
      }
    }

    return score;
  }
}

window.TicTacToeEngine = TicTacToeEngine;
window.Connect4Engine = Connect4Engine;
