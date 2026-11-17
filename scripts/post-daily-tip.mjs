/**
 * Keyverse Daily Social Media Tip Poster
 *
 * Runs automatically via GitHub Actions (or manually via workflow_dispatch/node).
 * Selects a rotating Mac Shortcut Tip of the Day and posts to:
 * 1. Discord (via incoming webhook)
 * 2. Bluesky (via AT Protocol com.atproto.server.createSession + com.atproto.repo.createRecord)
 * 3. Mastodon (via POST ${instance}/api/v1/statuses)
 * 4. Telegram Channel (via POST https://api.telegram.org/bot${token}/sendMessage)
 * 5. Instagram (@keyversegames via Meta/Instagram Graph API /{ig-user-id}/media + /media_publish)
 * 6. Universal Cross-Post Webhook (Make.com, Zapier, Buffer for Instagram/X/LinkedIn/Threads/Facebook)
 *
 * Requirements:
 * - Node 20+ (uses native global fetch, no external dependencies)
 * - Environment variables:
 *   - DISCORD_WEBHOOK_URL (optional, skips if missing)
 *   - BLUESKY_HANDLE (optional, skips if missing)
 *   - BLUESKY_APP_PASSWORD (optional, skips if missing)
 *   - MASTODON_INSTANCE_URL (optional, defaults to https://mastodon.social)
 *   - MASTODON_ACCESS_TOKEN (optional, skips if missing)
 *   - TELEGRAM_BOT_TOKEN (optional, skips if missing)
 *   - TELEGRAM_CHAT_ID (optional, skips if missing)
 *   - INSTAGRAM_USER_ID (optional, skips if missing)
 *   - INSTAGRAM_ACCESS_TOKEN (optional, skips if missing)
 *   - MULTI_SOCIAL_WEBHOOK_URL (optional, skips if missing)
 */

