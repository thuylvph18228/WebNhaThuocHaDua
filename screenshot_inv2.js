const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';

async function shotTab(browser, auth, tabLabel, file) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(auth));
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
  const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };
  const staff = { username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' };
  try {
    await shotTab(browser, admin, 'Nhập hàng', 'inv2_import.png');
    await shotTab(browser, admin, 'Danh mục', 'inv2_catalog.png');
    await shotTab(browser, staff, 'Nhập hàng', 'inv2_import_staff.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
