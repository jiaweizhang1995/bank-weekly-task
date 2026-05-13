import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

let browserPromise = null;
let puppeteerMod = null;

async function getBrowser() {
  if (!browserPromise) {
    if (!puppeteerMod) puppeteerMod = (await import('puppeteer')).default;
    browserPromise = puppeteerMod.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserPromise;
}

// GET /image - Render the public landing board to a PNG and return it
router.get('/image', requireAdmin, async (req, res) => {
  const port = process.env.PORT || 3000;
  const host = process.env.EXPORT_HOST || '127.0.0.1';
  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: 480, height: 1200, deviceScaleFactor: 2 });
    await page.goto(`http://${host}:${port}/?export=1`, {
      waitUntil: 'networkidle0',
      timeout: 15000,
    });
    await page.waitForSelector('body[data-export-ready="1"]', { timeout: 15000 });
    const png = await page.screenshot({ fullPage: true, type: 'png' });
    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="kanban-${new Date().toISOString().slice(0, 10)}.png"`
    );
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: '导出失败', detail: String(e?.message || e) });
  } finally {
    if (page) {
      try { await page.close(); } catch {}
    }
  }
});

export async function _closeBrowser() {
  if (browserPromise) {
    const b = await browserPromise;
    browserPromise = null;
    try { await b.close(); } catch {}
  }
}

export default router;
