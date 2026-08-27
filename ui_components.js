/**
 * UI Components Controller for Arcade Widget
 * Handles DOM rendering inside Shadow DOM, UI state management, user interactions,
 * P2P WebRTC synchronization, AI responses, and audio sound triggers.
 */

class ArcadeUIController {
  constructor(shadowRoot) {
    this.root = shadowRoot;
    this.tttEngine = new window.TicTacToeEngine();
    this.c4Engine = new window.Connect4Engine();
    this.p2p = new window.P2PNetworkManager();
    this.sound = window.arcadeSound;

    // UI State
    this.activeGame = 'tictactoe'; // 'tictactoe' or 'connect4'
    this.gameMode = 'ai'; // 'ai', 'local', or 'p2p'
    this.aiDifficulty = 'hard'; // 'easy' or 'hard'
    this.isCollapsed = false;
    this.scores = {
      tictactoe: { p1: 0, p2: 0, ties: 0 },
      connect4: { p1: 0, p2: 0, ties: 0 }
    };

    // P2P State
    this.isMyTurn = true;
    this.mySymbol = 'X'; // For TicTacToe (P1='X', P2='O')
    this.myToken = 1;    // For Connect4 (P1=1, P2=2)

    this.initP2PCallbacks();
  }

  render() {
    this.root.innerHTML = `
      <style>
        /* CSS styles injected directly or via stylesheet link */
      </style>
      <div id="arcade-app">
        <!-- COLLAPSED PILL BUTTON -->
        <div id="arcade-pill" class="arcade-pill hidden" title="Click to open Arcade">
          <span class="pill-icon">🎮</span>
          <span class="pill-text">Arcade</span>
          <span id="pill-badge" class="pill-badge"></span>
        </div>

        <!-- EXPANDED WINDOW -->
        <div id="arcade-window" class="arcade-window">
          <!-- HEADER -->
          <div id="window-header" class="window-header">
            <div class="header-title">
              <span>🎮</span>
              <span>Floating Arcade</span>
            </div>
            <div class="header-actions">
              <button id="btn-sound" class="icon-btn" title="Toggle Sound">🔊</button>
              <button id="btn-minimize" class="icon-btn" title="Minimize">—</button>
            </div>
          </div>

          <!-- NAVIGATION & MODE BAR -->
          <div class="arcade-navigation">
            <div class="nav-tabs">
              <button id="tab-ttt" class="tab-btn active">❌ Tic-Tac-Toe</button>
              <button id="tab-c4" class="tab-btn">🔴 4-Gewinnt</button>
            </div>
            <div class="mode-selector">
              <span style="color:#9ca3af">Mode:</span>
              <div class="mode-pills">
                <button id="mode-ai" class="mode-pill active">🤖 vs AI</button>
                <button id="mode-local" class="mode-pill">👥 Pass & Play</button>
                <button id="mode-p2p" class="mode-pill">🌐 Online P2P</button>
              </div>
            </div>
          </div>

          <!-- MULTIPLAYER P2P DRAWER -->
          <div id="p2p-panel" class="p2p-panel hidden">
            <div class="p2p-status-bar">
              <span id="p2p-status-text">Offline / Disconnected</span>
              <button id="btn-host-room" class="btn-small">Create Room</button>
            </div>
            <div id="p2p-room-info" class="p2p-actions hidden">
              <span>Room Code:</span>
              <div class="code-display">
                <span id="room-code-txt">------</span>
                <button id="btn-copy-code" class="copy-btn">Copy</button>
              </div>
            </div>
            <div id="p2p-join-group" class="join-group">
              <input id="input-room-code" type="text" class="code-input" placeholder="Enter Room Code" maxlength="6" />
              <button id="btn-join-room" class="btn-small">Connect</button>
            </div>
          </div>

          <!-- GAME ARENA BODY -->
          <div class="arena-body">
            <!-- TURN & SCORE BANNER -->
            <div class="turn-indicator">
              <div class="turn-badge">
                <span id="turn-dot" class="turn-dot player1"></span>
                <span id="turn-status-text">Your Turn</span>
              </div>
              <div style="font-size: 11px; color: #9ca3af;">
                Score: <span id="score-text" style="color: #ffffff; font-weight:700">0 - 0</span>
              </div>
            </div>

            <!-- TIC-TAC-TOE BOARD (3x3) -->
            <div id="ttt-arena" class="ttt-board">
              ${Array(9).fill(0).map((_, i) => `<div class="ttt-cell" data-index="${i}"></div>`).join('')}
            </div>

            <!-- 4-GEWINNT BOARD (7x6) -->
            <div id="c4-arena" class="c4-container hidden">
              <div class="c4-drop-row">
                ${Array(7).fill(0).map((_, col) => `<button class="c4-drop-btn" data-col="${col}">▼</button>`).join('')}
              </div>
              <div class="c4-board">
                ${Array(42).fill(0).map((_, i) => `<div class="c4-cell" data-index="${i}"></div>`).join('')}
              </div>
            </div>

            <!-- EMOTE QUICK BAR -->
            <div class="emote-bar">
              <button class="emote-btn" data-emote="🎉">🎉</button>
              <button class="emote-btn" data-emote="😂">😂</button>
              <button class="emote-btn" data-emote="🔥">🔥</button>
              <button class="emote-btn" data-emote="😱">😱</button>
              <button class="emote-btn" data-emote="👏">👏</button>
              <button class="emote-btn" data-emote="💩">💩</button>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="window-footer">
            <button id="btn-reset-game" class="footer-btn primary">🔄 New Round</button>
            <span id="game-status-msg" style="font-size: 11px; color: #9ca3af;">Ready</span>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.updateBoardView();
  }

  attachEventListeners() {
    // Window Toggle / Minimize / Sound
    this.root.getElementById('arcade-pill').addEventListener('click', () => this.toggleWindow(false));
    this.root.getElementById('btn-minimize').addEventListener('click', () => this.toggleWindow(true));
    
    const btnSound = this.root.getElementById('btn-sound');
    btnSound.addEventListener('click', () => {
      this.sound.muted = !this.sound.muted;
      btnSound.textContent = this.sound.muted ? '🔇' : '🔊';
    });

    // Drag Window Logic
    this.makeWindowDraggable();

    // Tabs
    const tabTTT = this.root.getElementById('tab-ttt');
    const tabC4 = this.root.getElementById('tab-c4');

    tabTTT.addEventListener('click', () => this.switchGameTab('tictactoe'));
    tabC4.addEventListener('click', () => this.switchGameTab('connect4'));

    // Mode Selector
    const modeAI = this.root.getElementById('mode-ai');
    const modeLocal = this.root.getElementById('mode-local');
    const modeP2P = this.root.getElementById('mode-p2p');

    modeAI.addEventListener('click', () => this.setGameMode('ai'));
    modeLocal.addEventListener('click', () => this.setGameMode('local'));
    modeP2P.addEventListener('click', () => this.setGameMode('p2p'));

    // P2P Controls
    this.root.getElementById('btn-host-room').addEventListener('click', () => {
      const code = this.p2p.hostRoom();
      this.root.getElementById('room-code-txt').textContent = code;
      this.root.getElementById('p2p-room-info').classList.remove('hidden');
      this.root.getElementById('p2p-status-text').textContent = 'Waiting for guest...';
      this.sound.playClick();
    });

    this.root.getElementById('btn-copy-code').addEventListener('click', () => {
      const code = this.root.getElementById('room-code-txt').textContent;
      navigator.clipboard.writeText(code);
      const btn = this.root.getElementById('btn-copy-code');
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 2000);
      this.sound.playClick();
    });

    this.root.getElementById('btn-join-room').addEventListener('click', () => {
      const input = this.root.getElementById('input-room-code');
      const code = input.value.trim();
      if (code.length === 6) {
        this.root.getElementById('p2p-status-text').textContent = 'Connecting...';
        this.p2p.joinRoom(code);
        this.sound.playClick();
      }
    });

    // Board Interactions - Tic Tac Toe
    const tttCells = this.root.querySelectorAll('.ttt-cell');
    tttCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const index = parseInt(cell.getAttribute('data-index'));
        this.handleTicTacToeMove(index);
      });
    });

    // Board Interactions - Connect 4 Drop Buttons
    const c4Btns = this.root.querySelectorAll('.c4-drop-btn');
    c4Btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const col = parseInt(btn.getAttribute('data-col'));
        this.handleConnect4Move(col);
      });
    });

    // Reset Button
    this.root.getElementById('btn-reset-game').addEventListener('click', () => {
      this.resetActiveGame();
      if (this.gameMode === 'p2p') {
        this.p2p.sendReset(this.activeGame);
      }
    });

    // Emotes
    const emoteBtns = this.root.querySelectorAll('.emote-btn');
    emoteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const emoji = btn.getAttribute('data-emote');
        this.triggerEmote(emoji);
        if (this.gameMode === 'p2p') {
          this.p2p.sendEmote(emoji);
        }
      });
    });
  }

  makeWindowDraggable() {
    const windowEl = this.root.getElementById('arcade-window');
    const headerEl = this.root.getElementById('window-header');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    headerEl.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      const rect = windowEl.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;

      // Switch to top/left positioning for smooth drag
      windowEl.style.right = 'auto';
      windowEl.style.bottom = 'auto';
      windowEl.style.left = initialLeft + 'px';
      windowEl.style.top = initialTop + 'px';
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      windowEl.style.left = (initialLeft + dx) + 'px';
      windowEl.style.top = (initialTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  toggleWindow(collapse) {
    this.isCollapsed = collapse;
    const windowEl = this.root.getElementById('arcade-window');
    const pillEl = this.root.getElementById('arcade-pill');

    if (collapse) {
      windowEl.classList.add('hidden');
      pillEl.classList.remove('hidden');
    } else {
      windowEl.classList.remove('hidden');
      pillEl.classList.add('hidden');
    }
    this.sound.playClick();
  }

  switchGameTab(game) {
    this.activeGame = game;
    const tabTTT = this.root.getElementById('tab-ttt');
    const tabC4 = this.root.getElementById('tab-c4');
    const arenaTTT = this.root.getElementById('ttt-arena');
    const arenaC4 = this.root.getElementById('c4-arena');

    if (game === 'tictactoe') {
      tabTTT.classList.add('active');
      tabC4.classList.remove('active');
      arenaTTT.classList.remove('hidden');
      arenaC4.classList.add('hidden');
    } else {
      tabC4.classList.add('active');
      tabTTT.classList.remove('active');
      arenaC4.classList.remove('hidden');
      arenaTTT.classList.add('hidden');
    }

    if (this.gameMode === 'p2p') {
      this.p2p.sendGameSwitch(game);
    }

    this.sound.playClick();
    this.updateBoardView();
  }

  setGameMode(mode) {
    this.gameMode = mode;
    const modeAI = this.root.getElementById('mode-ai');
    const modeLocal = this.root.getElementById('mode-local');
    const modeP2P = this.root.getElementById('mode-p2p');
    const p2pPanel = this.root.getElementById('p2p-panel');

    [modeAI, modeLocal, modeP2P].forEach(el => el.classList.remove('active'));

    if (mode === 'ai') {
      modeAI.classList.add('active');
      p2pPanel.classList.add('hidden');
      this.isMyTurn = true;
    } else if (mode === 'local') {
      modeLocal.classList.add('active');
      p2pPanel.classList.add('hidden');
      this.isMyTurn = true;
    } else if (mode === 'p2p') {
      modeP2P.classList.add('active');
      p2pPanel.classList.remove('hidden');
    }

    this.resetActiveGame();
    this.sound.playClick();
  }

  // ==========================================
  // GAME MOVE HANDLERS
  // ==========================================

  handleTicTacToeMove(index, fromRemote = false) {
    const engine = this.tttEngine;
    if (engine.winner) return;

    if (this.gameMode === 'p2p' && !fromRemote && !this.isMyTurn) {
      this.setStatusMsg("Not your turn!");
      return;
    }

    const success = engine.makeMove(index);
    if (!success) return;

    this.sound.playPlaceMarker();
    this.updateBoardView();

    // P2P Synchronization
    if (this.gameMode === 'p2p' && !fromRemote) {
      this.p2p.sendMove('tictactoe', index);
      this.isMyTurn = false;
    }

    if (engine.winner) {
      this.handleGameOver('tictactoe', engine.winner);
      return;
    }

    // AI Turn in Solo Mode
    if (this.gameMode === 'ai' && engine.turn === 'O') {
      this.isMyTurn = false;
      this.updateTurnIndicator('AI thinking...');
      setTimeout(() => {
        const aiIndex = engine.getAIMove(this.aiDifficulty);
        if (aiIndex !== null) {
          engine.makeMove(aiIndex);
          this.sound.playPlaceMarker();
          this.updateBoardView();
          if (engine.winner) {
            this.handleGameOver('tictactoe', engine.winner);
          }
        }
        this.isMyTurn = true;
        this.updateTurnIndicator();
      }, 400);
    } else if (this.gameMode === 'p2p') {
      if (fromRemote) this.isMyTurn = true;
      this.updateTurnIndicator();
    }
  }

  handleConnect4Move(col, fromRemote = false) {
    const engine = this.c4Engine;
    if (engine.winner) return;

    if (this.gameMode === 'p2p' && !fromRemote && !this.isMyTurn) {
      this.setStatusMsg("Not your turn!");
      return;
    }

    const dropResult = engine.dropToken(col);
    if (!dropResult) return;

    this.sound.playDropToken();
    this.updateBoardView();

    // P2P Synchronization
    if (this.gameMode === 'p2p' && !fromRemote) {
      this.p2p.sendMove('connect4', col);
      this.isMyTurn = false;
    }

    if (engine.winner) {
      this.handleGameOver('connect4', engine.winner);
      return;
    }

    // AI Turn in Solo Mode
    if (this.gameMode === 'ai' && engine.turn === 2) {
      this.isMyTurn = false;
      this.updateTurnIndicator('AI thinking...');
      setTimeout(() => {
        const aiCol = engine.getAIMove(this.aiDifficulty);
        if (aiCol !== null) {
          engine.dropToken(aiCol);
          this.sound.playDropToken();
          this.updateBoardView();
          if (engine.winner) {
            this.handleGameOver('connect4', engine.winner);
          }
        }
        this.isMyTurn = true;
        this.updateTurnIndicator();
      }, 450);
    } else if (this.gameMode === 'p2p') {
      if (fromRemote) this.isMyTurn = true;
      this.updateTurnIndicator();
    }
  }

  handleGameOver(game, winner) {
    const scoreObj = this.scores[game];
    let msg = '';

    if (winner === 'TIE') {
      msg = "It's a Tie!";
      scoreObj.ties++;
    } else {
      if (game === 'tictactoe') {
        msg = winner === 'X' ? 'Player X Wins! 🎉' : 'Player O Wins! 🎉';
        if (winner === 'X') scoreObj.p1++; else scoreObj.p2++;
      } else {
        msg = winner === 1 ? 'Player 1 (Cyan) Wins! 🎉' : 'Player 2 (Pink) Wins! 🎉';
        if (winner === 1) scoreObj.p1++; else scoreObj.p2++;
      }

      if ((this.gameMode === 'ai' && (winner === 'X' || winner === 1)) || 
          (this.gameMode === 'p2p' && ((this.p2p.isHost && (winner === 'X' || winner === 1)) || (!this.p2p.isHost && (winner === 'O' || winner === 2))))) {
        this.sound.playWin();
        this.triggerEmote('👑');
      } else {
        this.sound.playLoss();
      }
    }

    this.setStatusMsg(msg);
    this.updateTurnIndicator(msg);
  }

  resetActiveGame() {
    if (this.activeGame === 'tictactoe') {
      this.tttEngine.reset();
    } else {
      this.c4Engine.reset();
    }
    this.isMyTurn = this.gameMode === 'p2p' ? this.p2p.isHost : true;
    this.setStatusMsg("Ready");
    this.updateBoardView();
  }

  updateBoardView() {
    // 1. Render Tic-Tac-Toe
    const tttBoard = this.tttEngine.board;
    const tttCells = this.root.querySelectorAll('.ttt-cell');
    tttCells.forEach((cell, idx) => {
      const val = tttBoard[idx];
      cell.textContent = val;
      cell.className = 'ttt-cell';
      if (val === 'X') cell.classList.add('taken', 'x-mark');
      if (val === 'O') cell.classList.add('taken', 'o-mark');

      if (this.tttEngine.winningLine && this.tttEngine.winningLine.includes(idx)) {
        cell.classList.add('winning-cell');
      }
    });

    // 2. Render Connect 4
    const c4Board = this.c4Engine.board;
    const c4Cells = this.root.querySelectorAll('.c4-cell');
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        const index = r * 7 + c;
        const cell = c4Cells[index];
        const val = c4Board[r][c];

        cell.innerHTML = '';
        cell.className = 'c4-cell';

        if (val !== 0) {
          const token = document.createElement('div');
          token.className = `c4-token ${val === 1 ? 'p1' : 'p2'}`;
          cell.appendChild(token);
        }

        if (this.c4Engine.winningCoords) {
          const isWin = this.c4Engine.winningCoords.some(coord => coord.r === r && coord.c === c);
          if (isWin) cell.classList.add('winning-token');
        }
      }
    }

    // 3. Update Score Display
    const score = this.scores[this.activeGame];
    this.root.getElementById('score-text').textContent = `${score.p1} - ${score.p2}`;

    // 4. Update Turn Indicator
    this.updateTurnIndicator();
  }

  updateTurnIndicator(customText = null) {
    const dot = this.root.getElementById('turn-dot');
    const txt = this.root.getElementById('turn-status-text');

    if (customText) {
      txt.textContent = customText;
      return;
    }

    let isP1Turn = true;
    if (this.activeGame === 'tictactoe') {
      isP1Turn = this.tttEngine.turn === 'X';
    } else {
      isP1Turn = this.c4Engine.turn === 1;
    }

    dot.className = `turn-dot ${isP1Turn ? 'player1' : 'player2'}`;

    if (this.gameMode === 'ai') {
      txt.textContent = isP1Turn ? 'Your Turn' : 'AI Thinking...';
    } else if (this.gameMode === 'local') {
      txt.textContent = isP1Turn ? "Player 1's Turn" : "Player 2's Turn";
    } else if (this.gameMode === 'p2p') {
      txt.textContent = this.isMyTurn ? 'Your Turn (Online)' : "Opponent's Turn";
    }
  }

  setStatusMsg(msg) {
    this.root.getElementById('game-status-msg').textContent = msg;
  }

  triggerEmote(emoji) {
    const windowEl = this.root.getElementById('arcade-window');
    const emoteEl = document.createElement('div');
    emoteEl.className = 'floating-emote';
    emoteEl.textContent = emoji;

    // Random X offset across board width
    const randomLeft = 40 + Math.random() * 260;
    emoteEl.style.left = `${randomLeft}px`;
    emoteEl.style.bottom = '80px';

    windowEl.appendChild(emoteEl);
    this.sound.playEmote();

    setTimeout(() => {
      if (emoteEl.parentNode) emoteEl.parentNode.removeChild(emoteEl);
    }, 1800);
  }

  // ==========================================
  // P2P CALLBACKS INITIALIZATION
  // ==========================================
  initP2PCallbacks() {
    this.p2p.callbacks.onConnected = (info) => {
      this.root.getElementById('p2p-status-text').textContent = '✅ Connected P2P!';
      this.root.getElementById('pill-badge').className = 'pill-badge p2p';
      this.isMyTurn = info.isHost;
      this.mySymbol = info.isHost ? 'X' : 'O';
      this.myToken = info.isHost ? 1 : 2;
      this.sound.playWin();
      this.resetActiveGame();
    };

    this.p2p.callbacks.onDisconnected = () => {
      this.root.getElementById('p2p-status-text').textContent = 'Disconnected';
      this.root.getElementById('pill-badge').className = 'pill-badge';
      this.setStatusMsg("Opponent disconnected.");
      this.sound.playLoss();
    };

    this.p2p.callbacks.onMoveReceived = (data) => {
      if (data.game === 'tictactoe') {
        this.handleTicTacToeMove(data.moveData, true);
      } else if (data.game === 'connect4') {
        this.handleConnect4Move(data.moveData, true);
      }
    };

    this.p2p.callbacks.onResetReceived = (data) => {
      this.resetActiveGame();
      this.setStatusMsg("Opponent restarted game.");
    };

    this.p2p.callbacks.onGameSwitchReceived = (data) => {
      this.switchGameTab(data.game);
    };

    this.p2p.callbacks.onEmoteReceived = (data) => {
      this.triggerEmote(data.emoji);
    };

    this.p2p.callbacks.onError = (errMsg) => {
      this.root.getElementById('p2p-status-text').textContent = `❌ ${errMsg}`;
      this.sound.playLoss();
    };
  }
}

window.ArcadeUIController = ArcadeUIController;