const MAC_SHORTCUT_TIPS = [
  {
    keys: '⌘ + Space',
    title: 'Spotlight Quick Launcher & Calculator',
    category: 'Navigation & Search',
    desc: 'Stop hunting through folders or clicking menus. Press Command (⌘) + Space to launch apps, locate files, perform instant calculations like "125 * 1.15", or convert currencies on the fly.'
  },
  {
    keys: '⌘ + Tab',
    title: 'Instant Application Switcher',
    category: 'Window & App Control',
    desc: 'Cycle through running apps effortlessly. Hold Command (⌘) and tap Tab to move forward (or ` for backward). While holding ⌘, tap Q to quit the highlighted app or H to hide it.'
  },
  {
    keys: '⌘ + Shift + 4, then Space',
    title: 'Pixel-Perfect Window Screenshot',
    category: 'Productivity & Screen Capture',
    desc: 'Press Command (⌘) + Shift + 4, tap Space, and hover over any open window or menu. Click to capture a crisp screenshot with a clean Apple drop shadow.'
  },
  {
    keys: '⌘ + Shift + 5',
    title: 'Screen Recording & Capture HUD',
    category: 'Productivity & Screen Capture',
    desc: 'Press Command (⌘) + Shift + 5 to summon the unified capture control bar. Record entire displays, selected portions, capture windows, and set countdown timers.'
  },
  {
    keys: 'Option + ⌘ + Esc',
    title: 'Force Quit Frozen Applications',
    category: 'System Control',
    desc: 'When an app locks up with the spinning pinwheel, press Option + Command (⌘) + Esc to open the Force Quit dialog and terminate it immediately without rebooting.'
  },
  {
    keys: '⌘ + W vs ⌘ + Q',
    title: 'Closing Windows vs Quitting Apps',
    category: 'App Management',
    desc: 'Command (⌘) + W closes only the active tab or document window. Command (⌘) + Q completely quits the application process and frees up system memory.'
  },
  {
    keys: 'Option + ⌘ + C / V',
    title: 'Copy & Paste Text Formatting',
    category: 'Text & Typography',
    desc: 'Copy styling (font family, weight, color, margins) from highlighted text in Pages, Keynote, TextEdit, or Mail with Option + Command (⌘) + C, then apply it with Option + ⌘ + V.'
  },
  {
    keys: 'Control + ⌘ + Space',
    title: 'Emoji & Symbol Viewer',
    category: 'Text Editing',
    desc: "Press Control + Command (⌘) + Space anywhere you can type to open macOS's full Character Viewer palette for emojis, math operators, accents, and symbols."
  },
  {
    keys: '⌘ + Option + D',
    title: 'Quickly Toggle the Dock',
    category: 'Desktop & Workspace',
    desc: 'Press Command (⌘) + Option + D to instantly hide or show the macOS Dock and reclaim vertical workspace on smaller MacBook laptop displays.'
  },
  {
    keys: 'Control + ⌘ + Q',
    title: 'Lock Screen Instantly',
    category: 'Privacy & Security',
    desc: 'Stepping away from your Mac? Press Control + Command (⌘) + Q to lock your screen immediately without putting your computer to sleep or losing active tasks.'
  },
  {
    keys: '⌘ + Shift + .',
    title: 'Toggle Hidden Files & Dotfiles',
    category: 'Finder Mastery',
    desc: 'Need to inspect .env, .git, or hidden system files? Press Command (⌘) + Shift + . (Period) inside Finder or Open/Save dialogs to toggle invisible files on and off.'
  },
  {
    keys: '⌘ + Shift + G',
    title: 'Finder "Go to Folder" Path Jump',
    category: 'Finder Mastery',
    desc: 'Press Command (⌘) + Shift + G in Finder to jump directly to UNIX directories like ~/Library, /usr/local, or /etc with full shell tab-completion.'
  },
  {
    keys: 'Option + Delete',
    title: 'Delete Entire Word Backwards',
    category: 'Text Editing Speed',
    desc: 'Stop tapping Delete multiple times. Option + Delete removes the entire preceding word in one swift stroke across all Mac apps and browsers.'
  },
  {
    keys: '⌘ + Delete',
    title: 'Delete Entire Line to Beginning',
    category: 'Text Editing Speed',
    desc: 'Press Command (⌘) + Delete to wipe out everything from your cursor to the beginning of the line instantly—perfect for retyping sentences or clearing prompts.'
  },
  {
    keys: 'Fn + Delete (or Control + D)',
    title: 'Forward Delete on Mac Keyboards',
    category: 'Text Editing Speed',
    desc: 'MacBook keyboards lack a dedicated Del key. Hold Fn and press Delete (or press Control + D) to delete characters to the right of the cursor.'
  },
  {
    keys: '⌘ + Up / Down Arrow',
    title: 'Jump to Top or Bottom of Page',
    category: 'Navigation',
    desc: 'Navigate long documents, codebases, or web pages in an instant. Command (⌘) + Up Arrow jumps to the top; Command (⌘) + Down Arrow jumps to the bottom.'
  },
  {
    keys: 'Option + Left / Right Arrow',
    title: 'Navigate Word by Word',
    category: 'Text Editing Speed',
    desc: 'Hold Option and press Left Arrow or Right Arrow to jump your cursor across whole words rather than single letters. Add Shift to highlight word-by-word.'
  },
  {
    keys: 'Space in Finder',
    title: 'Quick Look Preview',
    category: 'Finder Mastery',
    desc: 'Highlight any PDF, photo, video, or code file in Finder and tap Space for an instant high-resolution preview without launching heavy desktop apps.'
  },
  {
    keys: '⌘ + Shift + T',
    title: 'Reopen Closed Browser Tab',
    category: 'Web Browsing',
    desc: 'Accidentally closed an essential tab? Command (⌘) + Shift + T restores your last closed tab in Safari, Chrome, Edge, and Arc with browsing history intact.'
  },
  {
    keys: '⌘ + Option + I',
    title: 'Open Web Developer Tools',
    category: 'Developer & Power User',
    desc: 'Inspect webpage elements, view JavaScript console output, and diagnose network requests with Command (⌘) + Option + I in all major macOS web browsers.'
  },
  {
    keys: '⌘ + 1 / 2 / 3 / 4',
    title: 'Switch Finder Views in Seconds',
    category: 'Finder Mastery',
    desc: 'Toggle Finder layout modes instantly: Command (⌘) + 1 for Icon view, ⌘ + 2 for List view, ⌘ + 3 for Column view, and ⌘ + 4 for Gallery view.'
  },
  {
    keys: '⌘ + Option + V in Finder',
    title: 'Move File (Cut & Paste Equivalent)',
    category: 'Finder Mastery',
    desc: 'Mac has no Cut shortcut for files, but something better: copy a file with Command (⌘) + C, open the target folder, and press Option + ⌘ + V to move it there.'
  },
  {
    keys: 'Option + Drag',
    title: 'Hold Option to Duplicate Anything',
    category: 'Productivity & Design',
    desc: 'Hold the Option key while dragging files in Finder, shapes in Figma/Keynote, or notes in Apple Notes to create a duplicate copy at the drop location.'
  },
  {
    keys: '⌘ + [ and ⌘ + ]',
    title: 'Back and Forward Navigation',
    category: 'Navigation',
    desc: 'Press Command (⌘) + [ or ⌘ + ] to go backward and forward across pages in Safari, Finder folder hierarchies, and Xcode without reaching for toolbar arrows.'
  },
  {
    keys: 'Control + Down Arrow',
    title: 'App Exposé (Active App Windows)',
    category: 'Window Management',
    desc: 'Have 6 Finder or browser windows open simultaneously? Control + Down Arrow tiles only the windows of the currently active app for quick selection.'
  },
  {
    keys: '⌘ + H and ⌘ + Option + H',
    title: 'Hide Window & Hide Others',
    category: 'Window Management',
    desc: 'Command (⌘) + H hides the active app instantly. Command (⌘) + Option + H hides every other app on your screen for a distraction-free workspace.'
  },
  {
    keys: 'Control + ⌘ + F',
    title: 'Toggle Full Screen Mode',
    category: 'Window Management',
    desc: 'Expand your active window to a dedicated macOS full-screen Space with Control + Command (⌘) + F. Press it again to return cleanly to your desktop.'
  },
  {
    keys: '⌘ + Shift + N',
    title: 'Create New Folder in Finder',
    category: 'Finder Mastery',
    desc: 'Press Command (⌘) + Shift + N to create and name a new folder in your current Finder window instantly without touching the mouse or menus.'
  },
  {
    keys: '⌘ + K in Finder',
    title: 'Connect to Server in Finder',
    category: 'Network & System',
    desc: 'Press Command (⌘) + K in Finder to open a quick connection box to link your Mac to an office server, shared drive, or home storage box. Standard sharing (smb://) pops up a normal username/password login. Strict Linux/Unix sharing (nfs://server:/export) needs a colon before the folder path and has no password box—your Mac’s IP must be on the server’s VIP allow-list.'
  },
  {
    keys: 'Option + Shift + Vol/Bright',
    title: 'Fine-Grained Audio & Display Steps',
    category: 'Hardware Control',
    desc: 'Hold Option + Shift while pressing the Volume or Display Brightness keys to adjust levels in quarter-step increments for the perfect setting.'
  }
];

