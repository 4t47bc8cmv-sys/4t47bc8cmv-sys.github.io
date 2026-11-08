import AppKit
import CoreGraphics
import Foundation

struct ShortcutTip {
    let index: Int
    let keys: String
    let title: String
    let category: String
    let desc: String
}

let tips: [ShortcutTip] = [
    ShortcutTip(index: 1, keys: "⌘ + Space", title: "Spotlight Quick Launcher & Calculator", category: "Navigation & Search", desc: "Stop hunting through folders or clicking menus. Press ⌘ + Space to launch apps, locate files, perform instant calculations like \"125 * 1.15\", or convert currencies on the fly."),
    ShortcutTip(index: 2, keys: "⌘ + Tab", title: "Instant Application Switcher", category: "Window & App Control", desc: "Cycle through running apps effortlessly. Hold ⌘ and tap Tab to move forward (or ` for backward). While holding ⌘, tap Q to quit the highlighted app or H to hide it."),
    ShortcutTip(index: 3, keys: "⌘ + Shift + 4, Space", title: "Pixel-Perfect Window Screenshot", category: "Productivity & Screen Capture", desc: "Press ⌘ + Shift + 4, tap Spacebar, and hover over any open window or menu. Click to capture a crisp screenshot with a clean Apple drop shadow."),
    ShortcutTip(index: 4, keys: "⌘ + Shift + 5", title: "Screen Recording & Capture HUD", category: "Productivity & Screen Capture", desc: "Summon the unified capture control bar. Record entire displays, selected portions, capture windows, and configure countdown timers or save locations with a single shortcut."),
    ShortcutTip(index: 5, keys: "⌥ + ⌘ + Esc", title: "Force Quit Frozen Applications", category: "System Control", desc: "When an app locks up with the spinning pinwheel, press Option + Command + Esc to open the Force Quit dialog and terminate it immediately without rebooting."),
    ShortcutTip(index: 6, keys: "⌘ + W  vs  ⌘ + Q", title: "Closing Windows vs Quitting Apps", category: "App Management", desc: "⌘ + W closes only the active tab or document window. ⌘ + Q completely quits the application process and frees up system memory."),
    ShortcutTip(index: 7, keys: "⌥ + ⌘ + C  /  ⌥ + ⌘ + V", title: "Copy & Paste Text Formatting", category: "Text & Typography", desc: "Copy styling (font family, weight, color, margins) from highlighted text in Pages, Keynote, TextEdit, or Mail with ⌥⌘C, then apply it onto target text with ⌥⌘V."),
    ShortcutTip(index: 8, keys: "⌃ + ⌘ + Space", title: "Emoji & Symbol Viewer", category: "Text Editing", desc: "Open macOS’s full Character Viewer palette anywhere you can type. Search emojis, Greek symbols, math operators, accents, and custom unicode symbols with ease."),
    ShortcutTip(index: 9, keys: "⌘ + ⌥ + D", title: "Quickly Toggle the Dock", category: "Desktop & Workspace", desc: "Instantly toggle hiding and showing the macOS Dock to reclaim vertical workspace on smaller MacBook laptop displays."),
    ShortcutTip(index: 10, keys: "⌃ + ⌘ + Q", title: "Lock Screen Instantly", category: "Privacy & Security", desc: "Stepping away from your Mac? Press Control + Command + Q to lock your screen immediately without putting your computer to sleep or losing active tasks."),
    ShortcutTip(index: 11, keys: "⌘ + Shift + .", title: "Toggle Hidden Files & Dotfiles", category: "Finder Mastery", desc: "Need to inspect .env, .git, or hidden system files? Press ⌘ + Shift + . (Period) inside Finder or Open/Save dialogs to toggle invisible files on and off."),
    ShortcutTip(index: 12, keys: "⌘ + Shift + G", title: "Finder \"Go to Folder\" Path Jump", category: "Finder Mastery", desc: "Jump directly to UNIX directories like ~/Library, /usr/local, or /etc in Finder. Supports full shell tab-completion and tilde user shortcuts."),
    ShortcutTip(index: 13, keys: "⌥ + Delete", title: "Delete Entire Word Backwards", category: "Text Editing Speed", desc: "Stop tapping Backspace multiple times. Option + Delete removes the entire preceding word in one swift stroke across all Mac apps and browsers."),
    ShortcutTip(index: 14, keys: "⌘ + Delete", title: "Delete Entire Line to Beginning", category: "Text Editing Speed", desc: "Wipe out everything from your cursor to the beginning of the line instantly. Perfect for resetting command line prompts or retyping sentences."),
    ShortcutTip(index: 15, keys: "Fn + Delete  (or ⌃ + D)", title: "Forward Delete on Mac Keyboards", category: "Text Editing Speed", desc: "MacBook keyboards lack a dedicated Del key. Hold Fn and press Delete (or press Control + D) to delete characters to the right of the cursor."),
    ShortcutTip(index: 16, keys: "⌘ + ↑ / ↓ Arrow", title: "Jump to Top or Bottom of Page", category: "Navigation", desc: "Navigate long documents, codebases, or web pages in an instant. ⌘ + Up arrow jumps to the top; ⌘ + Down arrow jumps to the bottom."),
    ShortcutTip(index: 17, keys: "⌥ + ← / → Arrow", title: "Navigate Word by Word", category: "Text Editing Speed", desc: "Hold Option and press Left or Right arrow to jump your cursor across words rather than single letters. Combine with Shift to highlight word-by-word."),
    ShortcutTip(index: 18, keys: "Spacebar in Finder", title: "Quick Look Preview", category: "Finder Mastery", desc: "Highlight any PDF, photo, video, or code file and tap Spacebar for an instant high-resolution preview without launching heavy desktop apps."),
    ShortcutTip(index: 19, keys: "⌘ + Shift + T", title: "Reopen Closed Browser Tab", category: "Web Browsing", desc: "Accidentally closed an essential tab? ⌘ + Shift + T restores your last closed tab in Safari, Chrome, Edge, and Arc, retaining your browsing history."),
    ShortcutTip(index: 20, keys: "⌘ + ⌥ + I", title: "Open Web Developer Tools", category: "Developer & Power User", desc: "Inspect webpage elements, view JavaScript console output, and diagnose network requests with ⌘ + Option + I in all major macOS web browsers."),
    ShortcutTip(index: 21, keys: "⌘ + 1 / 2 / 3 / 4", title: "Switch Finder Views in Seconds", category: "Finder Mastery", desc: "Toggle Finder layout modes instantly: ⌘1 for Icon view, ⌘2 for List view, ⌘3 for Column view (the power user favorite), and ⌘4 for Gallery view."),
    ShortcutTip(index: 22, keys: "⌘ + ⌥ + V in Finder", title: "Move File (Cut & Paste Equivalent)", category: "Finder Mastery", desc: "Mac has no \"Cut\" shortcut for files, but it has something better: copy the file with ⌘C, navigate to the target folder, and press ⌥⌘V to move it there."),
    ShortcutTip(index: 23, keys: "⌥ + Drag", title: "Hold Option to Duplicate Anything", category: "Productivity & Design", desc: "Hold the Option key while dragging files in Finder, shapes in Figma/Keynote, or notes in Apple Notes to create a duplicate copy at the drop location."),
    ShortcutTip(index: 24, keys: "⌘ + [  and  ⌘ + ]", title: "Back and Forward Navigation", category: "Navigation", desc: "Go backward and forward across pages in Safari, Finder folder hierarchies, Xcode, and many native macOS apps without reaching for toolbar arrows."),
    ShortcutTip(index: 25, keys: "⌃ + Down Arrow", title: "App Exposé (Active App Windows)", category: "Window Management", desc: "Have 6 Finder or browser windows open simultaneously? Control + Down Arrow tiles only the windows of the currently active app for quick selection."),
    ShortcutTip(index: 26, keys: "⌘ + H  and  ⌘ + ⌥ + H", title: "Hide Window & Hide Others", category: "Window Management", desc: "⌘ + H hides the active app instantly. ⌘ + Option + H hides every other app on your screen, instantly creating a distraction-free focused workspace."),
    ShortcutTip(index: 27, keys: "⌃ + ⌘ + F", title: "Toggle Full Screen Mode", category: "Window Management", desc: "Expand your active window to a dedicated macOS full-screen Space with ⌃⌘F. Press it again to return cleanly to your desktop layout."),
    ShortcutTip(index: 28, keys: "⌘ + Shift + N", title: "Create New Folder in Finder", category: "Finder Mastery", desc: "Create and name a new folder in your current Finder window instantly without touching the mouse or context menus."),
    ShortcutTip(index: 29, keys: "⌘ + K in Finder", title: "Connect to Network Server", category: "Network & System", desc: "Open the Connect to Server dialog to mount SMB, AFP, or NFS network drives, NAS boxes, and shared office storage volumes."),
    ShortcutTip(index: 30, keys: "⌥ + Shift + Vol/Bright", title: "Fine-Grained Audio & Display Steps", category: "Hardware Control", desc: "Hold Option + Shift while pressing the Volume or Display Brightness keys to adjust levels in quarter-step increments for the perfect setting.")
]

