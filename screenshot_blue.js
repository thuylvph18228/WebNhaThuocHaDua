const puppeteer = require('puppeteer-core');
const path = require('path');
const { execSync } = require('child_process');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = 'http://localhost:5185';
const KEY = 'hadua_auth_user';
const admin = { username: 'admin', name: 'Quản trị viên', role: 'admin' };

async function shot(browser, auth, url, file) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  if (auth) await page.evaluate((k, v) => localStorage.setItem(k, v), KEY, JSON.stringify(auth));
  else await page.evaluate(k => localStorage.removeItem(k), KEY);
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(OUT, file), fullPage: true });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  // Start vite server
  const vite = require('child_process').spawn('npx', ['vite', '--port', '5185'], {
    cwd: path.join(__dirname, 'FE'),
    shell: true,
    stdio: 'pipe',
  });
  await new Promise(r => setTimeout(r, 4000));

  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
  try {
    await shot(browser, null, '/', 'blue_home.png');
    await shot(browser, admin, '/', 'blue_home_admin.png');
    await shot(browser, null, '/san-pham', 'blue_products.png');
    await shot(browser, admin, '/quan-ly-kho', 'blue_inventory.png');
  } finally {
    await browser.close();
    vite.kill();
  }
  console.log('Done!');
})();
