// Keyverse split-screen session controller.
//
// Handles: PeerJS pairing (via the backend's tiny session-mailbox API),
// independent per-player voice/text/screen-share toggles, and the WebRTC
// data channel used for live text chat and lightweight game-progress
// broadcasting. This file is included by split-screen.html only.
//
// Design notes (see the project spec):
//  - Video/voice/text/game-state all flow peer-to-peer via WebRTC once
//    PeerJS connects the two browsers directly. Nothing routes through our
//    server except the one-time peer-ID handshake.
//  - Each player independently chooses voice, text, screen-share, any
//    combination, or none — a player's choice never affects what's
//    available to the other player.
//  - Desktop/laptop only (PC and Mac), per the paid-feature spec. Mobile and
//    tablet visitors are redirected back to the account page with a notice.

const ICE_SERVERS = [
  { urls: 'stun:stun.relay.metered.ca:80' },
  { urls: 'turn:global.relay.metered.ca:80', username: '18bf9b0dc703f2ba15d26cc9', credential: 'jNWVthjMLHINjdC3' },
  { urls: 'turn:global.relay.metered.ca:80?transport=tcp', username: '18bf9b0dc703f2ba15d26cc9', credential: 'jNWVthjMLHINjdC3' },
  { urls: 'turn:global.relay.metered.ca:443', username: '18bf9b0dc703f2ba15d26cc9', credential: 'jNWVthjMLHINjdC3' },
  { urls: 'turns:global.relay.metered.ca:443?transport=tcp', username: '18bf9b0dc703f2ba15d26cc9', credential: 'jNWVthjMLHINjdC3' },
];

class SplitScreenSession {
  /**
   * @param {Object} opts
   * @param {string} opts.inviteCode - shared invite code both players joined with
   * @param {string} opts.playerId - this browser's player row id
   * @param {'host'|'guest'} opts.role - which side of the invite this player is
   * @param {Object} opts.callbacks - UI hook functions (see below)
   */
  constructor({ inviteCode, playerId, role, callbacks }) {
    this.inviteCode = inviteCode.trim().toUpperCase();
    this.playerId = playerId;
    this.role = role;
    this.callbacks = {
      onStatus: () => {},          // (message: string) => void
      onRemoteStream: () => {},    // (kind: 'camera'|'screen', stream: MediaStream|null) => void
      onChatMessage: () => {},     // (fromRole, text) => void
      onProgressUpdate: () => {},  // (fromRole, progress: {gameSlug, boardId, correct, incorrect}) => void
      onConnected: () => {},
      onDisconnected: () => {},
      onError: () => {},
      ...callbacks,
    };

    this.peer = null;
    this.dataConn = null;
    this.localCameraStream = null;
    this.localScreenStream = null;
    this.cameraCall = null;
    this.screenCall = null;
    this.remoteCameraCall = null;
    this.remoteScreenCall = null;
    this.pollTimer = null;
    this.micEnabled = false;
    this.mutedForAd = false;
  }

  async start() {
    this.callbacks.onStatus('Connecting to signaling…');
    this.peer = new Peer(undefined, { config: { iceServers: ICE_SERVERS } });

    this.peer.on('open', async (myPeerId) => {
      try {
        await apiFetch(`/api/sessions/${encodeURIComponent(this.inviteCode)}/announce`, {
          method: 'POST',
          body: JSON.stringify({ player_id: this.playerId, role: this.role, peer_id: myPeerId }),
        });
        this.callbacks.onStatus('Waiting for the other player…');
        this._pollForPeer();
      } catch (err) {
        this.callbacks.onError(err.message || 'Could not announce this session.');
      }
    });

    this.peer.on('connection', (conn) => this._wireDataConnection(conn));
    this.peer.on('call', (call) => this._handleIncomingCall(call));
    this.peer.on('error', (err) => {
      if (err.type === 'peer-unavailable' && this.role === 'host' && !this.dataConn) {
        // The guest's cached peer_id we just tried is dead (they reloaded or
        // left since announcing). Re-fetch a fresh one and retry instead of
        // dead-ending here — this is the key fix that makes reopening an
        // invite link later, or either side refreshing, actually recover.
        this.callbacks.onStatus('That connection attempt failed — retrying…');
        this._otherPeerId = null;
        this._pollForPeer();
        return;
      }
      this.callbacks.onError(`Connection error: ${err.type || err.message}`);
    });
    this.peer.on('disconnected', () => this.callbacks.onStatus('Signaling disconnected — attempting to reconnect…'));
  }