func color(_ hex: UInt32, alpha: CGFloat = 1.0) -> NSColor {
    let r = CGFloat((hex >> 16) & 0xFF) / 255.0
    let g = CGFloat((hex >> 8) & 0xFF) / 255.0
    let b = CGFloat(hex & 0xFF) / 255.0
    return NSColor(srgbRed: r, green: g, blue: b, alpha: alpha)
}

func savePNG(bitmap: NSBitmapImageRep, to path: String) {
    guard let data = bitmap.representation(using: .png, properties: [:]) else {
        fatalError("Failed to generate PNG data for \(path)")
    }
    try! data.write(to: URL(fileURLWithPath: path))
}

func renderCanvas(width: Int = 1080, height: Int = 1080, draw: () -> Void) -> NSBitmapImageRep {
    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    draw()
    NSGraphicsContext.restoreGraphicsState()
    return rep
}

func drawRoundedRect(_ rect: NSRect, radius: CGFloat, fill: NSColor?, stroke: NSColor?, lineWidth: CGFloat = 2.0) {
    let path = NSBezierPath(roundedRect: rect, xRadius: radius, yRadius: radius)
    if let fill = fill {
        fill.setFill()
        path.fill()
    }
    if let stroke = stroke {
        stroke.setStroke()
        path.lineWidth = lineWidth
        path.stroke()
    }
}