function getDayOfYear(date = new Date()) {
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const diff = date - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay) + 1;
}

function buildPostText(tip, targetUrl) {
  return `💡 Mac Shortcut of the Day: ${tip.title}\n\nKeys: ${tip.keys}\n\n${tip.desc}\n\n🎮 Practice and build muscle memory for Mac shortcuts:\n${targetUrl}`;
}

function buildInstagramCaption(tip, targetUrl, dayOfYear) {
  return [
    `💡 Mac Shortcut of the Day (Day ${dayOfYear}): ${tip.title}`,
    ``,
    `⌨️ Shortcut: ${tip.keys}`,
    `📂 Category: ${tip.category}`,
    ``,
    `${tip.desc}`,
    ``,
    `🎮 Train your Mac keyboard muscle memory with 10 free retro browser games — no install, no download:`,
    `👉 Play free at keyversegames.com (Link in bio @keyversegames)`,
    ``,
    `#MacShortcuts #macOS #AppleTips #ProductivityHacks #MacBookPro #KeyverseGames #LearnMac #KeyboardShortcuts #TechTips #MacBookAir`
  ].join('\n');
}

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function postToDiscord(tip, targetUrl, dayOfYear) {
  const webhookUrl = (process.env.DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/1562218378213589095/6V18U91OyAirDk38bipavCB0QATYQT87ilDO3rko-WF02KizDz43pCiyeCljWJrRLfQ1').trim();
  if (!webhookUrl) {
    console.log('[Discord] Notice: DISCORD_WEBHOOK_URL secret not configured. Skipping Discord post.');
    return;
  }

  const payload = {
    username: 'Keyverse Daily Mac Tip',
    avatar_url: 'https://keyversegames.com/favicon.ico',
    content: `💡 **Mac Shortcut Tip of the Day** (Day ${dayOfYear})\n\n**${tip.title}** — \`${tip.keys}\`\n${tip.desc}\n\n👉 Train your Mac keyboard muscle memory: <${targetUrl}>`,
    embeds: [
      {
        title: `Mac Shortcut: ${tip.title}`,
        description: `${tip.desc}\n\n**Shortcut:** \`${tip.keys}\`\n**Category:** ${tip.category}`,
        url: targetUrl,
        color: 10937249, // #a6e3a1 Catppuccin Green
        footer: {
          text: 'Keyverse Games • Free Retro Mac Keyboard Trainer'
        },
        timestamp: new Date().toISOString()
      }
    ]
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok || res.status === 204) {
      console.log('✅ [Discord] Daily tip posted successfully.');
    } else {
      const errText = await res.text();
      console.error(`❌ [Discord] Webhook returned status ${res.status}: ${errText}`);
    }
  } catch (err) {
    console.error('❌ [Discord] Failed to send webhook:', err.message);
  }
}

