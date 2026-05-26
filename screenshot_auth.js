const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUT = path.join(__dirname, 'TempImg');
const BASE = process.argv[2] || 'http://localhost:5184';
const STORAGE_KEY = 'hadua_auth_user';

// Set localStorage trực tiếp — đáng tin hơn với React SPA
async function setAuth(page, user) {
  await page.evaluate((key, val) => localStorage.setItem(key, val), STORAGE_KEY, JSON.stringify(user));
}
async function clearAuth(page) {
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
}

async function shot(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(OUT, file) });
  console.log('Saved:', file);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // ─── 1. Chưa đăng nhập: trang login ─────────────────────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      // Vào /tai-khoan lần đầu (không có auth)
      await shot(page, `${BASE}/tai-khoan`, 'auth_1_login_page.png');
      await page.close();
    }

    // ─── 2. Chưa đăng nhập: truy cập /pos → redirect login ───────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await clearAuth(page);
      await shot(page, `${BASE}/pos`, 'auth_2_pos_no_auth.png');
      await page.close();
    }

    // ─── 3. Nhân viên đăng nhập → header có link POS ─────────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      // Đặt auth trước khi load trang
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await setAuth(page, { username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' });
      await shot(page, `${BASE}/`, 'auth_3_home_staff.png');
      await page.close();
    }

    // ─── 4. Nhân viên → vào POS thành công ───────────────────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await setAuth(page, { username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' });
      await shot(page, `${BASE}/pos`, 'auth_4_pos_staff_ok.png');
      await page.close();
    }

    // ─── 5. Nhân viên → trang Account (hồ sơ có nút POS) ─────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await setAuth(page, { username: 'nhanvien', name: 'Nguyễn Thị Lan', role: 'staff' });
      await shot(page, `${BASE}/tai-khoan`, 'auth_5_account_staff.png');
      await page.close();
    }

    // ─── 6. Admin đăng nhập → header ─────────────────────────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await setAuth(page, { username: 'admin', name: 'Quản trị viên', role: 'admin' });
      await shot(page, `${BASE}/`, 'auth_6_home_admin.png');
      await page.close();
    }

    // ─── 7. Khách hàng → vào /pos bị từ chối ─────────────────────
    {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      await page.goto(BASE, { waitUntil: 'networkidle0' });
      await setAuth(page, { username: 'khachhang', name: 'khachhang', role: 'customer' });
      await shot(page, `${BASE}/pos`, 'auth_7_pos_denied.png');
      await page.close();
    }

  } finally {
    await browser.close();
  }
  console.log('\nDone! Tất cả screenshot đã lưu vào TempImg/');
})();
