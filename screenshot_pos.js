const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5182';

async function shot(browser, url, file, actions) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  if (actions) await actions(page);
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(OUT, file), fullPage: false });
  console.log('Saved:', file);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    // Chụp màn hình đăng nhập POS
    await shot(browser, `${BASE}/pos`, 'pos_login.png');

    // Chụp màn hình POS sau khi đăng nhập (điền form đăng nhập)
    await shot(browser, `${BASE}/pos`, 'pos_main.png', async (page) => {
      await page.type('input[type="text"]', 'nhanvien01');
      await page.type('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      await new Promise(r => setTimeout(r, 1000));
    });
  } finally {
    await browser.close();
  }
  console.log('Done!');
})();