async function postToBluesky(tip, targetUrl, postText) {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    console.log('[Bluesky] Notice: BLUESKY_HANDLE or BLUESKY_APP_PASSWORD not configured. Skipping Bluesky post.');
    return;
  }

  try {
    // 1. Create Session
    const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: handle.trim(),
        password: appPassword.trim()
      })
    });

    if (!sessionRes.ok) {
      const errText = await sessionRes.text();
      throw new Error(`Bluesky authentication failed (${sessionRes.status}): ${errText}`);
    }

    const session = await sessionRes.json();
    console.log(`[Bluesky] Authenticated as @${session.handle} (${session.did})`);

    // 2. Prepare Post Text (shortened without raw trackedUrl, since external embed card already links to targetUrl)
    const blueskyText = `💡 Mac Shortcut of the Day: ${tip.title}\n\nKeys: ${tip.keys}\n\n${tip.desc}`.slice(0, 295);

    const recordPayload = {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: blueskyText,
        createdAt: new Date().toISOString(),
        embed: {
          $type: 'app.bsky.embed.external',
          external: {
            uri: targetUrl,
            title: `Mac Shortcut: ${tip.title} (${tip.keys})`,
            description: 'Learn, practice, and build muscle memory for macOS shortcuts with fast-paced retro browser games. 100% free, no installation.'
          }
        }
      }
    };

    // 3. Create Record
    const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessJwt}`
      },
      body: JSON.stringify(recordPayload)
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(`Failed to create Bluesky post record (${postRes.status}): ${errText}`);
    }

    const postData = await postRes.json();
    console.log(`✅ [Bluesky] Daily tip post created successfully: ${postData.uri}`);
  } catch (err) {
    console.error('❌ [Bluesky] Post failed:', err.message);
  }
}

function sanitizeToken(raw) {
  let token = (raw || '').trim();
  if (token.startsWith('Bearer ') || token.startsWith('bearer ')) {
    token = token.slice(7).trim();
  }
  if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
    token = token.slice(1, -1).trim();
  }
  return token;
}

async function postToMastodon(postTextArg, targetUrl, maybePostText) {
  const HARDCODED_FALLBACK_TOKEN = 'HA_P4UHXC-R5vNXCYD5LBt6Vvqz8vQcyJAe7yw_InRE';
  const primaryToken = sanitizeToken(process.env.MASTODON_ACCESS_TOKEN) || HARDCODED_FALLBACK_TOKEN;

  const postText = typeof postTextArg === 'string'
    ? postTextArg
    : (maybePostText || (postTextArg && targetUrl ? buildPostText(postTextArg, targetUrl) : ''));

  const rawInstance = (process.env.MASTODON_INSTANCE_URL || '').trim();
  const instanceUrl = rawInstance
    ? (rawInstance.startsWith('http') ? rawInstance.replace(/\/+$/, '') : `https://${rawInstance.replace(/\/+$/, '')}`)
    : 'https://mastodon.social';

  const apiUrl = `${instanceUrl}/api/v1/statuses`;

  async function attemptPost(tokenToUse) {
    return await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenToUse}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: postText,
        visibility: 'public'
      })
    });
  }

  try {
    let res = await attemptPost(primaryToken);

    // If GitHub Secret token was set but invalid (status 401), retry with the hardcoded fallback token
    if (res.status === 401 && primaryToken !== HARDCODED_FALLBACK_TOKEN) {
      console.log('⚠️ [Mastodon] Primary token returned 401, retrying with hardcoded fallback token...');
      res = await attemptPost(HARDCODED_FALLBACK_TOKEN);
    }

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ [Mastodon] Daily tip posted successfully: ${data.url || data.id}`);
    } else {
      const errText = await res.text();
      console.error(`❌ [Mastodon] API returned status ${res.status}: ${errText}`);
      if (res.status === 401) {
        console.error(`💡 [Mastodon Notice] 401 Invalid Token checklist:\n  1. Is your Mastodon account on ${instanceUrl}? (Tokens are bound to their specific instance).\n  2. Did you copy "Your access token" rather than "Client secret" under Preferences > Development?\n  3. Does your token have the "write:statuses" scope enabled?`);
      }
    }
  } catch (err) {
    console.error('❌ [Mastodon] Failed to post status:', err.message);
  }
}

async function postToTelegram(tip, targetUrl, dayOfYear) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !token.trim() || !chatId || !chatId.trim()) {
    console.log('[Telegram] Notice: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID secret not configured. Skipping Telegram post.');
    return;
  }

  const apiUrl = `https://api.telegram.org/bot${token.trim()}/sendMessage`;

  const messageText = `💡 <b>Mac Shortcut Tip of the Day</b> (Day ${dayOfYear})\n\n<b>${escapeHtml(tip.title)}</b> — <code>${escapeHtml(tip.keys)}</code>\n\n${escapeHtml(tip.desc)}\n\n🎮 <a href="${targetUrl}">Train your Mac keyboard muscle memory on Keyverse</a>`;

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`✅ [Telegram] Daily tip posted successfully (Message ID: ${data.result?.message_id}).`);
    } else {
      const errText = await res.text();
      console.error(`❌ [Telegram] API returned status ${res.status}: ${errText}`);
    }
  } catch (err) {
    console.error('❌ [Telegram] Failed to post message:', err.message);
  }
}

