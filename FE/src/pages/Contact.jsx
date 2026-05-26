import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Contact() {
  const contentRef = useScrollAnimation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1 className="text-xl font-bold text-gray-800 uppercase">Liên hệ với chúng tôi</h1>
          </div>

          <div ref={contentRef} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thông tin liên hệ */}
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-5">
                <h3 className="font-bold text-gray-800 mb-4">Thông tin liên hệ</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="text-primary flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Địa chỉ</div>
                      <div className="text-gray-600">196 Nguyễn Doãn Chất, P.Quảng Phú, TP.Thanh Hóa</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="text-primary flex-shrink-0" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Hotline</div>
                      <a href="tel:0972201843" className="text-primary font-bold">0972.201.843</a>
                      <div className="text-gray-500 text-xs">Miễn phí cuộc gọi nội mạng</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="text-primary flex-shrink-0" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Email</div>
                      <a href="mailto:info@nhathuochadua.vn" className="text-primary hover:underline">info@nhathuochadua.vn</a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock className="text-primary flex-shrink-0" size={18} />
                    <div>
                      <div className="font-medium text-gray-800">Giờ làm việc</div>
                      <div className="text-gray-600">Thứ 2 - Chủ nhật: 7:00 - 22:00</div>
                      <div className="text-gray-600">Tư vấn online: 8:00 - 22:00</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Các kênh liên hệ nhanh */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-bold text-gray-800 mb-4">Liên hệ nhanh</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a href="tel:0972201843" className="flex items-center gap-2 bg-primary-light text-primary p-3 rounded hover:bg-primary hover:text-white transition-colors">
                    <Phone size={18} />
                    <div>
                      <div className="text-xs">Gọi điện</div>
                      <div className="font-bold text-sm">0972.201.843</div>
                    </div>
                  </a>
                  <a href="https://zalo.me/0972201843" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 p-3 rounded hover:bg-blue-500 hover:text-white transition-colors">
                    <span className="font-bold text-lg">Z</span>
                    <div>
                      <div className="text-xs">Zalo</div>
                      <div className="font-bold text-sm">Chat ngay</div>
                    </div>
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-blue-100 text-blue-700 p-3 rounded hover:bg-blue-600 hover:text-white transition-colors">
                    <span className="font-bold">f</span>
                    <div>
                      <div className="text-xs">Facebook</div>
                      <div className="font-bold text-sm">Nhắn tin</div>
                    </div>
                  </a>
                  <a href="mailto:info@nhathuochadua.vn"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 p-3 rounded hover:bg-gray-600 hover:text-white transition-colors">
                    <Mail size={18} />
                    <div>
                      <div className="text-xs">Email</div>
                      <div className="font-bold text-sm">Gửi email</div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* Form liên hệ */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-4">Gửi câu hỏi cho chúng tôi</h3>
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle size={48} className="text-primary mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 mb-2">Gửi thành công!</h4>
                  <p className="text-sm text-gray-600">Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                      placeholder="Nhập họ tên của bạn"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="0912345678"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                      placeholder="Nhập câu hỏi hoặc yêu cầu tư vấn của bạn..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 rounded hover:bg-primary-dark transition-colors"
                  >
                    Gửi câu hỏi
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
