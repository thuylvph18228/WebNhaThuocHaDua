const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';
const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };

async function shot(browser, url, file, extraFn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(admin));
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  if (extraFn) await extraFn(page);
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log('Saved:', file);
  await page.close();
}

async function clickTab(page, label) {
  await page.evaluate(label => {
    const btns = [...document.querySelectorAll('button')];
    btns.find(b => b.textContent.includes(label))?.click();
  }, label);
  await new Promise(r => setTimeout(r, 300));
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    await shot(browser, '/quan-ly-san-pham', 'cat2_products.png');
    await shot(browser, '/quan-ly-san-pham', 'cat2_reasons.png',   async p => clickTab(p, 'Lý do nhập'));
    await shot(browser, '/quan-ly-san-pham', 'cat2_suppliers.png', async p => clickTab(p, 'Nhà cung cấp'));
    await shot(browser, '/quan-ly-san-pham', 'cat2_warehouses.png',async p => clickTab(p, 'Kho hàng'));
    await shot(browser, '/quan-ly-kho', 'cat2_inventory_tabs.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
