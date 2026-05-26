import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { User, Lock, Package, LogOut, MonitorCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { users } from '../data/mockData';

// Badge màu theo role
const ROLE_BADGE = {
  admin: { label: 'Quản trị viên', cls: 'bg-red-100 text-red-600' },
  staff: { label: 'Nhân viên nhà thuốc', cls: 'bg-blue-100 text-blue-600' },
  customer: { label: 'Khách hàng', cls: 'bg-gray-100 text-gray-600' },
};

export default function Account() {
  const { user, logout, canUsePOS } = useAuth();
  const [tab, setTab] = useState('login');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') === 'pos' ? '/pos' : '/';

  if (user) {
    return <ProfilePage user={user} logout={logout} canUsePOS={canUsePOS} />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Tab header */}
        <div className="flex border-b">
          {[
            { key: 'login', label: 'Đăng nhập' },
            { key: 'register', label: 'Đăng ký' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-primary'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Thông báo redirect từ POS */}
          {searchParams.get('redirect') === 'pos' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
              <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-amber-700">Yêu cầu tài khoản nhân viên</div>
                <div className="text-amber-600 text-xs mt-0.5">
                  Dùng tài khoản có quyền <strong>nhân viên</strong> hoặc <strong>admin</strong> để truy cập POS.
                </div>
              </div>
            </div>
          )}

          {tab === 'login'
            ? <LoginForm onSuccess={() => navigate(redirectTo)} />
            : <RegisterForm onSuccess={() => { setTab('login'); }} />
          }
        </div>
      </div>

      {/* Bảng tài khoản demo lấy từ mockData */}
      <DemoAccountsHint />
    </div>
  );
}

// ─── Gợi ý tài khoản demo ────────────────────────────────────────
function DemoAccountsHint() {
  const [show, setShow] = useState(false);
  // Track từng row nào đang hiện mật khẩu
  const [visiblePw, setVisiblePw] = useState({});

  const demo = [
    users.find(u => u.role === 'admin'),
    users.find(u => u.role === 'staff'),
    users.find(u => u.role === 'customer'),
  ].filter(Boolean);

  const togglePw = (id) => setVisiblePw(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setShow(s => !s)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
      >
        <span>Tài khoản demo</span>
        <span className="text-blue-400 text-xs">{show ? '▲ Ẩn bớt' : '▼ Xem thêm'}</span>
      </button>
      {show && (
        <div className="border-t border-blue-200">
          {demo.map(u => (
            <div key={u.id} className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100 last:border-0">
              <div>
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mr-2 ${ROLE_BADGE[u.role]?.cls}`}>
                  {ROLE_BADGE[u.role]?.label}
                </span>
                <span className="text-xs text-blue-700">{u.name}</span>
              </div>
              {/* Mật khẩu ẩn mặc định, click để xem/ẩn */}
              <button
                onClick={() => togglePw(u.id)}
                className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-0.5 rounded text-blue-800 font-mono transition-colors"
                title={visiblePw[u.id] ? 'Ẩn mật khẩu' : 'Nhấn để xem'}
              >
                {u.username} / {visiblePw[u.id] ? u.password : '••••••'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Trang hồ sơ sau khi đăng nhập ─────────────────────────────
function ProfilePage({ user, logout, canUsePOS }) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-green-600 h-24" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md flex items-center justify-center text-3xl font-black text-primary">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="mb-2">
              <div className="font-bold text-gray-800 text-lg">{user.name}</div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${ROLE_BADGE[user.role]?.cls}`}>
                {ROLE_BADGE[user.role]?.label}
              </span>
            </div>
          </div>

          {/* Thông tin tài khoản */}
          <div className="bg-gray-50 rounded-lg p-3 mb-5 text-sm grid grid-cols-2 gap-2">
            {user.email && (
              <div>
                <span className="text-gray-400 text-xs">Email</span>
                <div className="text-gray-700 font-medium truncate">{user.email}</div>
              </div>
            )}
            {user.phone && (
              <div>
                <span className="text-gray-400 text-xs">Số điện thoại</span>
                <div className="text-gray-700 font-medium">{user.phone}</div>
              </div>
            )}
          </div>

          {/* Thống kê */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { icon: <Package size={18} />, label: 'Đơn hàng', count: '3' },
              { icon: <User size={18} />, label: 'Điểm tích lũy', count: '250đ' },
              { icon: <Package size={18} />, label: 'Đã xem', count: '8' },
            ].map(item => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="text-primary flex justify-center mb-1">{item.icon}</div>
                <div className="font-bold text-sm text-gray-800">{item.count}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>

          {/* Hành động */}
          <div className="space-y-2">
            <Link to="/dat-hang"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary-light transition-colors">
              <Package size={17} className="text-primary" />
              <div>
                <div className="text-sm font-medium text-gray-800">Lịch sử đơn hàng</div>
                <div className="text-xs text-gray-400">Xem và theo dõi các đơn đã đặt</div>
              </div>
            </Link>

            {canUsePOS && (
              <Link to="/pos"
                className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary-light hover:bg-primary/10 transition-colors">
                <MonitorCheck size={17} className="text-primary" />
                <div>
                  <div className="text-sm font-semibold text-primary">Bán hàng tại quầy (POS)</div>
                  <div className="text-xs text-gray-500">Tạo phiếu, quét barcode, in hóa đơn</div>
                </div>
              </Link>
            )}
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            className="mt-5 w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-600 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <LogOut size={15} /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Form đăng nhập ─────────────────────────────────────────────
function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = login(identifier, password);
    setLoading(false);
    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên đăng nhập hoặc Email
        </label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            required
            autoFocus
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="username hoặc email@..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPw ? 'text' : 'password'}
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="w-full border border-gray-300 rounded-lg pl-9 pr-10 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input type="checkbox" className="w-3.5 h-3.5 accent-primary" />
          <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
        <a href="#" className="text-xs text-primary hover:underline">Quên mật khẩu?</a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-60"
      >
        {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
      </button>
    </form>
  );
}

// ─── Form đăng ký ───────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', phone: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    const result = register({
      username: form.username,
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.ok) {
      onSuccess();
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg">
          <AlertCircle size={14} className="flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
          <input type="text" required value={form.name} onChange={set('name')}
            placeholder="Nguyễn Văn A"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
          <input type="text" required value={form.username} onChange={set('username')}
            placeholder="username"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
          <input type="tel" value={form.phone} onChange={set('phone')}
            placeholder="0912345678"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')}
            placeholder="email@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu <span className="text-red-500">*</span></label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} required value={form.password} onChange={set('password')}
              placeholder="Tối thiểu 6 ký tự"
              className="w-full border border-gray-300 rounded-lg px-3 pr-9 py-2 text-sm outline-none focus:border-primary" />
            <button type="button" onClick={() => setShowPw(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu <span className="text-red-500">*</span></label>
          <input type="password" required value={form.confirm} onChange={set('confirm')}
            placeholder="Nhập lại mật khẩu"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary" />
        </div>
      </div>

      <button type="submit"
        className="w-full bg-primary text-white font-bold py-2.5 rounded-lg hover:bg-primary-dark transition-colors mt-1">
        Tạo tài khoản
      </button>
      <p className="text-xs text-gray-400 text-center">Tài khoản mới sẽ có quyền Khách hàng</p>
    </form>
  );
}
