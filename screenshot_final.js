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
  else await page.evaluate((k) => localStorage.removeItem(k), KEY);
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
  if (extraFn) await extraFn(page);
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };
  try {
    await shot(browser, null,  '/',            'final_home.png');
    await shot(browser, null,  '/san-pham',    'final_products.png');
    await shot(browser, admin, '/',            'final_home_admin.png');
    await shot(browser, null,  '/tin-tuc',     'final_news.png');
    await shot(browser, null,  '/lien-he',     'final_contact.png');
    await shot(browser, admin, '/pos',         'final_pos.png');
    await shot(browser, admin, '/pos/orders',  'final_pos_orders.png');

    // Kho - tab xuất kho form
    await shot(browser, admin, '/quan-ly-kho', 'final_kho_export_form.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Xuất kho'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Tạo phiếu xuất'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });

    // Kho - tab luân chuyển form
    await shot(browser, admin, '/quan-ly-kho', 'final_kho_transfer_form.png', async (page) => {
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Luân chuyển'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));
      await page.evaluate(() => {
        const btns = [...document.querySelectorAll('button')];
        const btn = btns.find(b => b.textContent.includes('Tạo phiếu luân chuyển'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 400));
    });
  } finally { await browser.close(); }
  console.log('Done!');
})();
