/**
 * Keyverse Daily Social Media Tip Poster
 *
 * Runs automatically via GitHub Actions (or manually via workflow_dispatch/node).
 * Selects a rotating Mac Shortcut Tip of the Day and posts to:
 * 1. Discord (via incoming webhook)
 * 2. Bluesky (via AT Protocol com.atproto.server.createSession + com.atproto.repo.createRecord)
 *
 * Requirements:
 * - Node 20+ (uses native global fetch, no external dependencies)
 * - Environment variables:
 *   - DISCORD_WEBHOOK_URL (optional, skips if missing)
 *   - BLUESKY_HANDLE (optional, skips if missing)
 *   - BLUESKY_APP_PASSWORD (optional, skips if missing)
 */

const MAC_SHORTCUT_TIPS = [
  {
    keys: '⌘ + Space',
    title: 'Spotlight Quick Launcher & Calculator',
    category: 'Navigation & Search',
    desc: 'Stop hunting through folders or clicking menus. Press ⌘ + Space to launch apps, locate files, perform instant calculations like "125 * 1.15", or convert currencies on the fly.'
  },
  {
    keys: '⌘ + Tab',
    title: 'Instant Application Switcher',
    category: 'Window & App Control',
    desc: 'Cycle through running apps effortlessly. Hold ⌘ and tap Tab to move forward (or ` for backward). While holding ⌘, tap Q to quit the highlighted app or H to hide it.'
  },
  {
    keys: '⌘ + Shift + 4, then Space',
    title: 'Pixel-Perfect Window Screenshot',
    category: 'Productivity & Screen Capture',
    desc: 'Press ⌘ + Shift + 4, tap Spacebar, and hover over any open window or menu. Click to capture a crisp screenshot with a clean Apple drop shadow.'
  },
  {
    keys: '⌘ + Shift + 5',
    title: 'Screen Recording & Capture HUD',
    category: 'Productivity & Screen Capture',
    desc: 'Summon the unified capture control bar. Record entire displays, selected portions, capture windows, and configure countdown timers or save locations with a single shortcut.'
  },
  {
    keys: '⌥ + ⌘ + Esc',
    title: 'Force Quit Frozen Applications',
    category: 'System Control',
    desc: 'When an app locks up with the spinning pinwheel, press Option + Command + Esc to open the Force Quit dialog and terminate it immediately without rebooting.'
  },
  {
    keys: '⌘ + W vs ⌘ + Q',
    title: 'Closing Windows vs Quitting Apps',
    category: 'App Management',
    desc: '⌘ + W closes only the active tab or document window. ⌘ + Q completely quits the application process and frees up system memory.'
  },
  {
    keys: '⌥ + ⌘ + C and ⌥ + ⌘ + V',
    title: 'Copy & Paste Text Formatting / Style',
    category: 'Text & Typography',
    desc: 'Copy styling (font family, weight, color, margins) from highlighted text in Pages, Keynote, TextEdit, or Mail with ⌥⌘C, then apply it onto target text with ⌥⌘V.'
  },
  {
    keys: '⌃ + ⌘ + Space',
    title: 'Emoji & Symbol Viewer',
    category: 'Text Editing',
    desc: 'Open macOS’s full Character Viewer palette anywhere you can type. Search emojis, Greek symbols, math operators, accents, and custom unicode symbols with ease.'
  },
  {
    keys: '⌘ + ⌥ + D',
    title: 'Quickly Toggle the Dock',
    category: 'Desktop & Workspace',
    desc: 'Instantly toggle hiding and showing the macOS Dock to reclaim vertical workspace on smaller MacBook laptop displays.'
  },
  {
    keys: '⌃ + ⌘ + Q',
    title: 'Lock Screen Instantly',
    category: 'Privacy & Security',
    desc: 'Stepping away from your Mac? Press Control + Command + Q to lock your screen immediately without putting your computer to sleep or losing active tasks.'
  },
  {
    keys: '⌘ + Shift + .',
    title: 'Toggle Hidden Files & Dotfiles',
    category: 'Finder Mastery',
    desc: 'Need to inspect .env, .git, or hidden system files? Press ⌘ + Shift + . (Period) inside Finder or Open/Save dialogs to toggle invisible files on and off.'
  },
  {
    keys: '⌘ + Shift + G',
    title: 'Finder "Go to Folder" Path Jump',
    category: 'Finder Mastery',
    desc: 'Jump directly to UNIX directories like ~/Library, /usr/local, or /etc in Finder. Supports full shell tab-completion and tilde user shortcuts.'
  },
  {
    keys: '⌥ + Delete',
    title: 'Delete Entire Word Backwards',
    category: 'Text Editing Speed',
    desc: 'Stop tapping Backspace multiple times. Option + Delete removes the entire preceding word in one swift stroke across all Mac apps and browsers.'
  },
  {
    keys: '⌘ + Delete',
    title: 'Delete Entire Line to Beginning',
    category: 'Text Editing Speed',
    desc: 'Wipe out everything from your cursor to the beginning of the line instantly. Perfect for resetting command line prompts or retyping sentences.'
  },
  {
    keys: 'Fn + Delete (or ⌃ + D)',
    title: 'Forward Delete on Mac Keyboards',
    category: 'Text Editing Speed',
    desc: 'MacBook keyboards lack a dedicated Del key. Hold Fn and press Delete (or press Control + D) to delete characters to the right of the cursor.'
  },
  {
    keys: '⌘ + Up / Down Arrow',
    title: 'Jump to Top or Bottom of Page',
    category: 'Navigation',
    desc: 'Navigate long documents, codebases, or web pages in an instant. ⌘ + Up arrow jumps to the top; ⌘ + Down arrow jumps to the bottom.'
  },
  {
    keys: '⌥ + Left / Right Arrow',
    title: 'Navigate Word by Word',
    category: 'Text Editing Speed',
    desc: 'Hold Option and press Left or Right arrow to jump your cursor across words rather than single letters. Combine with Shift to highlight word-by-word.'
  },
  {
    keys: 'Spacebar in Finder',
    title: 'Quick Look Preview',
    category: 'Finder Mastery',
    desc: 'Highlight any PDF, photo, video, or code file and tap Spacebar for an instant high-resolution preview without launching heavy desktop apps.'
  },
  {
    keys: '⌘ + Shift + T',
    title: 'Reopen Closed Browser Tab',
    category: 'Web Browsing',
    desc: 'Accidentally closed an essential tab? ⌘ + Shift + T restores your last closed tab in Safari, Chrome, Edge, and Arc, retaining your browsing history.'
  },
  {
    keys: '⌘ + ⌥ + I',
    title: 'Open Web Developer Tools',
    category: 'Developer & Power User',
    desc: 'Inspect webpage elements, view JavaScript console output, and diagnose network requests with ⌘ + Option + I in all major macOS web browsers.'
  },
  {
    keys: '⌘ + 1 / 2 / 3 / 4 in Finder',
    title: 'Switch Finder Views in Seconds',
    category: 'Finder Mastery',
    desc: 'Toggle Finder layout modes instantly: ⌘1 for Icon view, ⌘2 for List view, ⌘3 for Column view (the power user favorite), and ⌘4 for Gallery view.'
  },
  {
    keys: '⌘ + ⌥ + V in Finder',
    title: 'Move File (Cut & Paste Equivalent)',
    category: 'Finder Mastery',
    desc: 'Mac has no "Cut" shortcut for files, but it has something better: copy the file with ⌘C, navigate to the target folder, and press ⌥⌘V to move it there.'
  },
  {
    keys: '⌥ + Drag',
    title: 'Hold Option to Duplicate Anything',
    category: 'Productivity & Design',
    desc: 'Hold the Option key while dragging files in Finder, shapes in Figma/Keynote, or notes in Apple Notes to create a duplicate copy at the drop location.'
  },
  {
    keys: '⌘ + [ and ⌘ + ]',
    title: 'Back and Forward Navigation',
    category: 'Navigation',
    desc: 'Go backward and forward across pages in Safari, Finder folder hierarchies, Xcode, and many native macOS apps without reaching for toolbar arrows.'
  },
  {
    keys: '⌃ + Down Arrow',
    title: 'App Exposé (All Windows of Current App)',
    category: 'Window Management',
    desc: 'Have 6 Finder or browser windows open simultaneously? Control + Down Arrow tiles only the windows of the currently active app for quick selection.'
  },
  {
    keys: '⌘ + H and ⌘ + ⌥ + H',
    title: 'Hide Window & Hide Others',
    category: 'Window Management',
    desc: '⌘ + H hides the active app instantly. ⌘ + Option + H hides every other app on your screen, instantly creating a distraction-free focused workspace.'
  },
  {
    keys: '⌃ + ⌘ + F',
    title: 'Toggle Full Screen Mode',
    category: 'Window Management',
    desc: 'Expand your active window to a dedicated macOS full-screen Space with ⌃⌘F. Press it again to return cleanly to your desktop layout.'
  },
  {
    keys: '⌘ + Shift + N',
    title: 'Create New Folder in Finder',
    category: 'Finder Mastery',
    desc: 'Create and name a new folder in your current Finder window instantly without touching the mouse or context menus.'
  },
  {
    keys: '⌘ + K in Finder',
    title: 'Connect to Network Server',
    category: 'Network & System',
    desc: 'Open the Connect to Server dialog to mount SMB, AFP, or NFS network drives, NAS boxes, and shared office storage volumes.'
  },
  {
    keys: '⌥ + Shift + Volume / Brightness',
    title: 'Fine-Grained Audio & Display Adjustments',
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

async function postToDiscord(tip, targetUrl, dayOfYear) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl || !webhookUrl.trim()) {
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

async function postToBluesky(tip, targetUrl) {
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

    // 2. Prepare Post Text & Facets
    const postText = `💡 Mac Shortcut of the Day: ${tip.title}\n\nKeys: ${tip.keys}\n\n${tip.desc}\n\n🎮 Practice and build muscle memory for Mac shortcuts:\n${targetUrl}`;

    // Calculate byte indices for the link facet
    const beforeUrl = postText.slice(0, postText.indexOf(targetUrl));
    const byteStart = Buffer.byteLength(beforeUrl, 'utf8');
    const byteEnd = byteStart + Buffer.byteLength(targetUrl, 'utf8');

    const recordPayload = {
      repo: session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type: 'app.bsky.feed.post',
        text: postText,
        createdAt: new Date().toISOString(),
        facets: [
          {
            index: {
              byteStart,
              byteEnd
            },
            features: [
              {
                $type: 'app.bsky.richtext.facet#link',
                uri: targetUrl
              }
            ]
          }
        ],
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

async function main() {
  const now = new Date();
  const dayOfYear = getDayOfYear(now);
  const tipIndex = (dayOfYear - 1) % MAC_SHORTCUT_TIPS.length;
  const tip = MAC_SHORTCUT_TIPS[tipIndex];

  const targetUrl = `https://keyversegames.com/?utm_source=social_auto&utm_medium=daily_tip&utm_campaign=tip_${dayOfYear}`;

  console.log(`========================================`);
  console.log(`Keyverse Social Promo Poster`);
  console.log(`Date: ${now.toISOString()}`);
  console.log(`Day of Year: ${dayOfYear}`);
  console.log(`Tip #${tipIndex + 1}/${MAC_SHORTCUT_TIPS.length}: ${tip.title} (${tip.keys})`);
  console.log(`Target URL: ${targetUrl}`);
  console.log(`========================================\n`);

  // Execute posts in parallel
  await Promise.allSettled([
    postToDiscord(tip, targetUrl, dayOfYear),
    postToBluesky(tip, targetUrl)
  ]);

  console.log('\nDaily promo posting run finished.');
}

main().catch((err) => {
  console.error('Fatal error in social promo poster:', err);
  process.exit(1);
});
