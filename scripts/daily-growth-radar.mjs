/**
 * Keyverse Daily Mac Community Growth Radar & Weekly Challenge Spotlight
 *
 * Runs automatically via GitHub Actions at 16:00 UTC daily (or manually via workflow_dispatch).
 * 1. Searches public Bluesky & Mastodon for real conversations about #MacTips, Mac shortcuts, and Cmd-K / Command+K.
 * 2. Picks the top 3 conversations and posts a clickable digest + suggested helpful human reply to DISCORD_WEBHOOK_URL
 *    so you can reply manually in 30 seconds without risking automated spam bans.
 * 3. Every Friday (UTC day 5, or when FORCE_SPOTLIGHT=true), posts a playable Weekly Shortcut Challenge Spotlight
 *    (?challenge_score=1500 + UTM tags) to MULTI_SOCIAL_WEBHOOK_URL for Instagram + Facebook.
 *
 * Zero external dependencies — requires Node 20+.
 */

const SEARCH_QUERIES = ['Mac shortcuts', '#MacTips', 'Command+K'];

const WEEKLY_CHALLENGES = [
  {
    gamePath: 'games/v1g1-first-steps.html',
    title: 'First Steps on Mac Speed Challenge',
    shortcut: '⌘ + Space / ⌘ + Tab',
    cardIndex: 1,
    guideUrl: 'https://keyversegames.com/guides/mac-shortcuts-for-beginners.html'
  },
  {
    gamePath: 'games/v3g1-finder-basics.html',
    title: 'Finder & Connect to Server Challenge',
    shortcut: '⌘ + K / ⌘ + Shift + G',
    cardIndex: 29,
    guideUrl: 'https://keyversegames.com/guides/macos-finder-and-window-management.html'
  },
  {
    gamePath: 'games/v1g3-productivity-boosters.html',
    title: 'Safari & Browser Speed Challenge',
    shortcut: '⌘ + Shift + T / ⌘ + L',
    cardIndex: 19,
    guideUrl: 'https://keyversegames.com/guides/safari-and-browser-productivity-shortcuts.html'
  },
  {
    gamePath: 'games/v4g1-text-editing.html',
    title: 'Text Editing & Terminal Speed Challenge',
    shortcut: 'Option + Left / Right Arrow',
    cardIndex: 17,
    guideUrl: 'https://keyversegames.com/guides/text-editing-and-terminal-essentials.html'
  },
  {
    gamePath: 'games/v1g2-daily-driver.html',
    title: 'Windows-to-Mac Switcher Challenge',
    shortcut: 'Option + ⌘ + Esc / ⌘ + `',
    cardIndex: 5,
    guideUrl: 'https://keyversegames.com/guides/windows-to-mac-shortcut-switchers-guide.html'
  }
];

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSuggestedReply(postText) {
  const lower = postText.toLowerCase();
  if (lower.includes('cmd-k') || lower.includes('command+k') || lower.includes('smb') || lower.includes('nfs') || lower.includes('finder')) {
    return 'Nice tip! In macOS Finder, Command (⌘) + K also opens Connect to Server for smb:// or nfs:// shares. We built a quick interactive ⌘+K simulator if anyone wants to practice it: https://keyversegames.com/guides/macos-finder-and-window-management.html';
  }
  if (lower.includes('windows') || lower.includes('switch')) {
    return 'If you are switching from Windows to Mac, the biggest unlock is resting your thumb on Command (⌘) instead of reaching for Ctrl. Here is a side-by-side Windows-to-Mac shortcut map if helpful: https://keyversegames.com/guides/windows-to-mac-shortcut-switchers-guide.html';
  }
  if (lower.includes('safari') || lower.includes('browser') || lower.includes('tab')) {
    return 'Great shortcut! Command (⌘) + Shift + T to reopen closed tabs and Command (⌘) + L to jump to the URL bar save so much trackpad travel. You can drill them in 2 minutes at https://keyversegames.com/guides/safari-and-browser-productivity-shortcuts.html';
  }
  return 'Love seeing Mac keyboard tips in the wild! Muscle memory beats cheat sheets every time—if you want a quick 2-minute browser drill to lock these in, check out https://keyversegames.com/';
}

async function searchBluesky(query) {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=${encodeURIComponent(query)}&limit=8`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const posts = Array.isArray(data.posts) ? data.posts : [];
    return posts.map((p) => {
      const handle = p.author?.handle || 'user.bsky.social';
      const rkey = (p.uri || '').split('/').pop() || '';
      const text = (p.record?.text || '').replace(/\s+/g, ' ').trim();
      return {
        platform: 'Bluesky',
        author: `@${handle}`,
        text,
        url: `https://bsky.app/profile/${handle}/post/${rkey}`,
        createdAt: p.record?.createdAt || p.indexedAt || ''
      };
    }).filter((item) => item.text.length > 20);
  } catch (err) {
    console.warn(`[Bluesky Search] Query "${query}" failed:`, err.message);
    return [];
  }
}

async function searchMastodon(query) {
  const url = `https://mastodon.social/api/v2/search?q=${encodeURIComponent(query)}&type=statuses&limit=8`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const statuses = Array.isArray(data.statuses) ? data.statuses : [];
    return statuses.map((s) => {
      const text = stripHtml(s.content);
      return {
        platform: 'Mastodon',
        author: `@${s.account?.acct || 'user'}`,
        text,
        url: s.url || '',
        createdAt: s.created_at || ''
      };
    }).filter((item) => item.url && item.text.length > 20);
  } catch (err) {
    console.warn(`[Mastodon Search] Query "${query}" failed:`, err.message);
    return [];
  }
}

