const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';

async function shot(browser, auth, url, file, extraFn) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  if (auth) await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(auth));
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  if (extraFn) await extraFn(page);
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };
  const customer = null;
  try {
    // Trang chủ
    await shot(browser, customer, '/', 'cmp_home_guest.png');
    await shot(browser, admin, '/', 'cmp_home_admin.png');
    // Sản phẩm
    await shot(browser, customer, '/san-pham', 'cmp_products.png');
    // Giỏ hàng
    await shot(browser, customer, '/gio-hang', 'cmp_cart.png');
    // Tài khoản
    await shot(browser, customer, '/tai-khoan', 'cmp_account_guest.png');
    await shot(browser, admin, '/tai-khoan', 'cmp_account_admin.png');
    // POS
    await shot(browser, admin, '/pos', 'cmp_pos.png');
    // Lịch sử đơn POS
    await shot(browser, admin, '/pos/orders', 'cmp_pos_orders.png');
    // Kho
    await shot(browser, admin, '/quan-ly-kho', 'cmp_kho_stock.png');
    await shot(browser, admin, '/quan-ly-kho', 'cmp_kho_batch.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Lô hàng'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });
    await shot(browser, admin, '/quan-ly-kho', 'cmp_kho_import.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Nhập hàng'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });
    // Tin tức
    await shot(browser, customer, '/tin-tuc', 'cmp_news.png');
    // Liên hệ
    await shot(browser, customer, '/lien-he', 'cmp_contact.png');
    // Cửa hàng
    await shot(browser, customer, '/he-thong-cua-hang', 'cmp_stores.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