async function postToInstagram(tip, dayOfYear, imageUrl, instagramCaption) {
  const igUserId = (process.env.INSTAGRAM_USER_ID || '').trim();
  const accessToken = sanitizeToken(process.env.INSTAGRAM_ACCESS_TOKEN);

  if (!igUserId || !accessToken) {
    console.log('[Instagram] Notice: INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN secret not configured. Skipping direct Instagram Graph API post.');
    return;
  }

  const hosts = ['https://graph.facebook.com/v21.0', 'https://graph.instagram.com/v21.0'];

  async function createAndPublish(baseUrl) {
    // 1. Create Media Container
    const containerRes = await fetch(`${baseUrl}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: instagramCaption,
        access_token: accessToken
      })
    });

    if (!containerRes.ok) {
      const errText = await containerRes.text();
      const err = new Error(`Container creation failed (${containerRes.status}): ${errText}`);
      err.status = containerRes.status;
      throw err;
    }

    const containerData = await containerRes.json();
    const creationId = containerData.id;
    console.log(`[Instagram] Created media container (${creationId}) for ${imageUrl}`);

    // 2. Poll container status briefly to ensure Instagram finished fetching the 1080x1080 image
    for (let attempt = 1; attempt <= 5; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const statusRes = await fetch(
        `${baseUrl}/${creationId}?fields=status_code&access_token=${encodeURIComponent(accessToken)}`
      );
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (statusData.status_code === 'FINISHED') break;
        if (statusData.status_code === 'ERROR') {
          throw new Error(`Instagram media container processing returned ERROR status.`);
        }
      }
    }

    // 3. Publish Media Container to @keyversegames Feed
    const publishRes = await fetch(`${baseUrl}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken
      })
    });

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      throw new Error(`Media publish failed (${publishRes.status}): ${errText}`);
    }

    return await publishRes.json();
  }

  try {
    let published;
    try {
      published = await createAndPublish(hosts[0]);
    } catch (firstErr) {
      console.log(`⚠️ [Instagram] Primary endpoint failed (${firstErr.message}), retrying via graph.instagram.com...`);
      published = await createAndPublish(hosts[1]);
    }
    console.log(`✅ [Instagram] Daily tip posted successfully to @keyversegames (Media ID: ${published.id}).`);
  } catch (err) {
    console.error('❌ [Instagram] Failed to publish post:', err.message);
  }
}

