/**
 * Keyverse Daily Mac Community Growth Radar & Weekly Challenge Spotlight
 *
 * Runs automatically via GitHub Actions at 16:00 UTC daily (or manually via workflow_dispatch).
 * 100% READ-ONLY & BAN-PROOF: Never auto-replies to strangers.
 * 1. Searches public Bluesky, Mastodon, Reddit (r/mac, r/MacOS, r/productivity), and Hacker News (Algolia)
 *    for fresh questions about "Mac shortcuts", "keyboard shortcuts", "macOS tips", "#MacTips", and "Command+K".
 * 2. Ranks and picks the top 3–5 highest-relevance conversations and posts direct links + a natural,
 *    helpful, non-salesy human reply draft to DISCORD_WEBHOOK_URL.
 * 3. Every Friday (UTC day 5, or when FORCE_SPOTLIGHT=true), posts a playable Weekly Shortcut Challenge Spotlight
 *    (?challenge_score=1500 + UTM tags) to MULTI_SOCIAL_WEBHOOK_URL for Instagram + Facebook.
 *
 * Zero external dependencies — requires Node 20+.
 */

const SOCIAL_QUERIES = ['Mac shortcuts', '#MacTips', 'Command+K'];
const COMMUNITY_QUERIES = ['Mac shortcuts', 'keyboard shortcuts', 'macOS tips'];
const REDDIT_SUBREDDITS = ['mac', 'MacOS', 'productivity'];

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
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSuggestedReply(postText) {
  const lower = postText.toLowerCase();
  if (lower.includes('cmd-k') || lower.includes('command+k') || lower.includes('smb') || lower.includes('nfs') || lower.includes('finder')) {
    return 'In macOS Finder, Command (⌘) + Shift + G jumps straight to any folder path (like ~/Library), and Command (⌘) + K opens Connect to Server for smb:// or nfs:// shares. If you ever want to drill Finder shortcuts interactively, there is a free browser trainer + ⌘+K sim at https://keyversegames.com/guides/macos-finder-and-window-management.html';
  }
  if (lower.includes('windows') || lower.includes('switch') || lower.includes('ctrl')) {
    return 'Coming from Windows, the biggest unlock is resting your thumb on Command (⌘) next to the Spacebar instead of reaching for Ctrl with your pinky—⌘+C/V/Z work just like Ctrl, ⌘+Space opens Spotlight, and ⌘+` cycles windows within the same app. This side-by-side Windows-to-Mac map is handy if you are adjusting: https://keyversegames.com/guides/windows-to-mac-shortcut-switchers-guide.html';
  }
  if (lower.includes('safari') || lower.includes('browser') || lower.includes('tab')) {
    return 'Two huge time-savers on Mac browsers: Command (⌘) + Shift + T reopens your last closed tab, and Command (⌘) + L highlights the address bar immediately so you never need the trackpad. You can also practice those in a quick 2-minute drill at https://keyversegames.com/guides/safari-and-browser-productivity-shortcuts.html';
  }
  if (lower.includes('text') || lower.includes('cursor') || lower.includes('word') || lower.includes('terminal')) {
    return 'Try Option (⌥) + Left/Right Arrow to jump word-by-word and Command (⌘) + Left/Right Arrow to snap to the start or end of a line (add Shift to select as you go). Works across Notes, Mail, Slack, and most editors. More cursor tricks here if useful: https://keyversegames.com/guides/text-editing-and-terminal-essentials.html';
  }
  if (lower.includes('window') || lower.includes('hide') || lower.includes('quit') || lower.includes('close')) {
    return 'On Mac, ⌘+W closes just the current window/tab, ⌘+H hides the app cleanly, and ⌘+Q quits it completely—plus ⌘+Option+M minimizes all windows of the front app. If you want to build muscle memory without a cheat sheet, Keyverse has free browser drills at https://keyversegames.com/';
  }
  return 'The fastest way to lock in Mac shortcuts is starting with just 4–5 high-frequency ones (⌘+Space for Spotlight, ⌘+Tab to switch apps, ⌘+W to close a tab, Option+Left/Right to jump words) until your thumb hits ⌘ automatically. If you want a quick interactive drill to practice them, https://keyversegames.com/ is free in the browser.';
}

function scoreConversation(item) {
  const text = (item.text || '').toLowerCase();
  let score = 0;

  if (text.includes('?')) score += 25;
  if (/\b(how do i|how to|anyone know|best way|tips|help|recommend|switch|new to mac)\b/.test(text)) score += 20;
  if (text.includes('mac shortcut') || text.includes('keyboard shortcut') || text.includes('macos')) score += 18;
  if (text.includes('command+k') || text.includes('cmd-k') || text.includes('finder') || text.includes('spotlight')) score += 12;

  const ageHours = item.createdAt ? Math.max(0, (Date.now() - new Date(item.createdAt).getTime()) / 3600000) : 168;
  if (ageHours <= 24) score += 25;
  else if (ageHours <= 72) score += 15;
  else if (ageHours <= 168) score += 6;

  return score;
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

function parseRedditRss(xml, subreddit) {
  const items = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/gi;
  let m;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/i);
    const linkMatch = block.match(/<link[^>]*href="([^"]+)"/i);
    const authorMatch = block.match(/<name>([\s\S]*?)<\/name>/i);
    const updatedMatch = block.match(/<updated>([\s\S]*?)<\/updated>/i);
    const contentMatch = block.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const title = stripHtml(titleMatch ? titleMatch[1] : '');
    const body = stripHtml(contentMatch ? contentMatch[1] : '');
    const text = [title, body].filter(Boolean).join(' — ');
    if (linkMatch && text.length > 20) {
      items.push({
        platform: `Reddit r/${subreddit}`,
        author: authorMatch ? authorMatch[1].trim() : 'redditor',
        text,
        url: linkMatch[1],
        createdAt: updatedMatch ? updatedMatch[1].trim() : ''
      });
    }
  }
  return items;
}

