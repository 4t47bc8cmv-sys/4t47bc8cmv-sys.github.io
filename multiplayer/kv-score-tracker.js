// Keyverse score-tracking hook.
//
// Included by every game HTML file (via a <script> tag right before
// </body>). Records time/attempts/correct/incorrect per board attempt to
// the backend, for both account holders and anonymous guests who joined via
// a split-screen invite. Silently does nothing if no player is active for
// this browser (i.e. someone playing standalone, not via an invite) — the
// existing single-player game experience is completely unaffected either
// way.
//
// This file intentionally has ZERO dependencies on the game engine's
// internal variable names. It exposes a tiny global API
// (window.KVScoreTracker) that each game's own code calls into at exactly
// three moments: test-mode start, each answer, and board completion. This
// keeps the actual game files' changes minimal and low-risk.

(function () {
  const KEYVERSE_API = 'https://keyverse-api.onrender.com';

  function getLocalPlayer() {
    try {
      const raw = localStorage.getItem('kv_player');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  let current = null; // { gameSlug, boardId, startedAt, attempts, correct, incorrect }

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
      if (!current) return;
      const elapsedSeconds = (performance.now() - current.startedAt) / 1000;
      const player = getLocalPlayer();
      const payload = { ...current, elapsedSeconds };
      current = null; // clear immediately so a rapid re-entry doesn't double-submit

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

    /** Call if the player exits Test Mode early without finishing (e.g.
     * toggles back to Practice Mode partway through). Discards the
     * in-progress attempt rather than submitting a partial/misleading one. */
    cancelBoard() {
      current = null;
    },
  };

  window.KVScoreTracker = KVScoreTracker;
})();
