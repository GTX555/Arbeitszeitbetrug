# 🎮 Top-Right Floating Arcade Extension & UserScript

A sleek, glassmorphic top-right floating GUI widget for any web page featuring **Tic-Tac-Toe** and **4-Gewinnt (Connect 4)** with **Single-Player vs AI**, **Pass & Play**, and **Real-Time P2P WebRTC Multiplayer**!

---

## ✨ Key Features

- ↗️ **Top-Right Floating Widget**: Always available on any website. Collapsible into a small pill button, draggable anywhere on screen.
- 🔒 **Shadow DOM Isolation**: Completely isolated styles—won't break website CSS and host websites won't break the game styling.
- ❌⭕ **Tic-Tac-Toe (3x3)**: Smooth glow markers, smart Minimax AI, P2P sync.
- 🔴🟡 **4-Gewinnt / Connect 4 (7x6)**: Column drop animations, gravity physics, Minimax heuristic AI, win line detection.
- 🌐 **Real-Time P2P WebRTC Multiplayer**:
  - No server configuration needed! Uses PeerJS cloud signaling.
  - Host generates a 6-character Room Code (e.g., `ARCADE-X79K`).
  - Friend enters the Room Code to instantly connect peer-to-peer!
- 🎉 **Emote & Sound System**: Interactive sound effects synthesized via Web Audio API, floating animated emoji reactions (🎉, 😂, 🔥, 👑, etc.).

---

## 🚀 How to Install

### Option A: Chrome / Edge / Brave Extension (Manifest V3)

1. Open Chrome/Edge and go to `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode** (toggle in the top-right corner).
3. Click **Load unpacked**.
4. Select the folder: `c:\Users\luis-\Downloads\Browser_games`
5. Open any webpage (e.g. Google, Wikipedia, GitHub) and look at the **top-right corner**!

### Option B: Tampermonkey / Violentmonkey UserScript

1. Make sure you have the [Tampermonkey](https://www.tampermonkey.net/) or Violentmonkey browser extension installed.
2. Open Tampermonkey Dashboard -> **Create a new script**.
3. Copy the contents of [`tampermonkey/arcade_widget.user.js`](file:///c:/Users/luis-/Downloads/Browser_games/tampermonkey/arcade_widget.user.js) and paste it into the editor.
4. Save the script (Ctrl+S).
5. Visit any website and play!

---

## 🎮 How to Play Multiplayer with a Friend

1. **Host**:
   - Open the Arcade widget -> Select **🌐 Online P2P** mode.
   - Click **Create Room**.
   - Copy the generated 6-character Room Code (e.g. `X79K9A`) and send it to your friend!

2. **Guest**:
   - Open the Arcade widget on their browser -> Select **🌐 Online P2P** mode.
   - Paste the 6-character Room Code into the text box and click **Connect**.
   - WebRTC connection is established automatically! Play Tic-Tac-Toe or 4-Gewinnt in real time.

---

## 📁 Directory Structure

```
Browser_games/
├── manifest.json                  # Manifest V3 Extension config
├── content.js                     # Shadow DOM injection entry point
├── styles.css                     # Dark glassmorphism styles & animations
├── game_engine.js                 # Tic-Tac-Toe & 4-Gewinnt game logic & Minimax AI
├── p2p_network.js                 # PeerJS WebRTC P2P network manager
├── audio_synth.js                 # Web Audio API sound synthesizer
├── ui_components.js               # UI Renderer & state manager
├── lib/
│   └── peerjs.min.js              # Bundled PeerJS library
├── popup/                         # Chrome Extension popup toolbar UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── tampermonkey/                  # Standalone 1-file Userscript format
    └── arcade_widget.user.js
```
