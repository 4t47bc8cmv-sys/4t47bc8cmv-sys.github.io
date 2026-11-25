/**
 * Keyverse Global Navigation & Info Hub ("Explore Keyverse ▾")
 * Lightweight, accessible dark-theme dropdown injected into the top bar
 * across index.html, all games/, and all guides/ pages.
 */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';

  const GAMES = {
    v1: [
      { label: 'V1·G1 First Steps', path: 'games/v1g1-first-steps.html' },
      { label: 'V1·G2 Daily Driver', path: 'games/v1g2-daily-driver.html' },
      { label: 'V1·G3 Productivity', path: 'games/v1g3-productivity-boosters.html' },
      { label: 'V1·G4 Accessibility', path: 'games/v1g4-accessibility-pro.html' }
    ],
    v2: [
      { label: 'V2·G1 System Control', path: 'games/v2g1-system-control.html' },
      { label: 'V2·G2 Window Wrangling', path: 'games/v2g2-window-wrangling.html' }
    ],
    v3: [
      { label: 'V3·G1 Finder Basics', path: 'games/v3g1-finder-basics.html' },
      { label: 'V3·G2 Finder Power', path: 'games/v3g2-finder-power.html' }
    ],
    v4: [
      { label: 'V4·G1 Text Editing', path: 'games/v4g1-text-editing.html' },
      { label: 'V4·G2 Text Mastery', path: 'games/v4g2-text-mastery.html' }
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
        display: block;
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
    `;
    document.head.appendChild(style);
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
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

    const v1Links = GAMES.v1.map(g => `<a class="kv-nav-link" href="${root}${g.path}">${g.label}</a>`).join('');
    const v2Links = GAMES.v2.map(g => `<a class="kv-nav-link" href="${root}${g.path}">${g.label}</a>`).join('');
    const v3Links = GAMES.v3.map(g => `<a class="kv-nav-link" href="${root}${g.path}">${g.label}</a>`).join('');
    const v4Links = GAMES.v4.map(g => `<a class="kv-nav-link" href="${root}${g.path}">${g.label}</a>`).join('');
    const guideLinks = GUIDES.map(g => `<a class="kv-nav-link" href="${root}${g.path}">📖 ${g.label}</a>`).join('');
    const packChips = PACKS.map(p => `<button type="button" class="kv-pack-chip" data-pack="${p.id}">${p.label}</button>`).join('');

    panel.innerHTML = `
      <div class="kv-nav-grid">
        <div class="kv-nav-col">
          <h4>🎮 Games &amp; Modes</h4>
          <a class="kv-nav-link featured" href="${root}games/desktop-meltdown.html">🔥 Desktop Meltdown (Survival &amp; Practice)</a>
          <a class="kv-nav-link" href="${root}index.html#multiplayer">⚔️ Split-Screen &amp; Ghost DNA Racing</a>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 1 · Essentials</div>${v1Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 2 · System &amp; Windows</div>${v2Links}</div>
        </div>
        <div class="kv-nav-col">
          <h4>⌨️ More Shortcut Volumes</h4>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 3 · Finder Mastery</div>${v3Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 4 · Text Editing</div>${v4Links}</div>
          <h4 style="margin-top:14px;">🎛️ Audio &amp; Features</h4>
          <button type="button" class="kv-nav-link featured" id="kv-nav-open-dj">🎛️ Shortcut DJ Studio</button>
          <div class="kv-vol-label" style="margin-top:6px;">🎵 Origin &amp; Vibe Sound Packs</div>
          <div class="kv-pack-row">${packChips}</div>
        </div>
        <div class="kv-nav-col">
          <h4>📚 Guides &amp; Info</h4>
          ${guideLinks}
          <a class="kv-nav-link" href="${root}index.html#guide">❓ How to Play / Quick Overview</a>
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

    // Mount trigger in appropriate top bar
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

    // Wire DJ Studio action
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

    // Wire Sound Pack chips
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

    // Apply ?pack= if present on a game page
    try {
      const params = new URLSearchParams(global.location.search);
      const urlPack = params.get('pack');
      if (urlPack && global.KeyverseAudio && typeof global.KeyverseAudio.setPack === 'function') {
        global.KeyverseAudio.setPack(urlPack);
      }
    } catch (_) {}

    // Outside click & Escape handling
    document.addEventListener('click', function (e) {
      if (!isOpen) return;
      if (!panel.contains(e.target) && !container.contains(e.target)) {
        closeMenu(false);
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closeMenu(true);
      }
    });
    global.addEventListener('resize', function () {
      if (isOpen) positionPanel(trigger, panel);
    });

    renderAccountBox();
    initSupabase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})(window);