async function collectTopConversations() {
  const results = await Promise.all(
    SEARCH_QUERIES.flatMap((q) => [searchBluesky(q), searchMastodon(q)])
  );

  const seenUrls = new Set();
  const merged = [];
  for (const list of results) {
    for (const item of list) {
      if (!seenUrls.has(item.url) && !item.author.includes('keyverse')) {
        seenUrls.add(item.url);
        merged.push(item);
      }
    }
  }

  merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  return merged.slice(0, 3);
}

async function sendDiscordRadarDigest(conversations, dateStr) {
  const webhookUrl = (process.env.DISCORD_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    console.log('[Discord Radar] Notice: DISCORD_WEBHOOK_URL secret not configured. Skipping Discord digest.');
    return;
  }

  const fields = conversations.length > 0
    ? conversations.map((c, idx) => ({
        name: `${idx + 1}. [${c.platform}] ${c.author}`,
        value: `**Post:** ${c.text.slice(0, 180)}${c.text.length > 180 ? '…' : ''}\n**Link:** ${c.url}\n**Suggested Reply:** ${buildSuggestedReply(c.text)}`
      }))
    : [{
        name: 'No fresh matches today',
        value: 'No new public Bluesky/Mastodon posts matched today’s search queries. Try checking #MacTips manually.'
      }];

  const payload = {
    username: 'Keyverse Growth Radar',
    content: `📡 **Daily Mac Community Radar (${dateStr})** — Top ${conversations.length} conversations to join manually:`,
    embeds: [
      {
        title: 'Fresh Mac Shortcut & #MacTips Conversations',
        color: 1299120, // #13f2b0 Keyverse Mint
        fields,
        footer: { text: 'Keyverse Growth Radar • Human-in-the-Loop Outreach (Zero Spam)' },
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
      console.log(`✅ [Discord Radar] Sent digest with ${conversations.length} conversations.`);
    } else {
      console.error(`❌ [Discord Radar] Webhook returned ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('❌ [Discord Radar] Failed to send digest:', err.message);
  }
}

async function sendFridayChallengeSpotlight(now) {
  const isFriday = now.getUTCDay() === 5;
  const forceSpotlight = process.env.FORCE_SPOTLIGHT === 'true';
  if (!isFriday && !forceSpotlight) {
    console.log('[Friday Spotlight] Today is not Friday (UTC). Skipping weekly challenge spotlight.');
    return;
  }

  const webhookUrl = (process.env.MULTI_SOCIAL_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    console.log('[Friday Spotlight] Notice: MULTI_SOCIAL_WEBHOOK_URL not configured. Skipping spotlight.');
    return;
  }

  const weekNum = Math.ceil(((now - new Date(Date.UTC(now.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7);
  const pick = WEEKLY_CHALLENGES[(weekNum - 1) % WEEKLY_CHALLENGES.length];
  const challengeUrl = `https://keyversegames.com/${pick.gamePath}?challenge_score=1500&utm_source=social_auto&utm_medium=friday_spotlight&utm_campaign=challenge_w${weekNum}`;
  const imageUrl = `https://keyversegames.com/social-cards/tip-${pick.cardIndex}.png`;

  const caption = [
    `⚔️ Friday Mac Shortcut Challenge (Week ${weekNum}): ${pick.title}!`,
    ``,
    `Can you beat 1,500 points on ${pick.shortcut}?`,
    `🎮 Play the live browser challenge (free, no download):`,
    `${challengeUrl}`,
    ``,
    `📖 Need a quick refresher first? Read the guide: ${pick.guideUrl}`,
    ``,
    `#MacShortcuts #macOS #AppleTips #Productivity #KeyverseGames`
  ].join('\n');

  const payload = {
    type: 'weekly_challenge_spotlight',
    date: now.toISOString().split('T')[0],
    week: weekNum,
    shortcut: pick.shortcut,
    title: pick.title,
    challengeScore: 1500,
    trackedUrl: challengeUrl,
    guideUrl: pick.guideUrl,
    imageUrl,
    caption
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      console.log(`✅ [Friday Spotlight] Dispatched Week ${weekNum} challenge (${pick.title}) to Make.com!`);
    } else {
      console.error(`❌ [Friday Spotlight] Webhook returned ${res.status}: ${await res.text()}`);
    }
  } catch (err) {
    console.error('❌ [Friday Spotlight] Failed to dispatch spotlight:', err.message);
  }
}

async function main() {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  console.log(`========================================`);
  console.log(`Keyverse Daily Growth Radar`);
  console.log(`Date: ${now.toISOString()}`);
  console.log(`========================================\n`);

  const conversations = await collectTopConversations();
  console.log(`Found ${conversations.length} top public Mac conversations.`);

  await Promise.allSettled([
    sendDiscordRadarDigest(conversations, dateStr),
    sendFridayChallengeSpotlight(now)
  ]);

  console.log('\nDaily growth radar run finished.');
}

main().catch((err) => {
  console.error('Fatal error in daily growth radar:', err);
  process.exit(1);
});
