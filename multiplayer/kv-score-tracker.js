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
    return `${baseUrl}${separator}utm_source=viral_share&utm_medium=challenge_btn&utm_campaign=score_challenge&challenge_score=${encodeURIComponent(score)}`;
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

  function checkUrlForChallenge() {
    try {
      const params = new URLSearchParams(window.location.search);
      const score = params.get('challenge_score');
      if (score) {
        renderChallengeBanner(score);
      }
    } catch (_) {}
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
