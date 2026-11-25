/**
 * Keyverse Weekly Bug Checker & Auto-Fixer
 * Zero external dependencies — runs on Node 20+.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://keyversegames.com';
const GA_ID = 'G-HPCMTG7133';
const SKIP_DIRS = new Set(['.git', 'node_modules', '.agents']);
const SKIP_FILES = new Set(['index copy.html']);

const criticalErrors = [];
const autoFixes = [];

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, exts, out);
    } else if (!SKIP_FILES.has(entry.name) && exts.has(path.extname(entry.name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p).split(path.sep).join('/');
}

// a) Check all .js and .mjs files with node --check
const jsFiles = walk(ROOT, new Set(['.js', '.mjs'])).sort();
for (const jf of jsFiles) {
  try {
    execFileSync(process.execPath, ['--check', jf], { stdio: 'pipe' });
  } catch (err) {
    criticalErrors.push(`JS syntax error in ${rel(jf)}: ${err.stderr?.toString() || err.message}`);
  }
}

// Gather HTML files
const htmlFiles = walk(ROOT, new Set(['.html'])).sort();
const contentPages = new Set([
  'index.html',
  'about.html',
  'contact.html',
  'privacy.html',
  'terms.html'
]);
const loginPages = new Set(['login.html', 'multiplayer/login.html']);

for (const hf of htmlFiles) {
  const r = rel(hf);
  const html = fs.readFileSync(hf, 'utf8');
  const isContent = contentPages.has(r) || r.startsWith('games/') || r.startsWith('guides/');
  const isLogin = loginPages.has(r);

  // Inline <script> syntax check
  const scriptRe = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let sm;
  let idx = 0;
  while ((sm = scriptRe.exec(html)) !== null) {
    const code = sm[1].trim();
    if (!code) continue;
    try {
      new vm.Script(code, { filename: `${r}#inline-${idx}` });
    } catch (err) {
      criticalErrors.push(`Inline script syntax error in ${r} (#${idx}): ${err.message}`);
    }
    idx++;
  }

  // b) Broken internal links (href / src)
  const attrRe = /\b(?:href|src)\s*=\s*"([^"]+)"/gi;
  let am;
  while ((am = attrRe.exec(html)) !== null) {
    const raw = am[1].trim();
    if (
      !raw ||
      raw.startsWith('#') ||
      raw.startsWith('http://') ||
      raw.startsWith('https://') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('tel:') ||
      raw.startsWith('data:') ||
      raw.startsWith('javascript:') ||
      raw.includes('${')
    ) {
      continue;
    }
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    const target = clean.startsWith('/')
      ? path.join(ROOT, clean.slice(1))
      : path.resolve(path.dirname(hf), clean);
    if (!fs.existsSync(target)) {
      criticalErrors.push(`Broken internal link in ${r}: "${raw}" -> missing ${rel(target)}`);
    }
  }

  // c) GA & AdSense checks
  if (isContent) {
    if (!html.includes(GA_ID)) {
      criticalErrors.push(`Missing Google Analytics (${GA_ID}) in ${r}`);
    }
    if (!html.includes('adsbygoogle')) {
      criticalErrors.push(`Missing AdSense tag (adsbygoogle) in ${r}`);
    }
  }
  if (isLogin) {
    if (html.includes('adsbygoogle')) {
      criticalErrors.push(`Accidental AdSense tag found on login page: ${r}`);
    }
    if (!/noindex/i.test(html)) {
      criticalErrors.push(`Missing noindex robots meta on login page: ${r}`);
    }
  }

  // e) Raw unrendered Markdown or broken i18n keys
  const bodyOnly = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, '\n');

  if (/^\s{0,3}#{2,4}\s+\S/m.test(bodyOnly)) {
    criticalErrors.push(`Possible raw Markdown heading in ${r}`);
  }
  if (/\bfooter_about\b/.test(bodyOnly)) {
    criticalErrors.push(`Broken/unrendered i18n key "footer_about" in visible text of ${r}`);
  }
}

// d) Check sitemap.xml for missing public game/guide pages and auto-fix
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const expectedUrls = [];
  for (const hf of htmlFiles) {
    const r = rel(hf);
    if (r === 'index.html') {
      expectedUrls.push(`${SITE_ORIGIN}/`);
    } else if (r.startsWith('games/') || r.startsWith('guides/')) {
      expectedUrls.push(`${SITE_ORIGIN}/${r}`);
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  const missingEntries = [];
  for (const url of expectedUrls) {
    if (!sitemap.includes(`<loc>${url}</loc>`)) {
      missingEntries.push(
        `  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      );
      autoFixes.push(`Added missing sitemap URL: ${url}`);
    }
  }
  if (missingEntries.length > 0 && sitemap.includes('</urlset>')) {
    sitemap = sitemap.replace('</urlset>', `${missingEntries.join('\n')}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  }
} else {
  criticalErrors.push('Missing sitemap.xml at repository root');
}

console.log(`Checked ${jsFiles.length} JS/MJS files and ${htmlFiles.length} HTML files.`);
if (autoFixes.length > 0) {
  console.log('Auto-fixes applied:');
  for (const fix of autoFixes) console.log(`  - ${fix}`);
}
if (criticalErrors.length > 0) {
  console.error('Critical errors found:');
  for (const err of criticalErrors) console.error(`  - ${err}`);
  process.exit(1);
}
console.log('Weekly Keyverse health check passed with 0 critical errors.');
