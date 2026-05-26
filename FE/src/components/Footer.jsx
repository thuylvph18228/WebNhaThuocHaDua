import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 mt-8">
      {/* Footer chính */}
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Thông tin công ty */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  <img src="/img/logo.png" alt="" />
                </span>
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight">NHÀ THUỐC</div>
                <div className="text-primary font-bold text-xl leading-tight">HÀ ĐUA</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Nhà thuốc Hà Đua — Tin tưởng từ sức khỏe bạn! Cung cấp thuốc chính hãng, thiết bị y tế chất lượng cao, tư vấn chuyên nghiệp từ dược sĩ.
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors text-white font-bold text-sm">
                f
              </a>
              <a href="https://zalo.me" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors text-white font-bold text-sm">
                Z
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors text-white font-bold text-sm">
                ▶
              </a>
            </div>
          </div>

          {/* Liên kết nhanh */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase mb-4 border-b border-gray-600 pb-2">
              Liên kết nhanh
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Trang chủ', to: '/' },
                { label: 'Sản phẩm', to: '/san-pham' },
                { label: 'Tin tức sức khỏe', to: '/tin-tuc' },
                { label: 'Hệ thống cửa hàng', to: '/he-thong-cua-hang' },
                { label: 'Tuyển dụng', to: '/tuyen-dung' },
                { label: 'Liên hệ', to: '/lien-he' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors flex items-center gap-1">
                    <span className="text-primary">›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase mb-4 border-b border-gray-600 pb-2">
              Chính sách
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                'Chính sách đổi trả',
                'Chính sách bảo mật',
                'Chính sách vận chuyển',
                'Chính sách thanh toán',
                'Chính sách đại lý',
                'Điều khoản sử dụng',
              ].map(item => (
                <li key={item}>
                  <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
                    <span className="text-primary">›</span> {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Thông tin liên hệ */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase mb-4 border-b border-gray-600 pb-2">
              Liên hệ
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span>196 Nguyễn Doãn Chất, P.Quảng Phú, TP.Thanh Hóa</span>
              </li>
              <li className="flex gap-2">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="tel:0972201843" className="hover:text-primary">Hotline: 0972.201.843</a>
              </li>
              <li className="flex gap-2">
                <Mail size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <a href="mailto:info@nhathuochadua.vn" className="hover:text-primary">info@nhathuochadua.vn</a>
              </li>
            </ul>

            {/* Giờ hoạt động */}
            <div className="mt-4 bg-gray-700 rounded p-3 text-xs">
              <div className="text-white font-medium mb-1">Giờ hoạt động:</div>
              <div>Thứ 2 - Chủ nhật: <span className="text-primary font-medium">7:00 - 22:00</span></div>
              <div>Dược sĩ tư vấn: <span className="text-primary font-medium">8:00 - 22:00</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Đối tác / chứng nhận */}
      <div className="border-t border-gray-700">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-gray-500">Đã thông báo với Bộ Công Thương</span>
          <div className="flex gap-3 items-center">
            {['VNPAY', 'MoMo', 'COD', 'Bank Transfer'].map(method => (
              <span key={method} className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-900 text-center py-3 text-xs text-gray-500">
        © 2026 Nhà Thuốc Hà Đua. Tất cả quyền được bảo lưu.
        <span className="mx-2">|</span>
        Giấy phép kinh doanh: 0123456789 - Sở KHĐT TP.Thanh Hóa cấp
      </div>
    </footer>
  );
}
