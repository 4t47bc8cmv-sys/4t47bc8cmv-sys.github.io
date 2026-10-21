// Shared config and helpers for the Keyverse split-screen multiplayer pages.
// Loaded by login.html, account.html, join.html, and leaderboard.html.

const KEYVERSE_API = 'https://keyverse-api.onrender.com';
const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';
// Global Free Trial configuration. Set to false when trial ends.
const FREE_TRIAL_ENABLED = true;
const FREE_TRIAL_PASSCODE = 'Veteran USMC';
const UNLOCK_PAYMENT_LINK = '/multiplayer/login.html';

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

function notifySignupOnDiscord(email, callsign) {
  const webhookUrl = (
    (typeof DISCORD_SIGNUP_WEBHOOK_URL !== 'undefined' ? DISCORD_SIGNUP_WEBHOOK_URL : '') ||
    (typeof window !== 'undefined' && window.KEYVERSE_DISCORD_WEBHOOK_URL) ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('kv_discord_webhook')) ||
    ''
  ).trim();

  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    console.log('[Keyverse] Notice: Discord webhook URL not configured. (Set DISCORD_SIGNUP_WEBHOOK_URL or localStorage.kv_discord_webhook to enable live signup alerts).');
    return;
  }

  try {
    const payload = {
      content: "🎉 **New Keyverse Free Trial Signup!**\n📧 Player: `" + email + "`" + (callsign ? " (" + callsign + ")" : "") + "\n🕒 Time: " + new Date().toLocaleString()
    };
    fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch((err) => {
      console.warn('[Keyverse] Non-blocking Discord alert error:', err);
    });
  } catch (err) {
    console.warn('[Keyverse] Non-blocking Discord alert exception:', err);
  }
}

function recordTrialSignup(email, callsign) {
  // 1. Local Storage
  try {
    localStorage.setItem('kv_trial_active', 'true');
    localStorage.setItem('kv_trial_email', email);
    localStorage.setItem('kv_player', JSON.stringify({
      id: 'trial-' + btoa(email).replace(/=/g, '').substring(0, 12),
      nickname: callsign || email.split('@')[0],
      email: email
    }));
  } catch (e) {}

  // 2. Google Analytics trial_signup_completed tracking to G-HPCMTG7133
  try {
    const gaId = 'G-HPCMTG7133';
    if (typeof gtag === 'function') {
      gtag('event', 'trial_signup_completed', {
        method: 'veteran_usmc_passcode',
        send_to: gaId
      });
    } else if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'trial_signup_completed', {
        method: 'veteran_usmc_passcode',
        send_to: gaId
      });
    }
  } catch (e) {
    console.warn('[Keyverse] GA trial signup event error:', e);
  }

  // 3. Supabase Auth & Record
  try {
    const sb = typeof getSupabaseClient === 'function' ? getSupabaseClient() : (window.supabaseClient || null);
    if (sb) {
      sb.auth.signInWithPassword({
        email: email,
        password: FREE_TRIAL_PASSCODE
      }).then(({ error }) => {
        if (error) {
          return sb.auth.signUp({
            email: email,
            password: FREE_TRIAL_PASSCODE,
            options: {
              data: {
                trial_active: true,
                trial_passcode: FREE_TRIAL_PASSCODE,
                signup_source: 'veteran_usmc_passcode',
                signup_time: new Date().toISOString()
              }
            }
          });
        }
      }).catch(() => {});

      sb.from('trial_signups').insert([{
        email: email,
        method: 'veteran_usmc_passcode',
        created_at: new Date().toISOString()
      }]).catch(() => {});
    }
  } catch (e) {
    console.warn('[Keyverse] Supabase trial recording:', e);
  }

  // 4. Non-blocking Discord Notification
  if (typeof notifySignupOnDiscord === 'function') {
    notifySignupOnDiscord(email, callsign);
  }
}
