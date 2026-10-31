// scripts/build-game-guides.mjs
// Generates deep, crawlable educational guides (400-600+ words each) for all 10 Keyverse games.
import fs from 'fs';
import path from 'path';

const GAMES_DATA = {
  'v1g1-first-steps.html': {
    title: 'First Steps on Mac',
    volume: 'Volume 1 · Game 1',
    description: 'The fundamental keyboard shortcuts every macOS user needs for daily desktop navigation, application control, and clipboard management.',
    intro: `When switching to a Mac or setting up a new Apple computer, your immediate instinct is often to rely heavily on the trackpad or reach for the top menu bar. However, basic operations like copying, pasting, undoing edits, switching applications, and launching files account for more than 60% of all user input interactions. Mastering these foundational shortcuts builds the neurological baseline for all subsequent macOS speed and muscle memory.

On Apple keyboards, the Command (<kbd>⌘</kbd>) key is positioned directly under your thumb rather than your pinky finger. This architectural design distinction allows you to strike combinations without wrist deviation or lifting your hand from the home-row typing posture. By practicing these 22 core shortcuts until they become involuntary reflexes, you eliminate cumulative friction and save dozens of cumulative hours every working year.`,
    shortcuts: [
      { key: '⌘ Cmd + Space', action: 'Spotlight Search', context: 'Universal launcher for applications, files, calculations (e.g. "145 * 12"), and dictionary lookups without touching the mouse.' },
      { key: '⌘ Cmd + Z', action: 'Undo', context: 'Reverses the immediate prior action in text editors, graphic design software, and Finder file operations.' },
      { key: '⌘ Cmd + Left Arrow', action: 'Go Back', context: 'Navigates back to the preceding webpage in Safari or Chrome, or jumps to the parent folder in Finder.' },
      { key: '⌘ Cmd + O', action: 'Open File', context: 'Opens highlighted files or documents in their system default application.' },
      { key: '⇧ Shift + ⌘ Cmd + N', action: 'New Folder', context: 'Instantly generates an untitled directory in the active Finder window or on the Desktop.' },
      { key: '⌘ Cmd + C', action: 'Copy', context: 'Duplicates selected text, image assets, or files onto the macOS system clipboard.' },
      { key: '⌘ Cmd + V', action: 'Paste', context: 'Inserts clipboard contents into the active cursor position or target Finder folder.' },
      { key: '⌘ Cmd + X', action: 'Cut', context: 'Removes selected text or data and stages it on the clipboard for immediate relocation.' },
      { key: '⌘ Cmd + A', action: 'Select All', context: 'Selects every element, text string, or file inside the active document or folder.' },
      { key: '⌘ Cmd + Delete', action: 'Move to Trash', context: 'Instantly sends selected files or folders to the macOS Trash bin without dragging.' },
      { key: '⌘ Cmd + Tab', action: 'App Switcher', context: 'Cycles through running applications. Hold Command and tap Tab to move forward, or tap Q to quit the highlighted app.' },
      { key: '⌘ Cmd + W', action: 'Close Window', context: 'Closes the frontmost window or tab while allowing the background application process to stay open.' },
      { key: '⌘ Cmd + Q', action: 'Quit App', context: 'Completely terminates the application process and releases system memory.' },
      { key: '⌘ Cmd + M', action: 'Minimize Window', context: 'Shrinks active window down into the right-hand tray of the macOS Dock.' },
      { key: '⌥ Opt + ⌘ Cmd + Esc', action: 'Force Quit', context: 'Summons the Force Quit Applications dialog to terminate unresponsive software immediately.' },
      { key: '⌘ Cmd + S', action: 'Save Document', context: 'Commits current file changes to storage in text editors, IDEs, and office suites.' },
      { key: '⌘ Cmd + F', action: 'Find on Page', context: 'Summons search query input inside Safari, Notes, Word, and text documents.' },
      { key: '⌘ Cmd + B', action: 'Bold Text', context: 'Toggles bold typographic weight on highlighted characters.' },
      { key: '⌘ Cmd + R', action: 'Refresh / Reload', context: 'Reloads the current browser tab or updates the current Finder file directory.' },
      { key: '⇧ Shift + ⌘ Cmd + 3', action: 'Full Screenshot', context: 'Captures the entire screen display and saves a timestamped PNG image to the Desktop.' },
      { key: '⇧ Shift + ⌘ Cmd + 4', action: 'Region Screenshot', context: 'Turns the cursor into crosshairs to select a rectangular area, or tap Space to capture an entire window.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Q', action: 'Lock Screen', context: 'Immediately locks the Mac screen and requires password or Touch ID authentication to resume.' }
    ],
    workflows: `In everyday work, combining <kbd>⌘ Cmd</kbd> + <kbd>Space</kbd> with <kbd>⌘ Cmd</kbd> + <kbd>Tab</kbd> replaces the trackpad entirely when launching and switching between tasks. For example, instead of moving your hand to click on Spotlight or hunting through the Dock, a quick thumb tap on Command and Space lets you type three letters of an application name, hit Return to launch, and press <kbd>⌘ Cmd</kbd> + <kbd>Tab</kbd> to seamlessly toggle back to your active document.

When managing documents, keep your left thumb anchored on the Command key. Pressing <kbd>⌘ Cmd</kbd> + <kbd>S</kbd> after every key thought ensures your work is continuously committed, while <kbd>⌘ Cmd</kbd> + <kbd>Z</kbd> and <kbd>⌘ Cmd</kbd> + <kbd>A</kbd> give you complete editorial control over text blocks without breaking typing cadence.`,
    windowsMistakes: [
      'Reaching for the Control key with the pinky finger: On Windows, Control sits at the far bottom-left corner. On Mac, Command sits directly adjacent to the spacebar. Anchor with your thumb to eliminate pinky strain.',
      'Hitting Return to open a file: On Windows, Enter opens files. In macOS Finder, pressing Return renames the file; to open it, press Command + Down Arrow or Command + O.',
      'Clicking the red window traffic light to quit: On macOS, closing the window (Cmd+W) does not quit the application process. To quit completely, always use Command + Q.',
      'Using third-party tools for screenshots: macOS has professional screen-snapping built in. Shift+Cmd+4 followed by Spacebar takes a clean window capture with native drop shadows.'
    ],
    proTips: [
      'Thumb-Pivot Ergonomics: Rest your left thumb on the Command key and let your index and middle fingers strike letters (C, V, Z, Q, W). Your hand never has to twist or leave the home row.',
      'Spotlight Math & Conversions: Tap Cmd+Space and type expressions like "45 * 18" or "120 EUR in USD" for instant answers without opening a browser or calculator app.',
      'Quick Lock Security: Before stepping away from your desk in a shared office or coffee shop, tap Ctrl+Cmd+Q to secure your Mac in under half a second.'
    ]
  },

  'v1g2-daily-driver.html': {
    title: 'Daily Driver Shortcuts',
    volume: 'Volume 1 · Game 2',
    description: 'Power-user shortcuts for everyday macOS window wrangling, text formatting speed, Finder view switching, and screenshot clipboard relays.',
    intro: `Once you have memorized basic file opening and clipboard actions, the next productivity bottleneck is window and desktop clutter. In modern knowledge work, professionals juggle multiple browser tabs, code editors, reference PDFs, and communication channels simultaneously. Navigating between these overlapping windows with a trackpad wastes cognitive energy.

Volume 1 Game 2 focuses on "Daily Driver" workflows: switching between desktop Spaces, cycling windows within the same application, applying inline typographic styles, and controlling Finder layout views. These 25 shortcuts transform your macOS workstation into a seamless multi-pane command center.`,
    shortcuts: [
      { key: '⌃ Ctrl + ⌘ Cmd + F', action: 'Toggle Full Screen', context: 'Maximizes the front window into a dedicated macOS virtual Space without clicking the green traffic light.' },
      { key: '⌃ Ctrl + Up Arrow', action: 'Mission Control', context: 'Presents a bird\'s-eye view of every active window, grouped by application across all virtual desktops.' },
      { key: '⌃ Ctrl + Down Arrow', action: 'App Exposé', context: 'Tiles all open windows of the active foreground application for quick selection.' },
      { key: '⌃ Ctrl + Right Arrow', action: 'Next Desktop Space', context: 'Swipes seamlessly to the adjacent virtual desktop or full-screen app workspace.' },
      { key: '⌘ Cmd + `', action: 'Cycle App Windows', context: 'Cycles through all open windows of the active application without touching other programs.' },
      { key: '⌘ Cmd + B', action: 'Bold', context: 'Applies bold typography to selected text in rich-text editors, email, and word processors.' },
      { key: '⌘ Cmd + I', action: 'Italic', context: 'Applies italic slant to highlighted text.' },
      { key: '⌘ Cmd + U', action: 'Underline', context: 'Underlines selected text in documents and notes.' },
      { key: '⌥ Opt + Delete', action: 'Delete Previous Word', context: 'Erases the entire preceding word in one keystroke, replacing repeated Backspace tapping.' },
      { key: '⌘ Cmd + Delete', action: 'Delete to Line Start', context: 'Deletes all characters from current cursor insertion point back to the start of the line.' },
      { key: '⇧ Shift + ⌘ Cmd + Right Arrow', action: 'Select to Line End', context: 'Highlights all text from the cursor to the end of the line.' },
      { key: '⇧ Shift + ⌥ Opt + Right Arrow', action: 'Select Word Forward', context: 'Extends text selection forward one word at a time.' },
      { key: '⇧ Shift + ⌘ Cmd + Up Arrow', action: 'Select to Document Start', context: 'Highlights from current cursor location all the way up to the top of the file.' },
      { key: '⌘ Cmd + Up Arrow', action: 'Cursor to Document Top', context: 'Jumps the insertion point immediately to the beginning of the document.' },
      { key: '⌘ Cmd + Left Arrow', action: 'Cursor to Line Start', context: 'Snaps cursor to the beginning of the active line.' },
      { key: '⌘ Cmd + 1', action: 'Finder Icon View', context: 'Switches Finder folder display to large icon grid view.' },
      { key: '⌘ Cmd + 2', action: 'Finder List View', context: 'Switches Finder display to expandable hierarchical list view with sortable columns.' },
      { key: '⌘ Cmd + 3', action: 'Finder Column View', context: 'Switches Finder display to multi-tier Miller columns for intuitive parent-child folder browsing.' },
      { key: '⌘ Cmd + 4', action: 'Finder Gallery View', context: 'Switches Finder display to large preview gallery with metadata sidebar for photos and videos.' },
      { key: '⌥ Opt + ⌘ Cmd + V', action: 'Move / Cut-Paste File', context: 'Relocates a previously copied file to the current folder, removing the original without duplication.' },
      { key: '⌃ Ctrl + ⇧ Shift + ⌘ Cmd + 4', action: 'Region Snip to Clipboard', context: 'Snips selected screen area directly into clipboard memory without creating a Desktop file.' },
      { key: '⇧ Shift + ⌘ Cmd + 5', action: 'Screenshot Toolbar', context: 'Opens interactive screen capture toolbar for still frames, video recording, and timed captures.' },
      { key: '⇧ Shift + ⌘ Cmd + 6', action: 'Touch Bar Screenshot', context: 'Captures Touch Bar contents on supported MacBook Pro hardware.' },
      { key: '⇧ Shift + ⌘ Cmd + 4', action: 'Region Snip to File', context: 'Saves crosshair selected screen area as a PNG file on the Desktop.' },
      { key: '⌃ Ctrl + ⇧ Shift + ⌘ Cmd + 3', action: 'Full Screen to Clipboard', context: 'Captures full display directly into clipboard memory for immediate pasting into chat or email.' }
    ],
    workflows: `A core power-user technique is combining Finder's Column View (<kbd>⌘ Cmd</kbd> + <kbd>3</kbd>) with arrow-key navigation. By holding Command and tapping 3, you can navigate nested folder structures using only your Left and Right arrow keys, previewing files instantly with the Spacebar without ever spawning cluttering extra windows.

For writing and communications, combining <kbd>⌥ Opt</kbd> + <kbd>Delete</kbd> with <kbd>⌘ Cmd</kbd> + <kbd>Delete</kbd> dramatically speeds up drafting. When revising a sentence, instead of tapping backspace fifteen times, tapping Option+Delete cleanly removes bad words, keeping your mind focused on composition rather than editing mechanics.`,
    windowsMistakes: [
      'Trying to cut files with Cmd+X: On macOS, Cmd+X is intentionally disabled on files to prevent accidental deletion if you get distracted before pasting. Instead, copy with Cmd+C, navigate to the target folder, and press Option+Cmd+V to move it cleanly.',
      'Using Alt+Tab to cycle windows within the same app: On Windows, Alt+Tab mixes all windows together. On Mac, Cmd+Tab switches applications, while Cmd+\` (tilde) cycles exclusively through windows of the current app.',
      'Saving screenshots to the Desktop only to drag them into Slack: Adding the Control key (Ctrl+Shift+Cmd+4) copies the screen snip directly to your clipboard so you can paste it with Cmd+V instantly.'
    ],
    proTips: [
      'Instant Window Cleaning: If you have four Safari windows open and need to cycle between them, press Cmd+\` (the key right above Tab) to jump smoothly between them.',
      'Fast Screenshot to Clipboard: Memorize Ctrl+Shift+Cmd+4. It saves you from accumulating dozens of unwanted screenshot PNG files on your Desktop.',
      'Full Screen Space Toggle: Use Ctrl+Cmd+F to expand your active code editor or browser to a dedicated workspace, then swipe with Ctrl+Left/Right arrows.'
    ]
  },

  'v1g3-productivity-boosters.html': {
    title: 'Productivity Boosters',
    volume: 'Volume 1 · Game 3',
    description: 'High-speed browser tab control, Apple Mail triage, Quick Notes, hidden dotfile inspection, and Finder system productivity shortcuts.',
    intro: `When working across Safari, Mail, Apple Notes, and Finder, repetitive friction points like opening tabs, drafting replies, and inspecting system files add up to hundreds of wasted clicks daily. Volume 1 Game 3 drills the shortcuts that separate advanced macOS power users from casual trackpad clickers.

This curriculum focuses on fast web tab recovery, email triage shortcuts, global note capture from anywhere on your Mac, dictionary lookups, and developer utilities such as revealing hidden Unix dotfiles in Finder.`,
    shortcuts: [
      { key: '⌘ Cmd + T', action: 'New Browser Tab', context: 'Opens a new tab in Safari, Chrome, or Firefox.' },
      { key: '⌘ Cmd + W', action: 'Close Tab', context: 'Closes the current browser tab or document window.' },
      { key: '⇧ Shift + ⌘ Cmd + T', action: 'Reopen Closed Tab', context: 'Restores the most recently closed browser tab along with its complete back-forward history.' },
      { key: '⌘ Cmd + L', action: 'Highlight Address Bar', context: 'Jumps directly to the browser search/URL bar ready for typing.' },
      { key: '⌘ Cmd + R', action: 'Reload Page', context: 'Refreshes current webpage assets and layout.' },
      { key: '⌘ Cmd + N', action: 'New Email Message', context: 'Opens a new message composition window in Apple Mail.' },
      { key: '⇧ Shift + ⌘ Cmd + D', action: 'Send Email', context: 'Dispatches active composed email immediately without clicking the paper airplane icon.' },
      { key: '⇧ Shift + ⌘ Cmd + R', action: 'Reply to Sender', context: 'Initiates a reply email addressed to the original sender.' },
      { key: '⇧ Shift + ⌘ Cmd + F', action: 'Forward Email', context: 'Forwards active email conversation including attachments.' },
      { key: '⇧ Shift + ⌘ Cmd + J', action: 'Mark as Junk', context: 'Moves spam message to Junk folder and trains the macOS mail filter.' },
      { key: '⌘ Cmd + `', action: 'New Note', context: 'Creates a fresh note inside the Apple Notes application.' },
      { key: '⇧ Shift + ⌘ Cmd + L', action: 'Toggle Checklist', context: 'Converts selected lines into interactive checklist bubbles in Apple Notes.' },
      { key: '⌘ Cmd + K', action: 'Add Hyperlink', context: 'Embeds a web URL into highlighted text in Mail, Notes, and Pages.' },
      { key: 'Fn + Q', action: 'Global Quick Note', context: 'Summons a floating Quick Note scratchpad from any application in macOS.' },
      { key: '⇧ Shift + ⌘ Cmd + H', action: 'Format as Heading', context: 'Applies bold Heading typographic style in Apple Notes.' },
      { key: '⌃ Ctrl + ⌘ Cmd + D', action: 'Dictionary Lookup', context: 'Summons built-in macOS dictionary, thesaurus, and Wikipedia definition popover for the word under cursor.' },
      { key: '⌥ Opt + ⌘ Cmd + Space', action: 'Spotlight in Finder', context: 'Opens full-window Spotlight search in Finder with metadata filters.' },
      { key: '⌘ Cmd + E', action: 'Eject Disk', context: 'Safely unmounts and ejects selected external hard drive, USB stick, or DMG installer.' },
      { key: '⌘ Cmd + I', action: 'Get Info', context: 'Opens file inspector showing size, permissions, metadata, and default opening application.' },
      { key: '⌘ Cmd + R', action: 'Show Original / Package', context: 'Navigates to the original target of an alias or inspects application bundle packages.' },
      { key: '⇧ Shift + ⌘ Cmd + .', action: 'Toggle Hidden Dotfiles', context: 'Toggles visibility of invisible Unix configuration files (.git, .env, .zshrc) in Finder.' },
      { key: '⇧ Shift + ⌘ Cmd + Delete', action: 'Empty Trash', context: 'Empties macOS Trash bin with safety confirmation modal.' },
      { key: '⇧ Shift + ⌘ Cmd + Q', action: 'Log Out User', context: 'Initiates logout of current macOS session with prompt to save open documents.' },
      { key: '⌘ Cmd + N', action: 'New Finder Window', context: 'Opens a new file browser window.' },
      { key: '⌘ Cmd + R', action: 'Reveal Alias Source', context: 'Instantly reveals the real file location pointed to by an alias.' }
    ],
    workflows: `In Apple Mail, you can process incoming messages without ever touching the mouse. Tap <kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>R</kbd> to reply, type your response, and hit <kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>D</kbd> to dispatch it immediately. If a message is spam, <kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>J</kbd> sends it to Junk in one motion.

For developers and web creators, <kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>.</kbd> in Finder is essential. It instantly unhides hidden dotfiles like <code>.gitignore</code>, <code>.env</code>, and user configuration files without needing to open the Terminal and run defaults commands.`,
    windowsMistakes: [
      'Pressing F5 to refresh browser tabs: On Mac keyboards, F5 dims the keyboard backlight! Always use Command + R to reload web pages.',
      'Opening a browser tab just to look up a word definition: Hover your mouse over any word in macOS and tap Ctrl + Cmd + D for an instant dictionary popover.',
      'Clicking through File > New to make Quick Notes: Tapping Fn + Q pops up an instant note window regardless of what application you are currently running.'
    ],
    proTips: [
      'Reopen Closed Tab Magic: If you accidentally close an important web page, press Shift+Cmd+T to bring it back immediately with all form data intact.',
      'Send Email Faster: Shift+Cmd+D dispatches drafted emails in Mail instantly, keeping your hands on the keyboard.',
      'Instant Hidden File Toggle: Press Shift+Cmd+. in any Finder window or open/save dialog to reveal hidden developer files.'
    ]
  },

  'v1g4-accessibility-pro.html': {
    title: 'Accessibility Pro',
    volume: 'Volume 1 · Game 4',
    description: 'Fine quarter-step hardware adjustments, screen zoom, color inversion, full keyboard menu navigation, and macOS accessibility shortcuts.',
    intro: `macOS includes some of the world's most advanced accessibility and hardware-tuning technologies, but many users never discover them. Beyond assistive technology, accessibility shortcuts provide precision control over screen backlighting, audio fidelity, and keyboard-first system operation.

Volume 1 Game 4 trains precision hardware calibration: quarter-step volume and brightness adjustments, screen magnification zoom, full keyboard menu bar access (<kbd>⌃ Ctrl</kbd> + <kbd>F2</kbd>), and instant emoji and symbol palette access.`,
    shortcuts: [
      { key: 'F10', action: 'Mute Audio', context: 'Instantly silences system audio output.' },
      { key: 'F11', action: 'Volume Down', context: 'Lowers audio output by one standard increment.' },
      { key: 'F12', action: 'Volume Up', context: 'Increases audio output by one standard increment.' },
      { key: '⌥ Opt + ⇧ Shift + F11', action: 'Fine Volume Down', context: 'Decreases volume by one-quarter step (1/64th of full scale) for micro-adjustments with sensitive headphones.' },
      { key: '⌥ Opt + ⇧ Shift + F12', action: 'Fine Volume Up', context: 'Increases volume by one-quarter step for fine acoustic balancing.' },
      { key: 'F1', action: 'Brightness Down', context: 'Lowers screen backlight by one standard increment.' },
      { key: 'F2', action: 'Brightness Up', context: 'Increases screen backlight by one standard increment.' },
      { key: '⌥ Opt + ⇧ Shift + F1', action: 'Fine Brightness Down', context: 'Decreases screen brightness by one-quarter increment for comfortable low-light late-night viewing.' },
      { key: '⌃ Ctrl + F2', action: 'Focus Menu Bar', context: 'Moves keyboard focus to the Apple menu bar for 100% mouse-free navigation using arrow keys.' },
      { key: '⌃ Ctrl + F3', action: 'Focus Dock', context: 'Moves keyboard focus to the Dock for keyboard selection of applications.' },
      { key: '⌥ Opt + ⌘ Cmd + 8', action: 'Toggle Screen Zoom', context: 'Enables or disables hardware screen magnification.' },
      { key: '⌥ Opt + ⌘ Cmd + =', action: 'Zoom In', context: 'Magnifies screen viewport closer to cursor position.' },
      { key: '⌥ Opt + ⌘ Cmd + -', action: 'Zoom Out', context: 'Scales screen magnification back to standard level.' },
      { key: '⌃ Ctrl + ⌥ Opt + ⌘ Cmd + 8', action: 'Invert Colors', context: 'Inverts screen color palette to high-contrast dark mode to relieve ocular strain.' },
      { key: '⌥ Opt + ⌘ Cmd + F5', action: 'Accessibility Shortcuts', context: 'Summons Accessibility Shortcuts panel (VoiceOver, Zoom, Sticky Keys, Captions).' },
      { key: '⌃ Ctrl + ⌘ Cmd + Space', action: 'Character & Emoji Viewer', context: 'Summons full character picker with emojis, arrows, math symbols, and accents.' },
      { key: '⌥ Opt + ⌘ Cmd + C', action: 'Copy Style', context: 'Copies paragraph formatting, font size, and color without copying text characters.' },
      { key: '⌥ Opt + ⌘ Cmd + V', action: 'Paste Style', context: 'Applies copied typography styling to selected text block.' },
      { key: '⌥ Opt + ⌘ Cmd + T', action: 'Inspector / Format Toolbar', context: 'Shows or hides typography font attributes panel in Pages, TextEdit, and Keynote.' },
      { key: '⌘ Cmd + +', action: 'Increase Text Size', context: 'Increases font display size in browsers, mail, and text editors.' },
      { key: '⌃ Ctrl + Power', action: 'Power Options Dialog', context: 'Opens dialog with Restart, Sleep, Cancel, and Shut Down options.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Power', action: 'Force Restart', context: 'Instantly reboots computer without displaying save prompts.' },
      { key: '⌃ Ctrl + ⌥ Opt + ⌘ Cmd + Power', action: 'Safe Shut Down', context: 'Prompts to save open documents, quits applications, and powers off Mac.' },
      { key: '⌃ Ctrl + ⇧ Shift + Power', action: 'Sleep Displays Only', context: 'Darkens screen immediately while keeping audio playback and background processing running.' },
      { key: '⌥ Opt + ⇧ Shift + ⌘ Cmd + Q', action: 'Immediate Logout', context: 'Logs out active user account immediately without the 60-second confirmation prompt.' }
    ],
    workflows: `In quiet environments or during late-night work sessions, standard volume and brightness steps are often too aggressive. By holding <kbd>⌥ Opt</kbd> + <kbd>⇧ Shift</kbd> while tapping <kbd>F11</kbd> or <kbd>F1</kbd>, macOS subdivides each block on the on-screen indicator into four micro-steps, giving you 64 discrete levels for perfect low-light and headphone balance.

When your trackpad or mouse disconnects or runs out of battery, pressing <kbd>⌃ Ctrl</kbd> + <kbd>F2</kbd> moves full control to the Apple menu bar. You can traverse menus with arrow keys, type the first letter of any menu item, and press Return to trigger commands cleanly.`,
    windowsMistakes: [
      'Assuming Mac has no emoji picker: On Windows, Win + Period opens emojis. On Mac, press Control + Command + Space anywhere to summon the full Character Viewer.',
      'Clicking menu items when trackpad freezes: Tapping Ctrl + F2 focuses the top Apple menu bar for keyboard-only navigation.',
      'Struggling with blinding brightness steps at night: Hold Option + Shift while tapping brightness keys to adjust in quarter-increments.'
    ],
    proTips: [
      'Micro Volume Control: Hold Option+Shift while pressing volume keys for 64 precision levels instead of the standard 16.',
      'Copy Formatting Only: Press Option+Cmd+C to copy paragraph style and Option+Cmd+V to apply it elsewhere without retyping.',
      'Immediate Emergency Logout: Tap Option+Shift+Cmd+Q to log out immediately without waiting for the 60-second confirmation timer.'
    ]
  },

  'v2g1-system-control.html': {
    title: 'System Control & Power',
    volume: 'Volume 2 · Game 1',
    description: 'Hardware power management, immediate screen lock, option-key menu dialog bypasses, display sleep, and graceful kernel shutdowns.',
    intro: `Controlling your Mac's power states—sleeping, locking, rebooting, and shutting down—is one of the most critical security and hardware competencies. Relying on clicking through the Apple menu is slow and leaves your workstation exposed when stepping away.

Volume 2 Game 1 trains hardware mastery without menus. Learn the difference between locking your screen (<kbd>⌃ Ctrl</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>Q</kbd>), putting displays to sleep while keeping background rendering active (<kbd>⌃ Ctrl</kbd> + <kbd>⇧ Shift</kbd> + <kbd>Power</kbd>), and holding the Option key to bypass confirmation dialogs in the Apple menu.`,
    shortcuts: [
      { key: 'Power / Touch ID Tap', action: 'Screen Lock / Wake', context: 'Locks modern Touch ID Macs or wakes sleeping displays instantaneously.' },
      { key: 'Power Hold (5s)', action: 'Hardware Force Shutdown', context: 'Cuts hardware power to logic board during complete system lockups.' },
      { key: 'Power Hold (~1.5s)', action: 'Sleep System', context: 'Puts older non-Touch ID Mac keyboards into low-power sleep mode.' },
      { key: '⌥ Opt + ⌘ Cmd + Power', action: 'Modifier Sleep', context: 'Standard modifier shortcut to put Mac into full system sleep.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Q', action: 'Instant Screen Lock', context: 'Immediately locks display and requires password or Touch ID, leaving background processes running.' },
      { key: '⇧ Shift + ⌘ Cmd + Q', action: 'Log Out (with prompt)', context: 'Displays 60-second confirmation countdown to log out current user.' },
      { key: '⌥ Opt + ⇧ Shift + ⌘ Cmd + Q', action: 'Log Out (no prompt)', context: 'Immediately terminates user session and closes all applications without confirmation modal.' },
      { key: '⌃ Ctrl + Power', action: 'Power Dialog', context: 'Opens system dialog offering Restart, Sleep, Cancel, or Shut Down.' },
      { key: '⌃ Ctrl + ⇧ Shift + Power', action: 'Sleep Displays Only', context: 'Shuts down screen backlights immediately while audio playback, downloads, and rendering continue.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Power', action: 'Immediate Force Reboot', context: 'Forces immediate kernel reboot without prompting to save open documents.' },
      { key: '⌃ Ctrl + ⌥ Opt + ⌘ Cmd + Power', action: 'Graceful Shutdown', context: 'Prompts to save open documents, quits applications safely, and shuts down computer.' },
      { key: '⌃ Ctrl + ⌥ Opt + ⌘ Cmd + Eject', action: 'Shutdown via Eject', context: 'Performs graceful shutdown on older external Apple keyboards with Eject key.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Eject', action: 'Restart via Eject', context: 'Triggers immediate restart on keyboards equipped with Eject key.' },
      { key: '⌥ Opt + ⌘ Cmd + Eject', action: 'Sleep via Eject', context: 'Puts system to sleep on keyboards with Eject key.' },
      { key: '⌥ Opt + Click Apple Menu', action: 'Bypass Confirm Dialogs', context: 'Holding Option turns "Shut Down..." into "Shut Down" and "Log Out..." into "Log Out", skipping all prompts.' },
      { key: '⌃ Ctrl + F2, then Return', action: 'Open Apple Menu', context: 'Opens the Apple menu via keyboard without mouse interaction.' },
      { key: '⌥ Opt + ⌘ Cmd + Esc', action: 'Force Quit Manager', context: 'Opens Task Killer dialog to terminate stuck or spinning-beachball applications.' }
    ],
    workflows: `When running heavy background tasks like video rendering, compiling software, or downloading files, you don't want your Mac to enter deep system sleep, but you also don't want the screen burning power. Pressing <kbd>⌃ Ctrl</kbd> + <kbd>⇧ Shift</kbd> + <kbd>Power</kbd> puts the displays into energy-saving black mode while keeping CPU, GPU, and network processes running at full capacity.

For security when leaving your desk, tap <kbd>⌃ Ctrl</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>Q</kbd>. It locks your screen instantly without interrupting any background tasks, and waking takes a split-second touch on the Touch ID sensor.`,
    windowsMistakes: [
      'Looking for Ctrl+Alt+Delete: macOS does not use Ctrl+Alt+Del for task management. Press Option + Command + Escape to summon the Force Quit application manager.',
      'Closing the laptop lid during long exports: Closing the lid puts the Mac into sleep mode, halting downloads and renders. Use display sleep (Ctrl+Shift+Power) instead.',
      'Clicking through confirmation countdowns: Hold Option while clicking the Apple menu to restart or shut down without any confirmation modals.'
    ],
    proTips: [
      'Lock in 0.2 Seconds: Memorize Ctrl+Cmd+Q. It is the gold standard for office and coffee shop security.',
      'Display Sleep for Background Jobs: Ctrl+Shift+Power shuts off screens while podcast audio, backups, and file downloads continue uninterrupted.',
      'Option Menu Modifier: Holding Option in native macOS menus transforms commands into their direct, prompt-free power-user equivalents.'
    ]
  },

  'v2g2-window-wrangling.html': {
    title: 'Window Wrangling',
    volume: 'Volume 2 · Game 2',
    description: 'Multi-window navigation, hiding app clutter, Quick Look previews, universal settings shortcuts, and document workflow power.',
    intro: `Desktop chaos degrades productivity. When working across multiple applications, having dozens of overlapping windows creates visual noise and slows down focus. Most users waste significant time manually dragging window borders or minimizing windows to the Dock.

Volume 2 Game 2 covers "Window Wrangling": hiding background clutter with a single keystroke (<kbd>⌥ Opt</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>H</kbd>), cycling windows of the same application backward and forward, opening app settings universally (<kbd>⌘ Cmd</kbd> + <kbd>,</kbd>), and leveraging Quick Look previews.`,
    shortcuts: [
      { key: '⇧ Shift + ⌘ Cmd + Z', action: 'Redo', context: 'Re-applies the edit or action that was reversed by Undo.' },
      { key: '⌘ Cmd + G', action: 'Find Again (Next)', context: 'Advances cursor to the next occurrence of a search query in text or documents.' },
      { key: '⇧ Shift + ⌘ Cmd + G', action: 'Find Previous', context: 'Steps backward to the previous occurrence of a search query.' },
      { key: '⌥ Opt + ⌘ Cmd + F', action: 'Find and Replace', context: 'Jumps directly to the replacement input field in text editors and word processors.' },
      { key: '⌥ Opt + ⇧ Shift + ⌘ Cmd + V', action: 'Paste and Match Style', context: 'Strips external fonts, colors, and styling, pasting plain text that perfectly matches the destination paragraph.' },
      { key: '⌘ Cmd + H', action: 'Hide Front App', context: 'Hides all windows of active foreground application without quitting it.' },
      { key: '⌥ Opt + ⌘ Cmd + H', action: 'Hide Other Apps', context: 'Clears desktop clutter by hiding every application except the active front window.' },
      { key: '⌥ Opt + ⌘ Cmd + M', action: 'Minimize All Windows', context: 'Minimizes all windows of current application into the Dock.' },
      { key: '⌥ Opt + ⌘ Cmd + W', action: 'Close All Windows', context: 'Closes every open window of active app while leaving the application process running.' },
      { key: '⇧ Shift + ⌘ Cmd + `', action: 'Cycle Windows Backward', context: 'Cycles backward through open windows belonging to current application.' },
      { key: '⌘ Cmd + P', action: 'Print Document', context: 'Opens print dialog or export to PDF menu.' },
      { key: '⌘ Cmd + ,', action: 'Settings / Preferences', context: 'Universal shortcut across all macOS software to open application preferences.' },
      { key: '⇧ Shift + ⌘ Cmd + S', action: 'Save As / Duplicate', context: 'Duplicates file or opens Save As modal in document editors.' },
      { key: '⇧ Shift + ⌘ Cmd + P', action: 'Page Setup', context: 'Customizes paper dimensions, orientation, and print scaling.' },
      { key: '⌥ Opt + ⌘ Cmd + D', action: 'Toggle Dock Auto-Hide', context: 'Shows or hides macOS Dock to reclaim maximum screen real estate.' },
      { key: 'Spacebar', action: 'Quick Look Preview', context: 'Instantly previews highlighted files, images, PDFs, audio, and videos without opening applications.' },
      { key: '⌃ Ctrl + ⌘ Cmd + N', action: 'New Folder with Selection', context: 'Automatically creates a new folder containing all currently selected files.' },
      { key: '⌃ Ctrl + ⇧ Shift + ⌘ Cmd + T', action: 'Add to Dock / Favorites', context: 'Pins selected file or folder to the Dock or Finder sidebar favorites.' },
      { key: '⇧ Shift + ⌘ Cmd + C', action: 'Open Computer Window', context: 'Navigates Finder to top-level view showing all mounted storage drives and connected devices.' },
      { key: '⌥ Opt + ⌘ Cmd + L', action: 'Open Downloads Folder', context: 'Opens the user Downloads directory in Finder.' },
      { key: 'Fn + E', action: 'Emoji & Symbol Palette', context: 'Summons emoji and special character picker.' },
      { key: '⌘ Cmd + ;', action: 'Check Document Spelling', context: 'Finds and highlights the next misspelled word in active document.' },
      { key: '⌥ Opt + ⌘ Cmd + I', action: 'Inspector / Format Panel', context: 'Opens inspector attributes sidebar in Pages, Keynote, and Numbers.' },
      { key: '⌥ Opt + Click Menu Clock', action: 'Toggle Do Not Disturb', context: 'Mutes incoming notifications to enter distraction-free focus mode.' },
      { key: '⇧ Shift + ⌘ Cmd + /', action: 'Help Menu Command Search', context: 'Jumps directly to Help search field to locate and execute any menu command by typing.' }
    ],
    workflows: `One of the most satisfying shortcuts on Mac is <kbd>⌥ Opt</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>H</kbd> ("Hide Others"). When working in Photoshop, Xcode, or a writing document, pressing Option+Cmd+H instantly hides every other open app on your screen, giving you instant focus without closing your background tasks.

When preparing to share or email text, always use <kbd>⌥ Opt</kbd> + <kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>V</kbd> ("Paste and Match Style"). It cleanses foreign HTML, weird font sizes, and dark-mode background boxes, ensuring pasted text blends seamlessly into your destination document.`,
    windowsMistakes: [
      'Hunting for "Options" under Tools/Edit menus: In macOS, Command + Comma (<kbd>⌘,</kbd>) universally opens Settings in every application from Safari to Terminal.',
      'Opening files just to inspect their contents: On Mac, tapping Spacebar gives you an instant Quick Look preview of PDFs, images, spreadsheets, and video without launching heavy applications.',
      'Manually minimizing ten background windows: Press Option + Command + H to vanish all non-active windows in one millisecond.'
    ],
    proTips: [
      'Instant Search for Any Menu Action: Shift+Cmd+/ focuses the Help search bar. Type the name of any menu command (e.g., "Export") and press Return to trigger it without touching the mouse.',
      'Paste Without Formatting: Memorize Option+Shift+Cmd+V. It saves you from having to manually reset fonts and sizes when copying from web pages.',
      'New Folder with Selection: Highlight five files in Finder and press Ctrl+Cmd+N to bundle them into a clean folder instantly.'
    ]
  },

  'v3g1-finder-basics.html': {
    title: 'Finder Basics',
    volume: 'Volume 3 · Game 1',
    description: 'Core macOS Finder shortcuts: file duplication, directory location jumps, back/forward history navigation, and alias management.',
    intro: `The macOS Finder is your digital filing cabinet, but navigating folder hierarchies with mouse clicks is slow. Power users never click through drive trees; they use direct keyboard location jumps and directory navigation shortcuts.

Volume 3 Game 1 trains the core navigation bindings of Finder: duplicating files with <kbd>⌘ Cmd</kbd> + <kbd>D</kbd>, leaping directly to iCloud Drive, Network shares, Home, and Documents, navigating folder history with bracket keys, and managing aliases.`,
    shortcuts: [
      { key: '⌘ Cmd + D', action: 'Duplicate File', context: 'Creates an exact clone of the selected file with "copy" appended to filename.' },
      { key: '⇧ Shift + ⌘ Cmd + G', action: 'Go to Folder', context: 'Summons direct path input sheet to jump to hidden or deep Unix paths (e.g. ~/Library or /etc).' },
      { key: '⇧ Shift + ⌘ Cmd + H', action: 'Go to Home Folder', context: 'Opens user home directory (~/) in active Finder window.' },
      { key: '⇧ Shift + ⌘ Cmd + I', action: 'Open iCloud Drive', context: 'Jumps directly to cloud-synced documents and shared application data.' },
      { key: '⇧ Shift + ⌘ Cmd + K', action: 'Network Browser', context: 'Opens network window discovering local file servers, NAS drives, and shared Macs.' },
      { key: '⇧ Shift + ⌘ Cmd + O', action: 'Open Documents', context: 'Opens the user Documents directory.' },
      { key: '⇧ Shift + ⌘ Cmd + U', action: 'Open Utilities', context: 'Opens macOS Utilities folder containing Terminal, Activity Monitor, and Disk Utility.' },
      { key: '⌘ Cmd + [', action: 'Folder History Back', context: 'Traverses back to the preceding folder in navigation history.' },
      { key: '⌘ Cmd + ]', action: 'Folder History Forward', context: 'Traverses forward to the next folder in navigation history.' },
      { key: '⌘ Cmd + Down Arrow', action: 'Open Selected Item', context: 'Opens selected folder or launches highlighted document in default program.' },
      { key: '⌃ Ctrl + ⌘ Cmd + Up Arrow', action: 'Open Enclosing in New Window', context: 'Spawns a new Finder window focused on the parent directory.' },
      { key: '⌃ Ctrl + ⌘ Cmd + A', action: 'Create Alias', context: 'Generates a lightweight macOS symbolic link pointer to the original file.' },
      { key: '⌃ Ctrl + ⌘ Cmd + T', action: 'Add to Sidebar', context: 'Pins selected directory to Finder left sidebar under Favorites.' }
    ],
    workflows: `The single most powerful navigation feature in Finder is "Go to Folder" (<kbd>⇧ Shift</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>G</kbd>). When configuring developer tools or clearing application caches, pressing Shift+Cmd+G lets you type <code>~/Library/Application Support</code> or <code>/etc/hosts</code> with tab-completion, bypassing multiple nested folder clicks.

When moving through deeply nested project folders, use <kbd>⌘ Cmd</kbd> + <kbd>[</kbd> and <kbd>⌘ Cmd</kbd> + <kbd>]</kbd> to step backward and forward through your browsing path like web browser history.`,
    windowsMistakes: [
      'Clicking Enter to open folders: On Mac, pressing Enter/Return renames the folder. Press Command + Down Arrow to open folders or launch files.',
      'Clicking through user folders manually: Press Shift+Cmd+H to jump to Home, Shift+Cmd+O for Documents, and Shift+Cmd+I for iCloud Drive instantly.',
      'Creating redundant copies when an alias is needed: Press Ctrl+Cmd+A to make an alias that points to the original file without eating disk space.'
    ],
    proTips: [
      'The Go to Folder Shortcut: Press Shift+Cmd+G in any Finder window or open/save file dialog to jump directly to any Unix file path.',
      'Browser-Style Folder Back/Forward: Use Cmd+[ and Cmd+] to step through folder history instead of clicking breadcrumbs.',
      'Pin to Sidebar in One Tap: Highlight your current project folder and press Ctrl+Cmd+T to pin it to your Finder favorites list.'
    ]
  },

  'v3g2-finder-power.html': {
    title: 'Finder Power',
    volume: 'Volume 3 · Game 2',
    description: 'Finder power features: view options, path bars, status bars, smart folders, list-view tree expansion, and desktop Fn system toggles.',
    intro: `For power users who manage thousands of assets, raw folder browsing is insufficient. macOS Finder includes deep metadata tools, expandable tree views, and automated Smart Folders that can locate all files modified in the last 24 hours automatically.

Volume 3 Game 2 unlocks advanced Finder control: custom view options (<kbd>⌘ Cmd</kbd> + <kbd>J</kbd>), full-screen Quick Look slideshows, interactive breadcrumb path bars, immediate trash purges, list-view folder expansion with arrow keys, and keyboard toggles for Dock and Control Center.`,
    shortcuts: [
      { key: '⌘ Cmd + J', action: 'Show View Options', context: 'Customizes icon grid size, text label placement, column sorting, and default folder view settings.' },
      { key: '⌘ Cmd + Y', action: 'Quick Look Preview', context: 'Previews highlighted file without opening application (Spacebar equivalent).' },
      { key: '⌥ Opt + ⌘ Cmd + Y', action: 'Quick Look Slideshow', context: 'Launches full-screen slideshow of all selected photos, graphics, or document pages.' },
      { key: '⌘ Cmd + /', action: 'Toggle Status Bar', context: 'Displays bottom bar showing exact item count and remaining free disk gigabytes.' },
      { key: '⌥ Opt + ⌘ Cmd + P', action: 'Toggle Path Bar', context: 'Reveals interactive breadcrumb path bar along bottom edge of Finder window.' },
      { key: '⌥ Opt + ⌘ Cmd + S', action: 'Toggle Sidebar', context: 'Hides or reveals Finder left sidebar for clean minimalist view.' },
      { key: '⌥ Opt + ⌘ Cmd + N', action: 'New Smart Folder', context: 'Creates dynamic search folder that automatically updates based on file metadata rules.' },
      { key: '⌥ Opt + ⇧ Shift + ⌘ Cmd + Delete', action: 'Empty Trash Immediately', context: 'Bypasses confirmation dialog and permanently purges Trash contents immediately.' },
      { key: 'Right Arrow (→)', action: 'Expand Folder in List View', context: 'Expands folder disclosure triangle inline in List View without navigating away.' },
      { key: 'Left Arrow (←)', action: 'Collapse Folder in List View', context: 'Collapses folder tree in List View.' },
      { key: '⌘ Cmd + F', action: 'Finder Search', context: 'Opens search bar scoped to current folder or entire Mac with attribute filters.' },
      { key: '⌘ Cmd + I', action: 'Get Info', context: 'Displays file size, permissions, EXIF camera data, and default opening app.' },
      { key: '⌘ Cmd + N', action: 'New Finder Window', context: 'Opens fresh file browsing window.' },
      { key: 'Fn + A', action: 'Toggle Dock', context: 'Shows or hides Dock via Fn key.' },
      { key: 'Fn + C', action: 'Control Center', context: 'Toggles Control Center panel for Wi-Fi, Bluetooth, and audio outputs.' },
      { key: 'Fn + D', action: 'Start Dictation', context: 'Activates macOS speech-to-text voice dictation.' },
      { key: 'Fn + N', action: 'Notification Center', context: 'Slides out widgets and notification history.' },
      { key: 'Fn + H', action: 'Show Desktop', context: 'Clears all windows away to reveal Desktop files.' }
    ],
    workflows: `The interactive Path Bar (<kbd>⌥ Opt</kbd> + <kbd>⌘ Cmd</kbd> + <kbd>P</kbd>) is one of Finder's best-kept secrets. When enabled, it displays clickable breadcrumbs along the bottom of the window. You can drag files directly onto any parent folder in the breadcrumb path to relocate them without opening secondary windows!

In List View (<kbd>⌘ Cmd</kbd> + <kbd>2</kbd>), use the Right Arrow key to expand a folder inline. If you hold the <kbd>⌥ Option</kbd> key while pressing Right Arrow, Finder expands that folder and all nested subfolders simultaneously, giving you a full tree view of complex project directories.`,
    windowsMistakes: [
      'Opening folders just to see what subdirectories they contain: In List View, hit the Right Arrow key to expand folder trees inline without changing your active window.',
      'Dragging files into the Trash and confirming: Option + Shift + Command + Delete empties the Trash instantly without showing any confirmation modal.',
      'Guessing file sizes: Press Command + / to display the Status Bar, showing exact remaining SSD capacity at all times.'
    ],
    proTips: [
      'Interactive Breadcrumb Dragging: Enable the Path Bar with Option+Cmd+P and drop files directly onto intermediate parent folders in the breadcrumb line.',
      'Expand All Nested Subfolders: In List View, hold Option while tapping Right Arrow to expand an entire folder hierarchy in one stroke.',
      'Full-Screen Slideshow: Select 20 photos in Finder and press Option+Cmd+Y to launch an instant distraction-free full-screen presentation.'
    ]
  },

  'v4g1-text-editing.html': {
    title: 'Text Editing Navigation',
    volume: 'Volume 4 · Game 1',
    description: 'Precision cursor movement, word jumps, line boundaries, Page/Home/End keys, and built-in Unix/Emacs readline keybindings in macOS.',
    intro: `Touching the trackpad or mouse while writing or coding breaks cognitive flow. Every time your hand leaves the keyboard, your brain experiences micro-interruptions that slow down thought synthesis. macOS includes a sophisticated, deeply integrated text-editing engine that allows you to maneuver anywhere in a document with zero trackpad travel.

Because macOS is engineered on a Unix foundation, it includes both traditional GUI movement shortcuts (<kbd>⌘ Cmd</kbd> and <kbd>⌥ Opt</kbd> with arrows) and standard Readline/Emacs cursor controls (<kbd>⌃ Ctrl</kbd> + <kbd>A</kbd>, <kbd>E</kbd>, <kbd>K</kbd>, <kbd>O</kbd>). Volume 4 Game 1 drills these 25 essential cursor navigation bindings.`,
    shortcuts: [
      { key: 'Fn + Up Arrow', action: 'Page Up', context: 'Scrolls view up one full screen page without moving cursor insertion point.' },
      { key: 'Fn + Down Arrow', action: 'Page Down', context: 'Scrolls view down one full screen page.' },
      { key: 'Fn + Left Arrow', action: 'Home', context: 'Jumps viewport to the very top of document.' },
      { key: 'Fn + Shift + Up Arrow', action: 'Page Up with Selection', context: 'Extends text selection one full screen page upward.' },
      { key: 'Fn + Shift + Down Arrow', action: 'Page Down with Selection', context: 'Extends text selection one full screen page downward.' },
      { key: 'Fn + Right Arrow', action: 'End', context: 'Jumps viewport to the very end of document.' },
      { key: '⌘ Cmd + Right Arrow', action: 'End of Line', context: 'Snaps insertion cursor to the absolute end of current line.' },
      { key: '⌘ Cmd + Left Arrow', action: 'Beginning of Line', context: 'Snaps insertion cursor to the absolute beginning of current line.' },
      { key: '⌘ Cmd + Up Arrow', action: 'Top of Document', context: 'Moves cursor directly to the start of the entire document.' },
      { key: '⌘ Cmd + Down Arrow', action: 'End of Document', context: 'Moves cursor directly to the end of the entire document.' },
      { key: '⌥ Opt + Left Arrow', action: 'Previous Word', context: 'Leaps cursor backward to the beginning of the previous word.' },
      { key: '⌥ Opt + Right Arrow', action: 'Next Word', context: 'Leaps cursor forward to the end of the next word.' },
      { key: '⌥ Opt + ⇧ Shift + Left Arrow', action: 'Select Previous Word', context: 'Extends selection backward word by word.' },
      { key: '⌥ Opt + ⇧ Shift + Right Arrow', action: 'Select Next Word', context: 'Extends selection forward word by word.' },
      { key: '⌥ Opt + Delete', action: 'Delete Word Left', context: 'Erases the entire preceding word in one keystroke.' },
      { key: '⌃ Ctrl + A', action: 'Line Start (Emacs)', context: 'Moves cursor to beginning of line/paragraph without leaving home row.' },
      { key: '⌃ Ctrl + E', action: 'Line End (Emacs)', context: 'Moves cursor to end of line/paragraph without leaving home row.' },
      { key: '⌃ Ctrl + F', action: 'Forward Character', context: 'Advances cursor one character forward (home-row navigation).' },
      { key: '⌃ Ctrl + B', action: 'Backward Character', context: 'Retracts cursor one character backward (home-row navigation).' },
      { key: '⌃ Ctrl + D', action: 'Forward Delete', context: 'Deletes character directly to the right of cursor.' },
      { key: '⌃ Ctrl + P', action: 'Previous Line', context: 'Moves cursor up one line (home-row navigation).' },
      { key: '⌃ Ctrl + N', action: 'Next Line', context: 'Moves cursor down one line (home-row navigation).' },
      { key: '⌃ Ctrl + L', action: 'Center Cursor in Window', context: 'Centers current cursor line in middle of editing screen.' },
      { key: '⌃ Ctrl + O', action: 'Open Newline After Cursor', context: 'Inserts blank line below insertion point without moving current cursor.' },
      { key: '⌃ Ctrl + K', action: 'Kill Line', context: 'Deletes all text from cursor to end of current line into dedicated kill buffer.' }
    ],
    workflows: `The difference between Option and Command navigation is systematic across macOS: <kbd>⌥ Option</kbd> navigates by <strong>word</strong>, while <kbd>⌘ Command</kbd> navigates by <strong>structural boundary</strong> (line start/end, document start/end). Adding <kbd>⇧ Shift</kbd> to either modifier automatically converts the movement into a highlight selection.

For programmers, writers, and command-line users, standard Emacs keys work globally in almost every macOS text field—including Safari search bars, Slack inputs, Mail composition, and Xcode. You can jump to line start with <kbd>⌃ Ctrl</kbd> + <kbd>A</kbd>, line end with <kbd>⌃ Ctrl</kbd> + <kbd>E</kbd>, and delete to line end with <kbd>⌃ Ctrl</kbd> + <kbd>K</kbd> without lifting your hands from home row.`,
    windowsMistakes: [
      'Assuming Mac laptops lack Home and End keys: Fn + Left Arrow is Home; Fn + Right Arrow is End; Fn + Up/Down is Page Up/Down.',
      'Reaching for the mouse to jump to the start of a line: Command + Left Arrow snaps you to line start in zero seconds.',
      'Holding Backspace for ten seconds to erase words: Option + Delete deletes whole words instantly.'
    ],
    proTips: [
      'Home-Row Navigation: Use Ctrl+A and Ctrl+E to navigate line edges without moving your hands to arrow keys.',
      'Kill to Line End: Ctrl+K deletes from your cursor to the end of the line, storing the text in a secondary buffer.',
      'Insert Line Below: Ctrl+O creates a new line under your cursor without moving your cursor position.'
    ]
  },

  'v4g2-text-mastery.html': {
    title: 'Text Mastery',
    volume: 'Volume 4 · Game 2',
    description: 'Precision text highlighting, paragraph alignment, typographical scaling, spell checking, character transposition, and forward deletion.',
    intro: `Transforming draft writing into polished prose requires rapid structural text manipulation: selecting paragraphs, swapping misspelled letters, re-aligning headings, and scaling typography. Reaching for mouse cursors to highlight text blocks creates accidental selections and breaks mental momentum.

Volume 4 Game 2 trains the ultimate level of text mastery on macOS. Learn precision keyboard selection by character, line, and paragraph; instant typo fixing with character transposition (<kbd>⌃ Ctrl</kbd> + <kbd>T</kbd>); hardware forward delete on compact keyboards; and direct paragraph alignments.`,
    shortcuts: [
      { key: '⇧ Shift + ⌘ Cmd + Down Arrow', action: 'Select to Document End', context: 'Highlights all text from cursor location down to the final character of document.' },
      { key: '⇧ Shift + ⌘ Cmd + Left Arrow', action: 'Select to Line Start', context: 'Highlights all text from cursor location back to the beginning of current line.' },
      { key: '⇧ Shift + Left Arrow', action: 'Select Character Left', context: 'Extends text selection one character to the left.' },
      { key: '⇧ Shift + Right Arrow', action: 'Select Character Right', context: 'Extends text selection one character to the right.' },
      { key: '⇧ Shift + Up Arrow', action: 'Select Line Up', context: 'Extends text selection upward by one line in the identical column.' },
      { key: '⇧ Shift + Down Arrow', action: 'Select Line Down', context: 'Extends text selection downward by one line in identical column.' },
      { key: '⌥ Opt + ⇧ Shift + Up Arrow', action: 'Select to Paragraph Start', context: 'Extends selection to beginning of current paragraph; tap again to capture preceding paragraph.' },
      { key: '⌥ Opt + ⇧ Shift + Down Arrow', action: 'Select to Paragraph End', context: 'Extends selection to end of current paragraph; tap again to capture next paragraph.' },
      { key: '⌥ Opt + ⇧ Shift + Left Arrow', action: 'Select Word Left', context: 'Extends selection to beginning of previous word.' },
      { key: '⌃ Ctrl + H', action: 'Backspace (Delete Left)', context: 'Deletes character behind cursor without lifting hand from home row.' },
      { key: '⌃ Ctrl + D', action: 'Forward Delete', context: 'Deletes character ahead of cursor.' },
      { key: 'Fn + Delete', action: 'Hardware Forward Delete', context: 'Functions as Forward Delete key on compact MacBooks and Magic Keyboards.' },
      { key: '⌃ Ctrl + K', action: 'Cut to Paragraph End', context: 'Cuts all text from cursor to paragraph end into dedicated kill buffer.' },
      { key: '⌃ Ctrl + T', action: 'Transpose Characters', context: 'Swaps the two characters on either side of cursor—fixes typos like "teh" or "adn" in one millisecond!' },
      { key: '⌘ Cmd + [', action: 'Left Align Paragraph', context: 'Aligns selected paragraph to the left margin in rich-text editors.' },
      { key: '⌘ Cmd + ]', action: 'Right Align Paragraph', context: 'Aligns selected paragraph to the right margin.' },
      { key: '⇧ Shift + ⌘ Cmd + |', action: 'Center Align Paragraph', context: 'Centers selected paragraph between margins.' },
      { key: '⇧ Shift + ⌘ Cmd + :', action: 'Spelling & Grammar Window', context: 'Summons macOS Spelling and Grammar review panel.' },
      { key: '⇧ Shift + ⌘ Cmd + -', action: 'Decrease Font Size', context: 'Steps down font point size of selected text.' },
      { key: '⇧ Shift + ⌘ Cmd + +', action: 'Increase Font Size', context: 'Steps up font point size of selected text.' },
      { key: '⇧ Shift + ⌘ Cmd + ?', action: 'Help Search Bar', context: 'Opens Help menu command search bar across all native macOS apps.' }
    ],
    workflows: `The single greatest secret weapon in the macOS text system is Transpose (<kbd>⌃ Ctrl</kbd> + <kbd>T</kbd>). When typing quickly, the most common error is swapping two letters (e.g. typing "wrold" instead of "world"). Instead of hitting backspace three times and re-typing, place your cursor between the swapped letters and tap Ctrl+T. macOS swaps them instantaneously!

When restructuring documents, combining <kbd>⌥ Opt</kbd> + <kbd>⇧ Shift</kbd> + <kbd>↓</kbd> (select paragraph) with <kbd>⌘ Cmd</kbd> + <kbd>X</kbd> and <kbd>⌘ Cmd</kbd> + <kbd>V</kbd> allows you to rearrange multi-paragraph blocks in seconds without awkward trackpad click-and-drag errors.`,
    windowsMistakes: [
      'Assuming Mac keyboards cannot Forward Delete: Compact Mac keyboards lack a dedicated Del key, but pressing Fn + Delete performs a true forward delete.',
      'Manually fixing reversed letter typos: Placing your cursor between swapped letters and pressing Ctrl + T swaps them back instantly.',
      'Dragging mouse pointers across pages to highlight long text: Press Shift + Command + Down Arrow to select from your cursor to the very end of the file in one tap.'
    ],
    proTips: [
      'Fix Typos with Transpose: Memorize Ctrl+T. It is the fastest way to fix reversed-letter typos in macOS without erasing.',
      'Forward Delete on MacBooks: Hold Fn while pressing Delete to delete characters forward.',
      'Instant Paragraph Alignment: Use Cmd+[ for left, Shift+Cmd+| for center, and Cmd+] for right alignment in native text editors.'
    ]
  }
};

