// Run with Node.js and Playwright available (no build step is needed).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const server = http.createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || pathname.includes('/.')) {
    response.writeHead(403).end();
    return;
  }
  fs.readFile(file, (error, content) => {
    if (error) response.writeHead(404).end();
    else response.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream' }).end(content);
  });
});

async function run() {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' })
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const scenario of [
      { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
      { name: 'desktop', viewport: { width: 1440, height: 900 } },
      { name: 'reduced-motion', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }
    ]) {
      const { name, ...options } = scenario;
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(() => {
        window.entryAnimations = [];
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (frames, timing) {
          if (Array.isArray(frames) && frames[0]?.opacity === 0) {
            window.entryAnimations.push({ id: this.id, className: this.getAttribute('class'), time: performance.now() });
          }
          return animate.call(this, frames, timing);
        };
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForFunction(() => window.presentation?.ready && window.presentation.motion.getState().pending === null);
      await page.waitForTimeout(1400);
      await page.emulateMedia({ media: 'print' });
      assert.equal(await page.locator('[data-pm-hidden],.pm-entering').evaluateAll(elements =>
        elements.filter(el => Number(getComputedStyle(el).opacity) < 1).length), 0,
      `${name}: printing must include sections that have not been scrolled into view`);
      await page.emulateMedia({ media: 'screen' });
      const scrollTo = async id => {
        await page.evaluate(id => window.scrollTo({ top: document.getElementById(id).offsetTop, behavior: 'instant' }), id);
        await page.waitForTimeout(1400);
      };
      await scrollTo('why');
      const before = await page.evaluate(() => window.entryAnimations.filter(event => event.id === 'why-title').length);
      await scrollTo('cases');
      await scrollTo('why');
      const after = await page.evaluate(() => window.entryAnimations.filter(event => event.id === 'why-title').length);
      assert.equal(after, before, `${name}: returning to a section must not hide and replay already read content`);
      if (name !== 'reduced-motion') assert.ok(before > 0, `${name}: keep the first entrance animation`);
      assert.equal(await page.locator('#why-title').evaluate(el => getComputedStyle(el).opacity), '1');

      // Cross section boundaries continuously, without waiting for scrolling to settle.
      const flashes = await page.evaluate(async () => {
        const seen = new Set();
        const flashes = new Set();
        const start = document.getElementById('agenda').offsetTop;
        const end = document.getElementById('cases').offsetTop + 250;
        for (const direction of [1, -1]) {
          for (let distance = 0; distance <= end - start; distance += 65) {
            window.scrollTo({ top: direction > 0 ? start + distance : end - distance, behavior: 'instant' });
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
            document.querySelectorAll('#agenda h2,#why-title,#why .float-unit,#cases .section-heading').forEach(el => {
              const rect = el.getBoundingClientRect();
              if (rect.bottom <= 150 || rect.top >= innerHeight - 20) return;
              const opacity = Number(getComputedStyle(el).opacity);
              if (opacity >= .99) seen.add(el);
              if (opacity < .5 && seen.has(el)) flashes.add(el.id || el.className);
            });
          }
        }
        return [...flashes];
      });
      assert.deepEqual(flashes, [], `${name}: visible content must not disappear during continuous scrolling`);

      if (name !== 'reduced-motion') {
        await scrollTo('why');
        const count = await page.evaluate(() => window.entryAnimations.filter(event => event.id === 'why-title').length);
        await page.evaluate(() => window.presentation.motion.replay());
        await page.waitForTimeout(800);
        assert.equal(await page.evaluate(() => window.entryAnimations.filter(event => event.id === 'why-title').length), count + 1,
          `${name}: explicit replay must still work`);
      }

      await scrollTo('solution');
      // Desktop cards deliberately float. Use an actual pointer click without
      // Playwright waiting for the decorative movement to become stationary.
      const photo = page.locator('#solution .solution-photo-open').first();
      await photo.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
      await page.waitForTimeout(600);
      const photoBox = await photo.boundingBox();
      assert.ok(photoBox && photoBox.width > 0 && photoBox.height > 0);
      await page.mouse.click(photoBox.x + photoBox.width / 2, photoBox.y + photoBox.height / 2);
      assert.equal(await page.locator('#solution-dialog').evaluate(el => el.open), true);
      await page.locator('#solution-dialog [data-solution-close]').click();
      assert.equal(await page.locator('#solution-dialog').evaluate(el => el.open), false);
      await scrollTo('why');
      assert.equal(await page.locator('#why-title').evaluate(el => getComputedStyle(el).opacity), '1', `${name}: closing a photo must not hide previous content`);

      if (name === 'desktop') {
        await page.evaluate(() => { document.activeElement.blur(); window.presentation.goTo(1, { instant: true }); });
        await page.waitForTimeout(1100);
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => window.presentation.getState().page === 2 && window.presentation.motion.getState().pending === null);
        await page.waitForTimeout(1100);
        await page.evaluate(() => window.scrollTo({ top: window.PrimeWheelNavigation.range(document.getElementById('why')).end, behavior: 'instant' }));
        await page.mouse.move(1200, 700);
        await page.mouse.wheel(0, 150);
        await page.waitForFunction(() => window.presentation.getState().page === 3 && window.presentation.motion.getState().pending === null);
      }
      if (name === 'mobile') {
        await scrollTo('home');
        const beforeTouch = await page.evaluate(() => scrollY);
        const session = await context.newCDPSession(page);
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 190, y: 650 }] });
        for (const y of [620, 570, 510, 440, 360, 280]) {
          await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 190, y }] });
          await page.waitForTimeout(20);
        }
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await page.waitForTimeout(400);
        assert.ok(await page.evaluate(() => scrollY) > beforeTouch + 100, 'vertical touch swipes must keep native scrolling');
        await session.detach();
      }

      await page.evaluate(() => window.presentation.goTo(18, { instant: true }));
      await page.waitForFunction(() => window.presentation.getState().index === 18 && window.presentation.motion.getState().pending === null);
      await page.waitForTimeout(1400);
      assert.equal(await page.locator('#counter').textContent(), '19 / 19');
      await page.setViewportSize({ width: options.viewport.width, height: options.viewport.height - 70 });
      await page.waitForTimeout(200);
      assert.equal(await page.locator('#discussion .discussion-heading').evaluate(el => getComputedStyle(el).opacity), '1');

      await page.evaluate(() => window.presentation.setPaused(true));
      assert.equal(await page.locator('[data-pm-hidden]').count(), 0, `${name}: pausing must leave all content visible`);
      await page.evaluate(() => window.presentation.setPaused(false));
      if (name === 'mobile') {
        await scrollTo('home');
        assert.equal(await page.locator('.pm-float-live').count(), 0, 'touch devices should not run constant decorative movement');
      }
      assert.deepEqual(errors, [], `${name}: browser errors`);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name}: no horizontal overflow`);
      if (process.env.MOTION_SCREENSHOTS) {
        fs.mkdirSync(process.env.MOTION_SCREENSHOTS, { recursive: true });
        await scrollTo('why');
        await page.screenshot({ path: path.join(process.env.MOTION_SCREENSHOTS, `${name}.png`) });
      }
      console.log(`PASS ${name}: first reveal, revisit, continuous scroll, replay, photos, input navigation, resize and pause`);
      await context.close();
      if (process.env.MOTION_SMOKE_FIRST_ONLY) break;
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
run().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
