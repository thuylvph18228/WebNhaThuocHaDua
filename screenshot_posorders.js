const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';

async function shot(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('Saved:', file);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    // Admin — xem toàn bộ đơn + dropdown nhân viên
    const p1 = await browser.newPage();
    await p1.setViewport({ width: 1440, height: 900 });
    await p1.goto(BASE, { waitUntil: 'networkidle0' });
    await p1.evaluate((k, v) => localStorage.setItem(k, v), KEY,
      JSON.stringify({ username: 'admin', name: 'Quản trị viên', role: 'admin' }));
    await shot(p1, `${BASE}/pos/orders`, 'posorders_admin.png');
    await p1.close();

    // Staff — chỉ thấy đơn của mình + không có dropdown nhân viên
    const p2 = await browser.newPage();
    await p2.setViewport({ width: 1440, height: 900 });
    await p2.goto(BASE, { waitUntil: 'networkidle0' });
    await p2.evaluate((k, v) => localStorage.setItem(k, v), KEY,
      JSON.stringify({ username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' }));
    await shot(p2, `${BASE}/pos/orders`, 'posorders_staff.png');
    await p2.close();

    // POS topbar với link lịch sử đơn
    const p3 = await browser.newPage();
    await p3.setViewport({ width: 1440, height: 900 });
    await p3.goto(BASE, { waitUntil: 'networkidle0' });
    await p3.evaluate((k, v) => localStorage.setItem(k, v), KEY,
      JSON.stringify({ username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' }));
    await shot(p3, `${BASE}/pos`, 'pos_topbar_with_orders.png');
    await p3.close();

  } finally { await browser.close(); }
  console.log('Done!');
})();
