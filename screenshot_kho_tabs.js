const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';
const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };

async function shotTab(browser, tabLabel, file) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(admin));
  await page.goto(`${BASE}/quan-ly-kho`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));
  if (tabLabel) {
    await page.evaluate(label => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes(label));
      if (btn) btn.click();
    }, tabLabel);
    await new Promise(r => setTimeout(r, 400));
  }
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    await shotTab(browser, null, 'kho_stock.png');
    await shotTab(browser, 'Xuất kho', 'kho_export.png');
    await shotTab(browser, 'Luân chuyển', 'kho_transfer.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
