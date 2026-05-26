import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { users } from '../data/mockData';

const STORAGE_KEY = 'hadua_auth_user';

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

  // Đồng bộ user vào localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

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

  const logout = useCallback(() => setUser(null), []);

  // Nhân viên và admin được dùng POS
  const canUsePOS = user?.role === 'staff' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, canUsePOS }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
};
