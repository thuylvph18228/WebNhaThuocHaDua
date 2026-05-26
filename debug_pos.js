const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE = 'http://localhost:5184';
const KEY = 'hadua_auth_user';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const logs = [];
  page.on('console', m => logs.push('LOG: ' + m.text()));
  page.on('pageerror', e => logs.push('ERR: ' + e.message));

  // Bước 1: load trang chủ và set localStorage
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY,
    JSON.stringify({ username: 'nhanvien', name: 'Nguyen Thi Lan', role: 'staff' })
  );

  const saved = await page.evaluate(k => localStorage.getItem(k), KEY);
  console.log('[1] localStorage set:', saved ? 'OK' : 'FAIL');

  // Bước 2: navigate tới /pos và chờ
  await page.goto(BASE + '/pos', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));

  const currentUrl = page.url();
  const bodyText = await page.evaluate(() => document.body.innerText.trim().substring(0, 300));
  const localNow = await page.evaluate(k => localStorage.getItem(k), KEY);

  console.log('[2] URL:', currentUrl);
  console.log('[3] localStorage at /pos:', localNow ? 'STILL SET' : 'GONE (cleared!)');
  console.log('[4] Body text:', bodyText || '(empty)');
  if (logs.length) console.log('[5] Console:', logs.slice(0, 10).join('\n'));

  await page.screenshot({ path: path.join(__dirname, 'TempImg', 'debug_pos.png'), fullPage: false });
  console.log('[6] Screenshot saved: debug_pos.png');

  await browser.close();
})();
