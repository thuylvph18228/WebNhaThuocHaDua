import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { users } from '../data/mockData';

const STORAGE_KEY = 'hadua_auth_user';

// Thời gian không thao tác trước khi tự logout (30 phút)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// Cảnh báo trước khi logout bao nhiêu giây
const WARN_SECONDS = 10;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Khôi phục session từ localStorage khi reload/navigate
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Trạng thái idle warning
  const [idleWarning, setIdleWarning] = useState(false);
  const [countdown, setCountdown] = useState(WARN_SECONDS);
  // sessionExpired = true khi bị auto-logout để hiện thông báo ở trang login
  const [sessionExpired, setSessionExpired] = useState(false);

  const lastActivityRef = useRef(Date.now());

  // Đồng bộ user vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  // Reset bộ đếm khi có thao tác — setIdleWarning(false) khi đã false là no-op
  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleWarning(false);
  }, []);

  // Theo dõi idle — chỉ chạy khi đã đăng nhập
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, resetActivity, { passive: true }));

    const interval = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= IDLE_TIMEOUT_MS) {
        // Đã quá hạn — auto logout
        setUser(null);
        setIdleWarning(false);
        setSessionExpired(true);
      } else if (idleMs >= IDLE_TIMEOUT_MS - WARN_SECONDS * 1000) {
        // Trong vùng cảnh báo
        const remaining = Math.ceil((IDLE_TIMEOUT_MS - idleMs) / 1000);
        setCountdown(remaining);
        setIdleWarning(true);
      } else {
        setIdleWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach(e => window.removeEventListener(e, resetActivity));
      clearInterval(interval);
    };
  }, [user, resetActivity]);

  /**
   * Đăng nhập — kiểm tra username/password trong users (mockData).
   * Hỗ trợ đăng nhập bằng username hoặc email.
   * Trả về { ok: true } hoặc { ok: false, error: string }
   */
  const login = useCallback((identifier, password) => {
    if (!identifier?.trim() || !password?.trim()) {
      return { ok: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' };
    }

    const id = identifier.trim().toLowerCase();
    const acc = users.find(
      u =>
        (u.username.toLowerCase() === id || u.email.toLowerCase() === id) &&
        u.password === password
    );

    if (!acc) {
      return { ok: false, error: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }

    setUser({
      id: acc.id,
      username: acc.username,
      name: acc.name,
      email: acc.email,
      phone: acc.phone,
      role: acc.role,
    });
    return { ok: true };
  }, []);

  /**
   * Đăng ký — thêm tài khoản khách hàng mới (trong thực tế sẽ gọi API).
   * Demo: kiểm tra trùng username/email rồi tự đăng nhập.
   */
  const register = useCallback((data) => {
    const { username, email, password, name, phone } = data;

    if (!username?.trim() || !password?.trim() || !name?.trim()) {
      return { ok: false, error: 'Vui lòng điền đầy đủ thông tin bắt buộc' };
    }

    const dup = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() ||
        (email && u.email.toLowerCase() === email.toLowerCase())
    );
    if (dup) {
      return { ok: false, error: 'Tên đăng nhập hoặc email đã được sử dụng' };
    }

    // Tạo user tạm (không thực sự lưu vào mảng vì đây là frontend-only)
    const newUser = {
      id: Date.now(),
      username: username.trim(),
      name: name.trim(),
      email: email?.trim() || '',
      phone: phone?.trim() || '',
      role: 'customer',
    };
    setUser(newUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIdleWarning(false);
    setSessionExpired(false);
    lastActivityRef.current = Date.now();
  }, []);

  // Tiếp tục phiên làm việc từ dialog cảnh báo
  const extendSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIdleWarning(false);
    setCountdown(WARN_SECONDS);
  }, []);

  // Xóa flag sessionExpired sau khi đã hiển thị (Account page gọi sau khi show thông báo)
  const clearSessionExpired = useCallback(() => setSessionExpired(false), []);

  // Nhân viên và admin được dùng POS
  const canUsePOS = user?.role === 'staff' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, canUsePOS, sessionExpired, clearSessionExpired }}>
      {children}

      {/* Dialog cảnh báo sắp hết phiên */}
      {idleWarning && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">⏰</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">Phiên làm việc sắp hết</h2>
            <p className="text-sm text-gray-500 mb-1">
              Bạn không thao tác trong một thời gian dài.
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Hệ thống sẽ tự động đăng xuất sau{' '}
              <span className="font-bold text-red-500 text-base">{countdown}</span> giây.
            </p>
            <div className="flex gap-3">
              <button
                onClick={logout}
                className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 text-sm"
              >
                Đăng xuất ngay
              </button>
              <button
                onClick={extendSession}
                className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary-dark text-sm font-semibold"
              >
                Tiếp tục làm việc
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
};
