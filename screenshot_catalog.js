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
  await new Promise(r => setTimeout(r, 700));
  if (extraFn) await extraFn(page);
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    // Trang quản lý sản phẩm
    await shot(browser, '/quan-ly-san-pham', 'catalog_list.png');

    // Form thêm sản phẩm mới
    await shot(browser, '/quan-ly-san-pham', 'catalog_form.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        btns.find(b => b.textContent.includes('Thêm sản phẩm'))?.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });

    // Header dropdown Quản lý (hover)
    await shot(browser, '/', 'header_manage_dropdown.png', async (page) => {
      await page.evaluate(() => {
        // Hover vào nút Quản lý để mở dropdown
        const btns = [...document.querySelectorAll('nav button')];
        const btn = btns.find(b => b.textContent.includes('Quản lý'));
        if (btn) {
          btn.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
          btn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        }
      });
      await new Promise(r => setTimeout(r, 300));
    });

    // Inventory - tab Danh mục (không còn tab Sản phẩm)
    await shot(browser, '/quan-ly-kho', 'inventory_catalog_tab.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        btns.find(b => b.textContent.includes('Danh mục'))?.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });
  } finally { await browser.close(); }
  console.log('Done!');
})();
