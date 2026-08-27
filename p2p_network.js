/**
 * P2P Network Manager using PeerJS for WebRTC connectivity.
 * Allows seamless room creation and joining via 6-character room codes.
 */

class P2PNetworkManager {
  constructor() {
    this.peer = null;
    this.conn = null;
    this.isHost = false;
    this.roomCode = null;
    this.myPlayerId = null; // 1 or 2 (Host = 1, Guest = 2)
    this.callbacks = {
      onConnected: null,
      onDisconnected: null,
      onMoveReceived: null,
      onResetReceived: null,
      onEmoteReceived: null,
      onGameSwitchReceived: null,
      onError: null
    };
  }

  getPeerClass() {
    return window.Peer || globalThis.Peer || (typeof Peer !== 'undefined' ? Peer : null);
  }

  generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  getFullPeerId(code) {
    return `bg_arcade_v1_${code.toUpperCase()}`;
  }

  hostRoom(customCode = null) {
    this.disconnect();
    this.isHost = true;
    this.myPlayerId = 1;
    this.roomCode = customCode ? customCode.toUpperCase() : this.generateRoomCode();

    const peerId = this.getFullPeerId(this.roomCode);
    const PeerClass = this.getPeerClass();

    if (!PeerClass) {
      console.error('[P2P] PeerJS library is not loaded!');
      if (this.callbacks.onError) this.callbacks.onError('PeerJS library not loaded.');
      return this.roomCode;
    }

    try {
      this.peer = new PeerClass(peerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('[P2P] Hosted room successfully. Code:', this.roomCode);
      });

      this.peer.on('connection', (connection) => {
        console.log('[P2P] Guest connected!');
        this.conn = connection;
        this.setupConnection();
      });

      this.peer.on('error', (err) => {
        console.error('[P2P] Peer host error:', err);
        if (err.type === 'unavailable-id') {
          this.hostRoom();
        } else if (this.callbacks.onError) {
          this.callbacks.onError(err.message || 'Connection error');
        }
      });
    } catch (e) {
      console.error('[P2P] Exception hosting room:', e);
      if (this.callbacks.onError) this.callbacks.onError('Failed to initialize WebRTC Peer.');
    }

    return this.roomCode;
  }

  joinRoom(code) {
    if (!code) return;
    this.disconnect();
    this.isHost = false;
    this.myPlayerId = 2;
    this.roomCode = code.trim().toUpperCase();

    const hostPeerId = this.getFullPeerId(this.roomCode);
    const PeerClass = this.getPeerClass();

    if (!PeerClass) {
      console.error('[P2P] PeerJS library is not loaded!');
      if (this.callbacks.onError) this.callbacks.onError('PeerJS library not loaded.');
      return;
    }

    try {
      this.peer = new PeerClass({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('[P2P] Connecting to host code:', this.roomCode);
        this.conn = this.peer.connect(hostPeerId, { reliable: true });
        this.setupConnection();
      });

      this.peer.on('error', (err) => {
        console.error('[P2P] Peer join error:', err);
        if (this.callbacks.onError) {
          this.callbacks.onError(err.type === 'peer-unavailable' ? 'Room code not found or offline.' : err.message);
        }
      });
    } catch (e) {
      console.error('[P2P] Exception joining room:', e);
      if (this.callbacks.onError) this.callbacks.onError('Failed to connect to room.');
    }
  }

  setupConnection() {
    if (!this.conn) return;

    this.conn.on('open', () => {
      console.log('[P2P] WebRTC DataChannel established!');
      if (this.callbacks.onConnected) {
        this.callbacks.onConnected({
          isHost: this.isHost,
          myPlayerId: this.myPlayerId,
          roomCode: this.roomCode
        });
      }
    });

    this.conn.on('data', (data) => {
      this.handleIncomingData(data);
    });

    this.conn.on('close', () => {
      console.log('[P2P] Connection closed by remote peer.');
      if (this.callbacks.onDisconnected) this.callbacks.onDisconnected();
    });

    this.conn.on('error', (err) => {
      console.error('[P2P] Connection error:', err);
      if (this.callbacks.onError) this.callbacks.onError('Network connection error.');
    });
  }

  handleIncomingData(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'MOVE':
        if (this.callbacks.onMoveReceived) this.callbacks.onMoveReceived(data);
        break;
      case 'RESET':
        if (this.callbacks.onResetReceived) this.callbacks.onResetReceived(data);
        break;
      case 'EMOTE':
        if (this.callbacks.onEmoteReceived) this.callbacks.onEmoteReceived(data);
        break;
      case 'SWITCH_GAME':
        if (this.callbacks.onGameSwitchReceived) this.callbacks.onGameSwitchReceived(data);
        break;
    }
  }

  send(data) {
    if (this.conn && this.conn.open) {
      this.conn.send(data);
    }
  }

  sendMove(game, moveData) {
    this.send({ type: 'MOVE', game, moveData, senderId: this.myPlayerId });
  }

  sendReset(game) {
    this.send({ type: 'RESET', game, senderId: this.myPlayerId });
  }

  sendGameSwitch(game) {
    this.send({ type: 'SWITCH_GAME', game, senderId: this.myPlayerId });
  }

  sendEmote(emoji) {
    this.send({ type: 'EMOTE', emoji, senderId: this.myPlayerId });
  }

  disconnect() {
    if (this.conn) {
      try { this.conn.close(); } catch(e){}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch(e){}
      this.peer = null;
    }
    this.roomCode = null;
  }
}

window.P2PNetworkManager = P2PNetworkManager;
