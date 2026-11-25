/**
 * Keyverse "Origin & Vibe" Web Audio API Sound & Arcade Juice Engine
 * Zero-latency synthesized audio (no external MP3s), smart silent locale/timezone
 * pack detection, floating control pill, and theme-synced visual juice.
 */
(function (global) {
  'use strict';

  const PACK_STORAGE_KEY = 'keyverse_sound_pack';
  const MUTE_STORAGE_KEY = 'keyverse_sound_muted';
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

  function playCorrect(comboCount = 1) {
    if (isMuted) return;
    const audio = ensureAudioContext();
    if (!audio) return;

    const freq = getScaleFreq(currentPack, comboCount);
    const isOverdrive = comboCount >= 5;

    if (currentPack === 'katana') {
      // Metallic blade shing + bamboo clack
      playNoise(0.22, 'bandpass', 3200, 6400, 0.14, 4.5);
      playTone('triangle', freq, freq * 1.02, 0.24, 0.18);
      playTone('sine', 900, 260, 0.045, 0.16);
      if (isOverdrive) {
        // Shakuhachi-style flute swell + sword unsheathe
        playNoise(0.55, 'bandpass', 950, 1450, 0.11, 6.0, 0.04);
        playTone('triangle', freq * 0.5, freq, 0.45, 0.14, 0.05);
      }
    } else if (currentPack === 'anime') {
      // High-energy synth zwoop / arcade chime
      playTone('sine', freq * 0.72, freq, 0.14, 0.22);
      playTone('triangle', freq * 1.5, freq * 2, 0.18, 0.12, 0.03);
      if (isOverdrive) {
        // Charging-aura hum + sparkle burst
        playTone('sawtooth', 140, 280, 0.4, 0.08, 0.02);
        [1, 1.25, 1.5, 2].forEach((mult, i) => {
          playTone('sine', freq * mult, freq * mult, 0.14, 0.1, 0.05 + i * 0.045);
        });
      }
    } else if (currentPack === 'harbor') {
      // Crisp brass ship-bell ding / sonar ping
      playTone('sine', freq, freq, 0.45, 0.2);
      playTone('sine', freq * 2.4, freq * 2.4, 0.25, 0.07);
      playTone('sine', freq * 3.9, freq * 3.9, 0.16, 0.04);
      if (isOverdrive) {
        // Deep foghorn swell + ocean wave whoosh
        playTone('sawtooth', 110, 108, 0.65, 0.07, 0.04);
        playTone('sawtooth', 165, 162, 0.65, 0.05, 0.04);
        playNoise(0.7, 'lowpass', 900, 260, 0.13, 0.8, 0.02);
      }
    } else {
      // Retro Cyber: mechanical key-click + 8-bit synth blip
      playNoise(0.03, 'highpass', 2400, 3200, 0.14, 1.0);
      playTone('square', freq, freq * 1.05, 0.11, 0.09);
      playTone('square', freq * 1.5, freq * 1.5, 0.11, 0.07, 0.05);
      if (isOverdrive) {
        playTone('sawtooth', 110, 220, 0.35, 0.07, 0.02);
        playTone('square', freq * 2, freq * 2, 0.18, 0.08, 0.09);
      }
    }
  }

  function playMiss() {
    if (isMuted) return;
    const audio = ensureAudioContext();
    if (!audio) return;

    if (currentPack === 'katana') {
      // Low taiko drum thud
      playTone('sine', 120, 42, 0.24, 0.32);
      playNoise(0.06, 'lowpass', 320, 110, 0.16, 1.0);
    } else if (currentPack === 'anime') {
      // Comedic bonk / pitch-drop scratch
      playTone('triangle', 340, 92, 0.22, 0.24);
      playNoise(0.1, 'bandpass', 1400, 380, 0.12, 2.5);
    } else if (currentPack === 'harbor') {
      // Heavy metallic anchor clank
      playTone('triangle', 185, 130, 0.26, 0.22);
      playTone('square', 277, 195, 0.18, 0.08);
    } else {
      // Classic 8-bit buzz
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
    if (sel) sel.value = currentPack;
    if (muteBtn) {
      muteBtn.textContent = isMuted ? '🔇' : '🔊';
      muteBtn.setAttribute('aria-label', isMuted ? 'Unmute Sound' : 'Mute Sound');
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
      playCorrect(3);
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
      }
    });

    bar.appendChild(sel);
    bar.appendChild(muteBtn);
    document.body.appendChild(bar);
    syncControlUI();
  }

  function init() {
    currentPack = detectDefaultPack();
    isMuted = safeStorageGet(MUTE_STORAGE_KEY) === 'true';

    ['keydown', 'pointerdown', 'click'].forEach((evt) => {
      global.addEventListener(evt, unlockAudio, { once: true, passive: true });
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
      syncControlUI();
    },
    getPack: function () { return currentPack; },
    isMuted: function () { return isMuted; }
  };
})(window);
