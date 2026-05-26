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
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    // Nav với dropdown "Danh mục" hover
    await shot(browser, '/', 'menu_danhmuc_nav.png', async (page) => {
      // Trigger CSS group-hover bằng cách inject class
      await page.evaluate(() => {
        const lis = [...document.querySelectorAll('nav li.group')];
        const li = lis.find(l => l.textContent.includes('Danh mục'));
        if (li) {
          const dropdown = li.querySelector('div.hidden');
          if (dropdown) dropdown.classList.replace('hidden', 'block');
        }
      });
      await new Promise(r => setTimeout(r, 200));
    });

    // Trang catalog vào thẳng tab Nhà cung cấp
    await shot(browser, '/quan-ly-san-pham?tab=suppliers', 'menu_danhmuc_suppliers.png');

    // Trang catalog vào thẳng tab Lý do nhập
    await shot(browser, '/quan-ly-san-pham?tab=reasons', 'menu_danhmuc_reasons.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
