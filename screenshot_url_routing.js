const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const KEY = 'hadua_auth_user';
const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };

async function shot(browser, url, file) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(admin));
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, file) });
  const curUrl = page.url();
  console.log(`Saved: ${file} — URL: ${curUrl.replace(BASE, '')}`);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    await shot(browser, '/danh-muc',              'url_redirect.png');       // test redirect
    await shot(browser, '/danh-muc/san-pham',     'url_san_pham.png');
    await shot(browser, '/danh-muc/ly-do-nhap',   'url_ly_do_nhap.png');
    await shot(browser, '/danh-muc/nha-cung-cap', 'url_nha_cung_cap.png');
    await shot(browser, '/danh-muc/kho-hang',     'url_kho_hang.png');
  } finally { await browser.close(); }
  console.log('Done!');
})();