const CSS_STYLE = `
        /* KEYVERSE ACCREDITED EDITORIAL GUIDE & TUTORIAL */
        body {
            flex-direction: column !important;
            justify-content: flex-start !important;
            padding-block: 24px 80px !important;
            min-height: 100vh !important;
            height: auto !important;
            overflow-y: auto !important;
        }
        .game-guide {
            width: 100%;
            max-width: 720px;
            margin-top: 36px;
            background: #252538;
            border: 1px solid #45475a;
            border-radius: 14px;
            padding: 32px 26px;
            color: #cdd6f4;
            box-shadow: 0 8px 30px rgba(0,0,0,0.35);
            line-height: 1.7;
            box-sizing: border-box;
            text-align: left;
        }
        .game-guide h2 {
            font-size: 1.35rem;
            color: #89b4fa;
            margin-bottom: 8px;
            line-height: 1.3;
            text-align: left;
        }
        .game-guide .guide-tag {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: bold;
            color: #a6e3a1;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }
        .game-guide h3 {
            font-size: 1.05rem;
            color: #f5c2e7;
            margin-top: 22px;
            margin-bottom: 8px;
            text-align: left;
        }
        .game-guide p {
            margin-bottom: 14px;
            font-size: 0.92rem;
            color: #bac2de;
            line-height: 1.65;
            text-align: left;
        }
        .game-guide ul {
            margin-bottom: 16px;
            padding-left: 22px;
            color: #bac2de;
            font-size: 0.92rem;
            text-align: left;
        }
        .game-guide li {
            margin-bottom: 8px;
            text-align: left;
        }
        .game-guide kbd {
            display: inline-block;
            padding: 2px 7px;
            background: #11111b;
            border: 1px solid #45475a;
            border-bottom: 2px solid #45475a;
            border-radius: 4px;
            color: #89b4fa;
            font-family: monospace;
            font-weight: bold;
            font-size: 0.82rem;
        }
        .game-guide table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0 24px;
            font-size: 0.88rem;
            color: #bac2de;
            border: 1px solid #45475a;
            border-radius: 8px;
            overflow: hidden;
        }
        .game-guide th {
            background: #1e1e2e;
            color: #89b4fa;
            text-align: left;
            padding: 10px 14px;
            border-bottom: 2px solid #45475a;
            font-weight: 700;
        }
        .game-guide td {
            padding: 10px 14px;
            border-bottom: 1px solid #313244;
            vertical-align: top;
        }
        .game-guide tr:last-child td {
            border-bottom: none;
        }
        .game-guide tr:nth-child(even) {
            background: rgba(30, 30, 46, 0.4);
        }
        @media (max-width: 600px) {
            .game-guide table {
                display: block;
                overflow-x: auto;
            }
        }
        .game-guide-nav {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 28px;
            padding-top: 18px;
            border-top: 1px solid #313244;
            font-size: 0.88rem;
            flex-wrap: wrap;
            gap: 10px;
        }
        .game-guide-nav a {
            color: #89b4fa;
            text-decoration: none;
            font-weight: bold;
        }
        .game-guide-nav a:hover {
            text-decoration: underline;
        }
`;

