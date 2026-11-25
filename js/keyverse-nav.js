/**
 * Keyverse Global Navigation & Info Hub ("Explore Keyverse ▾")
 * + Clean Hover-to-Reveal Preview Cards ("What is this?")
 * Lightweight, accessible dark-theme dropdown injected into the top bar
 * across index.html, all games/, and all guides/ pages.
 */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';

  const INFO_CATALOG = {
    'desktop-meltdown': {
      badge: 'NEW 🔥 · ARCADE SURVIVAL',
      title: 'Desktop Meltdown (Survival & Practice)',
      desc: 'Survive a hijacked Mac desktop! Rogue popups, spyware scanners, and glitching apps attack your screen—destroy them using real Mac shortcuts (⌘+W, ⌘+H, ⌘+Space, ⌘+Q, ⌘+Z) before your System Integrity hits 0%. Includes an untimed Slow Practice mode to learn every threat first.'
    },
    v1g1: {
      badge: 'VOLUME 1 · GAME 1',
      title: 'First Steps on Mac',
      desc: 'Builds core everyday Mac muscle memory. Drills Spotlight (⌘+Space), Copy/Paste/Cut (⌘+C, ⌘+V, ⌘+X), Undo (⌘+Z), App Switching, and Quit/Close.'
    },
    v1g2: {
      badge: 'VOLUME 1 · GAME 2',
      title: 'Daily Driver',
      desc: 'Levels up your daily workflow speed. Drills Full Screen (⌃+⌘+F), Mission Control & Spaces (⌃+Up/Down/Right), Window Cycling (⌘+`), and Bold/Italic/Underline.'
    },
    v1g3: {
      badge: 'VOLUME 1 · GAME 3',
      title: 'Productivity Boosters',
      desc: 'Browser and app power-user speed drills. Practices New/Close/Reopen Tab (⌘+T, ⌘+W, ⇧+⌘+T), Focus Address Bar (⌘+L), Reload (⌘+R), and Bookmarks.'
    },
    v1g4: {
      badge: 'VOLUME 1 · GAME 4',
      title: 'Accessibility Pro',
      desc: 'Master macOS hardware, audio, and accessibility controls. Drills Volume/Brightness fine adjustments (⌥+⇧+F11/F12, F1/F2), Mute (F10), VoiceOver, and Zoom.'
    },
    v2g1: {
      badge: 'VOLUME 2 · GAME 1',
      title: 'System Control',
      desc: 'Control power, sleep, and lock states without touching menus. Drills Lock Screen (⌃+⌘+Q), Log Out (⇧+⌘+Q), Sleep (⌥+⌘+Power), and Touch ID/Power controls.'
    },
    v2g2: {
      badge: 'VOLUME 2 · GAME 2',
      title: 'Window Wrangling',
      desc: 'Manage overlapping windows and advanced edits effortlessly. Drills Hide App (⌘+H), Hide Others (⌥+⌘+H), Minimize All (⌥+⌘+M), Redo (⇧+⌘+Z), and Paste & Match Style.'
    },
    v3g1: {
      badge: 'VOLUME 3 · GAME 1',
      title: 'Finder Basics',
      desc: 'Navigate macOS folders at lightning speed without clicking. Drills Go to Desktop (⇧+⌘+D), Go to Folder (⇧+⌘+G), Home (⇧+⌘+H), iCloud Drive (⇧+⌘+I), and Back/Forward (⌘+[ / ]).'
    },
    v3g2: {
      badge: 'VOLUME 3 · GAME 2',
      title: 'Finder Power',
      desc: 'Master Finder views, panes, and instant file previews. Drills View Options (⌘+J), Quick Look (⌘+Y / Space), Path Bar (⌥+⌘+P), Sidebar toggle (⌥+⌘+S), and Smart Folders.'
    },
    v4g1: {
      badge: 'VOLUME 4 · GAME 1',
      title: 'Text Editing',
      desc: 'Move your text cursor like a developer without touching the mouse. Drills word-by-word jumps (⌥+Left/Right), line start/end (⌘+Left/Right), and document top/bottom (⌘+Up/Down).'
    },
    v4g2: {
      badge: 'VOLUME 4 · GAME 2',
      title: 'Text Mastery',
      desc: 'Select, edit, and format text at the speed of thought. Drills line/word/paragraph selection (⇧+⌘+Arrows, ⌥+⇧+Arrows), word deletion, and rapid formatting.'
    },
    multiplayer: {
      badge: 'BOARDS & RACING',
      title: 'Split-Screen Multiplayer & Ghost DNA',
      desc: 'Race a friend head-to-head or share a Ghost DNA link so friends race your exact live keystrokes.'
    },
    'dj-studio': {
      badge: 'INTERACTIVE AUDIO',
      title: 'Shortcut DJ Studio',
      desc: 'Turn your shortcut streaks into live music—pick a genre, customize a 16-step beat grid, and level up instruments as you play.'
    },
    'sound-packs': {
      badge: 'REACTIVE AUDIO',
      title: 'Origin & Vibe Sound Packs',
      desc: 'Switch between Katana, Anime, Harbor, and Cyber soundscapes that react to your combo streak.'
    },
    guides: {
      badge: 'REFERENCE & CHEAT SHEETS',
      title: 'Mac Shortcut Guides',
      desc: 'Step-by-step interactive reference guides and cheat sheets for mastering macOS.'
    }
  };

  const GAMES = {
    v1: [
      { id: 'v1g1', label: 'V1·G1 First Steps', path: 'games/v1g1-first-steps.html' },
      { id: 'v1g2', label: 'V1·G2 Daily Driver', path: 'games/v1g2-daily-driver.html' },
      { id: 'v1g3', label: 'V1·G3 Productivity', path: 'games/v1g3-productivity-boosters.html' },
      { id: 'v1g4', label: 'V1·G4 Accessibility', path: 'games/v1g4-accessibility-pro.html' }
    ],
    v2: [
      { id: 'v2g1', label: 'V2·G1 System Control', path: 'games/v2g1-system-control.html' },
      { id: 'v2g2', label: 'V2·G2 Window Wrangling', path: 'games/v2g2-window-wrangling.html' }
    ],
    v3: [
      { id: 'v3g1', label: 'V3·G1 Finder Basics', path: 'games/v3g1-finder-basics.html' },
      { id: 'v3g2', label: 'V3·G2 Finder Power', path: 'games/v3g2-finder-power.html' }
    ],
    v4: [
      { id: 'v4g1', label: 'V4·G1 Text Editing', path: 'games/v4g1-text-editing.html' },
      { id: 'v4g2', label: 'V4·G2 Text Mastery', path: 'games/v4g2-text-mastery.html' }
    ]
  };

  const GUIDES = [
    { label: "Beginner's Guide", path: 'guides/mac-shortcuts-for-beginners.html' },
    { label: 'Windows to Mac', path: 'guides/windows-to-mac-shortcut-switchers-guide.html' },
    { label: 'Finder & ⌘+K', path: 'guides/macos-finder-and-window-management.html' },
    { label: 'Safari & Browser', path: 'guides/safari-and-browser-productivity-shortcuts.html' },
    { label: 'Text & Terminal', path: 'guides/text-editing-and-terminal-essentials.html' }
  ];

  const PACKS = [
    { id: 'katana', label: '⚔️ Katana' },
    { id: 'anime', label: '✨ Anime' },
    { id: 'harbor', label: '⚓ Harbor' },
    { id: 'cyber', label: '⚡ Cyber' }
  ];

  let sbClient = null;
  let currentUser = null;
  let isOpen = false;
  let activeInfoTarget = null;

  function getRootPrefix() {
    const p = (global.location && global.location.pathname) || '';
    if (p.indexOf('/games/') !== -1 || p.indexOf('/guides/') !== -1 || p.indexOf('/multiplayer/') !== -1) {
      return '../';
    }
    return '';
  }

  function injectStyles() {
    if (document.getElementById('kv-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'kv-nav-styles';
    style.textContent = `
      #kv-nav-root {
        position: relative;
        display: inline-flex;
        align-items: center;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        z-index: 10020;
      }
      #kv-nav-root.kv-nav-floating {
        position: fixed;
        top: 14px;
        left: 14px;
      }
      .kv-explore-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: rgba(23, 28, 34, 0.92);
        color: #e6edf3;
        border: 1px solid #2b3544;
        border-radius: 999px;
        padding: 7px 14px;
        font-size: 0.84rem;
        font-weight: 700;
        cursor: pointer;
        backdrop-filter: blur(8px);
        transition: border-color 0.15s, color 0.15s, background 0.15s;
        white-space: nowrap;
      }
      .kv-explore-btn:hover,
      .kv-explore-btn[aria-expanded="true"] {
        border-color: #13f2b0;
        color: #13f2b0;
        background: rgba(19, 242, 176, 0.1);
      }
      #kv-nav-panel {
        display: none;
        position: fixed;
        width: min(860px, calc(100vw - 24px));
        max-height: calc(100vh - 84px);
        overflow-y: auto;
        background: #0f141b;
        border: 1px solid #2b3544;
        border-radius: 16px;
        padding: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.72);
        z-index: 10025;
        color: #e6edf3;
        text-align: left;
      }
      #kv-nav-panel.open {
        display: block;
      }
      .kv-nav-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(195px, 1fr));
        gap: 16px;
      }
      .kv-nav-col h4 {
        margin: 0 0 10px;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #13f2b0;
        border-bottom: 1px solid #1e2631;
        padding-bottom: 6px;
      }
      .kv-nav-link {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        color: #c9d1d9;
        text-decoration: none;
        font-size: 0.84rem;
        padding: 5px 8px;
        border-radius: 8px;
        transition: background 0.12s, color 0.12s;
        cursor: pointer;
        border: none;
        background: transparent;
        width: 100%;
        text-align: left;
        font-family: inherit;
        box-sizing: border-box;
      }
      .kv-nav-link:hover {
        background: rgba(19, 242, 176, 0.12);
        color: #13f2b0;
      }
      .kv-nav-link.featured {
        background: rgba(19, 242, 176, 0.08);
        border: 1px solid rgba(19, 242, 176, 0.28);
        color: #13f2b0;
        font-weight: 700;
        margin-bottom: 6px;
      }
      .kv-vol-group {
        margin: 6px 0;
      }
      .kv-vol-label {
        font-size: 0.72rem;
        font-weight: 700;
        color: #8b949e;
        padding: 2px 8px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .kv-pack-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 4px 4px 8px;
      }
      .kv-pack-chip {
        background: #171c22;
        border: 1px solid #2b3544;
        color: #c9d1d9;
        border-radius: 999px;
        padding: 4px 9px;
        font-size: 0.76rem;
        font-weight: 600;
        cursor: pointer;
      }
      .kv-pack-chip:hover,
      .kv-pack-chip.active {
        border-color: #13f2b0;
        color: #13f2b0;
        background: rgba(19, 242, 176, 0.12);
      }
      .kv-acct-box {
        background: #161b22;
        border: 1px solid #2b3544;
        border-radius: 10px;
        padding: 10px;
        font-size: 0.82rem;
      }
      .kv-acct-cta {
        display: block;
        text-align: center;
        background: #13f2b0;
        color: #0b0e11;
        font-weight: 800;
        text-decoration: none;
        border-radius: 8px;
        padding: 8px 10px;
        margin-top: 8px;
        font-size: 0.82rem;
      }
      .kv-acct-cta:hover { filter: brightness(1.06); }
      .kv-acct-signout {
        margin-top: 8px;
        width: 100%;
        background: #21262d;
        border: 1px solid #30363d;
        color: #f85149;
        border-radius: 8px;
        padding: 6px 10px;
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
      }

      /* Floating Hover-to-Reveal Preview Card */
      #kv-info-tooltip {
        position: fixed;
        z-index: 10040;
        width: min(330px, calc(100vw - 24px));
        background: rgba(13, 18, 24, 0.97);
        border: 1px solid rgba(19, 242, 176, 0.48);
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.78);
        backdrop-filter: blur(10px);
        color: #e6edf3;
        pointer-events: none;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.14s ease, transform 0.14s ease;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        text-align: left;
      }
      #kv-info-tooltip.visible {
        opacity: 1;
        transform: translateY(0);
      }
      .kv-tip-badge {
        font-size: 0.68rem;
        font-weight: 800;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #13f2b0;
        margin-bottom: 4px;
      }
      .kv-tip-title {
        font-size: 0.92rem;
        font-weight: 800;
        color: #f0f6fc;
        margin-bottom: 5px;
      }
      .kv-tip-desc {
        font-size: 0.8rem;
        line-height: 1.48;
        color: #b1bac4;
      }

      /* Unobtrusive ⓘ badge for touch/click preview without navigating */
      .kv-info-dot {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 999px;
        font-size: 0.7rem;
        font-weight: 700;
        color: #8b949e;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        cursor: pointer;
        flex-shrink: 0;
        line-height: 1;
        transition: color 0.12s, border-color 0.12s, background 0.12s;
      }
      .kv-info-dot:hover,
      .kv-info-dot:focus {
        color: #13f2b0;
        border-color: #13f2b0;
        background: rgba(19, 242, 176, 0.14);
        outline: none;
      }
      .game-card .kv-info-dot-card {
        position: absolute;
        top: 12px;
        right: 12px;
        z-index: 2;
      }
      .game-card[data-kv-info],
      .game-card[data-game] {
        position: relative;
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function ensureTooltipEl() {
    let tip = document.getElementById('kv-info-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'kv-info-tooltip';
      tip.setAttribute('role', 'tooltip');
      tip.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tip);
    }
    return tip;
  }

  function positionTooltip(target, tip) {
    const rect = target.getBoundingClientRect();
    const vw = global.innerWidth || document.documentElement.clientWidth;
    const vh = global.innerHeight || document.documentElement.clientHeight;
    const tipRect = tip.getBoundingClientRect();
    const tw = tipRect.width || Math.min(330, vw - 24);
    const th = tipRect.height || 130;

    let left = rect.left + (rect.width / 2) - (tw / 2);
    left = Math.max(12, Math.min(vw - tw - 12, left));

    let top = rect.bottom + 8;
    if (top + th > vh - 12) {
      top = rect.top - th - 8;
    }
    if (top < 12) {
      top = 12;
    }
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  }

  function showInfoCard(target, key) {
    const entry = INFO_CATALOG[key];
    if (!entry || !target) return;
    const tip = ensureTooltipEl();
    activeInfoTarget = target;
    tip.innerHTML = `
      <div class="kv-tip-badge">${escapeHtml(entry.badge)}</div>
      <div class="kv-tip-title">${escapeHtml(entry.title)}</div>
      <div class="kv-tip-desc">${escapeHtml(entry.desc)}</div>
    `;
    tip.setAttribute('aria-hidden', 'false');
    positionTooltip(target, tip);
    tip.classList.add('visible');
  }

  function hideInfoCard() {
    const tip = document.getElementById('kv-info-tooltip');
    if (!tip) return;
    activeInfoTarget = null;
    tip.classList.remove('visible');
    tip.setAttribute('aria-hidden', 'true');
  }

  function attachHoverTargets(scope) {
    const root = scope || document;
    const els = root.querySelectorAll('[data-kv-info], [data-game]');
    els.forEach(function (el) {
      if (el.dataset.kvBound === '1') return;
      const key = el.getAttribute('data-kv-info') || el.getAttribute('data-game');
      if (!key || !INFO_CATALOG[key]) return;
      el.dataset.kvBound = '1';

      el.addEventListener('mouseenter', function () {
        showInfoCard(el, key);
      });
      el.addEventListener('mouseleave', function () {
        hideInfoCard();
      });
      el.addEventListener('focusin', function () {
        showInfoCard(el, key);
      });
      el.addEventListener('focusout', function () {
        hideInfoCard();
      });

      // Add compact ⓘ badge for touch/click preview without triggering link navigation
      if (!el.querySelector('.kv-info-dot')) {
        const dot = document.createElement('span');
        dot.className = 'kv-info-dot' + (el.classList.contains('game-card') ? ' kv-info-dot-card' : '');
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label', 'What is ' + INFO_CATALOG[key].title + '?');
        dot.textContent = 'ⓘ';
        dot.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (activeInfoTarget === el) {
            hideInfoCard();
          } else {
            showInfoCard(el, key);
          }
        });
        dot.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            showInfoCard(el, key);
          }
        });
        el.appendChild(dot);
      }
    });
  }

  function renderAccountBox() {
    const box = document.getElementById('kv-nav-account-box');
    if (!box) return;
    const root = getRootPrefix();
    const currentUrl = encodeURIComponent(global.location.pathname + global.location.search);

    if (currentUser) {
      const display = (currentUser.user_metadata && (currentUser.user_metadata.callsign || currentUser.user_metadata.username)) || currentUser.email || 'Player';
      box.innerHTML = `
        <div style="color:#13f2b0;font-weight:700;margin-bottom:4px;word-break:break-all;">● ${escapeHtml(display)}</div>
        <a class="kv-nav-link" href="${root}multiplayer/account.html" style="padding-left:0;">👤 Account &amp; Stats →</a>
        <button type="button" class="kv-acct-signout" id="kv-nav-signout-btn">Sign Out</button>
      `;
      const soBtn = document.getElementById('kv-nav-signout-btn');
      if (soBtn) {
        soBtn.onclick = function () {
          if (sbClient) sbClient.auth.signOut();
        };
      }
    } else {
      box.innerHTML = `
        <div style="color:#8b949e;margin-bottom:4px;">Sign in to unlock Shortcut DJ Studio &amp; cloud-sync your beats.</div>
        <a class="kv-acct-cta" href="${root}login.html?redirect=${currentUrl}">🔑 Sign In / Free Trial</a>
      `;
    }
  }

  function initSupabase() {
    function attach() {
      try {
        if (!global.supabase) return;
        sbClient = global.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
        sbClient.auth.getSession().then(function (res) {
          currentUser = res && res.data && res.data.session ? res.data.session.user : null;
          renderAccountBox();
        }).catch(function () {});
        sbClient.auth.onAuthStateChange(function (_evt, session) {
          currentUser = session ? session.user : null;
          renderAccountBox();
        });
      } catch (_) {}
    }

    if (global.supabase) {
      attach();
    } else {
      const existing = document.querySelector('script[src*="supabase-js"]');
      if (existing) {
        existing.addEventListener('load', attach);
      } else {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
        s.async = true;
        s.onload = attach;
        document.head.appendChild(s);
      }
    }
  }

  function positionPanel(trigger, panel) {
    const rect = trigger.getBoundingClientRect();
    const vw = global.innerWidth || document.documentElement.clientWidth;
    const panelWidth = Math.min(860, vw - 24);
    let left = rect.left;
    if (left + panelWidth > vw - 12) {
      left = Math.max(12, vw - panelWidth - 12);
    }
    const top = Math.min((global.innerHeight || 800) - 100, rect.bottom + 8);
    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
  }

  function closeMenu(returnFocus) {
    const trigger = document.getElementById('kv-explore-trigger');
    const panel = document.getElementById('kv-nav-panel');
    hideInfoCard();
    if (!trigger || !panel || !isOpen) return;
    isOpen = false;
    panel.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    if (returnFocus) trigger.focus();
  }

  function toggleMenu() {
    const trigger = document.getElementById('kv-explore-trigger');
    const panel = document.getElementById('kv-nav-panel');
    if (!trigger || !panel) return;
    isOpen = !isOpen;
    if (isOpen) {
      positionPanel(trigger, panel);
      panel.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      refreshActivePack();
    } else {
      hideInfoCard();
      panel.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  }

  function refreshActivePack() {
    let active = '';
    try {
      if (global.KeyverseAudio && typeof global.KeyverseAudio.getPack === 'function') {
        active = global.KeyverseAudio.getPack();
      } else {
        active = localStorage.getItem('keyverse_sound_pack') || '';
      }
    } catch (_) {}
    document.querySelectorAll('.kv-pack-chip').forEach(function (chip) {
      chip.classList.toggle('active', chip.getAttribute('data-pack') === active);
    });
  }

  function buildNav() {
    if (document.getElementById('kv-nav-root')) return;
    injectStyles();
    ensureTooltipEl();
    const root = getRootPrefix();

    const container = document.createElement('div');
    container.id = 'kv-nav-root';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'kv-explore-trigger';
    trigger.className = 'kv-explore-btn';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'kv-nav-panel');
    trigger.innerHTML = 'ℹ️ Explore Keyverse <span aria-hidden="true">▾</span>';
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
    container.appendChild(trigger);

    const panel = document.createElement('div');
    panel.id = 'kv-nav-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Explore Keyverse Navigation');

    const v1Links = GAMES.v1.map(g => `<a class="kv-nav-link" data-kv-info="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v2Links = GAMES.v2.map(g => `<a class="kv-nav-link" data-kv-info="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v3Links = GAMES.v3.map(g => `<a class="kv-nav-link" data-kv-info="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v4Links = GAMES.v4.map(g => `<a class="kv-nav-link" data-kv-info="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const guideLinks = GUIDES.map(g => `<a class="kv-nav-link" data-kv-info="guides" href="${root}${g.path}"><span>📖 ${g.label}</span></a>`).join('');
    const packChips = PACKS.map(p => `<button type="button" class="kv-pack-chip" data-pack="${p.id}">${p.label}</button>`).join('');

    panel.innerHTML = `
      <div class="kv-nav-grid">
        <div class="kv-nav-col">
          <h4>🎮 Games &amp; Modes</h4>
          <a class="kv-nav-link featured" data-kv-info="desktop-meltdown" href="${root}games/desktop-meltdown.html"><span>🔥 Desktop Meltdown</span></a>
          <a class="kv-nav-link" data-kv-info="multiplayer" href="${root}index.html#multiplayer"><span>⚔️ Split-Screen &amp; Ghost DNA</span></a>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 1 · Essentials</div>${v1Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 2 · System &amp; Windows</div>${v2Links}</div>
        </div>
        <div class="kv-nav-col">
          <h4>⌨️ More Shortcut Volumes</h4>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 3 · Finder Mastery</div>${v3Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 4 · Text Editing</div>${v4Links}</div>
          <h4 style="margin-top:14px;">🎛️ Audio &amp; Features</h4>
          <button type="button" class="kv-nav-link featured" data-kv-info="dj-studio" id="kv-nav-open-dj"><span>🎛️ Shortcut DJ Studio</span></button>
          <div class="kv-vol-label" data-kv-info="sound-packs" style="margin-top:6px;cursor:default;"><span>🎵 Origin &amp; Vibe Sound Packs</span></div>
          <div class="kv-pack-row">${packChips}</div>
        </div>
        <div class="kv-nav-col">
          <h4>📚 Guides &amp; Info</h4>
          ${guideLinks}
          <a class="kv-nav-link" data-kv-info="guides" href="${root}index.html#guide"><span>❓ How to Play / Overview</span></a>
          <div style="border-top:1px solid #1e2631;margin:8px 0;padding-top:6px;">
            <a class="kv-nav-link" href="${root}about.html">ℹ️ About Keyverse</a>
            <a class="kv-nav-link" href="${root}contact.html">✉️ Contact</a>
            <a class="kv-nav-link" href="${root}privacy.html">🔒 Privacy Policy</a>
            <a class="kv-nav-link" href="${root}terms.html">📄 Terms of Service</a>
          </div>
        </div>
        <div class="kv-nav-col">
          <h4>🔑 Account</h4>
          <div id="kv-nav-account-box" class="kv-acct-box">Loading account status...</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    const navRight = document.querySelector('header.site .nav-right');
    const wrapNav = document.querySelector('header.site .wrap.nav');
    const topNav = document.querySelector('.top-nav');

    if (navRight) {
      navRight.insertBefore(container, navRight.firstChild);
    } else if (wrapNav) {
      wrapNav.appendChild(container);
    } else if (topNav) {
      topNav.insertBefore(container, topNav.children[1] || null);
    } else {
      container.classList.add('kv-nav-floating');
      document.body.appendChild(container);
    }

    const djBtn = document.getElementById('kv-nav-open-dj');
    if (djBtn) {
      djBtn.addEventListener('click', function () {
        closeMenu(false);
        if (global.KeyverseDJStudio && typeof global.KeyverseDJStudio.toggleDrawer === 'function') {
          global.KeyverseDJStudio.toggleDrawer();
        } else {
          const studioOpen = document.getElementById('kv-studio-open-btn');
          if (studioOpen) {
            studioOpen.click();
          } else {
            global.location.href = root + 'games/desktop-meltdown.html?open_dj=1';
          }
        }
      });
    }

    panel.querySelectorAll('.kv-pack-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        const packId = chip.getAttribute('data-pack');
        if (global.KeyverseAudio && typeof global.KeyverseAudio.setPack === 'function') {
          global.KeyverseAudio.setPack(packId);
          refreshActivePack();
        } else {
          global.location.href = root + 'games/desktop-meltdown.html?pack=' + encodeURIComponent(packId);
        }
      });
    });

    try {
      const params = new URLSearchParams(global.location.search);
      const urlPack = params.get('pack');
      if (urlPack && global.KeyverseAudio && typeof global.KeyverseAudio.setPack === 'function') {
        global.KeyverseAudio.setPack(urlPack);
      }
    } catch (_) {}

    document.addEventListener('click', function (e) {
      if (activeInfoTarget && !e.target.closest('.kv-info-dot')) {
        hideInfoCard();
      }
      if (!isOpen) return;
      if (!panel.contains(e.target) && !container.contains(e.target)) {
        closeMenu(false);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        hideInfoCard();
        if (isOpen) closeMenu(true);
      }
    });
    global.addEventListener('resize', function () {
      hideInfoCard();
      if (isOpen) positionPanel(trigger, panel);
    });
    global.addEventListener('scroll', hideInfoCard, { passive: true });

    attachHoverTargets(document);
    renderAccountBox();
    initSupabase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})(window);
