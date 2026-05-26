import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [ordered, setOrdered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    note: '',
    paymentMethod: 'cod',
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // TODO: thay bằng gọi API thực khi có BE
      await new Promise(r => setTimeout(r, 500));
      clearCart();
      setOrdered(true);
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <CheckCircle size={72} className="text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-600 mb-2">Cảm ơn bạn đã tin tưởng Nhà Thuốc Hà Đua.</p>
        <p className="text-gray-500 text-sm mb-6">
          Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút.
          <br />Hotline: <strong className="text-primary">0972.201.843</strong>
        </p>
        <Link to="/" className="inline-block bg-primary text-white py-3 px-8 rounded hover:bg-primary-dark transition-colors font-medium">
          Về trang chủ
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Giỏ hàng trống</h2>
        <Link to="/san-pham" className="text-primary hover:underline">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Đặt hàng</h1>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Form thông tin */}
          <div className="flex-1 space-y-6">
            {/* Thông tin giao hàng */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b">Thông tin giao hàng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0912345678"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tỉnh / Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    required
                    value={form.city}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="">Chọn tỉnh/thành phố</option>
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ cụ thể <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đơn hàng</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ghi chú thêm: thời gian giao hàng, yêu cầu đặc biệt..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-lg shadow-sm p-5">
              <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b">Phương thức thanh toán</h3>
              <div className="space-y-3">
                {[
                  { value: 'cod', label: '💵 Thanh toán khi nhận hàng (COD)', desc: 'Trả tiền mặt khi nhận hàng' },
                  { value: 'bank', label: '🏦 Chuyển khoản ngân hàng', desc: 'MB Bank: 0123456789 - Nhà Thuốc Hà Đua' },
                  { value: 'vnpay', label: '💳 VNPAY', desc: 'Thanh toán qua ví VNPAY, thẻ ATM, Visa...' },
                  { value: 'momo', label: '📱 MoMo', desc: 'Thanh toán qua ví điện tử MoMo' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition-colors ${
                    form.paymentMethod === opt.value ? 'border-primary bg-primary-light' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.value}
                      checked={form.paymentMethod === opt.value}
                      onChange={handleChange}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-800">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Tóm tắt đơn hàng */}
          <div className="lg:w-72">
            <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
              <h3 className="font-bold text-gray-800 text-base mb-4 border-b pb-3">
                Đơn hàng ({items.length} sản phẩm)
              </h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <img src={item.image} alt={item.name} className="w-10 h-10 object-contain bg-gray-100 rounded flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-700 line-clamp-1">{item.name}</div>
                      <div className="text-xs text-gray-500">x{item.qty}</div>
                    </div>
                    <div className="text-xs font-bold text-red-600 flex-shrink-0">{formatPrice(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Vận chuyển</span>
                  <span className="text-primary">Miễn phí</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-red-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white text-center font-bold py-3 rounded hover:bg-primary-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