function generateGuideHTML(info) {
  const tableRows = info.shortcuts.map(s => {
    // Format keys with kbd tags
    const keysFormatted = s.key.split(' + ').map(k => `<kbd>${k}</kbd>`).join(' + ');
    return `        <tr>
          <td><strong>${keysFormatted}</strong></td>
          <td>${s.action}</td>
          <td>${s.context}</td>
        </tr>`;
  }).join('\n');

  const mistakesHTML = info.windowsMistakes.map(m => `        <li>${m}</li>`).join('\n');
  const proTipsHTML = info.proTips.map(p => `        <li>${p}</li>`).join('\n');

  return `    <!-- COMPLETE EDUCATIONAL GUIDE & SHORTCUT REFERENCE (Crawlable Editorial Content) -->
    <article class="game-guide">
      <span class="guide-tag">${info.volume} · Complete Guide</span>
      <h2>Complete Guide &amp; Shortcut Reference for ${info.title}</h2>
      
      <h3>Overview: Why These Mac Shortcuts Matter</h3>
      <p>${info.intro.replace(/\n\n/g, '</p>\n      <p>')}</p>

      <h3>Full Keyboard Shortcut Reference Table</h3>
      <p>Here is every single Mac keyboard shortcut trained in <em>${info.title}</em>, complete with its primary function and real-world application context:</p>
      <table>
        <thead>
          <tr>
            <th style="width: 32%;">Shortcut</th>
            <th style="width: 28%;">Action</th>
            <th style="width: 40%;">macOS Workflow Context</th>
          </tr>
        </thead>
        <tbody>
${tableRows}
        </tbody>
      </table>

      <h3>Real-World macOS Workflows</h3>
      <p>${info.workflows.replace(/\n\n/g, '</p>\n      <p>')}</p>

      <h3>Common Mistakes Windows Switchers Make</h3>
      <ul>
${mistakesHTML}
      </ul>

      <h3>Pro Productivity &amp; Ergonomics Tips</h3>
      <ul>
${proTipsHTML}
      </ul>

      <div class="game-guide-nav">
        <a href="../index.html">← Back to Keyverse Home</a>
        <a href="../index.html#games">Browse All 10 Games</a>
        <a href="../about.html">About Keyverse</a>
        <a href="../privacy.html">Privacy Policy</a>
        <a href="../terms.html">Terms of Service</a>
      </div>
    </article>`;
}

