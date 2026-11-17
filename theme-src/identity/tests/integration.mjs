import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';

const build = path.resolve('../../themes/identity/build');
const manifest = JSON.parse(await fs.readFile(path.join(build, '.vite/manifest.json'), 'utf8'))['index.html'];
let server;
let base = process.env.QA_URL;
if (!base) {
  // Explicit synthetic public-data fixture: static preview only, never a database.
  const fixture = { name: 'QA Profile', monogram: 'Q', location: '', biography: '', quote: '',
    portrait: { src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect width="300" height="400" fill="%23666"/%3E%3C/svg%3E', alt: 'QA Profile', position: 'center' },
    social: [{ id: 1, label: 'Website', description: '', url: 'https://example.org', icon: 'web' }],
    appearance: { background: '#0B0D12', accent: '#C4A77D', card: '#191c21', displayFont: '"Barlow Condensed", sans-serif', motion: 'full' } };
  server = http.createServer(async (req, res) => {
    if (req.url === '/favicon.ico') { res.writeHead(204); return res.end(); }
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      return res.end(`<!doctype html><html lang="az"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Static QA fixture</title>${manifest.css.map(css => `<link rel="stylesheet" href="/themes/identity/build/${css}">`).join('')}</head><body><script id="identity-profile" type="application/json">${JSON.stringify(fixture).replace(/</g, '\\u003c')}</script><div id="root"></div><script type="module" src="/themes/identity/build/${manifest.file}"></script></body></html>`);
    }
    const target = path.resolve(build, '.' + decodeURIComponent(req.url.replace('/themes/identity/build', '')));
    if (!target.startsWith(build + path.sep)) { res.writeHead(403); return res.end(); }
    try {
      const types = { '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' };
      res.setHeader('Content-Type', types[path.extname(target)] || 'application/octet-stream');
      res.end(await fs.readFile(target));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}/`;
}
await fs.mkdir('qa/screenshots', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
try {
  for (const [label, viewport, reducedMotion] of [
    ['desktop', { width: 1440, height: 1000 }, 'no-preference'],
    ['mobile', { width: 390, height: 844 }, 'no-preference'],
    ['reduced', { width: 390, height: 844 }, 'reduce'],
  ]) {
    const context = await browser.newContext({ viewport, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200);
    await page.locator('.identity-story').waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, 'horizontal overflow');
    assert.equal(await page.locator('.photo-treatment').evaluate(img => img.complete && img.naturalWidth > 0), true);
    await page.screenshot({ path: `qa/screenshots/${label}-hero.png` });
    if (reducedMotion !== 'reduce') {
      await page.evaluate(() => { const s = document.querySelector('.identity-story'); document.documentElement.style.scrollBehavior = 'auto'; scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * .95); });
      await page.waitForTimeout(1000);
      assert.equal(await page.locator('.identity-object').evaluate(el => { const r = el.getBoundingClientRect(); return !!document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('.card-face-back'); }), true, 'actual rendered back face');
      await page.screenshot({ path: `qa/screenshots/${label}-reveal.png` });
    } else {
      assert.equal(await page.locator('.story-static').count(), 1);
    }
    await page.locator('#social').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1000);
    assert.ok(await page.locator('.social-row').count() > 0);
    const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(scan.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })), []);
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Kontaktı saxla' }).click();
    const contact = await download;
    const vcf = await fs.readFile(await contact.path(), 'utf8');
    assert.ok(vcf.startsWith('BEGIN:VCARD\r\n'));
    await page.getByRole('button', { name: 'Profili paylaş' }).click();
    if (await page.locator('dialog[open]').count()) {
      assert.ok(await page.locator('#profile-url').inputValue());
      await page.getByRole('button', { name: 'Bağla', exact: true }).click();
    }
    await page.screenshot({ path: `qa/screenshots/${label}-contact.png` });
    assert.deepEqual(errors, []);
    results.push({ label, passed: true, consoleErrors: errors, wcagViolations: 0 });
    await page.close();
  }
  console.log(JSON.stringify({ base, results }, null, 2));
  await fs.writeFile('qa/integration.json', JSON.stringify({ base, results }, null, 2));
} finally { await browser.close(); if (server) server.close(); }
