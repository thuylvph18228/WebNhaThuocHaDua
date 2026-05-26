import { MapPin, Phone, Clock } from 'lucide-react';
import { stores } from '../data/mockData';
import Sidebar from '../components/Sidebar';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function Stores() {
  const gridRef = useScrollAnimation();

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1 className="text-xl font-bold text-gray-800 uppercase">Hệ thống cửa hàng</h1>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Danh sách cửa hàng */}
            <div className="space-y-4">
              {stores.map(store => (
                <div key={store.id} className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow border-l-4 border-primary">
                  <h3 className="font-bold text-gray-800 mb-3">{store.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={15} className="text-primary flex-shrink-0" />
                      <a href={`tel:${store.phone}`} className="hover:text-primary">{store.phone}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-primary flex-shrink-0" />
                      <span>{store.hours}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <a
                      href="https://maps.app.goo.gl/RFR7vt1LGkU5KEDy5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center bg-primary text-white text-xs py-2 rounded hover:bg-primary-dark transition-colors"
                    >
                      Xem bản đồ
                    </a>
                    <a
                      href={`tel:${store.phone}`}
                      className="flex-1 text-center border border-primary text-primary text-xs py-2 rounded hover:bg-primary-light transition-colors"
                    >
                      Gọi ngay
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Bản đồ Google Maps thật */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <iframe
                title="Nhà Thuốc Hà Đua"
                src={`https://maps.google.com/maps?q=${19.746031639585258},${105.83940292152181}&z=16&output=embed`}
                width="100%"
                height="320"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="px-4 py-2.5 flex items-center justify-between border-t bg-gray-50">
                <span className="text-xs text-gray-500">196 Nguyễn Doãn Chất, P.Quảng Phú, TP.Thanh Hóa</span>
                <a href="https://maps.app.goo.gl/RFR7vt1LGkU5KEDy5" target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline font-medium">
                  Mở Google Maps →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