const TABLE_CSS = `
        .game-guide table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0 24px;
            font-size: 0.88rem;
            color: #bac2de;
            border: 1px solid #45475a;
            border-radius: 8px;
            overflow: hidden;
        }
        .game-guide th {
            background: #1e1e2e;
            color: #89b4fa;
            text-align: left;
            padding: 10px 14px;
            border-bottom: 2px solid #45475a;
            font-weight: 700;
        }
        .game-guide td {
            padding: 10px 14px;
            border-bottom: 1px solid #313244;
            vertical-align: top;
        }
        .game-guide tr:last-child td {
            border-bottom: none;
        }
        .game-guide tr:nth-child(even) {
            background: rgba(30, 30, 46, 0.4);
        }
        @media (max-width: 600px) {
            .game-guide table {
                display: block;
                overflow-x: auto;
            }
        }
`;

const dir = 'games';
for (const file of Object.keys(GAMES_DATA)) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Insert Table CSS before .game-guide-nav in style if not present
  if (!content.includes('.game-guide table')) {
    content = content.replace(/(\.game-guide-nav\s*\{)/, TABLE_CSS + '\n        $1');
  }

  // Pinpoint replace of guide container right before </body>
  let guideIdx = content.indexOf('<!-- ACCREDITED COMPREHENSIVE SHORTCUT GUIDE');
  if (guideIdx === -1) guideIdx = content.indexOf('<!-- COMPLETE EDUCATIONAL GUIDE');
  if (guideIdx === -1) guideIdx = content.lastIndexOf('<article class="game-guide"');
  if (guideIdx === -1) guideIdx = content.lastIndexOf('<article class="game-guide"');
  if (guideIdx === -1) guideIdx = content.lastIndexOf('<div class="game-guide"');
  const bodyIdx = content.lastIndexOf('</body>');
  if (guideIdx === -1 || bodyIdx === -1) {
    throw new Error(`Could not find guide or body in ${file}`);
  }

  const guideHTML = generateGuideHTML(GAMES_DATA[file]);
  content = content.substring(0, guideIdx).trimEnd() + '\n\n' + guideHTML + '\n</body>\n</html>\n';

  fs.writeFileSync(filePath, content, 'utf8');

  // Verify word count of text
  const match = content.match(/<article class="game-guide"[\s\S]*?<\/article>/);
  if (match) {
    const textOnly = match[0].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = textOnly.split(/\s+/).length;
    console.log(`✅ ${file}: ${words} words, ${GAMES_DATA[file].shortcuts.length} shortcuts in table`);
  } else {
    console.error(`❌ Failed to verify guide in ${file}`);
  }
}

