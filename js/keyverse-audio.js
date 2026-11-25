/**
 * Keyverse "Origin & Vibe" Web Audio API Sound & Arcade Juice Engine
 * Zero-latency synthesized audio (no external MP3s), smart silent locale/timezone
 * pack detection, floating control pill, and theme-synced visual juice.
 */
(function (global) {
  'use strict';

  const PACK_STORAGE_KEY = 'keyverse_sound_pack';
  const MUTE_STORAGE_KEY = 'keyverse_sound_muted';
  const AMBIENT_ENABLED_KEY = 'keyverse_ambient_enabled';
  const AMBIENT_VOLUME_KEY = 'keyverse_ambient_volume';
  const GEO_CACHE_KEY = 'keyverse_geo_pack';

  const PACKS = {
    katana: {
      id: 'katana',
      label: '⚔️ Katana',
      fullName: '⚔️ Katana & Dojo',
      accent: '#ff4d6d',
      secondary: '#ffffff',
      glow: 'rgba(255, 77, 109, 0.55)',
      scale: [293.66, 311.13, 440.0, 466.16, 587.33, 622.25, 880.0] // In-sen Japanese pentatonic
    },
    anime: {
      id: 'anime',
      label: '⚡ Anime',
      fullName: '⚡ Anime Power-Up',
      accent: '#ffd60a',
      secondary: '#00f5d4',
      glow: 'rgba(255, 214, 10, 0.55)',
      scale: [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66] // Heroic major scale
    },
    harbor: {
      id: 'harbor',
      label: '⚓ Harbor',
      fullName: '⚓ Harbor & Maritime',
      accent: '#2ec4b6',
      secondary: '#cbf3f0',
      glow: 'rgba(46, 196, 182, 0.55)',
      scale: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0, 987.77] // Harmonic bell scale
    },
    cyber: {
      id: 'cyber',
      label: '👾 Cyber',
      fullName: '👾 Retro Cyber',
      accent: '#13f2b0',
      secondary: '#7c9dff',
      glow: 'rgba(19, 242, 176, 0.55)',
      scale: [330.0, 392.0, 493.88, 587.33, 659.25, 783.99, 987.77] // Retro arpeggio
    }
  };

  const MARITIME_TIMEZONES = new Set([
    'America/Anchorage', 'America/Juneau', 'America/Sitka', 'America/Nome',
    'America/Los_Angeles', 'America/Vancouver', 'America/New_York',
    'America/Halifax', 'Europe/Amsterdam', 'Europe/Oslo', 'Europe/London',
    'Europe/Lisbon', 'Pacific/Auckland', 'Australia/Sydney'
  ]);

  const PORT_CITIES = /anchorage|juneau|ketchikan|sitka|seattle|tacoma|portland|san francisco|san diego|los angeles|vancouver|new york|boston|miami|halifax|amsterdam|rotterdam|oslo|bergen|london|lisbon|auckland|sydney|honolulu/i;

  let ctx = null;
  let noiseBuffer = null;
  let currentPack = 'cyber';
  let isMuted = false;
  let ambientEnabled = false;
  let ambientVolume = 25;
  let ambientGain = null;
  let ambientNodes = [];
  let ambientRunningPack = null;
  let ambientStopTimer = null;
  const sampleBuffers = {};
  const preloadStarted = {};

  function preloadPack(packId) {
    if (!PACKS[packId] || preloadStarted[packId]) return;
    const audio = ensureAudioContext();
    if (!audio || typeof fetch !== 'function') return;

    preloadStarted[packId] = true;
    sampleBuffers[packId] = sampleBuffers[packId] || {};

    ['hit', 'overdrive', 'miss', 'ambient'].forEach((slot) => {
      const url = `../sounds/${packId}/${slot}.mp3`;
      fetch(url)
        .then((res) => (res.ok ? res.arrayBuffer() : null))
        .then((buf) => (buf ? audio.decodeAudioData(buf) : null))
        .then((decoded) => {
          if (decoded) {
            sampleBuffers[packId][slot] = decoded;
            if (slot === 'ambient' && ambientEnabled && !isMuted && currentPack === packId) {
              startAmbient(packId);
            }
          }
        })
        .catch(() => {});
    });
  }

  function playSample(packId, slot, playbackRate = 1.0, gainVal = 0.85) {
    const buf = sampleBuffers[packId] && sampleBuffers[packId][slot];
    const audio = ensureAudioContext();
    if (!buf || !audio) return false;

    try {
      const src = audio.createBufferSource();
      src.buffer = buf;
      src.playbackRate.value = playbackRate;

      const gain = audio.createGain();
      gain.gain.setValueAtTime(gainVal, audio.currentTime);

      src.connect(gain);
      gain.connect(audio.destination);
      src.start(0);
      return true;
    } catch (_) {
      return false;
    }
  }

  function safeStorageGet(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  function safeStorageSet(key, val) {
    try { localStorage.setItem(key, val); } catch (_) {}
  }

  function detectDefaultPack() {
    const saved = safeStorageGet(PACK_STORAGE_KEY);
    if (saved && PACKS[saved]) return saved;

    const cachedGeo = safeStorageGet(GEO_CACHE_KEY);
    if (cachedGeo && PACKS[cachedGeo]) return cachedGeo;

    const lang = (navigator.language || '').toLowerCase();
    let tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (_) {}

    if (lang.startsWith('ja')) return 'anime';
    if (tz.startsWith('Asia/')) return 'katana';
    if (MARITIME_TIMEZONES.has(tz)) {
      scheduleSilentCityCheck();
      return 'harbor';
    }
    return 'cyber';
  }

  function scheduleSilentCityCheck() {
    if (safeStorageGet(PACK_STORAGE_KEY) || safeStorageGet(GEO_CACHE_KEY)) return;
    if (typeof fetch !== 'function') return;

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), 1500) : null;

    fetch('https://ipapi.co/json/', controller ? { signal: controller.signal } : {})
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || safeStorageGet(PACK_STORAGE_KEY)) return;
        const city = `${data.city || ''} ${data.region || ''}`;
        const refined = PORT_CITIES.test(city) ? 'harbor' : 'cyber';
        safeStorageSet(GEO_CACHE_KEY, refined);
        if (currentPack !== refined) {
          currentPack = refined;
          syncControlUI();
        }
      })
      .catch(() => {})
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  function ensureAudioContext() {
    if (!ctx) {
      const AudioCtx = global.AudioContext || global.webkitAudioContext;
      if (!AudioCtx) return null;
      ctx = new AudioCtx();
    }
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (!noiseBuffer && ctx) {
      const sampleRate = ctx.sampleRate;
      noiseBuffer = ctx.createBuffer(1, sampleRate * 1.2, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return ctx;
  }

  function unlockAudio() {
    ensureAudioContext();
    preloadPack(currentPack);
    if (ambientEnabled && !isMuted && !document.hidden && !ambientRunningPack) {
      startAmbient(currentPack);
    }
  }

  function getEffectiveAmbientGain() {
    if (isMuted || !ambientEnabled || (typeof document !== 'undefined' && document.hidden)) {
      return 0;
    }
    return (Math.max(0, Math.min(100, ambientVolume)) / 100) * 0.45;
  }

  function ensureAmbientGain() {
    const audio = ensureAudioContext();
    if (!audio) return null;
    if (!ambientGain) {
      ambientGain = audio.createGain();
      ambientGain.gain.setValueAtTime(0, audio.currentTime);
      ambientGain.connect(audio.destination);
    }
    return ambientGain;
  }

  function clearAmbientNodes() {
    ambientNodes.forEach((node) => {
      try { if (typeof node.stop === 'function') node.stop(); } catch (_) {}
      try { node.disconnect(); } catch (_) {}
    });
    ambientNodes = [];
    ambientRunningPack = null;
  }

  function updateAmbientVolume(fadeSec = 0.12) {
    const audio = ensureAudioContext();
    const master = ensureAmbientGain();
    if (!audio || !master) return;
    const now = audio.currentTime;
    const target = getEffectiveAmbientGain();
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(target, now + fadeSec);
  }

  function stopAmbient() {
    if (!ctx || !ambientGain) {
      clearAmbientNodes();
      return;
    }
    const now = ctx.currentTime;
    ambientGain.gain.cancelScheduledValues(now);
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(0, now + 0.4);
    clearTimeout(ambientStopTimer);
    ambientStopTimer = setTimeout(clearAmbientNodes, 430);
  }

  function startAmbient(packId = currentPack) {
    if (!ambientEnabled || isMuted || (typeof document !== 'undefined' && document.hidden)) return;
    const audio = ensureAudioContext();
    const master = ensureAmbientGain();
    if (!audio || !master) return;

    preloadPack(packId);
    clearTimeout(ambientStopTimer);

    const switchDelay = ambientNodes.length > 0 ? 410 : 0;
    if (ambientNodes.length > 0) {
      const now = audio.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(0, now + 0.4);
    }

    setTimeout(() => {
      clearAmbientNodes();
      if (!ambientEnabled || isMuted || document.hidden) return;

      const sampleBuf = sampleBuffers[packId] && sampleBuffers[packId].ambient;
      if (sampleBuf) {
        const src = audio.createBufferSource();
        src.buffer = sampleBuf;
        src.loop = true;
        src.connect(master);
        src.start(0);
        ambientNodes.push(src);
      } else if (noiseBuffer) {
        if (packId === 'katana') {
          // Soft rain-like filtered noise + subtle D3 bamboo drone
          const src = audio.createBufferSource();
          src.buffer = noiseBuffer;
          src.loop = true;
          const filter = audio.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 780;
          filter.Q.value = 0.7;
          const subGain = audio.createGain();
          subGain.gain.value = 0.25;
          src.connect(filter);
          filter.connect(subGain);
          subGain.connect(master);
          src.start(0);

          const drone = audio.createOscillator();
          drone.type = 'sine';
          drone.frequency.value = 146.83;
          const dGain = audio.createGain();
          dGain.gain.value = 0.08;
          drone.connect(dGain);
          dGain.connect(master);
          drone.start(0);
          ambientNodes.push(src, filter, subGain, drone, dGain);
        } else if (packId === 'harbor') {
          // Gentle ocean swell via LFO-modulated lowpass noise
          const src = audio.createBufferSource();
          src.buffer = noiseBuffer;
          src.loop = true;
          const filter = audio.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 360;
          const lfo = audio.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.value = 0.14;
          const lfoGain = audio.createGain();
          lfoGain.gain.value = 160;
          lfo.connect(lfoGain);
          lfoGain.connect(filter.frequency);
          const subGain = audio.createGain();
          subGain.gain.value = 0.35;
          src.connect(filter);
          filter.connect(subGain);
          subGain.connect(master);
          src.start(0);
          lfo.start(0);
          ambientNodes.push(src, filter, lfo, lfoGain, subGain);
        } else if (packId === 'anime') {
          // Warm lo-fi synth pad chord
          const filter = audio.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 540;
          const subGain = audio.createGain();
          subGain.gain.value = 0.07;
          filter.connect(subGain);
          subGain.connect(master);
          ambientNodes.push(filter, subGain);
          [261.63, 329.63, 392.0].forEach((freq) => {
            const osc = audio.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.connect(filter);
            osc.start(0);
            ambientNodes.push(osc);
          });
        } else {
          // Subtle neon cyber hum
          const filter = audio.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 260;
          const subGain = audio.createGain();
          subGain.gain.value = 0.08;
          filter.connect(subGain);
          subGain.connect(master);
          ambientNodes.push(filter, subGain);
          [110.0, 165.0].forEach((freq) => {
            const osc = audio.createOscillator();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            osc.connect(filter);
            osc.start(0);
            ambientNodes.push(osc);
          });
        }
      }

      ambientRunningPack = packId;
      updateAmbientVolume(0.4);
    }, switchDelay);
  }

  function playNoise(duration, filterType, startFreq, endFreq, gainVal, qVal = 1.0, delay = 0) {
    const audio = ensureAudioContext();
    if (!audio || !noiseBuffer) return;
    const now = audio.currentTime + delay;
    const src = audio.createBufferSource();
    src.buffer = noiseBuffer;

    const filter = audio.createBiquadFilter();
    filter.type = filterType;
    filter.Q.setValueAtTime(qVal, now);
    filter.frequency.setValueAtTime(startFreq, now);
    if (endFreq !== startFreq) {
      filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(audio.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  function playTone(type, startFreq, endFreq, duration, gainVal, delay = 0) {
    const audio = ensureAudioContext();
    if (!audio) return;
    const now = audio.currentTime + delay;
    const osc = audio.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, now);
    if (endFreq !== startFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(25, endFreq), now + duration);
    }

    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(gainVal, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  function getScaleFreq(packId, comboCount) {
    const scale = PACKS[packId].scale;
    const idx = Math.min(Math.max(0, (comboCount || 1) - 1), scale.length - 1);
    return scale[idx];
  }

  function playSynthHit(freq) {
    if (currentPack === 'katana') {
      playNoise(0.22, 'bandpass', 3200, 6400, 0.14, 4.5);
      playTone('triangle', freq, freq * 1.02, 0.24, 0.18);
      playTone('sine', 900, 260, 0.045, 0.16);
    } else if (currentPack === 'anime') {
      playTone('sine', freq * 0.72, freq, 0.14, 0.22);
      playTone('triangle', freq * 1.5, freq * 2, 0.18, 0.12, 0.03);
    } else if (currentPack === 'harbor') {
      playTone('sine', freq, freq, 0.45, 0.2);
      playTone('sine', freq * 2.4, freq * 2.4, 0.25, 0.07);
      playTone('sine', freq * 3.9, freq * 3.9, 0.16, 0.04);
    } else {
      playNoise(0.03, 'highpass', 2400, 3200, 0.14, 1.0);
      playTone('square', freq, freq * 1.05, 0.11, 0.09);
      playTone('square', freq * 1.5, freq * 1.5, 0.11, 0.07, 0.05);
    }
  }

  function playSynthOverdrive(freq) {
    if (currentPack === 'katana') {
      playNoise(0.55, 'bandpass', 950, 1450, 0.11, 6.0, 0.04);
      playTone('triangle', freq * 0.5, freq, 0.45, 0.14, 0.05);
    } else if (currentPack === 'anime') {
      playTone('sawtooth', 140, 280, 0.4, 0.08, 0.02);
      [1, 1.25, 1.5, 2].forEach((mult, i) => {
        playTone('sine', freq * mult, freq * mult, 0.14, 0.1, 0.05 + i * 0.045);
      });
    } else if (currentPack === 'harbor') {
      playTone('sawtooth', 110, 108, 0.65, 0.07, 0.04);
      playTone('sawtooth', 165, 162, 0.65, 0.05, 0.04);
      playNoise(0.7, 'lowpass', 900, 260, 0.13, 0.8, 0.02);
    } else {
      playTone('sawtooth', 110, 220, 0.35, 0.07, 0.02);
      playTone('square', freq * 2, freq * 2, 0.18, 0.08, 0.09);
    }
  }

  function playCorrect(comboCount = 1) {
    if (isMuted) return;
    const audio = ensureAudioContext();
    if (!audio) return;
    preloadPack(currentPack);

    const freq = getScaleFreq(currentPack, comboCount);
    const pitchRate = 1.0 + Math.min(Math.max(0, comboCount), 12) * 0.045;
    const isOverdriveMilestone = comboCount >= 5 && comboCount % 5 === 0;

    if (!playSample(currentPack, 'hit', pitchRate, 0.82)) {
      playSynthHit(freq);
    }

    if (isOverdriveMilestone) {
      if (!playSample(currentPack, 'overdrive', 1.0, 0.78)) {
        playSynthOverdrive(freq);
      }
    }
  }

  function playMiss() {
    if (isMuted) return;
    const audio = ensureAudioContext();
    if (!audio) return;
    preloadPack(currentPack);

    if (playSample(currentPack, 'miss', 1.0, 0.85)) return;

    if (currentPack === 'katana') {
      playTone('sine', 120, 42, 0.24, 0.32);
      playNoise(0.06, 'lowpass', 320, 110, 0.16, 1.0);
    } else if (currentPack === 'anime') {
      playTone('triangle', 340, 92, 0.22, 0.24);
      playNoise(0.1, 'bandpass', 1400, 380, 0.12, 2.5);
    } else if (currentPack === 'harbor') {
      playTone('triangle', 185, 130, 0.26, 0.22);
      playTone('square', 277, 195, 0.18, 0.08);
    } else {
      playTone('sawtooth', 145, 95, 0.2, 0.14);
    }
  }

  function playWin() {
    if (isMuted) return;
    const audio = ensureAudioContext();
    if (!audio) return;

    const notes = PACKS[currentPack].scale;
    const fanfare = [notes[0], notes[2], notes[4], notes[6] || notes[notes.length - 1]];
    fanfare.forEach((f, idx) => {
      const wave = currentPack === 'cyber' ? 'square' : (currentPack === 'katana' ? 'triangle' : 'sine');
      const vol = currentPack === 'cyber' ? 0.09 : 0.18;
      playTone(wave, f, f, 0.28, vol, idx * 0.085);
    });
  }

  function injectJuiceStyles() {
    if (document.getElementById('kv-audio-styles')) return;
    const style = document.createElement('style');
    style.id = 'kv-audio-styles';
    style.textContent = `
      @keyframes kvFloatUp {
        0% { opacity: 0; transform: translate(-50%, 6px) scale(0.85); }
        20% { opacity: 1; transform: translate(-50%, -6px) scale(1.06); }
        100% { opacity: 0; transform: translate(-50%, -44px) scale(1); }
      }
      @keyframes kvShake150 {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        50% { transform: translateX(6px); }
        75% { transform: translateX(-4px); }
      }
      .kv-juice-popup {
        position: fixed;
        pointer-events: none;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 800;
        font-size: 0.95rem;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(11, 14, 17, 0.9);
        z-index: 10002;
        animation: kvFloatUp 780ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        white-space: nowrap;
      }
      .kv-card-shake {
        animation: kvShake150 150ms ease-in-out;
      }
      .kv-overdrive-active {
        transition: box-shadow 220ms ease, border-color 220ms ease !important;
      }
      #kv-audio-bar {
        position: fixed;
        top: 14px;
        left: 14px;
        z-index: 9998;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(24, 24, 37, 0.88);
        border: 1px solid #45475a;
        border-radius: 999px;
        padding: 4px 10px;
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
      }
      #kv-sound-select {
        background: transparent;
        color: #cdd6f4;
        border: none;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        outline: none;
      }
      #kv-sound-select option {
        background: #1e1e2e;
        color: #cdd6f4;
      }
      #kv-mute-btn {
        background: transparent;
        border: none;
        color: #cdd6f4;
        font-size: 0.88rem;
        cursor: pointer;
        padding: 2px 4px;
        line-height: 1;
      }
      #kv-ambient-btn {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid #45475a;
        border-radius: 999px;
        color: #a6adc8;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        padding: 3px 8px;
        line-height: 1.2;
        transition: all 150ms ease;
      }
      #kv-ambient-btn.active {
        color: #13f2b0;
        border-color: #13f2b0;
        background: rgba(19, 242, 176, 0.12);
      }
      #kv-ambient-vol {
        width: 56px;
        height: 4px;
        cursor: pointer;
        accent-color: #13f2b0;
      }
    `;
    document.head.appendChild(style);
  }

  function triggerVisualJuice(type, comboCount = 1, targetElement = null) {
    injectJuiceStyles();
    const pack = PACKS[currentPack] || PACKS.cyber;
    const card = targetElement || document.querySelector('.card');

    if (type === 'miss') {
      if (card) {
        card.classList.remove('kv-card-shake', 'kv-overdrive-active');
        card.style.boxShadow = '';
        card.style.borderColor = '';
        void card.offsetWidth;
        card.classList.add('kv-card-shake');
      }
      return;
    }

    if (type === 'correct') {
      const popup = document.createElement('div');
      popup.className = 'kv-juice-popup';
      const isOverdrive = comboCount >= 5;
      popup.textContent = isOverdrive ? `🔥 ${comboCount}x OVERDRIVE!` : `+100`;
      popup.style.color = isOverdrive ? pack.secondary : pack.accent;
      popup.style.border = `1px solid ${pack.accent}`;
      popup.style.boxShadow = `0 0 14px ${pack.glow}`;

      const anchor = document.getElementById('msg') || card;
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${Math.max(56, rect.top - 6)}px`;
      } else {
        popup.style.left = '50%';
        popup.style.top = '30%';
      }

      document.body.appendChild(popup);
      setTimeout(() => popup.remove(), 800);

      if (card) {
        if (isOverdrive) {
          card.classList.add('kv-overdrive-active');
          card.style.borderColor = pack.accent;
          card.style.boxShadow = `0 0 26px ${pack.glow}`;
        } else {
          card.classList.remove('kv-overdrive-active');
          card.style.borderColor = '';
          card.style.boxShadow = '';
        }
      }
    }
  }

  function syncControlUI() {
    const sel = document.getElementById('kv-sound-select');
    const muteBtn = document.getElementById('kv-mute-btn');
    const ambBtn = document.getElementById('kv-ambient-btn');
    const ambVol = document.getElementById('kv-ambient-vol');
    if (sel) sel.value = currentPack;
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
    }
    if (ambBtn) {
      ambBtn.classList.toggle('active', ambientEnabled);
      ambBtn.textContent = ambientEnabled ? '🎧 Ambience On' : '🎧 Ambience';
      ambBtn.setAttribute('aria-pressed', String(ambientEnabled));
    }
    if (ambVol) {
      ambVol.value = String(ambientVolume);
      ambVol.style.accentColor = (PACKS[currentPack] && PACKS[currentPack].accent) || '#13f2b0';
    }
  }

  function injectControlBar() {
    if (document.getElementById('kv-audio-bar') || !document.body) return;
    injectJuiceStyles();

    const bar = document.createElement('div');
    bar.id = 'kv-audio-bar';
    bar.setAttribute('aria-label', 'Sound Pack Controls');

    const sel = document.createElement('select');
    sel.id = 'kv-sound-select';
    sel.setAttribute('aria-label', 'Sound Pack');
    Object.values(PACKS).forEach((p) => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = p.label;
      sel.appendChild(opt);
    });
    sel.value = currentPack;
    sel.addEventListener('change', () => {
      currentPack = sel.value;
      safeStorageSet(PACK_STORAGE_KEY, currentPack);
      unlockAudio();
      preloadPack(currentPack);
      syncControlUI();
      playCorrect(3);
      if (ambientEnabled && !isMuted) {
        startAmbient(currentPack);
      }
    });

    const ambBtn = document.createElement('button');
    ambBtn.id = 'kv-ambient-btn';
    ambBtn.type = 'button';
    ambBtn.addEventListener('click', () => {
      ambientEnabled = !ambientEnabled;
      safeStorageSet(AMBIENT_ENABLED_KEY, String(ambientEnabled));
      syncControlUI();
      if (ambientEnabled && !isMuted) {
        unlockAudio();
        startAmbient(currentPack);
      } else {
        stopAmbient();
      }
    });

    const ambVol = document.createElement('input');
    ambVol.id = 'kv-ambient-vol';
    ambVol.type = 'range';
    ambVol.min = '0';
    ambVol.max = '100';
    ambVol.value = String(ambientVolume);
    ambVol.setAttribute('aria-label', 'Ambient Volume');
    ambVol.addEventListener('input', () => {
      ambientVolume = parseInt(ambVol.value, 10) || 0;
      safeStorageSet(AMBIENT_VOLUME_KEY, String(ambientVolume));
      updateAmbientVolume(0.08);
    });

    const muteBtn = document.createElement('button');
    muteBtn.id = 'kv-mute-btn';
    muteBtn.type = 'button';
    muteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      safeStorageSet(MUTE_STORAGE_KEY, String(isMuted));
      syncControlUI();
      if (!isMuted) {
        unlockAudio();
        playCorrect(1);
        if (ambientEnabled) startAmbient(currentPack);
      } else {
        updateAmbientVolume(0.2);
      }
    });

    bar.appendChild(sel);
    bar.appendChild(ambBtn);
    bar.appendChild(ambVol);
    bar.appendChild(muteBtn);
    document.body.appendChild(bar);
    syncControlUI();
  }

  function init() {
    currentPack = detectDefaultPack();
    isMuted = safeStorageGet(MUTE_STORAGE_KEY) === 'true';
    ambientEnabled = safeStorageGet(AMBIENT_ENABLED_KEY) === 'true';
    const savedVol = parseInt(safeStorageGet(AMBIENT_VOLUME_KEY), 10);
    if (!isNaN(savedVol) && savedVol >= 0 && savedVol <= 100) {
      ambientVolume = savedVol;
    }

    ['keydown', 'pointerdown', 'click'].forEach((evt) => {
      global.addEventListener(evt, unlockAudio, { once: true, passive: true });
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        updateAmbientVolume(0.4);
      } else if (ambientEnabled && !isMuted) {
        if (!ambientRunningPack) {
          startAmbient(currentPack);
        } else {
          updateAmbientVolume(0.4);
        }
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectControlBar);
    } else {
      injectControlBar();
    }
  }

  init();

  global.KeyverseAudio = {
    playCorrect,
    playMiss,
    playWin,
    triggerVisualJuice,
    setPack: function (packId) {
      if (!PACKS[packId]) return;
      currentPack = packId;
      safeStorageSet(PACK_STORAGE_KEY, packId);
      preloadPack(packId);
      syncControlUI();
      if (ambientEnabled && !isMuted) {
        startAmbient(packId);
      }
    },
    getPack: function () { return currentPack; },
    isMuted: function () { return isMuted; }
  };
})(window);
