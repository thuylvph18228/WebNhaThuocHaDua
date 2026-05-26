const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT_DIR = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5180';

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

async function shot(browser, url, filename) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Chờ networkidle và thêm thời gian để animations khởi động
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });

  // Trigger scroll để kích hoạt IntersectionObserver animations
  await page.evaluate(async () => {
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 300));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 300));
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, filename), fullPage: true });
  console.log('Saved:', filename, '-', url);
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    await shot(browser, `${BASE}/`, 'my_home.png');
    await shot(browser, `${BASE}/san-pham`, 'my_products.png');
    await shot(browser, `${BASE}/gio-hang`, 'my_cart.png');
    await shot(browser, `${BASE}/san-pham/may-do-huyet-ap-omron-hem-7121`, 'my_detail.png');
    await shot(browser, `${BASE}/lien-he`, 'my_contact.png');
  } finally {
    await browser.close();
  }

  console.log('Done!');
})();
