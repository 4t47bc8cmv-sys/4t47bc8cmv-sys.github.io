// Shared config and helpers for the Keyverse split-screen multiplayer pages.
// Loaded by login.html, account.html, join.html, and leaderboard.html.

const KEYVERSE_API = 'https://keyverse-api.onrender.com';
const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';
// One-time $7.77 split-screen unlock. Currently a TEST-mode Payment Link —
// swap this for the live Payment Link once the real Stripe business account
// is created and verified (see the project spec for that step).
const UNLOCK_PAYMENT_LINK = 'https://buy.stripe.com/test_3cI7sL5Zl0C6dkR7SHgbm00';

// Lazily created so pages that don't need auth (e.g. leaderboard.html) can
// include this file without also loading the Supabase JS CDN script.
let _supabaseClient = null;
function getSupabaseClient() {
  if (!_supabaseClient) {
    if (!window.supabase) {
      throw new Error('Supabase JS client is not loaded on this page.');
    }
    _supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  }
  return _supabaseClient;
}

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es-419', label: 'Español · Latinoamérica', flag: '🌎' },
  { code: 'tl', label: 'Tagalog', flag: '🇵🇭' },
  { code: 'zh-HK', label: '繁體中文 · 粵語', flag: '🇭🇰' },
  { code: 'zh-CN', label: '简体中文 · 普通话', flag: '🇨🇳' },
  { code: 'nan-Hokkien', label: '閩南語', flag: '🏮' },
  { code: 'hak', label: '客家話', flag: '🪨' },
  { code: 'wuu', label: '吳語', flag: '🏯' },
  { code: 'de-CH', label: 'Deutsch · Schweiz', flag: '🇨🇭' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'da-DK', label: 'Dansk', flag: '🇩🇰' },
];

const GAMES = [
  { slug: 'v1g1-first-steps', name: 'First Steps on Mac', boards: 5 },
  { slug: 'v1g2-daily-driver', name: 'Daily Driver', boards: 5 },
  { slug: 'v1g3-productivity-boosters', name: 'Productivity Boosters', boards: 5 },
  { slug: 'v1g4-accessibility-pro', name: 'Accessibility Pro', boards: 5 },
  { slug: 'v2g1-system-control', name: 'System Control', boards: 5 },
  { slug: 'v2g2-window-wrangling', name: 'Window Wrangling', boards: 5 },
  { slug: 'v3g1-finder-basics', name: 'Finder Basics', boards: 5 },
  { slug: 'v3g2-finder-power', name: 'Finder Power', boards: 5 },
  { slug: 'v4g1-text-editing', name: 'Text Editing', boards: 5 },
  { slug: 'v4g2-text-mastery', name: 'Text Mastery', boards: 5 },
];

async function apiFetch(path, options = {}) {
  const res = await fetch(`${KEYVERSE_API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

function getLocalPlayer() {
  try {
    const raw = localStorage.getItem('kv_player');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setLocalPlayer(player) {
  try {
    localStorage.setItem('kv_player', JSON.stringify(player));
  } catch (e) { /* private browsing */ }
}
