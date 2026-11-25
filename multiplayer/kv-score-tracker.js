// Keyverse score-tracking and viral challenge engine.
//
// Included by every game HTML file (via a <script> tag right before
// </body>). Records time/attempts/correct/incorrect per board attempt to
// the backend, handles scoring, provides the viral "⚔️ Challenge a Friend"
// share button flow, and renders the Friend Challenge top banner.

(function () {
  const KEYVERSE_API = 'https://keyverse-api.onrender.com';
  const GA_MEASUREMENT_ID = 'G-HPCMTG7133';

  function getLocalPlayer() {
    try {
      const raw = localStorage.getItem('kv_player');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  let current = null; // { gameSlug, boardId, startedAt, attempts, correct, incorrect }
  let lastScore = 1000;
  let lastAccuracy = 100;
  let sessionScore = 0;

  // Ghost DNA state
  let ghostRun = { startedAt: null, steps: [] };
  let activeGhost = null; // decoded { n, s, p, t }
  let ghostReplayStarted = false;
  let ghostReplayStartedAt = null;
  let ghostTimers = [];
  let ghostCompletedCount = 0;
  let playerGhostCount = 0;
  let ghostVerdictShown = false;

  function encodeGhostDNA(dna) {
    try {
      const json = JSON.stringify(dna);
      const b64 = btoa(unescape(encodeURIComponent(json)));
      return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    } catch (_) {
      return '';
    }
  }

  function decodeGhostDNA(raw) {
    try {
      let b64 = (raw || '').replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const json = decodeURIComponent(escape(atob(b64)));
      const parsed = JSON.parse(json);
      if (!parsed || !Array.isArray(parsed.t) || parsed.t.length === 0) return null;
      return {
        n: String(parsed.n || 'Friend').slice(0, 20),
        s: Number(parsed.s) || 1000,
        p: String(parsed.p || 'cyber'),
        t: parsed.t.map((x) => Math.max(0, Number(x) || 0)).slice(0, 60)
      };
    } catch (_) {
      return null;
    }
  }

  function getActiveGhostPayload() {
    const player = getLocalPlayer();
    const callsign = (player && player.nickname) ? player.nickname : 'Player';
    const pack = (window.KeyverseAudio && window.KeyverseAudio.getPack) ? window.KeyverseAudio.getPack() : 'cyber';
    const steps = ghostRun.steps.length > 0 ? ghostRun.steps : [750, 1450, 2200, 3050, 3800];
    return encodeGhostDNA({
      n: callsign,
      s: getPlayerScore(),
      p: pack,
      t: steps
    });
  }

  function calculateBoardScore(payload) {
    const accuracy = payload.attempts > 0 ? (payload.correct / payload.attempts) : 1;
    const basePoints = Math.max(1, payload.correct || 5) * 200;
    const speedBonus = Math.max(0, Math.round((45 - payload.elapsedSeconds) * 15));
    const accuracyBonus = Math.round(accuracy * 400);
    return {
      score: Math.max(100, basePoints + speedBonus + accuracyBonus),
      accuracy: Math.round(accuracy * 100)
    };
  }

  function getPlayerScore() {
    const el = document.getElementById('kv-int-score');
    if (el && el.innerText) {
      const num = parseInt(el.innerText.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(num) && num > 0) return num;
    }
    return lastScore || 1000;
  }

  function getGameTitle() {
    const titleCandidates = [
      document.querySelector('#level-screen .title'),
      document.querySelector('#study-title'),
      document.querySelector('#game-title'),
      document.querySelector('h1'),
      document.querySelector('.title')
    ];
    for (const el of titleCandidates) {
      if (el && el.innerText && el.innerText.trim() && el.innerText.trim() !== 'Level') {
        return el.innerText.trim();
      }
    }
    if (document.title) {
      const clean = document.title.split('—')[0].split('|')[0].trim();
      if (clean) return clean;
    }
    return 'Keyverse Mac Shortcuts';
  }

  function constructChallengeUrl(score) {
    let baseUrl;
    if (window.location.protocol.startsWith('http')) {
      baseUrl = window.location.href.split('#')[0].split('?')[0];
    } else {
      const pathParts = window.location.pathname.split('/');
      const lastTwo = pathParts.slice(-2).join('/');
      baseUrl = 'https://keyversegames.com/' + (lastTwo || '');
    }

    const separator = baseUrl.includes('?') ? '&' : '?';
    const ghostParam = getActiveGhostPayload();
    const ghostSuffix = ghostParam ? `&ghost=${encodeURIComponent(ghostParam)}` : '';
    return `${baseUrl}${separator}utm_source=viral_share&utm_medium=challenge_btn&utm_campaign=score_challenge&challenge_score=${encodeURIComponent(score)}${ghostSuffix}`;
  }

  function triggerGaEvent(gameTitle, score) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'viral_share_click', {
          event_category: 'viral_share',
          event_label: gameTitle,
          score: score,
          game_title: gameTitle,
          value: score,
          send_to: GA_MEASUREMENT_ID
        });
      }
    } catch (e) {
      console.warn('[Keyverse] Google Analytics event tracking warning:', e);
    }
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}

    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function showToast(message) {
    let toast = document.getElementById('kv-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'kv-toast';
      toast.className = 'kv-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('kv-toast-show');
    clearTimeout(window._kvToastTimer);
    window._kvToastTimer = setTimeout(() => {
      toast.classList.remove('kv-toast-show');
    }, 3200);
  }

  async function handleChallengeShare() {
    const score = getPlayerScore();
    const gameTitle = getGameTitle();
    const challengeUrl = constructChallengeUrl(score);

    // Track analytics event
    triggerGaEvent(gameTitle, score);

    const shareData = {
      title: `⚔️ Challenge: Beat my score of ${score.toLocaleString()} on ${gameTitle}!`,
      text: `I just scored ${score.toLocaleString()} points on ${gameTitle} at Keyverse! Think you can beat me? Take the challenge:`,
      url: challengeUrl
    };

    let shared = false;
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        shared = true;
      } catch (err) {
        if (err && err.name === 'AbortError') {
          return; // User cancelled share sheet
        }
      }
    }

    if (!shared) {
      const copied = await copyToClipboard(challengeUrl);
      if (copied) {
        showToast('⚔️ Challenge link copied to clipboard! Share it with a friend.');
      } else {
        prompt('Copy your challenge link below:', challengeUrl);
      }
    }
  }

  function updateScoreUI(score, acc) {
    const scoreEl = document.getElementById('kv-int-score');
    if (scoreEl) scoreEl.textContent = score.toLocaleString();
    const accEl = document.getElementById('kv-int-acc');
    if (accEl) accEl.textContent = (acc != null ? acc : 100) + '%';
  }

  function injectViralStyles() {
    if (document.getElementById('kv-viral-styles')) return;
    const style = document.createElement('style');
    style.id = 'kv-viral-styles';
    style.textContent = `
      .kv-challenge-banner {
        position: sticky;
        top: 0;
        left: 0;
        right: 0;
        z-index: 99999;
        background: linear-gradient(135deg, #181825, #252538);
        border-bottom: 2px solid #a6e3a1;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
        color: #cdd6f4;
        padding: 11px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 0.92rem;
        box-sizing: border-box;
        animation: kvBannerSlideDown 0.35s ease-out;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      @keyframes kvBannerSlideDown {
        from { transform: translateY(-100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .kv-cb-content {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        justify-content: center;
        font-weight: 600;
        letter-spacing: 0.3px;
      }
      .kv-cb-icon {
        font-size: 1.15rem;
      }
      .kv-cb-text strong {
        color: #f9e2af;
        font-size: 1.05rem;
        font-weight: 800;
        text-shadow: 0 0 12px rgba(249, 226, 175, 0.4);
      }
      .kv-cb-close {
        background: transparent;
        border: none;
        color: #a6adc8;
        font-size: 1.4rem;
        cursor: pointer;
        padding: 0 6px;
        line-height: 1;
        border-radius: 4px;
        transition: color 0.15s, transform 0.15s;
      }
      .kv-cb-close:hover {
        color: #f38ba8;
        transform: scale(1.15);
      }
      .kv-toast {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: #181825;
        color: #a6e3a1;
        border: 1.5px solid #a6e3a1;
        border-radius: 10px;
        padding: 12px 22px;
        font-size: 0.92rem;
        font-weight: 700;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        z-index: 100000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
        opacity: 0;
        pointer-events: none;
        transition: transform 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.3s ease;
        max-width: 90vw;
        text-align: center;
      }
      .kv-toast-show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      .kv-challenge-btn {
        background: linear-gradient(135deg, #cba6f7, #f5c2e7) !important;
        color: #11111b !important;
        font-size: 0.95rem !important;
        font-weight: 800 !important;
        letter-spacing: 0.5px !important;
        border: none !important;
        border-radius: 10px !important;
        padding: 12px 20px !important;
        cursor: pointer !important;
        width: 100% !important;
        box-sizing: border-box !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        box-shadow: 0 4px 15px rgba(203, 166, 247, 0.35) !important;
        transition: transform 0.15s ease, box-shadow 0.15s ease !important;
        margin-bottom: 10px !important;
      }
      .kv-challenge-btn:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 20px rgba(203, 166, 247, 0.5) !important;
      }
      .kv-challenge-btn:active {
        transform: translateY(0) !important;
      }
      .kv-ghost-hud {
        background: rgba(18, 22, 27, 0.94);
        border: 1px solid rgba(124, 157, 255, 0.45);
        border-radius: 12px;
        padding: 10px 14px;
        margin-bottom: 12px;
        text-align: left;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
      }
      .kv-ghost-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.82rem;
        font-weight: 800;
        color: #cdd6f4;
        margin-bottom: 8px;
      }
      .kv-ghost-track {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 5px;
        font-size: 0.74rem;
        font-family: 'JetBrains Mono', monospace;
        color: #a6adc8;
      }
      .kv-ghost-bar-bg {
        flex: 1;
        height: 8px;
        background: #181825;
        border-radius: 999px;
        overflow: hidden;
        border: 1px solid #313244;
      }
      .kv-ghost-bar-you {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #13f2b0, #a6e3a1);
        transition: width 180ms ease;
      }
      .kv-ghost-bar-rival {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #7c9dff, #cba6f7);
        transition: width 180ms ease;
      }
      @keyframes kvGhostFloat {
        0% { opacity: 0; transform: translate(-50%, 4px) scale(0.9); }
        25% { opacity: 0.92; transform: translate(-50%, -8px) scale(1.05); }
        100% { opacity: 0; transform: translate(-50%, -36px) scale(1); }
      }
      .kv-ghost-pulse-pop {
        position: fixed;
        pointer-events: none;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.82rem;
        font-weight: 800;
        color: #7c9dff;
        background: rgba(18, 22, 27, 0.86);
        border: 1px solid rgba(124, 157, 255, 0.65);
        border-radius: 999px;
        padding: 3px 9px;
        z-index: 10001;
        animation: kvGhostFloat 720ms ease-out forwards;
      }
      .kv-ghost-verdict {
        background: rgba(124, 157, 255, 0.12);
        border: 1px solid rgba(124, 157, 255, 0.45);
        border-radius: 10px;
        padding: 10px 12px;
        margin-bottom: 12px;
        font-size: 0.88rem;
        font-weight: 800;
        color: #cdd6f4;
      }
      .kv-ghost-verdict.win {
        background: rgba(19, 242, 176, 0.12);
        border-color: #13f2b0;
        color: #13f2b0;
      }
    `;
    document.head.appendChild(style);
  }

  function renderChallengeBanner(scoreText) {
    if (document.getElementById('kv-challenge-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'kv-challenge-banner';
    banner.className = 'kv-challenge-banner';
    banner.setAttribute('role', 'status');
    banner.setAttribute('aria-live', 'polite');

    const cleanScore = (scoreText || '').replace(/[^-a-zA-Z0-9,.]/g, '') || scoreText;

    banner.innerHTML = `
      <div class="kv-cb-content">
        <span class="kv-cb-icon">🎯</span>
        <span class="kv-cb-text">Friend Challenge Active: Beat a score of <strong>${cleanScore}</strong>!</span>
      </div>
      <button class="kv-cb-close" type="button" aria-label="Dismiss banner" title="Dismiss">&times;</button>
    `;

    document.body.insertBefore(banner, document.body.firstChild);

    const closeBtn = banner.querySelector('.kv-cb-close');
    if (closeBtn) {
      closeBtn.onclick = () => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => banner.remove(), 250);
      };
    }
  }

  let challengeOpenedTracked = false;

  function checkUrlForChallenge() {
    try {
      const params = new URLSearchParams(window.location.search);
      const score = params.get('challenge_score');
      const ghostRaw = params.get('ghost');
      if (ghostRaw) {
        activeGhost = decodeGhostDNA(ghostRaw);
      }
      if (score) {
        renderChallengeBanner(score);
        if (!challengeOpenedTracked) {
          challengeOpenedTracked = true;
          if (typeof gtag === 'function') {
            gtag('event', 'challenge_link_opened', {
              challenge_target_score: Number(score),
              send_to: GA_MEASUREMENT_ID
            });
          } else if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', 'challenge_link_opened', {
              challenge_target_score: Number(score),
              send_to: GA_MEASUREMENT_ID
            });
          }
        }
      }
      if (activeGhost) {
        renderGhostHud();
      }
    } catch (_) {}
  }

  function renderGhostHud() {
    if (!activeGhost || document.getElementById('kv-ghost-hud')) return;
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) return;

    const hud = document.createElement('div');
    hud.id = 'kv-ghost-hud';
    hud.className = 'kv-ghost-hud';
    const total = activeGhost.t.length;
    hud.innerHTML = `
      <div class="kv-ghost-head">
        <span>👻 Racing ${activeGhost.n}'s Ghost</span>
        <span style="color:#f9e2af;">${activeGhost.s.toLocaleString()} pts</span>
      </div>
      <div class="kv-ghost-track">
        <span style="width:42px;color:#13f2b0;">YOU</span>
        <div class="kv-ghost-bar-bg"><div class="kv-ghost-bar-you" id="kv-ghost-you-bar"></div></div>
        <span id="kv-ghost-you-cnt" style="width:42px;text-align:right;">0/${total}</span>
      </div>
      <div class="kv-ghost-track">
        <span style="width:42px;color:#7c9dff;">GHOST</span>
        <div class="kv-ghost-bar-bg"><div class="kv-ghost-bar-rival" id="kv-ghost-rival-bar"></div></div>
        <span id="kv-ghost-rival-cnt" style="width:42px;text-align:right;">0/${total}</span>
      </div>
    `;
    gameScreen.insertBefore(hud, gameScreen.firstChild);
  }

  function updateGhostBars() {
    if (!activeGhost) return;
    const total = Math.max(1, activeGhost.t.length);
    const youBar = document.getElementById('kv-ghost-you-bar');
    const youCnt = document.getElementById('kv-ghost-you-cnt');
    const rivBar = document.getElementById('kv-ghost-rival-bar');
    const rivCnt = document.getElementById('kv-ghost-rival-cnt');

    if (youBar) youBar.style.width = `${Math.min(100, Math.round((playerGhostCount / total) * 100))}%`;
    if (youCnt) youCnt.textContent = `${Math.min(playerGhostCount, total)}/${total}`;
    if (rivBar) rivBar.style.width = `${Math.min(100, Math.round((ghostCompletedCount / total) * 100))}%`;
    if (rivCnt) rivCnt.textContent = `${Math.min(ghostCompletedCount, total)}/${total}`;
  }

  function spawnGhostPulse(idx) {
    const card = document.querySelector('.card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const pop = document.createElement('div');
    pop.className = 'kv-ghost-pulse-pop';
    pop.textContent = idx >= 4 ? `👻 🔥 +1` : `👻 +1`;
    pop.style.left = `${rect.left + rect.width * 0.78}px`;
    pop.style.top = `${Math.max(48, rect.top + 36)}px`;
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), 750);
  }

  function startGhostReplay() {
    if (!activeGhost || ghostReplayStarted) return;
    ghostReplayStarted = true;
    ghostReplayStartedAt = performance.now();
    ghostCompletedCount = 0;
    ghostTimers.forEach(clearTimeout);
    ghostTimers = [];

    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'ghost_race_started', {
          ghost_author: activeGhost.n,
          ghost_steps: activeGhost.t.length,
          send_to: GA_MEASUREMENT_ID
        });
      }
    } catch (_) {}

    activeGhost.t.forEach((ms, idx) => {
      const tid = setTimeout(() => {
        ghostCompletedCount = idx + 1;
        updateGhostBars();
        spawnGhostPulse(idx);
      }, Math.max(50, ms));
      ghostTimers.push(tid);
    });
  }

  function showGhostVerdict(playerTimeMs) {
    if (!activeGhost || ghostVerdictShown) return;
    ghostVerdictShown = true;
    const ghostTotalMs = activeGhost.t[activeGhost.t.length - 1] || 1000;
    const diffSec = Math.abs((ghostTotalMs - playerTimeMs) / 1000).toFixed(1);
    const won = playerTimeMs <= ghostTotalMs;

    if (won) {
      try {
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'ghost_race_won', {
            ghost_author: activeGhost.n,
            time_diff_sec: Number(diffSec),
            send_to: GA_MEASUREMENT_ID
          });
        }
      } catch (_) {}
    }

    const interstitial = document.getElementById('kv-interstitial');
    if (!interstitial) return;
    const card = interstitial.querySelector('div');
    if (!card) return;

    let verdictEl = document.getElementById('kv-ghost-verdict');
    if (!verdictEl) {
      verdictEl = document.createElement('div');
      verdictEl.id = 'kv-ghost-verdict';
      const challengeBtn = document.getElementById('kv-challenge-btn');
      if (challengeBtn) {
        card.insertBefore(verdictEl, challengeBtn);
      } else {
        card.appendChild(verdictEl);
      }
    }
    verdictEl.className = won ? 'kv-ghost-verdict win' : 'kv-ghost-verdict';
    verdictEl.textContent = won
      ? `👻 GHOST DEFEATED by ${diffSec}s!`
      : `👻 GHOST ESCAPED by ${diffSec}s — Rematch?`;

    const challengeBtn = document.getElementById('kv-challenge-btn');
    if (challengeBtn) {
      challengeBtn.innerText = '⚔️ Send Your Ghost DNA Back';
    }
  }

  function setupInterstitialViralElements() {
    const interstitial = document.getElementById('kv-interstitial');
    if (!interstitial) return;

    const card = interstitial.querySelector('div');
    if (!card) return;

    // Check if score box exists, otherwise insert it before the next button
    let scoreBox = document.getElementById('kv-int-score-box');
    const nextBtn = document.getElementById('kv-int-next');

    if (!scoreBox) {
      scoreBox = document.createElement('div');
      scoreBox.id = 'kv-int-score-box';
      scoreBox.style.cssText = 'background:#181825;border:1px solid #45475a;border-radius:10px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-around;align-items:center;';
      scoreBox.innerHTML = `
        <div>
          <div style="font-size:0.7rem;color:#a6adc8;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Your Score</div>
          <div id="kv-int-score" style="font-size:1.5rem;font-weight:900;color:#f9e2af;margin-top:2px;">${lastScore.toLocaleString()}</div>
        </div>
        <div style="width:1px;height:30px;background:#313244;"></div>
        <div>
          <div style="font-size:0.7rem;color:#a6adc8;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;">Accuracy</div>
          <div id="kv-int-acc" style="font-size:1.5rem;font-weight:900;color:#a6e3a1;margin-top:2px;">${lastAccuracy}%</div>
        </div>
      `;
      if (nextBtn) {
        card.insertBefore(scoreBox, nextBtn);
      } else {
        card.appendChild(scoreBox);
      }
    }

    // Check if challenge button exists, otherwise insert it before next button
    let challengeBtn = document.getElementById('kv-challenge-btn');
    if (!challengeBtn) {
      challengeBtn = document.createElement('button');
      challengeBtn.id = 'kv-challenge-btn';
      challengeBtn.className = 'kv-challenge-btn';
      challengeBtn.type = 'button';
      challengeBtn.innerText = '⚔️ Challenge a Friend';
      if (nextBtn) {
        card.insertBefore(challengeBtn, nextBtn);
      } else {
        card.appendChild(challengeBtn);
      }
    }

    // Attach handler cleanly
    challengeBtn.onclick = handleChallengeShare;
  }

  const KVScoreTracker = {
    /**
     * Call when a player enters Test Mode for a board (the actual "graded"
     * mode, as opposed to un-scored Practice Mode).
     * @param {string} gameSlug - e.g. 'v1g1-first-steps'
     * @param {number} boardIdOneIndexed - the board/level number as shown to
     *   the user (1, 2, 3…), matching what the leaderboard displays.
     */
    startBoard(gameSlug, boardIdOneIndexed) {
      current = {
        gameSlug,
        boardId: boardIdOneIndexed,
        startedAt: performance.now(),
        attempts: 0,
        correct: 0,
        incorrect: 0,
      };
    },

    /**
     * Call once per real answer submission while in Test Mode (win or
     * lose). Do NOT call this for practice-mode answers, order-modal
     * re-prompts, or automatic re-asks that aren't a fresh answer.
     * @param {boolean} wasCorrect
     */
    recordAnswer(wasCorrect) {
      if (!current) return;
      current.attempts++;
      if (wasCorrect) current.correct++;
      else current.incorrect++;
    },

    /**
     * Call the moment a board is fully cleared (testQueue empty, right
     * before the level-up screen shows). Submits the attempt to the
     * backend if a player is active for this browser; no-ops otherwise.
     */
    finishBoard() {
      if (!current) {
        // Fallback score if finishBoard called outside test mode
        updateScoreUI(lastScore, lastAccuracy);
        return;
      }

      const elapsedSeconds = (performance.now() - current.startedAt) / 1000;
      const player = getLocalPlayer();
      const payload = { ...current, elapsedSeconds };
      current = null; // clear immediately so a rapid re-entry doesn't double-submit

      // Calculate score and accuracy for viral challenge flow
      const calc = calculateBoardScore(payload);
      lastScore = calc.score;
      lastAccuracy = calc.accuracy;
      sessionScore += lastScore;
      updateScoreUI(lastScore, lastAccuracy);
      this.finishGhostRun();

      if (!player || !player.id) return; // standalone play, nothing to report to

      fetch(`${KEYVERSE_API}/api/score-attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: player.id,
          game_slug: payload.gameSlug,
          board_id: payload.boardId,
          time_seconds: Math.round(payload.elapsedSeconds * 100) / 100,
          attempts: payload.attempts,
          correct_count: payload.correct,
          incorrect_count: payload.incorrect,
        }),
      }).catch(() => {
        // Best-effort only — a dropped score submission should never
        // interrupt or break the actual game experience.
      });
    },

    /** Call if the player exits Test Mode early without finishing. */
    cancelBoard() {
      current = null;
    },

    /** Return the most recent score achieved. */
    getLastScore() {
      return getPlayerScore();
    },

    /** Record a shortcut hit timestamp for Ghost DNA replay & racing. */
    recordGhostStep(wasCorrect) {
      if (!ghostRun.startedAt) {
        ghostRun.startedAt = performance.now();
      }
      if (activeGhost && !ghostReplayStarted) {
        startGhostReplay();
      }
      if (wasCorrect) {
        const elapsed = Math.round(performance.now() - ghostRun.startedAt);
        ghostRun.steps.push(elapsed);
        playerGhostCount++;
        updateGhostBars();
      }
    },

    /** Finalize Ghost DNA race when a level/round completes. */
    finishGhostRun() {
      const elapsedMs = ghostReplayStartedAt ? (performance.now() - ghostReplayStartedAt) : (ghostRun.startedAt ? (performance.now() - ghostRun.startedAt) : 1000);
      if (activeGhost) {
        showGhostVerdict(elapsedMs);
      }
    },

    /** Programmatically trigger the challenge share dialog. */
    challengeFriend() {
      handleChallengeShare();
    }
  };

  window.KVScoreTracker = KVScoreTracker;

  // Initialize styling, banner detection, and button wiring
  function init() {
    injectViralStyles();
    checkUrlForChallenge();
    setupInterstitialViralElements();

    // Re-verify elements if DOM changes or modal is triggered
    const existingChallengeBtn = document.getElementById('kv-challenge-btn');
    if (existingChallengeBtn) {
      existingChallengeBtn.onclick = handleChallengeShare;
    }

    // Start Ghost replay on the player's very first keypress in #game-screen
    window.addEventListener('keydown', () => {
      const gs = document.getElementById('game-screen');
      if (!gs || gs.style.display !== 'block') return;
      if (!ghostRun.startedAt) ghostRun.startedAt = performance.now();
      if (activeGhost && !ghostReplayStarted) startGhostReplay();
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also hook into window load to ensure everything is wired even if scripts load in different orders
  window.addEventListener('load', () => {
    setupInterstitialViralElements();
    const btn = document.getElementById('kv-challenge-btn');
    if (btn) btn.onclick = handleChallengeShare;
  });
})();