func generateAvatar(outputPath: String) {
    let rep = renderCanvas {
        let bounds = NSRect(x: 0, y: 0, width: 1080, height: 1080)
        // Background gradient
        let bgGrad = NSGradient(starting: color(0x11111b), ending: color(0x1e1e2e))!
        bgGrad.draw(in: bounds, angle: 135)

        // Subtle outer ring
        let ringRect = NSRect(x: 60, y: 60, width: 960, height: 960)
        drawRoundedRect(ringRect, radius: 220, fill: color(0x181825, alpha: 0.85), stroke: color(0xa6e3a1, alpha: 0.35), lineWidth: 6)

        // Keycap shadow (3D retro mechanical keycap look)
        let shadowRect = NSRect(x: 260, y: 330, width: 560, height: 500)
        drawRoundedRect(shadowRect, radius: 90, fill: color(0x11111b), stroke: color(0x313244), lineWidth: 4)

        let keyBaseRect = NSRect(x: 260, y: 365, width: 560, height: 500)
        drawRoundedRect(keyBaseRect, radius: 90, fill: color(0x313244), stroke: color(0xa6e3a1), lineWidth: 8)

        let keyTopRect = NSRect(x: 292, y: 405, width: 496, height: 435)
        drawRoundedRect(keyTopRect, radius: 70, fill: color(0x1e1e2e), stroke: color(0x89b4fa, alpha: 0.5), lineWidth: 3)

        // Command symbol ⌘
        let para = NSMutableParagraphStyle()
        para.alignment = .center

        let cmdAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 250, weight: .bold),
            .foregroundColor: color(0xa6e3a1),
            .paragraphStyle: para
        ]
        NSString(string: "⌘").draw(in: NSRect(x: 260, y: 465, width: 560, height: 300), withAttributes: cmdAttrs)

        // KEYVERSE title below keycap
        let titleAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.monospacedSystemFont(ofSize: 68, weight: .heavy),
            .foregroundColor: color(0xcdd6f4),
            .kern: 10.0,
            .paragraphStyle: para
        ]
        NSString(string: "KEYVERSE").draw(in: NSRect(x: 100, y: 205, width: 880, height: 95), withAttributes: titleAttrs)

        let subAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 32, weight: .semibold),
            .foregroundColor: color(0xf9e2af),
            .kern: 4.0,
            .paragraphStyle: para
        ]
        NSString(string: "MAC SHORTCUT GAMES").draw(in: NSRect(x: 100, y: 140, width: 880, height: 55), withAttributes: subAttrs)
    }
    savePNG(bitmap: rep, to: outputPath)
}