function buildXCaption(todayTip, xTrackedUrl) {
  const header = `💡 Mac Tip: ${todayTip.title}\nKeys: ${todayTip.shortcut}`;
  const footer = `\n\n${xTrackedUrl}\n#MacTips #macOS`;
  const maxDescLen = Math.max(0, 270 - header.length - footer.length - 2);
  let desc = (todayTip.tip || todayTip.desc || '').trim();
  if (desc.length > maxDescLen) {
    desc = maxDescLen > 3 ? `${desc.slice(0, maxDescLen - 1).trimEnd()}…` : '';
  }
  return desc ? `${header}\n\n${desc}${footer}` : `${header}${footer}`;
}

async function postToMultiSocialBridge(todayTip, trackedUrl, dayOfYear, postText, dateObj = new Date(), staticCardUrl = '', instagramCaption = '') {
  const webhookUrl = process.env.MULTI_SOCIAL_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.trim()) {
    console.log('[Multi-Social Bridge] Notice: MULTI_SOCIAL_WEBHOOK_URL secret not configured. Skipping cross-post webhook.');
    return;
  }

  const date = dateObj.toISOString().split('T')[0];
  const tipIndex = (dayOfYear - 1) % MAC_SHORTCUT_TIPS.length;
  const imageUrl = staticCardUrl || `https://keyversegames.com/social-cards/tip-${tipIndex + 1}.png`;
  const xTrackedUrl = `https://keyversegames.com/?utm_source=x&utm_medium=daily_tip&utm_campaign=tip_${dayOfYear}`;
  const xCaption = buildXCaption(todayTip, xTrackedUrl);

  const payload = {
    date,
    dayOfYear,
    shortcut: todayTip.shortcut,
    title: todayTip.title,
    tip: todayTip.tip,
    trackedUrl,
    xTrackedUrl,
    xCaption,
    imageUrl,
    caption: postText,
    staticCardUrl: staticCardUrl || imageUrl,
    category: todayTip.category,
    instagramHandle: '@keyversegames',
    instagramCaption: instagramCaption || postText,
    postText
  };

  try {
    const res = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      console.log('✅ [Multi-Social Bridge] Daily tip payload dispatched successfully.');
    } else {
      const errText = await res.text();
      console.error(`❌ [Multi-Social Bridge] Webhook returned status ${res.status}: ${errText}`);
    }
  } catch (err) {
    console.error('❌ [Multi-Social Bridge] Failed to dispatch webhook:', err.message);
  }
}

const postToMultiSocialWebhook = postToMultiSocialBridge;

async function main() {
  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const tipIndex = (dayOfYear - 1) % MAC_SHORTCUT_TIPS.length;
  const rawTip = MAC_SHORTCUT_TIPS[tipIndex];
  const todayTip = {
    ...rawTip,
    shortcut: rawTip.shortcut || rawTip.keys,
    tip: rawTip.tip || rawTip.desc
  };

  const trackedUrl = `https://keyversegames.com/?utm_source=social_auto&utm_medium=daily_tip&utm_campaign=tip_${dayOfYear}`;
  const targetUrl = trackedUrl;
  const imageUrl = `https://keyversegames.com/social-cards/tip-${tipIndex + 1}.png`;
  const postText = buildPostText(todayTip, trackedUrl);
  const instagramCaption = buildInstagramCaption(todayTip, trackedUrl, dayOfYear);

  console.log(`========================================`);
  console.log(`Keyverse Social Promo Poster`);
  console.log(`Date: ${now.toISOString()}`);
  console.log(`Day of Year: ${dayOfYear}`);
  console.log(`Tip #${tipIndex + 1}/${MAC_SHORTCUT_TIPS.length}: ${todayTip.title} (${todayTip.shortcut})`);
  console.log(`Target URL: ${trackedUrl}`);
  console.log(`Instagram Card URL: ${imageUrl}`);
  console.log(`========================================\n`);

  // Execute posts in parallel across all supported platforms
  await Promise.allSettled([
    postToDiscord(todayTip, trackedUrl, dayOfYear),
    postToBluesky(todayTip, trackedUrl, postText),
    postToMastodon(postText),
    postToTelegram(todayTip, trackedUrl, dayOfYear),
    postToInstagram(todayTip, dayOfYear, imageUrl, instagramCaption),
    postToMultiSocialBridge(todayTip, trackedUrl, dayOfYear, postText, now, imageUrl, instagramCaption)
  ]);

  console.log('\nDaily promo posting run finished.');
}

main().catch((err) => {
  console.error('Fatal error in social promo poster:', err);
  process.exit(1);
});