async function searchReddit(subreddit, query) {
  const headers = {
    Accept: 'application/json',
    'User-Agent': 'KeyverseGrowthRadar/1.0 (read-only community digest)'
  };
  const jsonUrl = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&t=week&limit=6`;
  try {
    const res = await fetch(jsonUrl, { headers });
    if (res.ok) {
      const data = await res.json();
      const children = data?.data?.children || [];
      return children.map((c) => {
        const d = c.data || {};
        const text = [d.title || '', d.selftext || ''].map((s) => s.replace(/\s+/g, ' ').trim()).filter(Boolean).join(' — ');
        return {
          platform: `Reddit r/${subreddit}`,
          author: d.author ? `u/${d.author}` : 'redditor',
          text,
          url: d.permalink ? `https://www.reddit.com${d.permalink}` : '',
          createdAt: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : ''
        };
      }).filter((item) => item.url && item.text.length > 20);
    }

    // Fallback to public RSS feed if JSON endpoint is rate-limited
    const rssUrl = `https://www.reddit.com/r/${subreddit}/search.rss?q=${encodeURIComponent(query)}&restrict_sr=1&sort=new&t=week`;
    const rssRes = await fetch(rssUrl, { headers: { 'User-Agent': headers['User-Agent'] } });
    if (!rssRes.ok) return [];
    const xml = await rssRes.text();
    return parseRedditRss(xml, subreddit);
  } catch (err) {
    console.warn(`[Reddit Search] r/${subreddit} "${query}" failed:`, err.message);
    return [];
  }
}

async function searchHackerNews(query) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(query)}&tags=(story,ask_hn,comment)&hitsPerPage=8`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    const hits = Array.isArray(data.hits) ? data.hits : [];
    return hits.map((h) => {
      const rawText = h.title || h.story_title || '';
      const comment = stripHtml(h.comment_text || h.story_text || '');
      const text = [rawText, comment].filter(Boolean).join(' — ');
      const itemId = h.objectID || h.story_id;
      return {
        platform: 'Hacker News',
        author: h.author || 'hn_user',
        text,
        url: itemId ? `https://news.ycombinator.com/item?id=${itemId}` : '',
        createdAt: h.created_at || ''
      };
    }).filter((item) => item.url && item.text.length > 25);
  } catch (err) {
    console.warn(`[HN Search] Query "${query}" failed:`, err.message);
    return [];
  }
}

async function collectTopConversations() {
  const tasks = [
    ...SOCIAL_QUERIES.flatMap((q) => [searchBluesky(q), searchMastodon(q)]),
    ...COMMUNITY_QUERIES.flatMap((q) => [
      searchHackerNews(q),
      ...REDDIT_SUBREDDITS.map((sub) => searchReddit(sub, q))
    ])
  ];

  const results = await Promise.all(tasks);
  const seenUrls = new Set();
  const merged = [];

  for (const list of results) {
    for (const item of list) {
      if (!seenUrls.has(item.url) && !item.author.toLowerCase().includes('keyverse')) {
        seenUrls.add(item.url);
        item.relevance = scoreConversation(item);
        merged.push(item);
      }
    }
  }

  merged.sort((a, b) => (b.relevance - a.relevance) || (new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
  return merged.slice(0, 5);
}

async function sendDiscordRadarDigest(conversations, dateStr) {
  const webhookUrl = (process.env.DISCORD_WEBHOOK_URL || '').trim();
  if (!webhookUrl) {
    console.log('[Discord Radar] Notice: DISCORD_WEBHOOK_URL secret not configured. Skipping Discord digest.');
    return;
  }

  const fields = conversations.length > 0
    ? conversations.map((c, idx) => {
        const snippet = `${c.text.slice(0, 180)}${c.text.length > 180 ? '…' : ''}`;
        const reply = buildSuggestedReply(c.text);
        const value = `**Post:** ${snippet}\n**Link:** ${c.url}\n**Suggested Reply:** ${reply}`.slice(0, 1000);
        return {
          name: `${idx + 1}. [${c.platform}] ${c.author}`,
          value
        };
      })
    : [{
        name: 'No fresh matches today',
        value: 'No new public Bluesky, Mastodon, Reddit, or Hacker News posts matched today’s Mac shortcut queries.'
      }];

  const payload = {
    username: 'Keyverse Growth Radar',
    content: `📡 **Daily Mac Community Radar (${dateStr})** — Top ${conversations.length} conversations to join manually (100% read-only, zero auto-replies):`,
    embeds: [
      {
        title: 'Fresh Mac Shortcut & #MacTips Conversations',
        color: 1299120, // #13f2b0 Keyverse Mint
        fields,
        footer: { text: 'Keyverse Growth Radar • Bluesky + Mastodon + Reddit + HN (Human-in-the-Loop)' },
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
  const xTrackedUrl = 'https://keyversegames.com/?challenge_score=1500&utm_source=x&utm_medium=weekly_spotlight';
  const imageUrl = `https://keyversegames.com/social-cards/tip-${pick.cardIndex}.png`;

  const xCaptionBase = `⚔️ Friday Mac Challenge: Can you beat 1,500 pts on ${pick.shortcut}?\n\nPlay free: ${xTrackedUrl}\n#MacTips #macOS`;
  const xCaption = xCaptionBase.length <= 270 ? xCaptionBase : `${xCaptionBase.slice(0, 269)}…`;

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
    xTrackedUrl,
    xCaption,
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
