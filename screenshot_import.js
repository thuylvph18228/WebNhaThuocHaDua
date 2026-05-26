const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';
const ADMIN = JSON.stringify({ username: 'admin', name: 'Quản trị viên', role: 'admin' });

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, ADMIN);
    await page.goto(`${BASE}/quan-ly-kho`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Click tab Phiếu nhập
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Phiếu nhập'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    // Click Tạo phiếu nhập
    await page.evaluate(() => {
      const btns = [...document.querySelectorAll('button')];
      const btn = btns.find(b => b.textContent.includes('Tạo phiếu nhập'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 400));

    await page.screenshot({ path: path.join(OUT, 'inv_import.png'), fullPage: true });
    console.log('Saved: inv_import.png');
    await page.close();
  } finally { await browser.close(); }
  console.log('Done!');
})();
