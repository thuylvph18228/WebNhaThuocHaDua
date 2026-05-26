const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';
const ADMIN = JSON.stringify({ username: 'admin', name: 'Quản trị viên', role: 'admin' });

async function shot(browser, url, file, extraWait = 800) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, ADMIN);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, extraWait));
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    await shot(browser, `${BASE}/quan-ly-kho`, 'inv_stock.png');     // Tab tồn kho
    await shot(browser, `${BASE}/quan-ly-kho#batch`, 'inv_nav.png'); // Để thấy nav
  } finally { await browser.close(); }
  console.log('Done!');
})();
