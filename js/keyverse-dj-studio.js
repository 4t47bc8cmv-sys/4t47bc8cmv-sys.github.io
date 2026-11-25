/**
 * Keyverse "Shortcut DJ Studio" — Interactive 16-Step Sequencer,
 * 5 Playable Genres, and Persistent Instrument Leveling (Lv. 1–5).
 * Works alongside js/keyverse-audio.js across all Keyverse games.
 */
(function (global) {
  'use strict';

  const GENRE_KEY = 'keyverse_dj_genre';
  const PATTERNS_KEY = 'keyverse_dj_patterns';
  const XP_KEY = 'keyverse_dj_xp';
  const XP_THRESHOLDS = [0, 10, 25, 45, 75]; // Lv 1..5
  const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';
  const GA_MEASUREMENT_ID = 'G-HPCMTG7133';

  const GENRES = {
    lofi: {
      id: 'lofi',
      label: '🎧 Lo-Fi Chill',
      bpm: 85,
      accent: '#a6e3a1',
      bassNotes: [65.41, 73.42, 87.31, 98.0],
      leadNotes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
      defaults: [
        [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,0,0,0],
        [0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,1],
        [1,0,0,0, 0,0,1,0, 1,0,0,0, 0,1,0,0],
        [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0]
      ]
    },
    synthwave: {
      id: 'synthwave',
      label: '🌆 Synthwave',
      bpm: 118,
      accent: '#cba6f7',
      bassNotes: [82.41, 98.0, 110.0, 123.47],
      leadNotes: [329.63, 392.0, 440.0, 493.88, 587.33, 659.25],
      defaults: [
        [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        [0,0,1,0, 1,0,1,0, 0,0,1,0, 1,0,1,0],
        [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        [1,0,0,1, 0,1,0,0, 1,0,0,1, 0,1,1,0]
      ]
    },
    trap: {
      id: 'trap',
      label: '🔥 Trap / Hip-Hop',
      bpm: 135,
      accent: '#f38ba8',
      bassNotes: [55.0, 58.27, 73.42, 82.41],
      leadNotes: [220.0, 233.08, 293.66, 329.63, 440.0, 466.16],
      defaults: [
        [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,0],
        [0,1,0,1, 1,0,1,1, 0,1,0,1, 1,1,1,1],
        [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,1,0,0],
        [1,0,0,0, 1,0,0,1, 0,0,1,0, 0,0,1,0]
      ]
    },
    anime: {
      id: 'anime',
      label: '⚡ Anime / J-Rock',
      bpm: 140,
      accent: '#ffd60a',
      bassNotes: [73.42, 82.41, 98.0, 110.0],
      leadNotes: [440.0, 493.88, 554.37, 659.25, 739.99, 880.0],
      defaults: [
        [1,0,1,0, 1,0,0,0, 1,0,1,0, 1,0,1,0],
        [0,0,1,0, 1,0,1,0, 0,0,1,0, 1,1,1,1],
        [1,1,0,0, 1,1,0,0, 1,1,0,0, 1,0,1,0],
        [1,0,1,1, 0,1,1,0, 1,0,1,1, 0,1,1,1]
      ]
    },
    house: {
      id: 'house',
      label: '🕺 House / EDM',
      bpm: 126,
      accent: '#13f2b0',
      bassNotes: [65.41, 77.78, 98.0, 116.54],
      leadNotes: [261.63, 311.13, 392.0, 466.16, 523.25, 622.25],
      defaults: [
        [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
        [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,1],
        [0,0,1,0, 0,1,0,0, 0,0,1,0, 0,1,0,1],
        [1,0,0,1, 0,0,1,0, 0,0,1,0, 1,0,0,0]
      ]
    }
  };

  const TRACK_META = [
    { id: 0, name: '🥁 Kick', shortName: 'Kick' },
    { id: 1, name: '⚡ Snare/Hat', shortName: 'Snare' },
    { id: 2, name: '🎸 Bassline', shortName: 'Bass' },
    { id: 3, name: '🎹 Lead/Arp', shortName: 'Lead' }
  ];

  let activeGenre = 'synthwave';
  let patternsByGenre = {};
  let trackState = [
    { mute: false, solo: false, vol: 85, tone: 'mid', fx: false },
    { mute: false, solo: false, vol: 75, tone: 'mid', fx: false },
    { mute: false, solo: false, vol: 80, tone: 'mid', fx: false },
    { mute: false, solo: false, vol: 75, tone: 'mid', fx: false }
  ];
  let trackXP = [0, 0, 0, 0];

  let previewPlaying = false;
  let previewStep = 0;
  let previewNextTime = 0;
  let previewTimer = null;
  let drawerOpen = false;
  let lastPlayheadStep = -1;

  // Supabase Auth & Cloud Sync state
  let sbClient = null;
  let currentUser = null;
  let syncTimer = null;
  let unlockedTracked = false;
  let xpPromptShown = false;

  function trackGA(eventName, extraParams) {
    try {
      const payload = Object.assign({ send_to: GA_MEASUREMENT_ID }, extraParams || {});
      if (typeof gtag === 'function') {
        gtag('event', eventName, payload);
      } else if (typeof global.gtag === 'function') {
        global.gtag('event', eventName, payload);
      }
    } catch (_) {}
  }

  function getUserStorageKey() {
    return currentUser && currentUser.id ? `keyverse_dj_state_${currentUser.id}` : null;
  }

  function applyDjState(dj) {
    if (!dj || typeof dj !== 'object') return;
    if (dj.genre && GENRES[dj.genre]) activeGenre = dj.genre;
    if (dj.patterns && typeof dj.patterns === 'object') patternsByGenre = dj.patterns;
    if (Array.isArray(dj.xp) && dj.xp.length === 4) {
      trackXP = dj.xp.map((n) => Math.max(0, Number(n) || 0));
    }
  }

  function exportDjState() {
    return {
      genre: activeGenre,
      patterns: patternsByGenre,
      xp: trackXP,
      updatedAt: new Date().toISOString()
    };
  }

  function saveUserStateAndSync() {
    if (!currentUser) return;
    const state = exportDjState();
    const uKey = getUserStorageKey();
    if (uKey) {
      try { localStorage.setItem(uKey, JSON.stringify(state)); } catch (_) {}
    }
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      if (!sbClient || !currentUser) return;
      sbClient.auth.updateUser({ data: { keyverse_dj: state } }).catch(() => {});
    }, 1200);
  }

  function hydrateForUser(user) {
    currentUser = user || null;
    if (currentUser) {
      const metaDj = currentUser.user_metadata && currentUser.user_metadata.keyverse_dj;
      if (metaDj) {
        applyDjState(metaDj);
      } else {
        const uKey = getUserStorageKey();
        if (uKey) {
          try {
            const local = localStorage.getItem(uKey);
            if (local) applyDjState(JSON.parse(local));
          } catch (_) {}
        }
      }
      if (!unlockedTracked) {
        unlockedTracked = true;
        trackGA('dj_studio_unlocked', { user_id: currentUser.id });
      }
    }
    updateAuthUI();
    renderGrid();
  }

  function initSupabaseAuth() {
    function attachClient() {
      try {
        if (!global.supabase) return;
        sbClient = global.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        sbClient.auth.getSession().then(({ data }) => {
          hydrateForUser(data && data.session ? data.session.user : null);
        }).catch(() => {});
        sbClient.auth.onAuthStateChange((_evt, session) => {
          hydrateForUser(session ? session.user : null);
        });
      } catch (_) {}
    }

    if (global.supabase) {
      attachClient();
      return;
    }
    if (document.querySelector('script[data-kv-supabase]')) return;
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    s.async = true;
    s.setAttribute('data-kv-supabase', '1');
    s.onload = attachClient;
    document.head.appendChild(s);
  }

  function loadStorage() {
    try {
      const g = localStorage.getItem(GENRE_KEY);
      if (g && GENRES[g]) activeGenre = g;
      const p = localStorage.getItem(PATTERNS_KEY);
      if (p) patternsByGenre = JSON.parse(p) || {};
      const x = localStorage.getItem(XP_KEY);
      if (x) {
        const parsed = JSON.parse(x);
        if (Array.isArray(parsed) && parsed.length === 4) {
          trackXP = parsed.map((n) => Math.max(0, Number(n) || 0));
        }
      }
    } catch (_) {}
  }

  function savePatterns() {
    if (!currentUser) return;
    try { localStorage.setItem(PATTERNS_KEY, JSON.stringify(patternsByGenre)); } catch (_) {}
    saveUserStateAndSync();
  }

  function saveXP() {
    if (!currentUser) return;
    try { localStorage.setItem(XP_KEY, JSON.stringify(trackXP)); } catch (_) {}
    saveUserStateAndSync();
  }

  function getTrackLevel(idx) {
    const xp = trackXP[idx] || 0;
    let lv = 1;
    for (let i = 1; i < XP_THRESHOLDS.length; i++) {
      if (xp >= XP_THRESHOLDS[i]) lv = i + 1;
    }
    return lv;
  }

  function getTrackLevelProgress(idx) {
    const xp = trackXP[idx] || 0;
    const lv = getTrackLevel(idx);
    if (lv >= 5) return 100;
    const curMin = XP_THRESHOLDS[lv - 1];
    const nextMin = XP_THRESHOLDS[lv];
    return Math.min(100, Math.round(((xp - curMin) / (nextMin - curMin)) * 100));
  }

  function getActivePattern() {
    if (!patternsByGenre[activeGenre]) {
      patternsByGenre[activeGenre] = GENRES[activeGenre].defaults.map((r) => r.slice());
    }
    return patternsByGenre[activeGenre];
  }

  function getStepDuration() {
    const bpm = (GENRES[activeGenre] && GENRES[activeGenre].bpm) || 120;
    return 60 / bpm / 4; // 16th note
  }

  function isTrackAudible(idx) {
    if (trackState[idx].mute) return false;
    const anySolo = trackState.some((t) => t.solo);
    if (anySolo && !trackState[idx].solo) return false;
    return true;
  }

  function triggerInstrumentSound(rowIdx, stepIdx, when, cellVal) {
    const audioApi = global.KeyverseAudio && global.KeyverseAudio._internal;
    if (!audioApi) return;
    if (audioApi.isMuted()) return;
    const audio = audioApi.ensureAudioContext();
    if (!audio) return;

    const genre = GENRES[activeGenre] || GENRES.synthwave;
    const lv = getTrackLevel(rowIdx);
    const st = trackState[rowIdx];
    const volScale = (st.vol / 100) * (cellVal === 2 ? 1.35 : 1.0);
    const toneMult = st.tone === 'high' ? 1.5 : (st.tone === 'low' ? 0.75 : 1.0);

    function tone(wave, f1, f2, dur, gainVal, cutoff, delayOffset = 0) {
      const t = when + delayOffset;
      const osc = audio.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(f1, t);
      if (f2 !== f1) osc.frequency.exponentialRampToValueAtTime(Math.max(25, f2), t + dur);

      const g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(Math.max(0.001, gainVal), t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      if (cutoff) {
        const flt = audio.createBiquadFilter();
        flt.type = 'lowpass';
        flt.frequency.setValueAtTime(cutoff, t);
        osc.connect(flt);
        flt.connect(g);
      } else {
        osc.connect(g);
      }
      g.connect(audio.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    }

    function noiseHit(dur, hpFreq, gainVal, delayOffset = 0) {
      const nb = audioApi.getNoiseBuffer();
      if (!nb) return;
      const t = when + delayOffset;
      const src = audio.createBufferSource();
      src.buffer = nb;
      const hp = audio.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(hpFreq, t);
      const g = audio.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(Math.max(0.001, gainVal), t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(hp);
      hp.connect(g);
      g.connect(audio.destination);
      src.start(t);
      src.stop(t + dur + 0.02);
    }

    if (rowIdx === 0) {
      // Kick
      const startF = (activeGenre === 'trap' ? 125 : 150) * toneMult;
      tone('sine', startF, 42, 0.16, 0.24 * volScale, null);
      if (lv >= 5) tone('triangle', startF * 1.4, 52, 0.1, 0.09 * volScale, null);
      if (st.fx && lv >= 4) tone('sine', startF, 42, 0.12, 0.08 * volScale, null, 0.18);
    } else if (rowIdx === 1) {
      // Snare / Hi-Hat
      const isSnareBeat = stepIdx % 8 === 4;
      const hp = (isSnareBeat ? 1800 : 6200) * toneMult;
      noiseHit(isSnareBeat ? 0.11 : 0.05, hp, (isSnareBeat ? 0.13 : 0.075) * volScale);
      if (isSnareBeat && lv >= 5) tone('triangle', 220 * toneMult, 120, 0.08, 0.09 * volScale, null);
      if (st.fx && lv >= 4) noiseHit(0.05, hp * 1.1, 0.04 * volScale, 0.16);
    } else if (rowIdx === 2) {
      // Bassline
      const baseF = genre.bassNotes[Math.floor(stepIdx / 4) % genre.bassNotes.length] * toneMult;
      const wave = activeGenre === 'lofi' ? 'triangle' : 'sawtooth';
      const cutoff = activeGenre === 'trap' ? 280 : 460;
      tone(wave, baseF, baseF, 0.18, 0.09 * volScale, cutoff);
      if (lv >= 5) tone('sine', baseF * 2, baseF * 2, 0.16, 0.04 * volScale, cutoff);
      if (st.fx && lv >= 4) tone(wave, baseF, baseF, 0.12, 0.04 * volScale, cutoff, 0.2);
    } else if (rowIdx === 3) {
      // Lead / Melody
      const leadF = genre.leadNotes[(stepIdx + (cellVal === 2 ? 2 : 0)) % genre.leadNotes.length] * toneMult;
      const wave = activeGenre === 'lofi' ? 'sine' : (activeGenre === 'synthwave' ? 'square' : 'sawtooth');
      const baseGain = (wave === 'square' ? 0.045 : 0.065) * volScale;
      tone(wave, leadF, leadF, 0.16, baseGain, 2200);
      if (lv >= 5) tone('sine', leadF * 1.5, leadF * 1.5, 0.16, 0.035 * volScale, 2600);
      if (st.fx && lv >= 4) tone(wave, leadF, leadF, 0.14, baseGain * 0.45, 1800, 0.19);
    }
  }

  function highlightPlayhead(stepIdx) {
    if (!drawerOpen || lastPlayheadStep === stepIdx) return;
    lastPlayheadStep = stepIdx;
    const grid = document.getElementById('kv-dj-grid');
    if (!grid) return;
    grid.querySelectorAll('.kv-dj-cell.playing').forEach((el) => el.classList.remove('playing'));
    grid.querySelectorAll(`.kv-dj-cell[data-step="${stepIdx}"]`).forEach((el) => el.classList.add('playing'));
  }

  function playGameplayStep(stepIdx, when, tier) {
    const pattern = getActivePattern();
    for (let r = 0; r < 4; r++) {
      if (tier >= r + 1 && isTrackAudible(r)) {
        const val = pattern[r][stepIdx % 16];
        if (val > 0) {
          triggerInstrumentSound(r, stepIdx % 16, when, val);
        }
      }
    }
    if (drawerOpen) {
      setTimeout(() => highlightPlayhead(stepIdx % 16), 10);
    }
  }

  function previewTick() {
    const audioApi = global.KeyverseAudio && global.KeyverseAudio._internal;
    if (!audioApi || !previewPlaying) return;
    const audio = audioApi.ensureAudioContext();
    if (!audio) return;
    const stepDur = getStepDuration();

    while (previewNextTime < audio.currentTime + 0.12) {
      const s = previewStep;
      const pattern = getActivePattern();
      for (let r = 0; r < 4; r++) {
        if (isTrackAudible(r) && pattern[r][s] > 0) {
          triggerInstrumentSound(r, s, previewNextTime, pattern[r][s]);
        }
      }
      setTimeout(() => highlightPlayhead(s), Math.max(0, (previewNextTime - audio.currentTime) * 1000));
      previewNextTime += stepDur;
      previewStep = (previewStep + 1) % 16;
    }
  }

  function togglePreview() {
    const audioApi = global.KeyverseAudio && global.KeyverseAudio._internal;
    if (!audioApi) return;
    audioApi.unlockAudio();
    const audio = audioApi.ensureAudioContext();
    if (!audio) return;

    previewPlaying = !previewPlaying;
    if (previewPlaying) {
      previewStep = 0;
      previewNextTime = audio.currentTime + 0.03;
      previewTimer = setInterval(previewTick, 40);
    } else {
      clearInterval(previewTimer);
      previewTimer = null;
      highlightPlayhead(-1);
    }
    renderGrid();
  }

  function showStudioToast(msg) {
    let t = document.getElementById('kv-dj-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'kv-dj-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  function grantShortcutXP(comboCount) {
    if (!currentUser) {
      if (comboCount >= 5 && !xpPromptShown) {
        xpPromptShown = true;
        showStudioToast('🔑 Sign in to save Instrument XP');
      }
      return;
    }

    const bonus = comboCount >= 10 ? 4 : (comboCount >= 5 ? 3 : 1);
    const activeRows = comboCount >= 10 ? [0, 1, 2, 3] : (comboCount >= 6 ? [0, 1, 2] : (comboCount >= 3 ? [0, 1] : [0]));
    const targetRow = activeRows[comboCount % activeRows.length];

    const prevLv = getTrackLevel(targetRow);
    trackXP[targetRow] += bonus;
    const newLv = getTrackLevel(targetRow);
    saveXP();

    if (newLv > prevLv) {
      showStudioToast(`⬆️ ${TRACK_META[targetRow].name} leveled up to Lv. ${newLv}!`);
    }
    if (drawerOpen) renderGrid();
  }

  function remixPattern() {
    const pat = [[], [], [], []];
    for (let s = 0; s < 16; s++) {
      pat[0].push(s % 4 === 0 ? 1 : (Math.random() < 0.18 ? 1 : 0));
      pat[1].push(s % 4 === 2 ? 1 : (Math.random() < 0.35 ? 1 : 0));
      pat[2].push(s % 2 === 0 && Math.random() < 0.55 ? 1 : (Math.random() < 0.2 ? 1 : 0));
      pat[3].push(Math.random() < 0.38 ? (getTrackLevel(3) >= 2 && Math.random() < 0.3 ? 2 : 1) : 0);
    }
    patternsByGenre[activeGenre] = pat;
    savePatterns();
    renderGrid();
  }

  function resetPattern() {
    patternsByGenre[activeGenre] = GENRES[activeGenre].defaults.map((r) => r.slice());
    savePatterns();
    renderGrid();
  }

  function injectStyles() {
    if (document.getElementById('kv-dj-studio-styles')) return;
    const st = document.createElement('style');
    st.id = 'kv-dj-studio-styles';
    st.textContent = `
      #kv-studio-open-btn {
        background: rgba(124, 157, 255, 0.14);
        border: 1px solid rgba(124, 157, 255, 0.5);
        border-radius: 999px;
        color: #cdd6f4;
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
        padding: 3px 9px;
        line-height: 1.2;
      }
      #kv-studio-open-btn:hover { border-color: #13f2b0; color: #13f2b0; }
      #kv-dj-studio-drawer {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10005;
        background: rgba(12, 16, 22, 0.97);
        border-top: 2px solid #13f2b0;
        box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.75);
        padding: 14px 18px 18px;
        display: none;
        backdrop-filter: blur(12px);
        color: #e7ecef;
        font-family: 'Inter', sans-serif;
        max-height: 82vh;
        overflow-y: auto;
      }
      #kv-dj-studio-drawer.open { display: block; }
      .kv-studio-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 12px;
        max-width: 960px;
        margin-inline: auto;
      }
      .kv-studio-controls { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
      .kv-studio-btn {
        background: #171c22;
        border: 1px solid #303a47;
        color: #e7ecef;
        border-radius: 7px;
        padding: 5px 11px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        font-family: 'JetBrains Mono', monospace;
      }
      .kv-studio-btn.primary { background: #13f2b0; color: #0b0e11; border-color: #13f2b0; }
      .kv-studio-select {
        background: #171c22;
        color: #e7ecef;
        border: 1px solid #303a47;
        border-radius: 7px;
        padding: 5px 9px;
        font-size: 0.78rem;
        font-weight: 700;
      }
      #kv-dj-grid {
        max-width: 960px;
        margin-inline: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .kv-dj-row {
        display: grid;
        grid-template-columns: 230px 1fr;
        gap: 10px;
        align-items: center;
        background: #12161b;
        border: 1px solid #262d36;
        border-radius: 10px;
        padding: 7px 10px;
      }
      @media (max-width: 780px) {
        .kv-dj-row { grid-template-columns: 1fr; }
      }
      .kv-dj-meta { display: flex; flex-direction: column; gap: 4px; }
      .kv-dj-row-head { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; font-weight: 700; }
      .kv-lv-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; padding: 1px 6px; border-radius: 999px; background: #1e252d; color: #7c9dff; }
      .kv-lv-badge.master { background: rgba(249, 226, 175, 0.18); color: #f9e2af; border: 1px solid #f9e2af; }
      .kv-xp-bar { height: 4px; background: #1d232a; border-radius: 999px; overflow: hidden; }
      .kv-xp-fill { height: 100%; background: #13f2b0; transition: width 200ms ease; }
      .kv-dj-row-btns { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
      .kv-mini-btn {
        background: #171c22;
        border: 1px solid #303a47;
        color: #9aa5af;
        border-radius: 5px;
        padding: 2px 6px;
        font-size: 0.68rem;
        font-weight: 700;
        cursor: pointer;
      }
      .kv-mini-btn.on { background: rgba(19, 242, 176, 0.16); border-color: #13f2b0; color: #13f2b0; }
      .kv-mini-btn.mute-on { background: rgba(255, 92, 119, 0.18); border-color: #ff5c77; color: #ff5c77; }
      .kv-dj-steps {
        display: grid;
        grid-template-columns: repeat(16, 1fr);
        gap: 4px;
      }
      .kv-dj-cell {
        height: 28px;
        border-radius: 5px;
        background: #1a2028;
        border: 1px solid #2b3544;
        cursor: pointer;
        transition: transform 80ms ease, background 100ms ease;
      }
      .kv-dj-cell.beat-start { border-left: 2px solid #45475a; }
      .kv-dj-cell.active { background: #13f2b0; border-color: #13f2b0; }
      .kv-dj-cell.accent { background: #f9e2af; border-color: #f9e2af; box-shadow: 0 0 8px rgba(249, 226, 175, 0.5); }
      .kv-dj-cell.playing { outline: 2px solid #ffffff; transform: scale(1.06); }
      #kv-dj-toast {
        position: fixed;
        top: 56px;
        left: 50%;
        transform: translateX(-50%) translateY(-10px);
        background: #12161b;
        border: 1.5px solid #f9e2af;
        color: #f9e2af;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 6px 14px;
        border-radius: 999px;
        opacity: 0;
        pointer-events: none;
        z-index: 10010;
        transition: all 220ms ease;
      }
      #kv-dj-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
      #kv-dj-gate-modal {
        position: fixed;
        inset: 0;
        background: rgba(11, 14, 17, 0.88);
        backdrop-filter: blur(8px);
        z-index: 10020;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 16px;
      }
      #kv-dj-gate-modal.open { display: flex; }
      .kv-gate-card {
        background: #12161b;
        border: 1.5px solid #13f2b0;
        border-radius: 16px;
        padding: 26px 22px;
        max-width: 420px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
      }
      .kv-gate-card h3 {
        font-family: 'JetBrains Mono', monospace;
        color: #13f2b0;
        font-size: 1.2rem;
        margin-bottom: 10px;
      }
      .kv-gate-card p {
        color: #9aa5af;
        font-size: 0.9rem;
        line-height: 1.55;
        margin-bottom: 18px;
      }
      .kv-gate-actions { display: flex; flex-direction: column; gap: 10px; }
      .kv-gate-login {
        display: inline-block;
        background: #13f2b0;
        color: #0b0e11;
        font-family: 'JetBrains Mono', monospace;
        font-weight: 800;
        font-size: 0.92rem;
        padding: 12px 18px;
        border-radius: 10px;
        text-decoration: none;
      }
      .kv-user-badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.75rem;
        color: #9aa5af;
        background: #171c22;
        border: 1px solid #262d36;
        border-radius: 999px;
        padding: 3px 10px;
      }
    `;
    document.head.appendChild(st);
  }

  function renderGrid() {
    const drawer = document.getElementById('kv-dj-studio-drawer');
    if (!drawer) return;

    const genreSelect = document.getElementById('kv-studio-genre');
    if (genreSelect) genreSelect.value = activeGenre;
    const playBtn = document.getElementById('kv-studio-play');
    if (playBtn) playBtn.textContent = previewPlaying ? '⏹ Stop' : '▶ Play';

    const grid = document.getElementById('kv-dj-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const pattern = getActivePattern();
    TRACK_META.forEach((tm, r) => {
      const lv = getTrackLevel(r);
      const pct = getTrackLevelProgress(r);
      const st = trackState[r];

      const rowEl = document.createElement('div');
      rowEl.className = 'kv-dj-row';

      const metaEl = document.createElement('div');
      metaEl.className = 'kv-dj-meta';
      metaEl.innerHTML = `
        <div class="kv-dj-row-head">
          <span>${tm.name}</span>
          <span class="kv-lv-badge ${lv >= 5 ? 'master' : ''}">${lv >= 5 ? '★ Lv.5 MASTER' : 'Lv.' + lv}</span>
        </div>
        <div class="kv-xp-bar"><div class="kv-xp-fill" style="width:${pct}%"></div></div>
      `;

      const btnsEl = document.createElement('div');
      btnsEl.className = 'kv-dj-row-btns';

      const mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.className = `kv-mini-btn ${st.mute ? 'mute-on' : ''}`;
      mBtn.textContent = 'M';
      mBtn.title = 'Mute';
      mBtn.onclick = () => { st.mute = !st.mute; renderGrid(); };

      const sBtn = document.createElement('button');
      sBtn.type = 'button';
      sBtn.className = `kv-mini-btn ${st.solo ? 'on' : ''}`;
      sBtn.textContent = 'S';
      sBtn.title = 'Solo';
      sBtn.onclick = () => { st.solo = !st.solo; renderGrid(); };

      const volEl = document.createElement('input');
      volEl.type = 'range';
      volEl.min = '0';
      volEl.max = '100';
      volEl.value = String(st.vol);
      volEl.style.width = '48px';
      volEl.title = 'Track Volume';
      volEl.oninput = () => { st.vol = parseInt(volEl.value, 10) || 0; };

      const toneBtn = document.createElement('button');
      toneBtn.type = 'button';
      toneBtn.className = 'kv-mini-btn';
      toneBtn.textContent = lv >= 3 ? `Tone:${st.tone}` : '🔒Lv3';
      toneBtn.disabled = lv < 3;
      toneBtn.onclick = () => {
        const order = ['low', 'mid', 'high'];
        st.tone = order[(order.indexOf(st.tone) + 1) % order.length];
        renderGrid();
      };

      const fxBtn = document.createElement('button');
      fxBtn.type = 'button';
      fxBtn.className = `kv-mini-btn ${st.fx ? 'on' : ''}`;
      fxBtn.textContent = lv >= 4 ? 'FX' : '🔒Lv4';
      fxBtn.disabled = lv < 4;
      fxBtn.onclick = () => { st.fx = !st.fx; renderGrid(); };

      btnsEl.append(mBtn, sBtn, volEl, toneBtn, fxBtn);
      metaEl.appendChild(btnsEl);

      const stepsEl = document.createElement('div');
      stepsEl.className = 'kv-dj-steps';
      for (let s = 0; s < 16; s++) {
        const val = pattern[r][s];
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = `kv-dj-cell ${s % 4 === 0 ? 'beat-start' : ''} ${val === 1 ? 'active' : (val === 2 ? 'accent' : '')}`;
        cell.dataset.step = String(s);
        cell.title = `Step ${s + 1} (Lv.2+ unlocks Accent)`;
        cell.onclick = (e) => {
          if (e.shiftKey && lv >= 2) {
            pattern[r][s] = pattern[r][s] === 2 ? 0 : 2;
          } else if (lv >= 2) {
            pattern[r][s] = (pattern[r][s] + 1) % 3;
          } else {
            pattern[r][s] = pattern[r][s] ? 0 : 1;
          }
          savePatterns();
          renderGrid();
        };
        stepsEl.appendChild(cell);
      }

      rowEl.append(metaEl, stepsEl);
      grid.appendChild(rowEl);
    });
  }

  function updateAuthUI() {
    const openBtn = document.getElementById('kv-studio-open-btn');
    if (openBtn) {
      openBtn.textContent = currentUser ? '🎛️ DJ Studio' : '🔒 DJ Studio (Login)';
    }
    const userBadge = document.getElementById('kv-studio-user-badge');
    if (userBadge) {
      if (currentUser) {
        const label = currentUser.email || (currentUser.user_metadata && currentUser.user_metadata.nickname) || 'Signed In';
        userBadge.innerHTML = `<span>👤 ${label}</span><button type="button" id="kv-studio-signout" style="background:none;border:none;color:#f38ba8;cursor:pointer;font-weight:700;font-size:0.74rem;">Sign Out</button>`;
        const so = document.getElementById('kv-studio-signout');
        if (so) {
          so.onclick = async () => {
            if (sbClient) await sbClient.auth.signOut().catch(() => {});
            currentUser = null;
            if (drawerOpen) toggleDrawer();
            updateAuthUI();
          };
        }
      } else {
        userBadge.innerHTML = '';
      }
    }
  }

  function openGateModal() {
    const modal = document.getElementById('kv-dj-gate-modal');
    if (!modal) return;
    const pauseBtn = document.getElementById('btn-pause');
    if (pauseBtn && pauseBtn.textContent.includes('Pause')) pauseBtn.click();

    const loginLink = document.getElementById('kv-gate-login-link');
    if (loginLink) {
      const redir = window.location.pathname + window.location.search;
      loginLink.href = `/login.html?redirect=${encodeURIComponent(redir)}`;
    }
    modal.classList.add('open');
    trackGA('dj_studio_login_prompt', { page: window.location.pathname });
  }

  function toggleDrawer() {
    if (!currentUser) {
      openGateModal();
      return;
    }

    const drawer = document.getElementById('kv-dj-studio-drawer');
    if (!drawer) return;
    drawerOpen = !drawerOpen;
    drawer.classList.toggle('open', drawerOpen);

    // Auto-pause active Desktop Meltdown round if opened mid-game
    if (drawerOpen) {
      const pauseBtn = document.getElementById('btn-pause');
      if (pauseBtn && pauseBtn.textContent.includes('Pause')) {
        pauseBtn.click();
      }
      renderGrid();
    } else if (previewPlaying) {
      togglePreview();
    }
  }

  function injectStudioUI() {
    if (document.getElementById('kv-dj-studio-drawer') || !document.body) return;
    injectStyles();

    const bar = document.getElementById('kv-audio-bar');
    if (bar && !document.getElementById('kv-studio-open-btn')) {
      const btn = document.createElement('button');
      btn.id = 'kv-studio-open-btn';
      btn.type = 'button';
      btn.textContent = currentUser ? '🎛️ DJ Studio' : '🔒 DJ Studio (Login)';
      btn.onclick = toggleDrawer;
      bar.insertBefore(btn, bar.lastChild);
    }

    const gate = document.createElement('div');
    gate.id = 'kv-dj-gate-modal';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.innerHTML = `
      <div class="kv-gate-card">
        <h3>🎛️ Unlock Shortcut DJ Studio</h3>
        <p>Create a free account &amp; sign in to unlock Shortcut DJ Studio, choose music genres, build custom 16-step beats, and level up your instruments across devices.</p>
        <div class="kv-gate-actions">
          <a id="kv-gate-login-link" class="kv-gate-login" href="/login.html">🔑 Sign In / Create Account</a>
          <button type="button" id="kv-gate-close" class="kv-studio-btn">Maybe Later</button>
        </div>
      </div>
    `;
    document.body.appendChild(gate);
    document.getElementById('kv-gate-close').onclick = () => gate.classList.remove('open');
    gate.addEventListener('click', (e) => { if (e.target === gate) gate.classList.remove('open'); });

    const drawer = document.createElement('section');
    drawer.id = 'kv-dj-studio-drawer';
    drawer.setAttribute('aria-label', 'Shortcut DJ Studio');
    drawer.innerHTML = `
      <div class="kv-studio-top">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <span style="font-family:'JetBrains Mono',monospace;font-weight:800;font-size:0.95rem;color:#13f2b0;">🎛️ Shortcut DJ Studio</span>
          <span id="kv-studio-user-badge" class="kv-user-badge"></span>
        </div>
        <div class="kv-studio-controls">
          <select id="kv-studio-genre" class="kv-studio-select" aria-label="Music Genre"></select>
          <button type="button" id="kv-studio-play" class="kv-studio-btn primary">▶ Play</button>
          <button type="button" id="kv-studio-remix" class="kv-studio-btn">🎲 Remix</button>
          <button type="button" id="kv-studio-reset" class="kv-studio-btn">↺ Reset</button>
          <button type="button" id="kv-studio-close" class="kv-studio-btn">✕ Close</button>
        </div>
      </div>
      <div id="kv-dj-grid"></div>
    `;
    document.body.appendChild(drawer);

    const sel = document.getElementById('kv-studio-genre');
    Object.values(GENRES).forEach((g) => {
      const opt = document.createElement('option');
      opt.value = g.id;
      opt.textContent = `${g.label} (${g.bpm} BPM)`;
      sel.appendChild(opt);
    });
    sel.value = activeGenre;
    sel.onchange = () => {
      activeGenre = sel.value;
      try { localStorage.setItem(GENRE_KEY, activeGenre); } catch (_) {}
      saveUserStateAndSync();
      renderGrid();
    };

    document.getElementById('kv-studio-play').onclick = togglePreview;
    document.getElementById('kv-studio-remix').onclick = remixPattern;
    document.getElementById('kv-studio-reset').onclick = resetPattern;
    document.getElementById('kv-studio-close').onclick = toggleDrawer;
    updateAuthUI();
    renderGrid();
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('open_dj') === '1') {
        setTimeout(() => { toggleDrawer(); }, 180);
      }
    } catch (_) {}
  }

  loadStorage();
  initSupabaseAuth();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStudioUI);
  } else {
    injectStudioUI();
  }

  global.KeyverseDJStudio = {
    isReady: () => true,
    getStepDuration,
    playGameplayStep,
    grantShortcutXP,
    toggleDrawer,
    setGenre: function (g) {
      if (!GENRES[g]) return;
      activeGenre = g;
      try { localStorage.setItem(GENRE_KEY, g); } catch (_) {}
      renderGrid();
    },
    getGenre: () => activeGenre
  };
})(window);
