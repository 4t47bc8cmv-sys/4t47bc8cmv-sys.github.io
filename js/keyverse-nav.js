/**
 * Keyverse Unified Top Navbar ("☰ Explore Keyverse ▾" + Audio/DJ + Language)
 * + Global Multi-Language Hover-Explanation Engine across all clickable links.
 */
(function (global) {
  'use strict';

  const SUPABASE_URL = 'https://ludisdvlhkheokhehzih.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xpSiid3HEEUS1wCs2dTMQw_wr6NQVdM';

  const I18N_TIPS = {
    en: {
      'desktop-meltdown': ['NEW 🔥 · ARCADE SURVIVAL', 'Desktop Meltdown (Survival & Practice)', 'Survive a hijacked Mac desktop! Destroy rogue popups, spyware scanners, and glitching apps with real Mac shortcuts (⌘+W, ⌘+H, ⌘+Space, ⌘+Q, ⌘+Z). Includes untimed Slow Practice.'],
      v1g1: ['VOLUME 1 · GAME 1', 'First Steps on Mac', 'Core everyday Mac muscle memory: Spotlight (⌘+Space), Copy/Paste/Cut (⌘+C, ⌘+V, ⌘+X), Undo (⌘+Z), App Switch, and Quit.'],
      v1g2: ['VOLUME 1 · GAME 2', 'Daily Driver', 'Daily workflow speed: Full Screen (⌃+⌘+F), Mission Control & Spaces (⌃+Arrows), Window Cycling (⌘+`), and text styling.'],
      v1g3: ['VOLUME 1 · GAME 3', 'Productivity Boosters', 'Browser & app speed drills: New/Close/Reopen Tab (⌘+T, ⌘+W, ⇧+⌘+T), Address Bar (⌘+L), Reload (⌘+R), and Bookmarks.'],
      v1g4: ['VOLUME 1 · GAME 4', 'Accessibility Pro', 'Hardware & accessibility controls: Volume/Brightness fine steps (⌥+⇧+F11/F12, F1/F2), Mute (F10), VoiceOver, and Zoom.'],
      v2g1: ['VOLUME 2 · GAME 1', 'System Control', 'Power, sleep & lock mastery: Lock Screen (⌃+⌘+Q), Log Out (⇧+⌘+Q), Sleep (⌥+⌘+Power), and Touch ID controls.'],
      v2g2: ['VOLUME 2 · GAME 2', 'Window Wrangling', 'Window & edit mastery: Hide App (⌘+H), Hide Others (⌥+⌘+H), Minimize All (⌥+⌘+M), Redo (⇧+⌘+Z), and Paste & Match Style.'],
      v3g1: ['VOLUME 3 · GAME 1', 'Finder Basics', 'Navigate folders fast: Desktop (⇧+⌘+D), Go to Folder (⇧+⌘+G), Home (⇧+⌘+H), iCloud Drive (⇧+⌘+I), and Back/Forward (⌘+[ / ]).'],
      v3g2: ['VOLUME 3 · GAME 2', 'Finder Power', 'Finder views & previews: View Options (⌘+J), Quick Look (⌘+Y / Space), Path Bar (⌥+⌘+P), Sidebar (⌥+⌘+S), and Smart Folders.'],
      v4g1: ['VOLUME 4 · GAME 1', 'Text Editing', 'Cursor navigation without a mouse: word jumps (⌥+Left/Right), line start/end (⌘+Left/Right), and document top/bottom (⌘+Up/Down).'],
      v4g2: ['VOLUME 4 · GAME 2', 'Text Mastery', 'Rapid selection & editing: line/word selection (⇧+⌘+Arrows, ⌥+⇧+Arrows), word deletion, and formatting shortcuts.'],
      multiplayer: ['BOARDS & RACING', 'Split-Screen Multiplayer & Ghost DNA', 'Race a friend head-to-head or share a Ghost DNA link so friends race your exact live keystrokes.'],
      'dj-studio': ['INTERACTIVE AUDIO', 'Shortcut DJ Studio', 'Turn shortcut streaks into live music—pick a genre, customize a 16-step beat grid, and level up instruments as you play.'],
      'sound-packs': ['REACTIVE AUDIO', 'Origin & Vibe Sound Packs', 'Switch between Katana, Anime, Harbor, and Cyber soundscapes that react to your combo streak.'],
      guides: ['REFERENCE & CHEAT SHEETS', 'Mac Shortcut Guides', 'Step-by-step interactive reference guides and cheat sheets for mastering macOS.'],
      about: ['INFO', 'About Keyverse', 'Learn how Keyverse turns macOS keyboard shortcuts into fast muscle memory.'],
      contact: ['SUPPORT', 'Contact Keyverse', 'Send feedback, bug reports, or questions to the Keyverse team.'],
      privacy: ['LEGAL', 'Privacy Policy', 'Read how Keyverse handles local storage, analytics, and account privacy.'],
      terms: ['LEGAL', 'Terms of Service', 'Review the terms of service for playing and using Keyverse.'],
      login: ['ACCOUNT', 'Sign In / Free Trial', 'Sign in or create a free account to unlock Shortcut DJ Studio and cloud-sync your beats.'],
      account: ['ACCOUNT', 'Account & Stats', 'View your profile, DJ Studio sync status, and multiplayer settings.'],
      'level-btn': ['GAME LEVEL', 'Start Training Level', 'Click to review the shortcuts in this level and begin practicing.'],
      fallback_open: ['OPEN', 'Open ', 'Navigate to ']
    },
    'es-419': {
      'desktop-meltdown': ['NUEVO 🔥 · SUPERVIVENCIA', 'Desktop Meltdown (Supervivencia y Práctica)', '¡Sobrevive a un Mac secuestrado! Destruye ventanas emergentes y apps fallando con atajos reales de Mac (⌘+W, ⌘+H, ⌘+Espacio, ⌘+Q, ⌘+Z). Incluye modo Práctica Lenta.'],
      v1g1: ['VOLUMEN 1 · JUEGO 1', 'Primeros Pasos en Mac', 'Memoria muscular esencial: Spotlight (⌘+Espacio), Copiar/Pegar/Cortar (⌘+C, ⌘+V, ⌘+X), Deshacer (⌘+Z) y Salir.'],
      v1g2: ['VOLUMEN 1 · JUEGO 2', 'Uso Diario', 'Velocidad diaria: Pantalla completa (⌃+⌘+F), Mission Control (⌃+Flechas), cambiar ventanas (⌘+`) y formato de texto.'],
      v1g3: ['VOLUMEN 1 · JUEGO 3', 'Impulsores de Productividad', 'Atajos de navegador y apps: Nueva/Cerrar/Reabrir pestaña (⌘+T, ⌘+W, ⇧+⌘+T), Barra de direcciones (⌘+L) y Recargar (⌘+R).'],
      v1g4: ['VOLUMEN 1 · JUEGO 4', 'Accesibilidad Pro', 'Controles de sistema y accesibilidad: ajustes finos de volumen/brillo (⌥+⇧+F11/F12), Silenciar (F10), VoiceOver y Zoom.'],
      v2g1: ['VOLUMEN 2 · JUEGO 1', 'Control del Sistema', 'Energía y bloqueo sin menús: Bloquear pantalla (⌃+⌘+Q), Cerrar sesión (⇧+⌘+Q) y Reposo (⌥+⌘+Encendido).'],
      v2g2: ['VOLUMEN 2 · JUEGO 2', 'Dominio de Ventanas', 'Control de ventanas y edición: Ocultar app (⌘+H), Ocultar otras (⌥+⌘+H), Minimizar todo (⌥+⌘+M) y Rehacer (⇧+⌘+Z).'],
      v3g1: ['VOLUMEN 3 · JUEGO 1', 'Finder Básico', 'Navega carpetas rápido: Escritorio (⇧+⌘+D), Ir a carpeta (⇧+⌘+G), Inicio (⇧+⌘+H), iCloud (⇧+⌘+I) y Atrás/Adelante.'],
      v3g2: ['VOLUMEN 3 · JUEGO 2', 'Finder Avanzado', 'Vistas y vista rápida: Opciones de vista (⌘+J), Vista rápida (⌘+Y), Barra de ruta (⌥+⌘+P) y Barra lateral (⌥+⌘+S).'],
      v4g1: ['VOLUMEN 4 · JUEGO 1', 'Edición de Texto', 'Mueve el cursor sin ratón: saltar palabras (⌥+Izq/Der), inicio/fin de línea (⌘+Izq/Der) y principio/fin del documento.'],
      v4g2: ['VOLUMEN 4 · JUEGO 2', 'Maestría en Texto', 'Selección y edición veloz: seleccionar líneas o palabras (⇧+⌘+Flechas, ⌥+⇧+Flechas) y formato rápido.'],
      multiplayer: ['TABLEROS Y CARRERAS', 'Multijugador y Ghost DNA', 'Compite cara a cara o comparte un enlace Ghost DNA para que tus amigos corran contra tus pulsaciones exactas.'],
      'dj-studio': ['AUDIO INTERACTIVO', 'Shortcut DJ Studio', 'Convierte tus rachas en música en vivo: elige género, edita la cuadrícula de 16 pasos y sube de nivel tus instrumentos.'],
      'sound-packs': ['AUDIO REACTIVO', 'Paquetes de Sonido', 'Cambia entre Katana, Anime, Harbor y Cyber que reaccionan a tu racha de combos.'],
      guides: ['GUÍAS Y REFERENCIA', 'Guías de Atajos de Mac', 'Guías interactivas paso a paso y hojas de referencia para dominar macOS.'],
      about: ['INFO', 'Acerca de Keyverse', 'Descubre cómo Keyverse convierte los atajos de macOS en memoria muscular.'],
      contact: ['SOPORTE', 'Contacto', 'Envía comentarios, reportes o preguntas al equipo de Keyverse.'],
      privacy: ['LEGAL', 'Política de Privacidad', 'Consulta cómo Keyverse gestiona el almacenamiento local, analítica y privacidad.'],
      terms: ['LEGAL', 'Términos de Servicio', 'Revisa los términos de uso de Keyverse.'],
      login: ['CUENTA', 'Iniciar Sesión / Prueba Gratis', 'Inicia sesión o crea una cuenta gratis para desbloquear DJ Studio y sincronizar tus ritmos.'],
      account: ['CUENTA', 'Cuenta y Estadísticas', 'Consulta tu perfil, sincronización de DJ Studio y ajustes multijugador.'],
      'level-btn': ['NIVEL', 'Iniciar Nivel', 'Haz clic para repasar los atajos de este nivel y comenzar a practicar.'],
      fallback_open: ['ABRIR', 'Abrir ', 'Ir a ']
    },
    tl: {
      'desktop-meltdown': ['BAGO 🔥 · SURVIVAL', 'Desktop Meltdown (Survival & Practice)', 'Makaligtas sa na-hijack na Mac desktop! Sirain ang mga rogue popup at glitching apps gamit ang totoong Mac shortcuts (⌘+W, ⌘+H, ⌘+Space, ⌘+Q, ⌘+Z). May kasamang Slow Practice.'],
      v1g1: ['VOLUME 1 · LARO 1', 'First Steps sa Mac', 'Pangunahing Mac muscle memory: Spotlight (⌘+Space), Copy/Paste/Cut (⌘+C, ⌘+V, ⌘+X), Undo (⌘+Z), at Quit.'],
      v1g2: ['VOLUME 1 · LARO 2', 'Daily Driver', 'Bilis sa araw-araw: Full Screen (⌃+⌘+F), Mission Control (⌃+Arrows), Window Cycling (⌘+`), at text styling.'],
      v1g3: ['VOLUME 1 · LARO 3', 'Productivity Boosters', 'Browser at app shortcuts: New/Close/Reopen Tab (⌘+T, ⌘+W, ⇧+⌘+T), Address Bar (⌘+L), at Reload (⌘+R).'],
      v1g4: ['VOLUME 1 · LARO 4', 'Accessibility Pro', 'Kontrol sa hardware at accessibility: Volume/Brightness (⌥+⇧+F11/F12), Mute (F10), VoiceOver, at Zoom.'],
      v2g1: ['VOLUME 2 · LARO 1', 'System Control', 'Power at lock shortcuts: Lock Screen (⌃+⌘+Q), Log Out (⇧+⌘+Q), at Sleep (⌥+⌘+Power).'],
      v2g2: ['VOLUME 2 · LARO 2', 'Window Wrangling', 'Pamamahala ng window: Hide App (⌘+H), Hide Others (⌥+⌘+H), Minimize All (⌥+⌘+M), at Redo (⇧+⌘+Z).'],
      v3g1: ['VOLUME 3 · LARO 1', 'Finder Basics', 'Mabilis na pag-navigate sa Finder: Desktop (⇧+⌘+D), Go to Folder (⇧+⌘+G), Home (⇧+⌘+H), at iCloud (⇧+⌘+I).'],
      v3g2: ['VOLUME 3 · LARO 2', 'Finder Power', 'Finder views at preview: View Options (⌘+J), Quick Look (⌘+Y), Path Bar (⌥+⌘+P), at Sidebar (⌥+⌘+S).'],
      v4g1: ['VOLUME 4 · LARO 1', 'Text Editing', 'Paggalaw ng cursor nang walang mouse: salita (⌥+Left/Right), linya (⌘+Left/Right), at dokumento (⌘+Up/Down).'],
      v4g2: ['VOLUME 4 · LARO 2', 'Text Mastery', 'Mabilisang pagpili at pag-edit ng teksto (⇧+⌘+Arrows, ⌥+⇧+Arrows) at pag-format.'],
      multiplayer: ['MULTIPLAYER', 'Split-Screen & Ghost DNA', 'Makipagkarera sa kaibigan o magbahagi ng Ghost DNA link para labanan ang iyong eksaktong keystrokes.'],
      'dj-studio': ['INTERACTIVE AUDIO', 'Shortcut DJ Studio', 'Gawing live na musika ang iyong combo streak—pumili ng genre at i-customize ang 16-step beat grid.'],
      'sound-packs': ['REACTIVE AUDIO', 'Sound Packs', 'Magpalit sa pagitan ng Katana, Anime, Harbor, at Cyber soundscapes na tumutugon sa iyong combo.'],
      guides: ['MGA GABAY', 'Mac Shortcut Guides', 'Mga step-by-step na gabay at cheat sheet para maging bihasa sa macOS.'],
      login: ['ACCOUNT', 'Mag-sign In / Free Trial', 'Mag-sign in o gumawa ng libreng account para mabuksan ang DJ Studio at i-save ang iyong beats.'],
      'level-btn': ['ANTAS', 'Simulan ang Antas', 'I-click upang tingnan ang mga shortcut at magsimulang magsanay.'],
      fallback_open: ['BUKSAN', 'Buksan ', 'Pumunta sa ']
    },
    'zh-HK': {
      'desktop-meltdown': ['最新 🔥 · 街機生存', 'Desktop Meltdown（生存與慢速練習）', '喺被騎劫嘅 Mac 桌面生存！用真正 Mac 快捷鍵（⌘+W、⌘+H、⌘+Space、⌘+Q、⌘+Z）摧毀彈窗同故障程式。附設唔限時慢速練習模式。'],
      v1g1: ['第 1 輯 · 遊戲 1', 'Mac 入門第一步', '建立日常肌肉記憶：Spotlight (⌘+Space)、複製貼上剪下 (⌘+C/V/X)、復原 (⌘+Z) 同結束程式。'],
      v1g2: ['第 1 輯 · 遊戲 2', '日常高效操作', '全螢幕 (⌃+⌘+F)、Mission Control (⌃+方向鍵)、切換視窗 (⌘+`) 同文字格式快捷鍵。'],
      v1g3: ['第 1 輯 · 遊戲 3', '生產力加速器', '瀏覽器分頁極速操作：開新/關閉/重開分頁 (⌘+T/W, ⇧+⌘+T)、網址列 (⌘+L) 同重新載入 (⌘+R)。'],
      v1g4: ['第 1 輯 · 遊戲 4', '輔助使用專家', '硬件與輔助控制：微調音量/亮度 (⌥+⇧+F11/F12)、靜音 (F10)、旁白同縮放。'],
      v2g1: ['第 2 輯 · 遊戲 1', '系統電源控制', '鎖定螢幕 (⌃+⌘+Q)、登出 (⇧+⌘+Q)、睡眠 (⌥+⌘+Power) 等快速系統控制。'],
      v2g2: ['第 2 輯 · 遊戲 2', '視窗管理大師', '隱藏程式 (⌘+H)、隱藏其他 (⌥+⌘+H)、全部縮到最小 (⌥+⌘+M) 同重做 (⇧+⌘+Z)。'],
      v3g1: ['第 3 輯 · 遊戲 1', 'Finder 基礎導航', '極速跳轉資料夾：桌面 (⇧+⌘+D)、前往資料夾 (⇧+⌘+G)、個人專屬 (⇧+⌘+H) 同 iCloud。'],
      v3g2: ['第 3 輯 · 遊戲 2', 'Finder 進階視圖', '顯示方式選項 (⌘+J)、快速查看 (⌘+Y)、路徑列 (⌥+⌘+P) 同側邊欄 (⌥+⌘+S)。'],
      v4g1: ['第 4 輯 · 遊戲 1', '文字游標移動', '唔用滑鼠移動游標：逐字跳轉 (⌥+左右)、行首行尾 (⌘+左右) 同文件頂部/底部。'],
      v4g2: ['第 4 輯 · 遊戲 2', '文字選取與編輯', '極速選取整行/單字 (⇧+⌘+方向鍵, ⌥+⇧+方向鍵)、刪字同格式快捷鍵。'],
      multiplayer: ['對戰與幽靈競速', '分割畫面多人與 Ghost DNA', '同朋友面對面競速，或者分享 Ghost DNA 連結挑戰你嘅即時按鍵紀錄。'],
      'dj-studio': ['互動音樂引擎', 'Shortcut DJ Studio', '將連擊變成現場音樂——揀選曲風、自訂 16 步節拍網格並升級樂器。'],
      'sound-packs': ['動態音效包', '主題音效包', '切換 Katana、Anime、Harbor 同 Cyber 音效，隨連擊數即時變化。'],
      guides: ['教學指南', 'Mac 快捷鍵指南', '互動式 macOS 快捷鍵教學與速查表。'],
      login: ['帳戶', '登入 / 免費試玩', '登入或建立免費帳戶以解鎖 DJ Studio 並雲端同步你嘅節拍。'],
      'level-btn': ['關卡', '開始練習關卡', '點擊查看此關卡快捷鍵並開始練習。'],
      fallback_open: ['開啟', '開啟 ', '前往 ']
    },
    'zh-CN': {
      'desktop-meltdown': ['全新 🔥 · 街机生存', 'Desktop Meltdown（生存与慢速练习）', '在被劫持的 Mac 桌面上生存！使用真实 Mac 快捷键（⌘+W、⌘+H、⌘+Space、⌘+Q、⌘+Z）消灭弹窗与异常应用。含不限时慢速练习模式。'],
      v1g1: ['第 1 辑 · 游戏 1', 'Mac 入门第一步', '建立核心肌肉记忆：聚焦搜索 (⌘+Space)、复制粘贴剪切 (⌘+C/V/X)、撤销 (⌘+Z) 与退出。'],
      v1g2: ['第 1 辑 · 游戏 2', '日常高效驱动', '全屏切换 (⌃+⌘+F)、调度中心 (⌃+方向键)、窗口切换 (⌘+`) 与文字样式快捷键。'],
      v1g3: ['第 1 辑 · 游戏 3', '效率加速器', '浏览器标签页速练：新建/关闭/重开标签页 (⌘+T/W, ⇧+⌘+T)、地址栏 (⌘+L) 与刷新 (⌘+R)。'],
      v1g4: ['第 1 辑 · 游戏 4', '辅助功能专家', '硬件与辅助控制：微调音量/亮度 (⌥+⇧+F11/F12)、静音 (F10)、旁白与缩放。'],
      v2g1: ['第 2 辑 · 游戏 1', '系统电源控制', '锁定屏幕 (⌃+⌘+Q)、退出登录 (⇧+⌘+Q)、睡眠 (⌥+⌘+Power) 等系统控制快捷键。'],
      v2g2: ['第 2 辑 · 游戏 2', '窗口管理大师', '隐藏应用 (⌘+H)、隐藏其他 (⌥+⌘+H)、全部最小化 (⌥+⌘+M) 与重做 (⇧+⌘+Z)。'],
      v3g1: ['第 3 辑 · 游戏 1', '访达基础导航', '快速跳转文件夹：桌面 (⇧+⌘+D)、前往文件夹 (⇧+⌘+G)、个人 (⇧+⌘+H) 与 iCloud 云盘。'],
      v3g2: ['第 3 辑 · 游戏 2', '访达进阶视图', '查看显示选项 (⌘+J)、快速查看 (⌘+Y)、路径栏 (⌥+⌘+P) 与边栏切换 (⌥+⌘+S)。'],
      v4g1: ['第 4 辑 · 游戏 1', '文本光标移动', '不用鼠标移动光标：逐词跳转 (⌥+左右)、行首行尾 (⌘+左右) 与文首文末。'],
      v4g2: ['第 4 辑 · 游戏 2', '文本编辑精通', '快速选中与编辑：整行/整词选中 (⇧+⌘+方向键, ⌥+⇧+方向键) 与排版快捷键。'],
      multiplayer: ['多人对战', '分屏多人与 Ghost DNA', '与好友同屏竞速，或分享 Ghost DNA 链接让好友挑战你的真实按键节奏。'],
      'dj-studio': ['互动音乐引擎', 'Shortcut DJ Studio', '把连击变成现场节拍——选择曲风、自定义 16 步鼓点网格并升级乐器。'],
      'sound-packs': ['动态音效包', '主题音效包', '切换 Katana、Anime、Harbor 与 Cyber 音效，随连击实时响应。'],
      guides: ['教程指南', 'Mac 快捷键指南', '交互式 macOS 快捷键参考指南与速查表。'],
      login: ['账号', '登录 / 免费试用', '登录或创建免费账号以解锁 DJ Studio 并云端同步你的节拍。'],
      'level-btn': ['关卡', '开始练习关卡', '点击查看本关快捷键并开始训练。'],
      fallback_open: ['打开', '打开 ', '前往 ']
    },
    'nan-Hokkien': {
      'desktop-meltdown': ['新 🔥 · 生存模式', 'Desktop Meltdown（生存佮慢速練習）', '用真正 Mac 快捷鍵（⌘+W、⌘+H、⌘+Space、⌘+Q、⌘+Z）拍掉跳出來的窗仔，保護系統！內底有慢速練習模式。'],
      v1g1: ['第 1 輯 · 1', 'Mac 入門第一步', '練習 Spotlight (⌘+Space)、拷貝貼上 (⌘+C/V/X)、取消 (⌘+Z) 佮關掉程式。'],
      'dj-studio': ['互動音樂', 'Shortcut DJ Studio', '共連擊變成現場音樂——揀曲風、自訂 16 步節奏格仔。'],
      guides: ['指南', 'Mac 快捷鍵指南', '一步一步學 macOS 快捷鍵。'],
      fallback_open: ['開', '開 ', '去到 ']
    },
    hak: {
      'desktop-meltdown': ['新 🔥 · 生存模式', 'Desktop Meltdown（生存同慢速練習）', '用真正 Mac 快捷鍵（⌘+W、⌘+H、⌘+Space、⌘+Q、⌘+Z）消滅彈窗，保護系統！有慢速練習模式。'],
      v1g1: ['第 1 輯 · 1', 'Mac 入門第一步', '練習 Spotlight (⌘+Space)、複製貼上 (⌘+C/V/X)、復原 (⌘+Z) 同結束程式。'],
      'dj-studio': ['互動音樂', 'Shortcut DJ Studio', '將連擊變成現場音樂——選曲風、自訂 16 步節奏。'],
      guides: ['指南', 'Mac 快捷鍵指南', '一步一步學習 macOS 快捷鍵。'],
      fallback_open: ['打開', '打開 ', '前往 ']
    },
    wuu: {
      'desktop-meltdown': ['新 🔥 · 生存模式', 'Desktop Meltdown（生存搭慢速练习）', '用真正 Mac 快捷键（⌘+W、⌘+H、⌘+Space、⌘+Q、⌘+Z）消灭弹窗，保护系统！带慢速练习模式。'],
      v1g1: ['第 1 辑 · 1', 'Mac 入门第一步', '练习 Spotlight (⌘+Space)、复制粘贴 (⌘+C/V/X)、撤销 (⌘+Z) 搭退出。'],
      'dj-studio': ['互动音乐', 'Shortcut DJ Studio', '拿连击变成现场节拍——选曲风、自定 16 步网格。'],
      guides: ['指南', 'Mac 快捷键指南', '一步一步学好 macOS 快捷键。'],
      fallback_open: ['打开', '打开 ', '前往 ']
    },
    'de-CH': {
      'desktop-meltdown': ['NEU 🔥 · ARCADE SURVIVAL', 'Desktop Meltdown (Survival & Übung)', 'Überlebe einen gekaperten Mac! Zerstöre Popups und hängende Apps mit echten Mac-Kurzbefehlen (⌘+W, ⌘+H, ⌘+Space, ⌘+Q, ⌘+Z). Inklusive ruhigem Übungsmodus.'],
      v1g1: ['BAND 1 · SPIEL 1', 'Erste Schritte am Mac', 'Basis-Muskelgedächtnis: Spotlight (⌘+Space), Kopieren/Einfügen/Ausschneiden (⌘+C/V/X), Widerrufen (⌘+Z) und Beenden.'],
      v1g2: ['BAND 1 · SPIEL 2', 'Daily Driver', 'Tägliches Tempo: Vollbild (⌃+⌘+F), Mission Control (⌃+Pfeile), Fensterwechsel (⌘+`) und Textformatierung.'],
      v1g3: ['BAND 1 · SPIEL 3', 'Produktivitäts-Booster', 'Browser- und App-Tempo: Tabs öffnen/schliessen/wiederherstellen (⌘+T/W, ⇧+⌘+T), Adressleiste (⌘+L) und Neu laden (⌘+R).'],
      v1g4: ['BAND 1 · SPIEL 4', 'Bedienungshilfen Pro', 'Hardware & Bedienungshilfen: Lautstärke/Helligkeit fein (⌥+⇧+F11/F12), Stumm (F10), VoiceOver und Zoom.'],
      v2g1: ['BAND 2 · SPIEL 1', 'Systemsteuerung', 'Strom & Sperre ohne Menüs: Bildschirm sperren (⌃+⌘+Q), Abmelden (⇧+⌘+Q) und Ruhezustand (⌥+⌘+Power).'],
      v2g2: ['BAND 2 · SPIEL 2', 'Fenster-Management', 'Fenster & Bearbeitung: App ausblenden (⌘+H), Andere ausblenden (⌥+⌘+H), Alle minimieren (⌥+⌘+M) und Wiederholen (⇧+⌘+Z).'],
      v3g1: ['BAND 3 · SPIEL 1', 'Finder-Grundlagen', 'Ordner blitzschnell öffnen: Schreibtisch (⇧+⌘+D), Gehe zum Ordner (⇧+⌘+G), Benutzer (⇧+⌘+H) und iCloud Drive.'],
      v3g2: ['BAND 3 · SPIEL 2', 'Finder-Profi', 'Ansichten & Vorschau: Darstellungsoptionen (⌘+J), Übersicht (⌘+Y), Pfadleiste (⌥+⌘+P) und Seitenleiste (⌥+⌘+S).'],
      v4g1: ['BAND 4 · SPIEL 1', 'Textnavigation', 'Cursor ohne Maus bewegen: wortweise (⌥+Links/Rechts), Zeilenanfang/-ende (⌘+Links/Rechts) und Dokumentanfang/-ende.'],
      v4g2: ['BAND 4 · SPIEL 2', 'Text-Meisterschaft', 'Schnellauswahl & Formatierung: Zeilen/Wörter markieren (⇧+⌘+Pfeile, ⌥+⇧+Pfeile) und Kurzbefehle.'],
      multiplayer: ['MEHRSPIELER', 'Split-Screen & Ghost DNA', 'Tritt im Split-Screen gegeneinander an oder teile einen Ghost-DNA-Link für ein Rennen gegen deine echten Tastenanschläge.'],
      'dj-studio': ['INTERAKTIVES AUDIO', 'Shortcut DJ Studio', 'Verwandle Serien in Live-Musik—wähle ein Genre, gestalte das 16-Step-Raster und verbessere Instrumente.'],
      'sound-packs': ['REAKTIVES AUDIO', 'Sound Packs', 'Wechsle zwischen Katana, Anime, Harbor und Cyber, die auf deine Serie reagieren.'],
      guides: ['ANLEITUNGEN', 'Mac-Kurzbefehl-Guides', 'Interaktive Schritt-für-Schritt-Anleitungen und Spickzettel für macOS.'],
      login: ['KONTO', 'Anmelden / Gratis-Test', 'Melde dich an, um das DJ Studio freizuschalten und Beats in der Cloud zu speichern.'],
      'level-btn': ['LEVEL', 'Level starten', 'Klicken, um die Kurzbefehle dieses Levels anzusehen und zu üben.'],
      fallback_open: ['ÖFFNEN', 'Öffnen: ', 'Weiter zu ']
    },
    'it-IT': {
      'desktop-meltdown': ['NUOVO 🔥 · SOPRAVVIVENZA', 'Desktop Meltdown (Sopravvivenza e Pratica)', 'Sopravvivi a un Mac violato! Elimina popup e app bloccate con vere scorciatoie Mac (⌘+W, ⌘+H, ⌘+Spazio, ⌘+Q, ⌘+Z). Include la Pratica Lenta.'],
      v1g1: ['VOLUME 1 · GIOCO 1', 'Primi Passi su Mac', 'Memoria muscolare di base: Spotlight (⌘+Spazio), Copia/Incolla/Taglia (⌘+C/V/X), Annulla (⌘+Z) ed Esci.'],
      v1g2: ['VOLUME 1 · GIOCO 2', 'Uso Quotidiano', 'Velocità quotidiana: Schermo intero (⌃+⌘+F), Mission Control (⌃+Frecce), cambio finestra (⌘+`) e stile testo.'],
      v1g3: ['VOLUME 1 · GIOCO 3', 'Produttività Rapida', 'Scorciatoie browser: Nuova/Chiudi/Riapri scheda (⌘+T/W, ⇧+⌘+T), Barra indirizzi (⌘+L) e Ricarica (⌘+R).'],
      v1g4: ['VOLUME 1 · GIOCO 4', 'Accessibilità Pro', 'Controlli hardware e accessibilità: Volume/Luminosità fini (⌥+⇧+F11/F12), Muto (F10), VoiceOver e Zoom.'],
      v2g1: ['VOLUME 2 · GIOCO 1', 'Controllo Sistema', 'Blocco e alimentazione: Blocca schermo (⌃+⌘+Q), Esci (⇧+⌘+Q) e Stop (⌥+⌘+Power).'],
      v2g2: ['VOLUME 2 · GIOCO 2', 'Gestione Finestre', 'Nascondi app (⌘+H), Nascondi altre (⌥+⌘+H), Riduci tutte (⌥+⌘+M) e Ripristina (⇧+⌘+Z).'],
      v3g1: ['VOLUME 3 · GIOCO 1', 'Finder Base', 'Navigazione rapida: Scrivania (⇧+⌘+D), Vai alla cartella (⇧+⌘+G), Inizio (⇧+⌘+H) e iCloud Drive.'],
      v3g2: ['VOLUME 3 · GIOCO 2', 'Finder Avanzato', 'Opzioni vista (⌘+J), Visualizzazione rapida (⌘+Y), Barra percorso (⌥+⌘+P) e Barra laterale (⌥+⌘+S).'],
      v4g1: ['VOLUME 4 · GIOCO 1', 'Modifica Testo', 'Muovi il cursore senza mouse: salto parola (⌥+Sinistra/Destra), inizio/fine riga (⌘+Sinistra/Destra).'],
      v4g2: ['VOLUME 4 · GIOCO 2', 'Maestria Testo', 'Selezione rapida di parole e righe (⇧+⌘+Frecce, ⌥+⇧+Frecce) e formattazione.'],
      multiplayer: ['MULTIPLAYER', 'Split-Screen e Ghost DNA', 'Sfida un amico o condividi un link Ghost DNA per gareggiare contro i tuoi tasti reali.'],
      'dj-studio': ['AUDIO INTERATTIVO', 'Shortcut DJ Studio', 'Trasforma le serie in musica dal vivo—scegli un genere e personalizza la griglia a 16 step.'],
      'sound-packs': ['AUDIO REATTIVO', 'Pacchetti Audio', 'Scegli tra Katana, Anime, Harbor e Cyber che reagiscono alla tua combo.'],
      guides: ['GUIDE', 'Guide Scorciatoie Mac', 'Guide interattive passo dopo passo e promemoria per macOS.'],
      login: ['ACCOUNT', 'Accedi / Prova Gratuita', 'Accedi o crea un account gratuito per sbloccare DJ Studio e salvare i tuoi beat.'],
      'level-btn': ['LIVELLO', 'Avvia Livello', 'Clicca per rivedere le scorciatoie di questo livello e iniziare.'],
      fallback_open: ['APRI', 'Apri ', 'Vai a ']
    },
    'fr-FR': {
      'desktop-meltdown': ['NOUVEAU 🔥 · SURVIE', 'Desktop Meltdown (Survie & Pratique)', 'Survivez à un Mac piraté ! Détruisez les popups et apps figées avec de vrais raccourcis Mac (⌘+W, ⌘+H, ⌘+Espace, ⌘+Q, ⌘+Z). Mode Pratique lente inclus.'],
      v1g1: ['VOLUME 1 · JEU 1', 'Premiers Pas sur Mac', 'Mémoire musculaire de base : Spotlight (⌘+Espace), Copier/Coller/Couper (⌘+C/V/X), Annuler (⌘+Z) et Quitter.'],
      v1g2: ['VOLUME 1 · JEU 2', 'Usage Quotidien', 'Plein écran (⌃+⌘+F), Mission Control (⌃+Flèches), changement de fenêtre (⌘+`) et mise en forme.'],
      v1g3: ['VOLUME 1 · JEU 3', 'Boosters de Productivité', 'Raccourcis navigateur : Nouvel/Fermer/Rouvrir onglet (⌘+T/W, ⇧+⌘+T), Barre d’adresse (⌘+L) et Actualiser (⌘+R).'],
      v1g4: ['VOLUME 1 · JEU 4', 'Accessibilité Pro', 'Contrôles matériel et accessibilité : Volume/Luminosité fins (⌥+⇧+F11/F12), Silence (F10), VoiceOver et Zoom.'],
      v2g1: ['VOLUME 2 · JEU 1', 'Contrôle Système', 'Verrouiller l’écran (⌃+⌘+Q), Fermer la session (⇧+⌘+Q) et Suspendre (⌥+⌘+Power).'],
      v2g2: ['VOLUME 2 · JEU 2', 'Gestion des Fenêtres', 'Masquer l’app (⌘+H), Masquer les autres (⌥+⌘+H), Tout réduire (⌥+⌘+M) et Rétablir (⇧+⌘+Z).'],
      v3g1: ['VOLUME 3 · JEU 1', 'Bases du Finder', 'Navigation rapide : Bureau (⇧+⌘+D), Aller au dossier (⇧+⌘+G), Départ (⇧+⌘+H) et iCloud Drive.'],
      v3g2: ['VOLUME 3 · JEU 2', 'Finder Avancé', 'Options de présentation (⌘+J), Coup d’œil (⌘+Y), Barre du chemin (⌥+⌘+P) et Barre latérale (⌥+⌘+S).'],
      v4g1: ['VOLUME 4 · JEU 1', 'Édition de Texte', 'Déplacer le curseur sans souris : saut par mot (⌥+Gauche/Droite), début/fin de ligne (⌘+Gauche/Droite).'],
      v4g2: ['VOLUME 4 · JEU 2', 'Maîtrise du Texte', 'Sélection rapide de mots et lignes (⇧+⌘+Flèches, ⌥+⇧+Flèches) et formatage.'],
      multiplayer: ['MULTIJOUEUR', 'Écran Partagé & Ghost DNA', 'Affrontez un ami ou partagez un lien Ghost DNA pour courir contre vos frappes exactes.'],
      'dj-studio': ['AUDIO INTERACTIF', 'Shortcut DJ Studio', 'Transformez vos séries en musique live—choisissez un genre et créez votre grille à 16 pas.'],
      'sound-packs': ['AUDIO RÉACTIF', 'Packs Sonores', 'Passez entre Katana, Anime, Harbor et Cyber qui réagissent à votre combo.'],
      guides: ['GUIDES', 'Guides Raccourcis Mac', 'Guides interactifs étape par étape et antisèches pour macOS.'],
      login: ['COMPTE', 'Connexion / Essai Gratuit', 'Connectez-vous pour débloquer DJ Studio et synchroniser vos rythmes.'],
      'level-btn': ['NIVEAU', 'Lancer le Niveau', 'Cliquez pour revoir les raccourcis de ce niveau et pratiquer.'],
      fallback_open: ['OUVRIR', 'Ouvrir ', 'Aller à ']
    },
    'da-DK': {
      'desktop-meltdown': ['NY 🔥 · OVERLEVELSE', 'Desktop Meltdown (Overlevelse & Øvelse)', 'Overlev en kapret Mac! Ødelæg popups og frosne apps med rigtige Mac-genveje (⌘+W, ⌘+H, ⌘+Mellemrum, ⌘+Q, ⌘+Z). Inkluderer rolig øvetilstand.'],
      v1g1: ['BIND 1 · SPIL 1', 'Første Skridt på Mac', 'Grundlæggende muskelhukommelse: Spotlight (⌘+Mellemrum), Kopier/Sæt ind/Klip (⌘+C/V/X), Fortryd (⌘+Z) og Afslut.'],
      v1g2: ['BIND 1 · SPIL 2', 'Daglig Driver', 'Fuld skærm (⌃+⌘+F), Mission Control (⌃+Pile), skift vindue (⌘+`) og tekstformatering.'],
      v1g3: ['BIND 1 · SPIL 3', 'Produktivitets-Booster', 'Browsergenveje: Ny/Luk/Genåbn fane (⌘+T/W, ⇧+⌘+T), Adresselinje (⌘+L) og Genindlæs (⌘+R).'],
      v1g4: ['BIND 1 · SPIL 4', 'Tilgængelighed Pro', 'Hardware og tilgængelighed: Lyd/Lysstyrke fint (⌥+⇧+F11/F12), Lydløs (F10), VoiceOver og Zoom.'],
      v2g1: ['BIND 2 · SPIL 1', 'Systemkontrol', 'Lås skærm (⌃+⌘+Q), Log ud (⇧+⌘+Q) og Dvale (⌥+⌘+Power).'],
      v2g2: ['BIND 2 · SPIL 2', 'Vinduesstyring', 'Skjul app (⌘+H), Skjul andre (⌥+⌘+H), Minimer alle (⌥+⌘+M) og Gentag (⇧+⌘+Z).'],
      v3g1: ['BIND 3 · SPIL 1', 'Finder Basis', 'Hurtig mappenavigation: Skrivebord (⇧+⌘+D), Gå til mappe (⇧+⌘+G), Hjem (⇧+⌘+H) og iCloud Drive.'],
      v3g2: ['BIND 3 · SPIL 2', 'Finder Power', 'Visningsindstillinger (⌘+J), Hurtig visning (⌘+Y), Stilinje (⌥+⌘+P) og Indholdsoversigt (⌥+⌘+S).'],
      v4g1: ['BIND 4 · SPIL 1', 'Tekstredigering', 'Flyt markøren uden mus: ordhop (⌥+Venstre/Højre) og linjestart/-slut (⌘+Venstre/Højre).'],
      v4g2: ['BIND 4 · SPIL 2', 'Tekstmestring', 'Hurtig markering af ord og linjer (⇧+⌘+Pile, ⌥+⇧+Pile) og formatering.'],
      multiplayer: ['MULTIPLAYER', 'Split-Screen & Ghost DNA', 'Kør om kap med en ven eller del et Ghost DNA-link så venner kan køre mod dine præcise tastetryk.'],
      'dj-studio': ['INTERAKTIV LYD', 'Shortcut DJ Studio', 'Forvandl serier til livemusik—vælg genre, byg et 16-trins beatgrid og opgrader instrumenter.'],
      'sound-packs': ['REAKTIV LYD', 'Lydpakker', 'Skift mellem Katana, Anime, Harbor og Cyber der reagerer på din combo.'],
      guides: ['GUIDES', 'Mac Genvejsguides', 'Trin-for-trin interaktive guides og snydeark til macOS.'],
      login: ['KONTO', 'Log ind / Gratis Prøve', 'Log ind for at låse op for DJ Studio og synkronisere dine beats.'],
      'level-btn': ['NIVEAU', 'Start Niveau', 'Klik for at se genvejene i dette niveau og begynde at øve.'],
      fallback_open: ['ÅBN', 'Åbn ', 'Gå til ']
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
  let activeTipTarget = null;

  function getRootPrefix() {
    const p = (global.location && global.location.pathname) || '';
    if (p.indexOf('/games/') !== -1 || p.indexOf('/guides/') !== -1 || p.indexOf('/multiplayer/') !== -1) {
      return '../';
    }
    return '';
  }

  function getActiveLocale() {
    let loc = '';
    try {
      loc = localStorage.getItem('mrs.locale') || '';
    } catch (_) {}
    if (!loc && document.documentElement) {
      loc = document.documentElement.getAttribute('lang') || '';
    }
    if (I18N_TIPS[loc]) return loc;
    const base = loc.split('-')[0];
    if (base === 'es') return 'es-419';
    if (base === 'de') return 'de-CH';
    if (base === 'it') return 'it-IT';
    if (base === 'fr') return 'fr-FR';
    if (base === 'da') return 'da-DK';
    if (base === 'tl') return 'tl';
    return 'en';
  }

  function getTipEntry(key) {
    const loc = getActiveLocale();
    const dict = I18N_TIPS[loc] || I18N_TIPS.en;
    return dict[key] || I18N_TIPS.en[key] || null;
  }

  function resolveTipForElement(el) {
    if (!el || !el.getAttribute) return null;
    const explicit = el.getAttribute('data-kv-tip') || el.getAttribute('data-kv-info') || el.getAttribute('data-game');
    if (explicit) {
      const entry = getTipEntry(explicit);
      if (entry) return { badge: entry[0], title: entry[1], desc: entry[2] };
    }

    const id = el.id || '';
    if (id === 'kv-nav-open-dj' || id === 'kv-studio-open-btn' || id === 'kv-audio-popover-btn') {
      const e = getTipEntry('dj-studio');
      return { badge: e[0], title: e[1], desc: e[2] };
    }
    if (el.classList && el.classList.contains('kv-pack-chip')) {
      const e = getTipEntry('sound-packs');
      return { badge: e[0], title: e[1], desc: e[2] };
    }
    if (el.classList && el.classList.contains('level-btn')) {
      const e = getTipEntry('level-btn');
      const label = (el.textContent || '').replace(/\s+/g, ' ').trim();
      return { badge: e[0], title: label || e[1], desc: e[2] };
    }

    const href = el.getAttribute('href') || '';
    if (href) {
      const map = [
        ['desktop-meltdown', 'desktop-meltdown'],
        ['v1g1', 'v1g1'], ['v1g2', 'v1g2'], ['v1g3', 'v1g3'], ['v1g4', 'v1g4'],
        ['v2g1', 'v2g1'], ['v2g2', 'v2g2'],
        ['v3g1', 'v3g1'], ['v3g2', 'v3g2'],
        ['v4g1', 'v4g1'], ['v4g2', 'v4g2'],
        ['#multiplayer', 'multiplayer'],
        ['guides/', 'guides'], ['#guide', 'guides'],
        ['about.html', 'about'], ['contact.html', 'contact'],
        ['privacy.html', 'privacy'], ['terms.html', 'terms'],
        ['login.html', 'login'], ['account.html', 'account']
      ];
      for (let i = 0; i < map.length; i++) {
        if (href.indexOf(map[i][0]) !== -1) {
          const e = getTipEntry(map[i][1]);
          if (e) return { badge: e[0], title: e[1], desc: e[2] };
        }
      }
      const rawText = (el.textContent || el.getAttribute('aria-label') || '').replace(/ⓘ/g, '').replace(/\s+/g, ' ').trim();
      const fb = getTipEntry('fallback_open') || ['OPEN', 'Open ', 'Navigate to '];
      if (rawText) {
        return {
          badge: fb[0],
          title: rawText,
          desc: fb[2] + (href.startsWith('#') ? rawText : href.replace(/^\.\.\//, ''))
        };
      }
    }
    return null;
  }

  function injectStyles() {
    if (document.getElementById('kv-nav-styles')) return;
    const style = document.createElement('style');
    style.id = 'kv-nav-styles';
    style.textContent = `
      header.site {
        display: none !important;
      }
      body {
        padding-top: 76px !important;
        box-sizing: border-box;
      }
      #kv-unified-topbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 56px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 20px;
        background: rgba(11, 14, 17, 0.9);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 10020;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      #kv-topbar-left,
      #kv-topbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .kv-explore-btn,
      #kv-topbar-right #lang-switch-btn,
      #kv-topbar-right #lang-trigger {
        position: static !important;
        top: auto !important;
        right: auto !important;
        left: auto !important;
        display: inline-flex !important;
        align-items: center;
        gap: 6px;
        background: rgba(23, 28, 34, 0.92) !important;
        color: #e6edf3 !important;
        border: 1px solid #2b3544 !important;
        border-radius: 999px !important;
        padding: 6px 12px !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        cursor: pointer;
        white-space: nowrap;
        transition: border-color 0.15s, color 0.15s, background 0.15s;
        line-height: 1.2;
      }
      .kv-explore-btn:hover,
      .kv-explore-btn[aria-expanded="true"],
      #kv-topbar-right #lang-switch-btn:hover,
      #kv-topbar-right #lang-trigger:hover {
        border-color: #13f2b0 !important;
        color: #13f2b0 !important;
        background: rgba(19, 242, 176, 0.1) !important;
      }
      #kv-nav-panel,
      #kv-fallback-audio-pop {
        display: none;
        position: fixed;
        width: min(860px, calc(100vw - 24px));
        max-height: calc(100vh - 76px);
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
      #kv-fallback-audio-pop {
        width: min(290px, calc(100vw - 24px));
        padding: 14px;
      }
      #kv-nav-panel.open,
      #kv-fallback-audio-pop.open {
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
      .kv-vol-group { margin: 6px 0; }
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

      /* Global Floating Hover Explanation Card */
      #kv-info-tooltip {
        position: fixed;
        z-index: 99999;
        width: min(330px, calc(100vw - 24px));
        background: rgba(13, 18, 24, 0.97);
        border: 1px solid rgba(19, 242, 176, 0.52);
        border-radius: 12px;
        padding: 12px 14px;
        box-shadow: 0 18px 44px rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        color: #e6edf3;
        pointer-events: none;
        opacity: 0;
        transform: translateY(4px);
        transition: opacity 0.13s ease, transform 0.13s ease;
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
      @media (max-width: 640px) {
        #kv-unified-topbar { padding: 0 10px; }
        #kv-topbar-left, #kv-topbar-right { gap: 6px; }
        .kv-explore-btn,
        #kv-audio-popover-btn,
        #kv-topbar-right #lang-switch-btn,
        #kv-topbar-right #lang-trigger {
          padding: 5px 9px !important;
          font-size: 0.74rem !important;
        }
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
    if (top < 64) {
      top = Math.min(vh - th - 12, rect.bottom + 8);
    }
    tip.style.left = left + 'px';
    tip.style.top = Math.max(12, top) + 'px';
  }

  function showTipForElement(target) {
    const data = resolveTipForElement(target);
    if (!data) return;
    const tip = ensureTooltipEl();
    activeTipTarget = target;
    tip.innerHTML = `
      <div class="kv-tip-badge">${escapeHtml(data.badge)}</div>
      <div class="kv-tip-title">${escapeHtml(data.title)}</div>
      <div class="kv-tip-desc">${escapeHtml(data.desc)}</div>
    `;
    tip.setAttribute('aria-hidden', 'false');
    positionTooltip(target, tip);
    tip.classList.add('visible');
  }

  function hideInfoCard() {
    const tip = document.getElementById('kv-info-tooltip');
    if (!tip) return;
    activeTipTarget = null;
    tip.classList.remove('visible');
    tip.setAttribute('aria-hidden', 'true');
  }

  function attachTouchDots(scope) {
    (scope || document).querySelectorAll('[data-kv-info], [data-game]').forEach(function (el) {
      if (el.querySelector('.kv-info-dot')) return;
      const dot = document.createElement('span');
      dot.className = 'kv-info-dot' + (el.classList.contains('game-card') ? ' kv-info-dot-card' : '');
      dot.setAttribute('role', 'button');
      dot.setAttribute('tabindex', '0');
      dot.setAttribute('aria-label', 'Info');
      dot.textContent = 'ⓘ';
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (activeTipTarget === el) {
          hideInfoCard();
        } else {
          showTipForElement(el);
        }
      });
      el.appendChild(dot);
    });
  }

  function setupGlobalHoverDelegation() {
    const SELECTOR = 'a[href], .game-card, .level-btn, [data-kv-tip], [data-kv-info], [data-game], #kv-nav-open-dj, #kv-studio-open-btn, #kv-audio-popover-btn, .kv-pack-chip';

    document.addEventListener('mouseover', function (e) {
      const target = e.target && e.target.closest ? e.target.closest(SELECTOR) : null;
      if (!target || target === activeTipTarget) return;
      showTipForElement(target);
    });
    document.addEventListener('mouseout', function (e) {
      if (!activeTipTarget) return;
      const rel = e.relatedTarget;
      if (!rel || !activeTipTarget.contains(rel)) {
        const next = rel && rel.closest ? rel.closest(SELECTOR) : null;
        if (!next) hideInfoCard();
      }
    });
    document.addEventListener('focusin', function (e) {
      const target = e.target && e.target.closest ? e.target.closest(SELECTOR) : null;
      if (target) showTipForElement(target);
    });
    document.addEventListener('focusout', function () {
      hideInfoCard();
    });

    // Re-render active tooltip immediately if language changes
    if (global.MutationObserver && document.documentElement) {
      new MutationObserver(function () {
        if (activeTipTarget) showTipForElement(activeTipTarget);
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    }
    global.addEventListener('storage', function (e) {
      if (e.key === 'mrs.locale' && activeTipTarget) {
        showTipForElement(activeTipTarget);
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
        <a class="kv-nav-link" data-kv-tip="account" href="${root}multiplayer/account.html" style="padding-left:0;">👤 Account &amp; Stats →</a>
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
        <a class="kv-acct-cta" data-kv-tip="login" href="${root}login.html?redirect=${currentUrl}">🔑 Sign In / Free Trial</a>
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
    const left = Math.max(12, Math.min(vw - panelWidth - 12, rect.left));
    panel.style.left = left + 'px';
    panel.style.top = (rect.bottom + 8) + 'px';
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
    if (document.getElementById('kv-unified-topbar')) return;
    injectStyles();
    ensureTooltipEl();
    const root = getRootPrefix();

    // 1. Create Unified Full-Width Top Navbar
    const topbar = document.createElement('div');
    topbar.id = 'kv-unified-topbar';

    const left = document.createElement('div');
    left.id = 'kv-topbar-left';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'kv-explore-trigger';
    trigger.className = 'kv-explore-btn';
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', 'kv-nav-panel');
    trigger.innerHTML = '☰ Explore Keyverse <span aria-hidden="true">▾</span>';
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });
    left.appendChild(trigger);

    const right = document.createElement('div');
    right.id = 'kv-topbar-right';

    const audioSlot = document.createElement('div');
    audioSlot.id = 'kv-topbar-audio-slot';
    audioSlot.style.display = 'inline-flex';
    audioSlot.style.alignItems = 'center';
    right.appendChild(audioSlot);

    topbar.appendChild(left);
    topbar.appendChild(right);
    document.body.insertBefore(topbar, document.body.firstChild);

    // Move existing audio bar OR create fallback Audio & DJ button
    const existingAudioBar = document.getElementById('kv-audio-bar');
    if (existingAudioBar) {
      audioSlot.appendChild(existingAudioBar);
    } else {
      const fbBtn = document.createElement('button');
      fbBtn.type = 'button';
      fbBtn.id = 'kv-audio-popover-btn';
      fbBtn.className = 'kv-explore-btn';
      fbBtn.setAttribute('data-kv-tip', 'dj-studio');
      fbBtn.innerHTML = '🎛️ Audio &amp; DJ <span aria-hidden="true">▾</span>';

      const fbPop = document.createElement('div');
      fbPop.id = 'kv-fallback-audio-pop';
      fbPop.innerHTML = `
        <div class="kv-vol-label" style="margin-bottom:6px;">🎵 Origin &amp; Vibe Sound Packs</div>
        <div class="kv-pack-row">${PACKS.map(p => `<button type="button" class="kv-pack-chip" data-pack="${p.id}">${p.label}</button>`).join('')}</div>
        <button type="button" class="kv-nav-link featured" data-kv-tip="dj-studio" id="kv-fb-open-dj" style="margin-top:6px;">🎛️ Launch Shortcut DJ Studio →</button>
      `;
      document.body.appendChild(fbPop);

      fbBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        const willOpen = !fbPop.classList.contains('open');
        if (willOpen) {
          const r = fbBtn.getBoundingClientRect();
          const vw = global.innerWidth || document.documentElement.clientWidth;
          fbPop.style.left = Math.max(12, Math.min(vw - 302, r.right - 290)) + 'px';
          fbPop.style.top = (r.bottom + 8) + 'px';
          fbPop.classList.add('open');
        } else {
          fbPop.classList.remove('open');
        }
      });
      document.addEventListener('click', function (e) {
        if (fbPop.classList.contains('open') && !fbPop.contains(e.target) && e.target !== fbBtn) {
          fbPop.classList.remove('open');
        }
      });
      fbPop.querySelectorAll('.kv-pack-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          global.location.href = root + 'games/desktop-meltdown.html?pack=' + encodeURIComponent(chip.getAttribute('data-pack'));
        });
      });
      const fbDj = document.getElementById('kv-fb-open-dj');
      if (fbDj) {
        fbDj.addEventListener('click', function () {
          global.location.href = root + 'games/desktop-meltdown.html?open_dj=1';
        });
      }
      audioSlot.appendChild(fbBtn);
    }

    // Dock existing language switcher cleanly inside the right side of the unified bar
    const langSwitchBtn = document.getElementById('lang-switch-btn');
    const langTrigger = document.getElementById('lang-trigger');
    if (langSwitchBtn) {
      right.appendChild(langSwitchBtn);
    } else if (langTrigger) {
      right.appendChild(langTrigger);
    }

    // 2. Build Explore Keyverse Dropdown Panel
    const panel = document.createElement('div');
    panel.id = 'kv-nav-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Explore Keyverse Navigation');

    const v1Links = GAMES.v1.map(g => `<a class="kv-nav-link" data-kv-tip="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v2Links = GAMES.v2.map(g => `<a class="kv-nav-link" data-kv-tip="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v3Links = GAMES.v3.map(g => `<a class="kv-nav-link" data-kv-tip="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const v4Links = GAMES.v4.map(g => `<a class="kv-nav-link" data-kv-tip="${g.id}" href="${root}${g.path}"><span>${g.label}</span></a>`).join('');
    const guideLinks = GUIDES.map(g => `<a class="kv-nav-link" data-kv-tip="guides" href="${root}${g.path}"><span>📖 ${g.label}</span></a>`).join('');
    const packChips = PACKS.map(p => `<button type="button" class="kv-pack-chip" data-kv-tip="sound-packs" data-pack="${p.id}">${p.label}</button>`).join('');

    panel.innerHTML = `
      <div class="kv-nav-grid">
        <div class="kv-nav-col">
          <h4>🎮 Games &amp; Modes</h4>
          <a class="kv-nav-link featured" data-kv-tip="desktop-meltdown" href="${root}games/desktop-meltdown.html"><span>🔥 Desktop Meltdown</span></a>
          <a class="kv-nav-link" data-kv-tip="multiplayer" href="${root}index.html#multiplayer"><span>⚔️ Split-Screen &amp; Ghost DNA</span></a>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 1 · Essentials</div>${v1Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 2 · System &amp; Windows</div>${v2Links}</div>
        </div>
        <div class="kv-nav-col">
          <h4>⌨️ More Shortcut Volumes</h4>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 3 · Finder Mastery</div>${v3Links}</div>
          <div class="kv-vol-group"><div class="kv-vol-label">Volume 4 · Text Editing</div>${v4Links}</div>
          <h4 style="margin-top:14px;">🎛️ Audio &amp; Features</h4>
          <button type="button" class="kv-nav-link featured" data-kv-tip="dj-studio" id="kv-nav-open-dj"><span>🎛️ Shortcut DJ Studio</span></button>
          <div class="kv-vol-label" data-kv-tip="sound-packs" style="margin-top:6px;"><span>🎵 Origin &amp; Vibe Sound Packs</span></div>
          <div class="kv-pack-row">${packChips}</div>
        </div>
        <div class="kv-nav-col">
          <h4>📚 Guides &amp; Info</h4>
          ${guideLinks}
          <a class="kv-nav-link" data-kv-tip="guides" href="${root}index.html#guide"><span>❓ How to Play / Overview</span></a>
          <div style="border-top:1px solid #1e2631;margin:8px 0;padding-top:6px;">
            <a class="kv-nav-link" data-kv-tip="about" href="${root}about.html">ℹ️ About Keyverse</a>
            <a class="kv-nav-link" data-kv-tip="contact" href="${root}contact.html">✉️ Contact</a>
            <a class="kv-nav-link" data-kv-tip="privacy" href="${root}privacy.html">🔒 Privacy Policy</a>
            <a class="kv-nav-link" data-kv-tip="terms" href="${root}terms.html">📄 Terms of Service</a>
          </div>
        </div>
        <div class="kv-nav-col">
          <h4>🔑 Account</h4>
          <div id="kv-nav-account-box" class="kv-acct-box">Loading account status...</div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

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
      if (activeTipTarget && !e.target.closest('.kv-info-dot')) {
        hideInfoCard();
      }
      if (!isOpen) return;
      if (!panel.contains(e.target) && !trigger.contains(e.target)) {
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

    setupGlobalHoverDelegation();
    attachTouchDots(document);
    renderAccountBox();
    initSupabase();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})(window);
