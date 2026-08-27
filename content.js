/**
 * Top-Right Arcade Extension - "Arbeitszeitbetrug" v4.2
 * Changes:
 * - Removed score counter (3-0) from status bar for a cleaner header.
 * - Pawn Chess Fix: Strict forward-only pawn moves & diagonal captures only on enemy pieces. No sideways steps.
 * - Smooth Chess Slide / Pop Animations on piece moves.
 * - EPIC Casino Jackpot Effect: Screen shake, flashing rainbow glow, confetti emoji rain overlay, and fanfare sound!
 */
(function () {
  'use strict';

  console.log('%c[Arbeitszeitbetrug] Extension initializing v4.2...', 'color: #818cf8; font-weight: bold;');

  if (document.getElementById('bg-arcade-floating-host')) return;

  // Sound Synthesizer (Muted by Default)
  let soundMuted = true;

  function playBeep(freq = 440, type = 'sine', duration = 0.1) {
    if (soundMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playWinSound() {
    if (soundMuted) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      setTimeout(() => playBeep(f, 'triangle', 0.2), i * 90);
    });
  }

  function playJackpotFanfare() {
    if (soundMuted) return;
    [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98].forEach((f, i) => {
      setTimeout(() => playBeep(f, 'square', 0.25), i * 80);
    });
  }

  function playSlotSpinSound() {
    if (soundMuted) return;
    [300, 350, 400, 450, 500].forEach((f, i) => {
      setTimeout(() => playBeep(f, 'sine', 0.05), i * 60);
    });
  }

  // Tic-Tac-Toe Engine
  class TTT {
    constructor() { this.reset(); }
    reset() {
      this.b = Array(9).fill('');
      this.turn = 'X';
      this.winner = null;
      this.winLine = null;
    }
    move(i) {
      if (i < 0 || i > 8 || this.b[i] || this.winner) return false;
      this.b[i] = this.turn;
      const winResult = this.checkWin(this.turn);
      if (winResult) {
        this.winner = this.turn;
        this.winLine = winResult;
      } else if (!this.b.includes('')) {
        this.winner = 'TIE';
      } else {
        this.turn = this.turn === 'X' ? 'O' : 'X';
      }
      return true;
    }
    checkWin(sym) {
      const lines = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Cols
        [0,4,8], [2,4,6]          // Diagonals
      ];
      for (let l of lines) {
        if (this.b[l[0]] === sym && this.b[l[1]] === sym && this.b[l[2]] === sym) {
          return l;
        }
      }
      return null;
    }
    getAIMove() {
      const avail = [];
      for (let i = 0; i < 9; i++) if (!this.b[i]) avail.push(i);
      if (avail.length === 0 || this.winner) return null;
      for (let i of avail) {
        this.b[i] = 'O';
        if (this.checkWin('O')) { this.b[i] = ''; return i; }
        this.b[i] = '';
      }
      for (let i of avail) {
        this.b[i] = 'X';
        if (this.checkWin('X')) { this.b[i] = ''; return i; }
        this.b[i] = '';
      }
      return avail[Math.floor(Math.random() * avail.length)];
    }
  }

  // Connect 4 Engine
  class C4 {
    constructor() { this.reset(); }
    reset() {
      this.b = Array(6).fill(null).map(() => Array(7).fill(0));
      this.turn = 1;
      this.winner = null;
      this.winCoords = null;
    }
    drop(c) {
      if (c < 0 || c >= 7 || this.winner) return null;
      let r = -1;
      for (let i = 5; i >= 0; i--) if (this.b[i][c] === 0) { r = i; break; }
      if (r === -1) return null;
      this.b[r][c] = this.turn;
      const winResult = this.checkWin(this.b);
      if (winResult) {
        this.winner = this.turn;
        this.winCoords = winResult;
      } else if (this.b.every(row => row.every(cell => cell !== 0))) {
        this.winner = 'TIE';
      } else {
        this.turn = this.turn === 1 ? 2 : 1;
      }
      return r;
    }
    getAIMove() {
      const valid = [];
      for (let c = 0; c < 7; c++) if (this.b[0][c] === 0) valid.push(c);
      if (valid.length === 0 || this.winner) return null;
      return valid[Math.floor(Math.random() * valid.length)];
    }
    checkWin(g) {
      for (let r=0;r<6;r++) for (let c=0;c<=3;c++)
        if(g[r][c]&&g[r][c]===g[r][c+1]&&g[r][c]===g[r][c+2]&&g[r][c]===g[r][c+3])
          return [{r,c},{r,c:c+1},{r,c:c+2},{r,c:c+3}];
      for (let r=0;r<=2;r++) for (let c=0;c<7;c++)
        if(g[r][c]&&g[r][c]===g[r+1][c]&&g[r][c]===g[r+2][c]&&g[r][c]===g[r+3][c])
          return [{r,c},{r:r+1,c},{r:r+2,c},{r:r+3,c}];
      for (let r=0;r<=2;r++) for (let c=0;c<=3;c++)
        if(g[r][c]&&g[r][c]===g[r+1][c+1]&&g[r][c]===g[r+2][c+2]&&g[r][c]===g[r+3][c+3])
          return [{r,c},{r:r+1,c:c+1},{r:r+2,c:c+2},{r:r+3,c:c+3}];
      for (let r=3;r<6;r++) for (let c=0;c<=3;c++)
        if(g[r][c]&&g[r][c]===g[r-1][c+1]&&g[r][c]===g[r-2][c+2]&&g[r][c]===g[r-3][c+3])
          return [{r,c},{r:r-1,c:c+1},{r:r-2,c:c+2},{r:r-3,c:c+3}];
      return null;
    }
  }

  // Chess Engine (Strict Pawn & Rochade Rules)
  class Chess {
    constructor() { this.reset(); }
    reset() {
      this.b = [
        ['♜','♞','♝','♛','♚','♝','♞','♜'],
        ['♟','♟','♟','♟','♟','♟','♟','♟'],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['','','','','','','',''],
        ['♙','♙','♙','♙','♙','♙','♙','♙'],
        ['♖','♘','♗','♕','♔','♗','♘','♖']
      ];
      this.turn = 'w';
      this.selected = null;
      this.validMoves = [];
      this.winner = null;
      this.lastMovedTo = null; // {r, c} for glide animation

      // Track Rochade Flags
      this.wKingMoved = false;
      this.wRook0Moved = false;
      this.wRook7Moved = false;
      this.bKingMoved = false;
      this.bRook0Moved = false;
      this.bRook7Moved = false;
    }

    isWhite(p) { return '♙♖♘♗♕♔'.includes(p); }
    isBlack(p) { return '♟♜♞♝♛♚'.includes(p); }

    getValidMoves(r, c) {
      const p = this.b[r][c];
      if (!p) return [];
      const isW = this.isWhite(p);
      if ((isW && this.turn !== 'w') || (!isW && this.turn !== 'b')) return [];

      const moves = [];
      const addMove = (tr, tc) => {
        if (tr < 0 || tr > 7 || tc < 0 || tc > 7) return false;
        const target = this.b[tr][tc];
        if (!target) {
          moves.push({ r: tr, c: tc });
          return true;
        }
        if ((isW && this.isBlack(target)) || (!isW && this.isWhite(target))) {
          moves.push({ r: tr, c: tc });
        }
        return false;
      };

      // Strict Pawn Rules (NO SIDEWAYS MOVES EVER)
      if (p === '♙') { // White Pawn (Moves UP from r=6 to r=0)
        if (r > 0 && this.b[r-1][c] === '') {
          moves.push({ r: r-1, c });
          if (r === 6 && this.b[r-2][c] === '') {
            moves.push({ r: r-2, c });
          }
        }
        if (r > 0 && c > 0 && this.b[r-1][c-1] !== '' && this.isBlack(this.b[r-1][c-1])) {
          moves.push({ r: r-1, c: c-1 });
        }
        if (r > 0 && c < 7 && this.b[r-1][c+1] !== '' && this.isBlack(this.b[r-1][c+1])) {
          moves.push({ r: r-1, c: c+1 });
        }
      } else if (p === '♟') { // Black Pawn (Moves DOWN from r=1 to r=7)
        if (r < 7 && this.b[r+1][c] === '') {
          moves.push({ r: r+1, c });
          if (r === 1 && this.b[r+2][c] === '') {
            moves.push({ r: r+2, c });
          }
        }
        if (r < 7 && c > 0 && this.b[r+1][c-1] !== '' && this.isWhite(this.b[r+1][c-1])) {
          moves.push({ r: r+1, c: c-1 });
        }
        if (r < 7 && c < 7 && this.b[r+1][c+1] !== '' && this.isWhite(this.b[r+1][c+1])) {
          moves.push({ r: r+1, c: c+1 });
        }
      }
      // Knight
      else if (p === '♘' || p === '♞') {
        const deltas = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        for (let [dr, dc] of deltas) addMove(r + dr, c + dc);
      }
      // King & Rochade
      else if (p === '♔') {
        const deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (let [dr, dc] of deltas) addMove(r + dr, c + dc);

        if (!this.wKingMoved && r === 7 && c === 4) {
          if (!this.wRook7Moved && this.b[7][5] === '' && this.b[7][6] === '' && this.b[7][7] === '♖') {
            moves.push({ r: 7, c: 6, castle: 'K' });
          }
          if (!this.wRook0Moved && this.b[7][1] === '' && this.b[7][2] === '' && this.b[7][3] === '' && this.b[7][0] === '♖') {
            moves.push({ r: 7, c: 2, castle: 'Q' });
          }
        }
      } else if (p === '♚') {
        const deltas = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
        for (let [dr, dc] of deltas) addMove(r + dr, c + dc);

        if (!this.bKingMoved && r === 0 && c === 4) {
          if (!this.bRook7Moved && this.b[0][5] === '' && this.b[0][6] === '' && this.b[0][7] === '♜') {
            moves.push({ r: 0, c: 6, castle: 'K' });
          }
          if (!this.bRook0Moved && this.b[0][1] === '' && this.b[0][2] === '' && this.b[0][3] === '' && this.b[0][0] === '♜') {
            moves.push({ r: 0, c: 2, castle: 'Q' });
          }
        }
      }
      // Rook / Queen Lines
      if ('♖♜♕♛'.includes(p)) {
        const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (let [dr, dc] of dirs) {
          let tr = r + dr, tc = c + dc;
          while (addMove(tr, tc)) { tr += dr; tc += dc; }
        }
      }
      // Bishop / Queen Diagonals
      if ('♗♝♕♛'.includes(p)) {
        const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
        for (let [dr, dc] of dirs) {
          let tr = r + dr, tc = c + dc;
          while (addMove(tr, tc)) { tr += dr; tc += dc; }
        }
      }

      return moves;
    }

    move(fromR, fromC, toR, toC) {
      const p = this.b[fromR][fromC];
      const target = this.b[toR][toC];

      const valid = this.getValidMoves(fromR, fromC);
      const matchMove = valid.find(m => m.r === toR && m.c === toC);

      if (matchMove && matchMove.castle) {
        if (matchMove.castle === 'K') {
          this.b[toR][toC] = p;
          this.b[fromR][fromC] = '';
          this.b[toR][5] = this.b[toR][7];
          this.b[toR][7] = '';
        } else if (matchMove.castle === 'Q') {
          this.b[toR][toC] = p;
          this.b[fromR][fromC] = '';
          this.b[toR][3] = this.b[toR][0];
          this.b[toR][0] = '';
        }
      } else {
        this.b[toR][toC] = p;
        this.b[fromR][fromC] = '';
      }

      this.lastMovedTo = { r: toR, c: toC };

      if (p === '♔') this.wKingMoved = true;
      if (p === '♚') this.bKingMoved = true;
      if (fromR === 7 && fromC === 0) this.wRook0Moved = true;
      if (fromR === 7 && fromC === 7) this.wRook7Moved = true;
      if (fromR === 0 && fromC === 0) this.bRook0Moved = true;
      if (fromR === 0 && fromC === 7) this.bRook7Moved = true;

      if (target === '♔' || target === '♚') {
        this.winner = this.turn === 'w' ? 'White' : 'Black';
      }

      this.turn = this.turn === 'w' ? 'b' : 'w';
      this.selected = null;
      this.validMoves = [];
      return true;
    }

    getAIMove() {
      if (this.winner || this.turn !== 'b') return null;
      const allMoves = [];
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (this.isBlack(this.b[r][c])) {
            const valid = this.getValidMoves(r, c);
            for (let m of valid) {
              const target = this.b[m.r][m.c];
              allMoves.push({ from: {r, c}, to: m, isCapture: !!target });
            }
          }
        }
      }
      if (allMoves.length === 0) return null;
      const captures = allMoves.filter(m => m.isCapture);
      if (captures.length > 0) return captures[Math.floor(Math.random() * captures.length)];
      return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
  }

  // Shadow DOM Styles
  const css = `
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; font-family: system-ui, -apple-system, sans-serif; }
    .arcade-box {
      width: 490px !important;
      height: 335px !important;
      min-width: 490px !important;
      min-height: 335px !important;
      max-width: 490px !important;
      max-height: 335px !important;
      background: rgba(15, 18, 28, 0.97);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      border: 1px solid rgba(255,255,255,0.18);
      border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.7), 0 0 25px rgba(99, 102, 241, 0.25);
      overflow: hidden;
      color: white;
      display: flex;
      flex-direction: column;
    }
    .arcade-box.hidden { display: none !important; }
    .arcade-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(18, 22, 34, 0.95);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 20px;
      padding: 6px 14px;
      color: white;
      font-weight: bold;
      cursor: grab;
      font-size: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    }
    .arcade-btn:active { cursor: grabbing; }
    .arcade-btn.hidden { display: none !important; }
    
    /* Top Header Taskbar */
    .head { display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: rgba(255,255,255,0.06); font-weight: bold; color: white; font-size: 12px; cursor: grab; border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
    .head:active { cursor: grabbing; }
    .head-actions { display: flex; align-items: center; gap: 4px; }
    .head-btn { background: rgba(255,255,255,0.1); border: none; color: #ccc; width: 22px; height: 22px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 11px; transition: all 0.2s; }
    .head-btn:hover { background: rgba(255,255,255,0.22); color: white; }
    .head-btn.close-btn:hover { background: #ef4444 !important; color: white !important; }

    /* Dashboard Main 2-Column Split */
    .main-dashboard {
      display: flex;
      flex: 1;
      padding: 6px;
      gap: 6px;
      overflow: hidden;
      box-sizing: border-box;
    }

    /* Left Panel: Arena & Controls */
    .panel-left {
      width: 250px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      background: rgba(0, 0, 0, 0.22);
      border-radius: 8px;
      padding: 6px;
      border: 1px solid rgba(255,255,255,0.06);
      box-sizing: border-box;
    }

    /* Status Bar without score counter */
    .status { width: 100%; display: flex; justify-content: center; font-size: 11px; color: #eee; font-weight: bold; background: rgba(255,255,255,0.04); padding: 4px 8px; border-radius: 5px; flex-shrink: 0; text-align: center; }
    
    /* Tic-Tac-Toe Grid */
    .ttt-wrap { position: relative; width: 195px !important; height: 195px !important; flex-shrink: 0; }
    .ttt-wrap.hidden { display: none !important; }
    .ttt-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px; width: 195px !important; height: 195px !important; }
    .ttt-cell {
      width: 61px !important;
      height: 61px !important;
      background: rgba(255,255,255,0.06);
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
      font-weight: 900;
      line-height: 1;
      cursor: pointer;
      color: white;
      transition: background 0.15s, transform 0.1s;
      box-sizing: border-box;
      overflow: hidden;
    }
    .ttt-cell:hover:not(.taken) { background: rgba(255,255,255,0.16); transform: scale(1.03); }
    .ttt-cell.X { color: #06b6d4; text-shadow: 0 0 10px rgba(6, 182, 212, 0.8); }
    .ttt-cell.O { color: #f43f5e; text-shadow: 0 0 10px rgba(244, 63, 94, 0.8); }
    .ttt-cell.win-cell { background: rgba(16, 185, 129, 0.25); border-color: #10b981; animation: pulse-win 0.8s infinite alternate; }

    /* SVG Strike Line */
    .ttt-svg { position: absolute; top: 0; left: 0; width: 195px; height: 195px; pointer-events: none; z-index: 10; }
    .ttt-strike-line {
      stroke: #10b981;
      stroke-width: 6;
      stroke-linecap: round;
      filter: drop-shadow(0 0 8px #10b981);
      stroke-dasharray: 300;
      stroke-dashoffset: 300;
      animation: draw-strike 0.4s ease-out forwards;
    }
    @keyframes draw-strike { to { stroke-dashoffset: 0; } }

    /* Connect 4 Container */
    .c4-wrap.hidden { display: none !important; }
    .c4-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; width: 220px; background: rgba(30,41,59,0.95); padding: 4px; border-radius: 8px; border: 1px solid rgba(99,102,241,0.3); }
    .c4-cell { width: 27px; height: 27px; border-radius: 50%; background: #0f172a; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .c4-cell.p1 { background: #06b6d4; box-shadow: 0 0 8px #06b6d4; }
    .c4-cell.p2 { background: #f43f5e; box-shadow: 0 0 8px #f43f5e; }
    .c4-cell.win-token { animation: pulse-win 0.6s infinite alternate ease-in-out; border: 2px solid #10b981; box-shadow: 0 0 14px #10b981; }

    @keyframes pulse-win { 0% { transform: scale(0.95); } 100% { transform: scale(1.1); } }

    .c4-drops { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; width: 220px; margin-bottom: 2px; }
    .c4-drop-btn { background: transparent; border: none; color: #aaa; cursor: pointer; font-size: 11px; }
    .c4-drop-btn:hover { color: white; }

    /* Chess Container (8x8 Grid with Piece Gliding Animations) */
    .chess-wrap.hidden { display: none !important; }
    .chess-grid { display: grid; grid-template-columns: repeat(8, 1fr); width: 195px; height: 195px; border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
    .chess-cell { width: 24.37px; height: 24.37px; display: flex; align-items: center; justify-content: center; font-size: 18px; cursor: pointer; transition: background 0.15s; font-weight: bold; position: relative; }
    .chess-cell.light { background: #cbd5e1; }
    .chess-cell.dark { background: #1e293b; }
    .chess-cell.piece-white { color: #38bdf8 !important; text-shadow: 0 0 6px rgba(56, 189, 248, 0.9), 0 0 10px rgba(56, 189, 248, 0.5); }
    .chess-cell.piece-black { color: #f43f5e !important; text-shadow: 0 0 6px rgba(244, 63, 94, 0.9), 0 0 10px rgba(244, 63, 94, 0.5); }
    .chess-cell.selected { background: #6366f1 !important; border: 1px solid white; }
    .chess-cell.valid { background: #10b981 !important; animation: pulse-valid 0.6s infinite alternate; }
    .chess-cell.last-moved { animation: piece-glide 0.35s ease-out; }

    @keyframes piece-glide {
      0% { transform: scale(0.6) translateY(-6px); opacity: 0.4; filter: brightness(1.8); }
      60% { transform: scale(1.2); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }

    /* Gambling Slot Machine Container */
    .slot-wrap.hidden { display: none !important; }
    .slot-machine { position: relative; width: 210px; display: flex; flex-direction: column; align-items: center; gap: 8px; background: rgba(30,27,75,0.85); padding: 10px; border-radius: 10px; border: 1px solid rgba(234,179,8,0.4); box-shadow: 0 0 15px rgba(234,179,8,0.2); transition: all 0.3s; }
    .slot-machine.jackpot-active { animation: jackpot-glow 0.35s infinite alternate, jackpot-shake 0.3s ease-in-out infinite; }

    @keyframes jackpot-glow {
      0% { border-color: #facc15; box-shadow: 0 0 30px #eab308, inset 0 0 20px #facc15; }
      100% { border-color: #ef4444; box-shadow: 0 0 45px #f43f5e, inset 0 0 30px #ef4444; }
    }
    @keyframes jackpot-shake {
      0% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(-3px, 2px) rotate(-1deg); }
      50% { transform: translate(3px, -2px) rotate(1deg); }
      75% { transform: translate(-2px, -1px) rotate(0deg); }
      100% { transform: translate(0, 0) rotate(0deg); }
    }

    .confetti-overlay {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      pointer-events: none;
      z-index: 100;
      overflow: hidden;
    }
    .confetti-particle {
      position: absolute;
      font-size: 16px;
      animation: confetti-fall 2.2s ease-out forwards;
    }
    @keyframes confetti-fall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(220px) rotate(720deg); opacity: 0; }
    }

    .slot-reels { display: flex; gap: 6px; background: #0f172a; padding: 6px; border-radius: 8px; border: 2px solid #eab308; }
    .slot-reel { width: 52px; height: 52px; background: rgba(255,255,255,0.08); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 28px; border: 1px solid rgba(255,255,255,0.1); transition: transform 0.1s; }
    .slot-reel.spinning { animation: reel-blur 0.1s infinite linear; }
    @keyframes reel-blur { 0% { filter: blur(1px); transform: translateY(-2px); } 50% { filter: blur(3px); transform: translateY(2px); } 100% { filter: blur(1px); transform: translateY(-2px); } }

    .slot-controls { display: flex; gap: 6px; width: 100%; align-items: center; }
    .btn-spin { flex: 1; background: #eab308; border: none; color: #0f172a; font-weight: 900; padding: 6px 8px; border-radius: 6px; font-size: 11px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(234,179,8,0.4); }
    .btn-spin:hover { background: #facc15; transform: scale(1.02); }
    .btn-spin:disabled { opacity: 0.5; cursor: not-allowed; }

    .bet-box { display: flex; align-items: center; gap: 4px; background: rgba(0,0,0,0.4); padding: 4px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.15); font-size: 10px; color: #ccc; }
    .bet-input { width: 45px; background: transparent; border: none; color: #facc15; font-size: 11px; font-weight: bold; text-align: center; outline: none; }

    /* Left Controls */
    .left-controls { width: 100%; display: flex; flex-direction: column; gap: 4px; }
    .mode-pills { display: flex; gap: 2px; background: rgba(255,255,255,0.05); padding: 2px; border-radius: 6px; }
    .mode-pills.hidden { display: none !important; }
    .mode-pill { flex: 1; border: none; background: transparent; color: #aaa; padding: 4px 2px; border-radius: 4px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
    .mode-pill.act { color: #10b981; background: rgba(16, 185, 129, 0.2); }
    
    .btn-reset { width: 100%; background: #6366f1; border: none; color: white; padding: 4px; border-radius: 5px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
    .btn-reset:hover:not(.disabled) { background: #4f46e5; }
    .btn-reset.disabled { opacity: 0.45; cursor: not-allowed; background: rgba(99, 102, 241, 0.2); }

    /* Right Panel */
    .panel-right {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* RIGHT TOP: Game Selector */
    .card-games {
      flex: 1;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      padding: 8px;
      border: 1px solid rgba(255,255,255,0.08);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .card-title {
      font-size: 10px;
      font-weight: bold;
      color: #818cf8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .game-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }

    .game-card-btn {
      border: none;
      background: rgba(255,255,255,0.08);
      color: #ccc;
      padding: 8px 4px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transition: all 0.2s;
    }
    .game-card-btn:hover:not(.disabled) {
      background: rgba(255,255,255,0.16);
      color: white;
    }
    .game-card-btn.act {
      background: #6366f1;
      color: white;
      box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
    }
    .game-card-btn.disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    /* RIGHT BOTTOM: Social Lobby */
    .card-social {
      background: rgba(99, 102, 241, 0.08);
      border-radius: 8px;
      padding: 8px;
      border: 1px solid rgba(99, 102, 241, 0.2);
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-shrink: 0;
    }

    .social-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #ddd;
    }

    .p2p-input-group {
      display: flex;
      gap: 4px;
    }

    .p2p-input {
      flex: 1;
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.15);
      color: white;
      padding: 4px 6px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 11px;
      text-transform: uppercase;
      outline: none;
    }

    .btn-action {
      background: #10b981;
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
      font-size: 10px;
      transition: background 0.2s;
    }
    .btn-action:hover { background: #059669; }

    .btn-leave {
      background: #ef4444 !important;
    }
    .btn-leave:hover {
      background: #dc2626 !important;
    }
    .btn-leave.hidden {
      display: none !important;
    }

    .username-box {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(0,0,0,0.35);
      padding: 4px 6px;
      border-radius: 5px;
      border: 1px solid rgba(255,255,255,0.1);
      font-size: 10px;
    }

    .username-input {
      flex: 1;
      background: transparent;
      border: none;
      color: #38bdf8;
      font-size: 10px;
      font-weight: bold;
      outline: none;
    }
  `;

  function mount() {
    const parent = document.body || document.documentElement;
    if (!parent || document.getElementById('bg-arcade-floating-host')) return;

    // Create Host Element
    const host = document.createElement('div');
    host.id = 'bg-arcade-floating-host';
    host.style.cssText = `
      position: fixed !important;
      top: 15px !important;
      right: 15px !important;
      z-index: 2147483647 !important;
      display: block !important;
      width: auto !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      background: transparent !important;
    `;
    parent.appendChild(host);

    // Attach Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css;
    shadow.appendChild(style);

    const defaultUsername = `Player${Math.floor(100 + Math.random() * 900)}`;

    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <button id="pill" class="arcade-btn hidden">💼 Arbeitszeitbetrug</button>
      <div id="box" class="arcade-box">
        <div id="drag" class="head">
          <span>💼 Arbeitszeitbetrug v4.2</span>
          <div class="head-actions">
            <button id="btn-sound" class="head-btn" title="Ton umschalten">🔇</button>
            <button id="min" class="head-btn" title="Minimieren">—</button>
            <button id="close" class="head-btn close-btn" title="Schließen">✕</button>
          </div>
        </div>

        <div class="main-dashboard">
          <!-- LEFT PANEL: Arena & Game Controls -->
          <div class="panel-left">
            <!-- STATUS BAR WITHOUT SCORE COUNTER -->
            <div class="status">
              <span id="st-txt">Your Turn</span>
            </div>

            <!-- TIC-TAC-TOE WRAPPER -->
            <div id="v-ttt" class="ttt-wrap">
              <div class="ttt-grid">
                ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" data-i="${i}"></div>`).join('')}
              </div>
              <svg id="ttt-svg" class="ttt-svg"></svg>
            </div>

            <!-- CONNECT 4 WRAPPER -->
            <div id="v-c4" class="c4-wrap hidden">
              <div class="c4-drops">
                ${Array(7).fill(0).map((_, c) => `<button class="c4-drop-btn" data-c="${c}">▼</button>`).join('')}
              </div>
              <div class="c4-grid">
                ${Array(42).fill(0).map((_, i) => `<div class="c4-cell" data-i="${i}"></div>`).join('')}
              </div>
            </div>

            <!-- CHESS WRAPPER -->
            <div id="v-chess" class="chess-wrap hidden">
              <div class="chess-grid">
                ${Array(64).fill(0).map((_, i) => {
                  const r = Math.floor(i / 8), c = i % 8;
                  const isLight = (r + c) % 2 === 0;
                  return `<div class="chess-cell ${isLight ? 'light' : 'dark'}" data-r="${r}" data-c="${c}"></div>`;
                }).join('')}
              </div>
            </div>

            <!-- GAMBLING SLOT MACHINE WRAPPER WITH CONFETTI OVERLAY -->
            <div id="v-slot" class="slot-wrap hidden">
              <div id="slot-mach" class="slot-machine">
                <div id="confetti-container" class="confetti-overlay"></div>
                <div style="font-size:11px;font-weight:bold;color:#eab308;">🎰 CASINO SLOTS</div>
                <div class="slot-reels">
                  <div id="r1" class="slot-reel">💼</div>
                  <div id="r2" class="slot-reel">💎</div>
                  <div id="r3" class="slot-reel">7️⃣</div>
                </div>
                <div style="font-size:11px;color:#a7f3d0;font-weight:bold;">Coins: <span id="slot-coins">100</span> 💰</div>
                <div class="slot-controls">
                  <button id="btn-spin" class="btn-spin">🎰 SPIN</button>
                  <div class="bet-box">
                    <span>Einsatz:</span>
                    <input id="slot-bet" type="number" class="bet-input" value="10" min="1" max="1000">
                  </div>
                </div>
              </div>
            </div>

            <!-- MODE SELECTOR & RESET -->
            <div class="left-controls">
              <div id="mode-pills-box" class="mode-pills">
                <button id="m-ai" class="mode-pill act">🤖 vs AI</button>
                <button id="m-local" class="mode-pill">👥 Local</button>
              </div>
              <button id="reset" class="btn-reset">🔄 Reset Game</button>
            </div>
          </div>

          <!-- RIGHT PANEL: Expanded Game Selector (Top) & Social Lobby (Bottom) -->
          <div class="panel-right">
            <!-- RIGHT TOP: Game Selector -->
            <div class="card-games">
              <div class="card-title">🎮 Spiel wählen</div>
              <div class="game-grid">
                <button id="t-ttt" class="game-card-btn act">
                  <span>❌ TicTacToe</span>
                </button>
                <button id="t-c4" class="game-card-btn">
                  <span>🔴 4-Gewinnt</span>
                </button>
                <button id="t-chess" class="game-card-btn">
                  <span>♟️ Schach</span>
                </button>
                <button id="t-slot" class="game-card-btn">
                  <span>🎰 Casino Slot</span>
                </button>
              </div>
            </div>

            <!-- RIGHT BOTTOM: Social Lobby -->
            <div class="card-social">
              <div class="card-title">🌐 Social & Online Lobby</div>
              
              <div class="social-row">
                <span>Status: <b id="p2p-st">Offline</b></span>
                <div style="display:flex;gap:4px;">
                  <button id="p2p-leave" class="btn-action btn-leave hidden">🚪 Leave</button>
                  <button id="p2p-host" class="btn-action">Host PIN</button>
                </div>
              </div>
              
              <div class="p2p-input-group">
                <input id="p2p-in" type="text" class="p2p-input" placeholder="4-PIN" maxlength="4">
                <button id="p2p-join" class="btn-action">Join</button>
              </div>

              <!-- Username Selector -->
              <div class="username-box">
                <span>Name:</span>
                <input id="user-name-in" type="text" class="username-input" value="${defaultUsername}" maxlength="12" placeholder="Dein Name">
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    shadow.appendChild(wrap);

    // State Engines
    const ttt = new TTT();
    const c4 = new C4();
    const chess = new Chess();
    let slotCoins = parseInt(localStorage.getItem('arcade_slot_coins')) || 100;

    let game = 'ttt';
    let mode = 'ai';
    let p2pPeer = null, p2pConn = null, isHost = false, roomCode = '', isMyTurn = true;
    let isCollapsed = false;
    let isClosed = false;
    let username = defaultUsername;

    // Timers
    let autoResetTimer = null;

    // Elements
    const box = shadow.getElementById('box');
    const pill = shadow.getElementById('pill');
    const head = shadow.getElementById('drag');
    const btnClose = shadow.getElementById('close');
    const btnMin = shadow.getElementById('min');
    const stTxt = shadow.getElementById('st-txt');
    const p2pSt = shadow.getElementById('p2p-st');
    const p2pIn = shadow.getElementById('p2p-in');
    const btnSound = shadow.getElementById('btn-sound');
    const tttSvg = shadow.getElementById('ttt-svg');
    const userNameIn = shadow.getElementById('user-name-in');
    const btnTTT = shadow.getElementById('t-ttt');
    const btnC4 = shadow.getElementById('t-c4');
    const btnChess = shadow.getElementById('t-chess');
    const btnSlot = shadow.getElementById('t-slot');
    const modePillsBox = shadow.getElementById('mode-pills-box');
    const btnLeave = shadow.getElementById('p2p-leave');
    const btnReset = shadow.getElementById('reset');
    const slotCoinsEl = shadow.getElementById('slot-coins');
    const btnSpin = shadow.getElementById('btn-spin');
    const slotBetIn = shadow.getElementById('slot-bet');
    const slotMachineEl = shadow.getElementById('slot-mach');
    const confettiBox = shadow.getElementById('confetti-container');

    // Username Change Event
    userNameIn.oninput = () => {
      username = userNameIn.value;
      saveTabState();
      if (p2pConn && p2pConn.open && username.trim() !== '') {
        p2pConn.send({ type: 'NAME_UPDATE', name: username.trim() });
      }
    };

    // MULTI-TAB PERSISTENCE & SYNC (chrome.storage)
    function saveTabState() {
      const rect = host.getBoundingClientRect();
      const stateObj = {
        left: host.style.left || `${rect.left}px`,
        top: host.style.top || `${rect.top}px`,
        isCollapsed,
        isClosed,
        game,
        mode,
        username,
        slotCoins
      };

      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ arcade_state: stateObj });
      } else {
        try { localStorage.setItem('arcade_state', JSON.stringify(stateObj)); } catch(e){}
      }
    }

    function applyTabState(stateObj) {
      if (!stateObj) return;

      if (stateObj.left && stateObj.top) {
        host.style.right = 'auto';
        host.style.left = stateObj.left;
        host.style.top = stateObj.top;
      }

      if (typeof stateObj.isClosed === 'boolean') {
        isClosed = stateObj.isClosed;
        host.style.display = isClosed ? 'none' : 'block';
      }

      if (typeof stateObj.isCollapsed === 'boolean') {
        isCollapsed = stateObj.isCollapsed;
        box.classList.toggle('hidden', isCollapsed);
        pill.classList.toggle('hidden', !isCollapsed);
      }

      if (typeof stateObj.username === 'string') {
        username = stateObj.username;
        userNameIn.value = username;
      }

      if (typeof stateObj.slotCoins === 'number') {
        slotCoins = stateObj.slotCoins;
        slotCoinsEl.textContent = slotCoins;
      }

      updateUI();
    }

    // Load initial tab state
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['arcade_state'], (res) => {
        if (res && res.arcade_state) applyTabState(res.arcade_state);
      });

      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.arcade_state && changes.arcade_state.newValue) {
          applyTabState(changes.arcade_state.newValue);
        }
      });
    } else {
      try {
        const saved = localStorage.getItem('arcade_state');
        if (saved) applyTabState(JSON.parse(saved));
      } catch(e){}

      window.addEventListener('storage', (e) => {
        if (e.key === 'arcade_state' && e.newValue) {
          try { applyTabState(JSON.parse(e.newValue)); } catch(err){}
        }
      });
    }

    // Extension Popup message
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((req) => {
        if (req.action === 'REOPEN_ARCADE') {
          isClosed = false;
          host.style.display = 'block';
          saveTabState();
        }
      });
    }

    // Keyboard shortcut: Alt + A
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        isClosed = !isClosed;
        host.style.display = isClosed ? 'none' : 'block';
        saveTabState();
      }
    });

    // DRAGGABLE BOX HEADER LOGIC
    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;

    head.onmousedown = (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = host.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      host.style.right = 'auto';
      host.style.left = `${initialLeft}px`;
      host.style.top = `${initialTop}px`;
    };

    // DRAGGABLE COLLAPSED PILL BUTTON LOGIC
    let pillDragging = false;
    let pillMoved = false;
    let pStartX = 0, pStartY = 0, pInitialLeft = 0, pInitialTop = 0;

    pill.onmousedown = (e) => {
      pillDragging = true;
      pillMoved = false;
      pStartX = e.clientX;
      pStartY = e.clientY;

      const rect = host.getBoundingClientRect();
      pInitialLeft = rect.left;
      pInitialTop = rect.top;

      host.style.right = 'auto';
      host.style.left = `${pInitialLeft}px`;
      host.style.top = `${pInitialTop}px`;
    };

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        host.style.left = `${initialLeft + dx}px`;
        host.style.top = `${initialTop + dy}px`;
      } else if (pillDragging) {
        const dx = e.clientX - pStartX;
        const dy = e.clientY - pStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          pillMoved = true;
        }
        host.style.left = `${pInitialLeft + dx}px`;
        host.style.top = `${pInitialTop + dy}px`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        saveTabState();
      }
      if (pillDragging) {
        pillDragging = false;
        if (pillMoved) saveTabState();
      }
    });

    pill.onclick = (e) => {
      if (pillMoved) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      isCollapsed = false;
      pill.classList.add('hidden');
      box.classList.remove('hidden');
      saveTabState();
    };

    // MINIMIZE & CLOSE BUTTONS
    btnMin.onclick = () => {
      isCollapsed = true;
      box.classList.add('hidden');
      pill.classList.remove('hidden');
      saveTabState();
    };

    btnClose.onclick = () => {
      isClosed = true;
      host.style.display = 'none';
      saveTabState();
    };

    // SOUND TOGGLE
    btnSound.onclick = () => {
      soundMuted = !soundMuted;
      btnSound.textContent = soundMuted ? '🔇' : '🔊';
      if (!soundMuted) playBeep(523.25, 'sine', 0.1);
    };

    // 3-SECOND AUTO-RESET AFTER GAME OVER
    function triggerAutoReset() {
      if (autoResetTimer) clearTimeout(autoResetTimer);
      autoResetTimer = setTimeout(() => {
        resetGame();
      }, 3000);
    }

    // UI Updates & Animations
    function updateUI() {
      if (game === 'ttt') {
        shadow.querySelectorAll('.ttt-cell').forEach((cell, i) => {
          cell.textContent = ttt.b[i];
          cell.className = 'ttt-cell ' + (ttt.b[i] ? 'taken ' + ttt.b[i] : '');
          if (ttt.winLine && ttt.winLine.includes(i)) cell.classList.add('win-cell');
        });

        tttSvg.innerHTML = '';
        if (ttt.winLine) {
          drawTTTStrikeLine(ttt.winLine);
        }

        if (ttt.winner) {
          if (ttt.winner !== 'TIE') playWinSound();
          stTxt.textContent = ttt.winner === 'TIE' ? "Unentschieden!" : (ttt.winner === 'X' ? 'Player X gewinnt! 🎉' : 'Player O gewinnt! 🎉');
        } else {
          stTxt.textContent = mode === 'p2p' ? (isMyTurn ? 'Du bist dran' : "Gegner ist dran") : (ttt.turn === 'X' ? 'Player X am Zug' : 'Player O am Zug');
        }
      } else if (game === 'c4') {
        const cells = shadow.querySelectorAll('.c4-cell');
        for (let r = 0; r < 6; r++) {
          for (let c = 0; c < 7; c++) {
            const cell = cells[r * 7 + c];
            const val = c4.b[r][c];
            cell.className = 'c4-cell ' + (val === 1 ? 'p1' : val === 2 ? 'p2' : '');

            if (c4.winCoords && c4.winCoords.some(coord => coord.r === r && coord.c === c)) {
              cell.classList.add('win-token');
            }
          }
        }

        if (c4.winner) {
          if (c4.winner !== 'TIE') playWinSound();
          stTxt.textContent = c4.winner === 'TIE' ? "Unentschieden!" : (c4.winner === 1 ? 'Player 1 gewinnt! 🎉' : 'Player 2 gewinnt! 🎉');
        } else {
          stTxt.textContent = mode === 'p2p' ? (isMyTurn ? 'Du bist dran' : "Gegner ist dran") : (c4.turn === 1 ? 'Player 1 am Zug' : 'Player 2 am Zug');
        }
      } else if (game === 'chess') {
        shadow.querySelectorAll('.chess-cell').forEach(cell => {
          const r = parseInt(cell.getAttribute('data-r'));
          const c = parseInt(cell.getAttribute('data-c'));
          const piece = chess.b[r][c];
          cell.textContent = piece;

          const isLight = (r + c) % 2 === 0;
          let cellCss = 'chess-cell ' + (isLight ? 'light' : 'dark');

          if (piece) {
            if (chess.isWhite(piece)) cellCss += ' piece-white';
            else if (chess.isBlack(piece)) cellCss += ' piece-black';
          }

          if (chess.selected && chess.selected.r === r && chess.selected.c === c) {
            cellCss += ' selected';
          }
          if (chess.validMoves.some(m => m.r === r && m.c === c)) {
            cellCss += ' valid';
          }
          if (chess.lastMovedTo && chess.lastMovedTo.r === r && chess.lastMovedTo.c === c) {
            cellCss += ' last-moved';
          }
          cell.className = cellCss;
        });

        if (chess.winner) {
          playWinSound();
          stTxt.textContent = `${chess.winner} gewinnt! ♚🎉`;
        } else {
          stTxt.textContent = mode === 'p2p' ? (isMyTurn ? 'Du bist dran' : "Gegner ist dran") : (chess.turn === 'w' ? 'Weiß am Zug ♔' : 'Schwarz am Zug ♚');
        }
      } else if (game === 'slot') {
        slotCoinsEl.textContent = slotCoins;
        stTxt.textContent = `Casino Slots 🎰`;
      }

      // Mode Pills Visibility & Leave Button
      if (mode === 'p2p') {
        modePillsBox.classList.add('hidden');
        btnLeave.classList.remove('hidden');
      } else {
        modePillsBox.classList.remove('hidden');
        btnLeave.classList.add('hidden');
      }

      // Guest Game Selector & Reset Button Lockdown in P2P
      const gameBtns = [btnTTT, btnC4, btnChess, btnSlot];
      if (mode === 'p2p' && !isHost) {
        gameBtns.forEach(b => b.classList.add('disabled'));
        btnReset.classList.add('disabled');
      } else {
        gameBtns.forEach(b => b.classList.remove('disabled'));
        btnReset.classList.remove('disabled');
      }
    }

    // Draw SVG Strike Line for TicTacToe
    function drawTTTStrikeLine(line) {
      const centers = [
        { x: 32, y: 32 },  { x: 97, y: 32 },  { x: 162, y: 32 },
        { x: 32, y: 97 },  { x: 97, y: 97 },  { x: 162, y: 97 },
        { x: 32, y: 162 }, { x: 97, y: 162 }, { x: 162, y: 162 }
      ];

      const p1 = centers[line[0]];
      const p2 = centers[line[2]];

      const lineEl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lineEl.setAttribute('x1', p1.x);
      lineEl.setAttribute('y1', p1.y);
      lineEl.setAttribute('x2', p2.x);
      lineEl.setAttribute('y2', p2.y);
      lineEl.setAttribute('class', 'ttt-strike-line');

      tttSvg.appendChild(lineEl);
    }

    // Switch Game Function
    function switchGame(targetGame, broadcast = true) {
      if (mode === 'p2p' && !isHost && broadcast) {
        return;
      }
      game = targetGame;
      btnTTT.classList.toggle('act', game === 'ttt');
      btnC4.classList.toggle('act', game === 'c4');
      btnChess.classList.toggle('act', game === 'chess');
      btnSlot.classList.toggle('act', game === 'slot');

      shadow.getElementById('v-ttt').classList.toggle('hidden', game !== 'ttt');
      shadow.getElementById('v-c4').classList.toggle('hidden', game !== 'c4');
      shadow.getElementById('v-chess').classList.toggle('hidden', game !== 'chess');
      shadow.getElementById('v-slot').classList.toggle('hidden', game !== 'slot');

      resetGame();

      if (mode === 'p2p' && isHost && broadcast && p2pConn && p2pConn.open) {
        p2pConn.send({ type: 'GAME_SELECT', game });
      }
      saveTabState();
    }

    btnTTT.onclick = () => switchGame('ttt', true);
    btnC4.onclick = () => switchGame('c4', true);
    btnChess.onclick = () => switchGame('chess', true);
    btnSlot.onclick = () => switchGame('slot', true);

    // Chess Cell Clicks
    shadow.querySelectorAll('.chess-cell').forEach(cell => {
      cell.onclick = () => {
        if (game !== 'chess' || chess.winner) return;
        if (mode === 'p2p' && !isMyTurn) return;

        const r = parseInt(cell.getAttribute('data-r'));
        const c = parseInt(cell.getAttribute('data-c'));

        // If piece selected & clicked on valid move
        if (chess.selected && chess.validMoves.some(m => m.r === r && m.c === c)) {
          const from = chess.selected;
          chess.move(from.r, from.c, r, c);
          playBeep(500, 'triangle', 0.1);

          if (mode === 'p2p') {
            if (p2pConn) p2pConn.send({ type: 'MOVE', g: 'chess', from, to: {r, c} });
            isMyTurn = false;
          }

          if (chess.winner) {
            saveTabState();
            triggerAutoReset();
          }

          updateUI();

          // AI Move in Chess
          if (!chess.winner && mode === 'ai' && chess.turn === 'b') {
            setTimeout(() => {
              const aiM = chess.getAIMove();
              if (aiM) {
                chess.move(aiM.from.r, aiM.from.c, aiM.to.r, aiM.to.c);
                playBeep(400, 'triangle', 0.1);
                if (chess.winner) {
                  saveTabState();
                  triggerAutoReset();
                }
                updateUI();
              }
            }, 400);
          }
        } else {
          // Select piece
          const p = chess.b[r][c];
          if (p) {
            const isW = chess.isWhite(p);
            if ((isW && chess.turn === 'w') || (!isW && chess.turn === 'b')) {
              chess.selected = { r, c };
              chess.validMoves = chess.getValidMoves(r, c);
              updateUI();
            }
          } else {
            chess.selected = null;
            chess.validMoves = [];
            updateUI();
          }
        }
      };
    });

    // Casino Slot Machine Engine with Krazy Jackpot Effects
    const slotEmojis = ['💼', '💰', '💎', '7️⃣', '🍒', '🚀'];
    let isSpinning = false;

    function triggerKrazyJackpot() {
      slotMachineEl.classList.add('jackpot-active');
      playJackpotFanfare();

      // Confetti Rain Particles
      confettiBox.innerHTML = '';
      const particles = ['💎', '7️⃣', '💰', '✨', '🎉', '👑'];
      for (let i = 0; i < 24; i++) {
        const p = document.createElement('div');
        p.className = 'confetti-particle';
        p.textContent = particles[Math.floor(Math.random() * particles.length)];
        p.style.left = `${Math.random() * 90 + 5}%`;
        p.style.animationDelay = `${Math.random() * 0.8}s`;
        confettiBox.appendChild(p);
      }

      setTimeout(() => {
        slotMachineEl.classList.remove('jackpot-active');
        confettiBox.innerHTML = '';
      }, 3000);
    }

    btnSpin.onclick = () => {
      const bet = parseInt(slotBetIn.value) || 10;
      if (isSpinning || bet <= 0) return;
      if (slotCoins < bet) {
        stTxt.textContent = `❌ Nicht genug Coins!`;
        return;
      }

      slotCoins -= bet;
      slotCoinsEl.textContent = slotCoins;
      saveTabState();

      isSpinning = true;
      btnSpin.disabled = true;
      playSlotSpinSound();

      const r1 = shadow.getElementById('r1');
      const r2 = shadow.getElementById('r2');
      const r3 = shadow.getElementById('r3');

      r1.classList.add('spinning');
      r2.classList.add('spinning');
      r3.classList.add('spinning');

      const i1 = setInterval(() => { r1.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)]; }, 60);
      const i2 = setInterval(() => { r2.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)]; }, 60);
      const i3 = setInterval(() => { r3.textContent = slotEmojis[Math.floor(Math.random() * slotEmojis.length)]; }, 60);

      setTimeout(() => {
        clearInterval(i1);
        r1.classList.remove('spinning');
        const res1 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
        r1.textContent = res1;
        playBeep(550, 'sine', 0.08);

        setTimeout(() => {
          clearInterval(i2);
          r2.classList.remove('spinning');
          const res2 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
          r2.textContent = res2;
          playBeep(650, 'sine', 0.08);

          setTimeout(() => {
            clearInterval(i3);
            r3.classList.remove('spinning');
            const res3 = slotEmojis[Math.floor(Math.random() * slotEmojis.length)];
            r3.textContent = res3;
            isSpinning = false;
            btnSpin.disabled = false;

            // Check Scaled Payout & Jackpot Trigger
            if (res1 === res2 && res2 === res3) {
              if (res1 === '💎' || res1 === '7️⃣') {
                const win = bet * 50;
                slotCoins += win;
                stTxt.textContent = `🎰 JACKPOT! +${win} 💎🎉`;
                triggerKrazyJackpot();
              } else {
                const win = bet * 20;
                slotCoins += win;
                stTxt.textContent = `🎰 BIG WIN! +${win} 💰🎉`;
                playWinSound();
              }
            } else if (res1 === res2 || res2 === res3 || res1 === res3) {
              const win = bet * 3;
              slotCoins += win;
              stTxt.textContent = `🎰 MINI WIN! +${win} 💰`;
              playBeep(750, 'sine', 0.15);
            } else {
              stTxt.textContent = `🎰 Versuch's nochmal!`;
            }
            slotCoinsEl.textContent = slotCoins;
            localStorage.setItem('arcade_slot_coins', slotCoins);
            saveTabState();
          }, 400);
        }, 400);
      }, 400);
    };

    // Modes (AI vs Local)
    shadow.getElementById('m-ai').onclick = () => setMode('ai');
    shadow.getElementById('m-local').onclick = () => setMode('local');

    function setMode(m) {
      if (mode === 'p2p') return;
      mode = m;
      shadow.getElementById('m-ai').classList.toggle('act', m === 'ai');
      shadow.getElementById('m-local').classList.toggle('act', m === 'local');
      resetGame();
      saveTabState();
    }

    function resetGame() {
      if (autoResetTimer) clearTimeout(autoResetTimer);
      ttt.reset(); c4.reset(); chess.reset();

      if (game === 'slot') {
        slotCoins = 100;
        slotCoinsEl.textContent = slotCoins;
        localStorage.setItem('arcade_slot_coins', 100);
        stTxt.textContent = `Coins auf 100 resetten! 💰`;
      }

      isMyTurn = mode === 'p2p' ? isHost : true;
      updateUI();
    }

    // Reset Button Logic
    btnReset.onclick = () => {
      if (mode === 'p2p' && !isHost) return;
      resetGame();
      if (mode === 'p2p' && isHost && p2pConn && p2pConn.open) {
        p2pConn.send({ type: 'RESET_GAME' });
      }
    };

    // Tic Tac Toe Move
    shadow.querySelectorAll('.ttt-cell').forEach(cell => {
      cell.onclick = () => {
        const i = parseInt(cell.getAttribute('data-i'));
        if (mode === 'p2p' && !isMyTurn) return;
        if (!ttt.move(i)) return;
        playBeep(450, 'triangle', 0.08);

        if (mode === 'p2p') {
          if (p2pConn) p2pConn.send({ type: 'MOVE', g: 'ttt', i });
          isMyTurn = false;
        }

        if (ttt.winner) {
          saveTabState();
          triggerAutoReset();
        }

        updateUI();

        if (!ttt.winner && mode === 'ai' && ttt.turn === 'O') {
          setTimeout(() => {
            const ai = ttt.getAIMove();
            if (ai !== null) {
              ttt.move(ai);
              playBeep(350, 'triangle', 0.08);
              if (ttt.winner) {
                saveTabState();
                triggerAutoReset();
              }
              updateUI();
            }
          }, 300);
        }
      };
    });

    // Connect 4 Move
    shadow.querySelectorAll('.c4-drop-btn').forEach(btn => {
      btn.onclick = () => {
        const c = parseInt(btn.getAttribute('data-c'));
        if (mode === 'p2p' && !isMyTurn) return;
        if (c4.drop(c) === null) return;
        playBeep(300, 'sine', 0.1);

        if (mode === 'p2p') {
          if (p2pConn) p2pConn.send({ type: 'MOVE', g: 'c4', c });
          isMyTurn = false;
        }

        if (c4.winner) {
          saveTabState();
          triggerAutoReset();
        }

        updateUI();

        if (!c4.winner && mode === 'ai' && c4.turn === 2) {
          setTimeout(() => {
            const ai = c4.getAIMove();
            if (ai !== null) {
              c4.drop(ai);
              playBeep(250, 'sine', 0.1);
              if (c4.winner) {
                saveTabState();
                triggerAutoReset();
              }
              updateUI();
            }
          }, 350);
        }
      };
    });

    // P2P LEAVE ACTION
    btnLeave.onclick = leaveP2P;

    function leaveP2P() {
      if (p2pConn && p2pConn.open) {
        try { p2pConn.send({ type: 'LEAVE' }); } catch(e){}
        try { p2pConn.close(); } catch(e){}
      }
      if (p2pPeer) {
        try { p2pPeer.destroy(); } catch(e){}
      }
      p2pConn = null;
      p2pPeer = null;
      isHost = false;
      mode = 'ai';
      p2pSt.textContent = 'Offline';
      shadow.getElementById('m-ai').classList.add('act');
      shadow.getElementById('m-local').classList.remove('act');
      resetGame();
      saveTabState();
    }

    // P2P 4-DIGIT PIN & USERNAME LOGIC
    shadow.getElementById('p2p-host').onclick = () => {
      const nameToUse = userNameIn.value.trim();
      if (!nameToUse) {
        p2pSt.textContent = '❌ Name eingeben!';
        return;
      }
      username = nameToUse;
      saveTabState();

      const PeerClass = window.Peer || globalThis.Peer;
      if (!PeerClass) { p2pSt.textContent = 'PeerJS Error'; return; }
      
      roomCode = Math.floor(1000 + Math.random() * 9000).toString();
      isHost = true; isMyTurn = true; mode = 'p2p';
      
      p2pPeer = new PeerClass(`arbeitszeit_${roomCode}`);
      p2pSt.textContent = `PIN: ${roomCode}`;
      p2pPeer.on('connection', (c) => {
        p2pConn = c;
        p2pSt.textContent = `✅ Verbunden!`;
        bindP2P();
      });
      updateUI();
    };

    shadow.getElementById('p2p-join').onclick = () => {
      const nameToUse = userNameIn.value.trim();
      if (!nameToUse) {
        p2pSt.textContent = '❌ Name eingeben!';
        return;
      }
      username = nameToUse;
      saveTabState();

      const code = p2pIn.value.trim();
      const PeerClass = window.Peer || globalThis.Peer;
      if (!code || !PeerClass) return;
      isHost = false; isMyTurn = false; mode = 'p2p';
      p2pPeer = new PeerClass();
      p2pSt.textContent = 'Verbinde...';
      p2pPeer.on('open', () => {
        p2pConn = p2pPeer.connect(`arbeitszeit_${code}`);
        bindP2P();
      });
      updateUI();
    };

    function bindP2P() {
      if (!p2pConn) return;
      p2pConn.on('open', () => {
        p2pSt.textContent = `✅ Verbunden!`;
        p2pConn.send({ type: 'HANDSHAKE', name: username, game });
      });
      p2pConn.on('data', (d) => {
        if (d.type === 'HANDSHAKE') {
          p2pSt.textContent = `✅ ${d.name}`;
          if (isHost) {
            p2pConn.send({ type: 'GAME_SELECT', game });
          }
        } else if (d.type === 'NAME_UPDATE') {
          p2pSt.textContent = `✅ ${d.name}`;
        } else if (d.type === 'GAME_SELECT') {
          switchGame(d.game, false);
        } else if (d.type === 'RESET_GAME') {
          resetGame();
        } else if (d.type === 'LEAVE') {
          p2pSt.textContent = '❌ Gegner hat verlassen';
          if (p2pConn) p2pConn.close();
          p2pConn = null;
        } else if (d.type === 'MOVE') {
          if (d.g === 'ttt') {
            ttt.move(d.i);
            if (ttt.winner) {
              saveTabState();
              triggerAutoReset();
            }
          } else if (d.g === 'c4') {
            c4.drop(d.c);
            if (c4.winner) {
              saveTabState();
              triggerAutoReset();
            }
          } else if (d.g === 'chess') {
            chess.move(d.from.r, d.from.c, d.to.r, d.to.c);
            if (chess.winner) {
              saveTabState();
              triggerAutoReset();
            }
          }
          isMyTurn = true;
          updateUI();
        }
      });
    }

    console.log('%c[Arbeitszeitbetrug] Injected v4.2 Krazy Jackpot Effects & Score Counter Removal', 'color: #10b981; font-weight: bold; font-size: 14px;');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