  // IMPORTANT: only ONE side may call peer.connect() to open the data
  // channel. If both sides called connect() independently (as an earlier
  // version of this code did), PeerJS creates two separate one-way
  // connections instead of one shared channel — each side ends up actively
  // listening on its own outgoing connection while the incoming connection
  // carrying the other side's messages is silently ignored, so "Connected!"
  // shows on both sides but chat/data never arrives. To avoid this, the
  // host always initiates; the guest only ever waits for the incoming
  // 'connection' event fired by peer.on('connection', ...) in start().
  //
  // The host keeps polling and re-announcing continuously (not just once)
  // until a real data connection opens, since the guest's peer_id in the
  // database can go stale at any time (they reloaded, or joined minutes
  // after the host started this session) — the poll interval re-reads the
  // CURRENT value every time rather than trusting a value cached at page
  // load, and any resulting peer-unavailable error triggers exactly one
  // more fresh poll cycle via the peer.on('error') handler above.
  _pollForPeer() {
    if (this.pollTimer) return; // already polling
    let attempts = 0;
    this.pollTimer = setInterval(async () => {
      attempts++;
      try {
        // Re-announce this side's own peer_id periodically. This keeps the
        // updated_at fresh (useful for future stale-session cleanup) and,
        // more importantly, guarantees that whenever the OTHER side reads
        // this row, the peer_id they see is one this browser tab is
        // definitely still holding open right now.
        if (attempts % 5 === 1) {
          await apiFetch(`/api/sessions/${encodeURIComponent(this.inviteCode)}/announce`, {
            method: 'POST',
            body: JSON.stringify({ player_id: this.playerId, role: this.role, peer_id: this.peer.id }),
          }).catch(() => {});
        }

        const session = await apiFetch(`/api/sessions/${encodeURIComponent(this.inviteCode)}`);
        const otherPeerId = this.role === 'host' ? session.guest_peer_id : session.host_peer_id;
        if (otherPeerId && otherPeerId !== this._otherPeerId) {
          this._otherPeerId = otherPeerId;
          if (this.role === 'host' && !this.dataConn) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
            this.callbacks.onStatus('Found the other player — connecting…');
            const conn = this.peer.connect(otherPeerId, { reliable: true });
            this._wireDataConnection(conn);
          } else if (this.role === 'guest' && !this.dataConn) {
            // Guest just needed the host's peer ID cached for voice/screen-share
            // calls later; the data channel itself arrives via the incoming
            // 'connection' event once the host successfully calls connect().
            // Keep polling (don't clear the timer) so that if the host's ID
            // changes again before they actually connect, we notice and stay
            // in sync rather than freezing on a status message forever.
            this.callbacks.onStatus('Found the host — waiting for them to connect…');
          }
        }
      } catch (err) {
        // 404 just means the other side hasn't announced yet — keep polling silently.
        if (attempts > 150) { // ~5 minutes at 2s interval
          clearInterval(this.pollTimer);
          this.pollTimer = null;
          this.callbacks.onError('Timed out waiting for the other player to join. Ask them to open the invite link again.');
        }
      }
    }, 2000);
  }

  _wireDataConnection(conn) {
    if (this.dataConn) return; // already connected to this peer
    this.dataConn = conn;
    if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    conn.on('open', () => {
      this.callbacks.onStatus('Connected!');
      this.callbacks.onConnected();
    });
    conn.on('data', (payload) => this._handleData(payload));
    conn.on('close', () => {
      this.callbacks.onStatus('The other player disconnected.');
      this.callbacks.onDisconnected();
    });
  }

  _handleData(payload) {
    if (!payload || typeof payload !== 'object') return;
    if (payload.type === 'chat') {
      this.callbacks.onChatMessage(this.role === 'host' ? 'guest' : 'host', payload.text);
    } else if (payload.type === 'progress') {
      this.callbacks.onProgressUpdate(this.role === 'host' ? 'guest' : 'host', payload.progress);
    } else if (payload.type === 'mic-ad-mute') {
      // Informational only — lets the other side's UI show "muted for ad" next
      // to this player's name, rather than silently going quiet.
      this.callbacks.onStatus(payload.muted ? 'Other player muted for an ad break' : 'Other player unmuted');
    }
  }

  sendChatMessage(text) {
    if (this.dataConn && this.dataConn.open) {
      this.dataConn.send({ type: 'chat', text });
    }
  }

  sendProgressUpdate(progress) {
    if (this.dataConn && this.dataConn.open) {
      this.dataConn.send({ type: 'progress', progress });
    }
  }

  // --- Voice -----------------------------------------------------------
  async enableVoice() {
    try {
      this.localCameraStream = this.localCameraStream || await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micEnabled = true;
      this._callWith(this.localCameraStream, 'camera');
      return true;
    } catch (err) {
      this.callbacks.onError('Microphone permission was denied or unavailable.');
      return false;
    }
  }

  disableVoice() {
    this.micEnabled = false;
    if (this.localCameraStream) {
      this.localCameraStream.getAudioTracks().forEach((t) => t.stop());
    }
    if (this.cameraCall) { this.cameraCall.close(); this.cameraCall = null; }
  }

  // --- Ad-mute integration point ----------------------------------------
  // Call this from the game's existing/future H5 Games Ads lifecycle hook
  // (fires when an ad with sound becomes visible / hides). Per policy this
  // mutes only the OUTGOING mic — never text chat — and auto-restores after.
  setMicMutedForAd(muted) {
    this.mutedForAd = muted;
    if (this.localCameraStream) {
      this.localCameraStream.getAudioTracks().forEach((t) => { t.enabled = !muted && this.micEnabled; });
    }
    if (this.dataConn && this.dataConn.open) {
      this.dataConn.send({ type: 'mic-ad-mute', muted });
    }
  }

  // --- Screen share ------------------------------------------------------
  async enableScreenShare() {
    try {
      this.localScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      this._callWith(this.localScreenStream, 'screen');
      this.localScreenStream.getVideoTracks()[0].addEventListener('ended', () => this.disableScreenShare());
      return true;
    } catch (err) {
      // User cancelled the picker — not a real error.
      return false;
    }
  }

  disableScreenShare() {
    if (this.localScreenStream) {
      this.localScreenStream.getTracks().forEach((t) => t.stop());
      this.localScreenStream = null;
    }
    if (this.screenCall) { this.screenCall.close(); this.screenCall = null; }
  }

  _callWith(stream, kind) {
    if (!this.peer || !this._otherPeerId) return;
    const call = this.peer.call(this._otherPeerId, stream, { metadata: { kind } });
    if (kind === 'camera') this.cameraCall = call;
    else this.screenCall = call;
    call.on('stream', (remoteStream) => this.callbacks.onRemoteStream(kind, remoteStream));
    call.on('close', () => this.callbacks.onRemoteStream(kind, null));
  }

  _handleIncomingCall(call) {
    this._otherPeerId = call.peer;
    const kind = (call.metadata && call.metadata.kind) || 'camera';
    call.answer(); // answer with no local stream of our own for this call slot
    call.on('stream', (remoteStream) => this.callbacks.onRemoteStream(kind, remoteStream));
    call.on('close', () => this.callbacks.onRemoteStream(kind, null));
    if (kind === 'camera') this.remoteCameraCall = call;
    else this.remoteScreenCall = call;
  }

  async end() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.disableVoice();
    this.disableScreenShare();
    if (this.dataConn) this.dataConn.close();
    if (this.peer) this.peer.destroy();
    try {
      await apiFetch(`/api/sessions/${encodeURIComponent(this.inviteCode)}/end`, { method: 'POST' });
    } catch (e) { /* best effort */ }
  }
}