func generateTipCard(tip: ShortcutTip, outputPath: String) {
    let rep = renderCanvas {
        let bounds = NSRect(x: 0, y: 0, width: 1080, height: 1080)
        let bgGrad = NSGradient(starting: color(0x11111b), ending: color(0x1e1e2e))!
        bgGrad.draw(in: bounds, angle: 125)

        // Outer card frame
        let cardRect = NSRect(x: 48, y: 48, width: 984, height: 984)
        drawRoundedRect(cardRect, radius: 44, fill: color(0x181825, alpha: 0.92), stroke: color(0x313244), lineWidth: 4)

        // Top accent bar
        let topBadgeRect = NSRect(x: 96, y: 900, width: 430, height: 64)
        drawRoundedRect(topBadgeRect, radius: 32, fill: color(0x313244, alpha: 0.8), stroke: color(0xa6e3a1, alpha: 0.6), lineWidth: 2)

        let badgeAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.monospacedSystemFont(ofSize: 24, weight: .bold),
            .foregroundColor: color(0xa6e3a1)
        ]
        NSString(string: "💡 MAC SHORTCUT TIP #\(tip.index)").draw(in: NSRect(x: 124, y: 915, width: 390, height: 36), withAttributes: badgeAttrs)

        // Category pill on top right
        let rightPara = NSMutableParagraphStyle()
        rightPara.alignment = .right
        let catAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 24, weight: .semibold),
            .foregroundColor: color(0x89b4fa),
            .paragraphStyle: rightPara
        ]
        NSString(string: tip.category.uppercased()).draw(in: NSRect(x: 540, y: 915, width: 440, height: 36), withAttributes: catAttrs)

        // 3D Mechanical Keycap Display Box in Center-Top
        let keyShadowRect = NSRect(x: 96, y: 605, width: 888, height: 225)
        drawRoundedRect(keyShadowRect, radius: 36, fill: color(0x11111b), stroke: nil)

        let keyBoxRect = NSRect(x: 96, y: 622, width: 888, height: 225)
        drawRoundedRect(keyBoxRect, radius: 36, fill: color(0x1e1e2e), stroke: color(0xa6e3a1), lineWidth: 5)

        let centerPara = NSMutableParagraphStyle()
        centerPara.alignment = .center

        let keyFontSize: CGFloat = tip.keys.count > 18 ? 62 : (tip.keys.count > 12 ? 74 : 88)
        let keyAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.monospacedSystemFont(ofSize: keyFontSize, weight: .heavy),
            .foregroundColor: color(0xf9e2af),
            .paragraphStyle: centerPara
        ]
        let keyYOffset = 622 + (225 - keyFontSize * 1.2) / 2 - 6
        NSString(string: tip.keys).draw(in: NSRect(x: 116, y: keyYOffset, width: 848, height: keyFontSize * 1.3), withAttributes: keyAttrs)

        // Tip Title
        let leftPara = NSMutableParagraphStyle()
        leftPara.alignment = .left
        leftPara.lineSpacing = 6

        let titleAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 50, weight: .heavy),
            .foregroundColor: color(0xcdd6f4),
            .paragraphStyle: leftPara
        ]
        NSString(string: tip.title).draw(in: NSRect(x: 96, y: 430, width: 888, height: 140), withAttributes: titleAttrs)

        // Tip Description
        let descPara = NSMutableParagraphStyle()
        descPara.alignment = .left
        descPara.lineSpacing = 10

        let descAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.systemFont(ofSize: 34, weight: .medium),
            .foregroundColor: color(0xbac2de),
            .paragraphStyle: descPara
        ]
        NSString(string: tip.desc).draw(in: NSRect(x: 96, y: 205, width: 888, height: 235), withAttributes: descAttrs)

        // Footer Divider
        let divider = NSBezierPath()
        divider.move(to: NSPoint(x: 96, y: 170))
        divider.line(to: NSPoint(x: 984, y: 170))
        color(0x313244).setStroke()
        divider.lineWidth = 3
        divider.stroke()

        // Footer Left: Brand
        let footerBrandAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.monospacedSystemFont(ofSize: 26, weight: .bold),
            .foregroundColor: color(0xa6e3a1)
        ]
        NSString(string: "🎮 @keyversegames").draw(in: NSRect(x: 96, y: 100, width: 450, height: 42), withAttributes: footerBrandAttrs)

        // Footer Right: URL CTA
        let footerUrlAttrs: [NSAttributedString.Key: Any] = [
            .font: NSFont.monospacedSystemFont(ofSize: 26, weight: .bold),
            .foregroundColor: color(0x89b4fa),
            .paragraphStyle: rightPara
        ]
        NSString(string: "keyversegames.com →").draw(in: NSRect(x: 520, y: 100, width: 464, height: 42), withAttributes: footerUrlAttrs)
    }
    savePNG(bitmap: rep, to: outputPath)
}

let fm = FileManager.default
let outDir = "social-cards"
try? fm.createDirectory(atPath: outDir, withIntermediateDirectories: true)

generateAvatar(outputPath: "\(outDir)/instagram-avatar.png")
print("Generated \(outDir)/instagram-avatar.png")

for tip in tips {
    let path = "\(outDir)/tip-\(tip.index).png"
    generateTipCard(tip: tip, outputPath: path)
}
print("Generated 30 Instagram tip cards (1080x1080) in \(outDir)/")
