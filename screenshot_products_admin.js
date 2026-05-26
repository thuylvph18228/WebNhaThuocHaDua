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
    // Danh mục sản phẩm trong Inventory (admin)
    await shot(browser, '/quan-ly-kho', 'admin_products_catalog.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        btns.find(b => b.textContent.includes('Danh mục'))?.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });

    // Form thêm sản phẩm mới
    await shot(browser, '/quan-ly-kho', 'admin_products_form.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        btns.find(b => b.textContent.includes('Danh mục'))?.click();
      });
      await new Promise(r => setTimeout(r, 300));
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        btns.find(b => b.textContent.includes('Thêm sản phẩm'))?.click();
      });
      await new Promise(r => setTimeout(r, 300));
    });

    // Trang sản phẩm storefront (chỉ thấy active products)
    await shot(browser, '/san-pham', 'storefront_products.png');

    // Trang chủ
    await shot(browser, '/', 'storefront_home.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
