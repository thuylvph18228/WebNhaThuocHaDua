import { Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Các nút liên hệ nhanh — ẩn trên trang POS vì không cần thiết
export default function FloatingButtons() {
  const { pathname } = useLocation();

  // Ẩn trên trang bán hàng POS
  if (pathname === '/pos') return null;

  return (
    <div className="fixed right-4 z-50 flex flex-col gap-3" style={{ bottom: '80px' }}>
      {/* Zalo */}
      <a
        href="https://zalo.me/0972201843"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Chat Zalo"
      >
        <span className="text-white font-bold text-sm">Zalo</span>
      </a>

      {/* Facebook Messenger */}
      <a
        href="https://m.me/nhathuochadua"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="Chat Facebook"
      >
        <span className="text-white text-xs font-bold">FB</span>
      </a>

      {/* Hotline */}
      <a
        href="tel:0972201843"
        className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-bounce"
        title="Gọi hotline"
      >
        <Phone size={22} className="text-white" />
      </a>
    </div>
  );
}
