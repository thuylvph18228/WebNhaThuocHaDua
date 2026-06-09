import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, Minus, Plus, AlertCircle, Shield, Truck, RotateCcw, Phone } from 'lucide-react';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { useProducts } from '../context/ProductContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Constants upload toa — khai báo ngoài component để không tạo lại mỗi render
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE_MB = 5;

export default function ProductDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { activeProducts: products } = useProducts();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [rxFile, setRxFile] = useState(null);
  const [rxError, setRxError] = useState('');
  const tabRef = useScrollAnimation();
  const relatedRef = useScrollAnimation();

  // Validate type và size trước khi chấp nhận file toa bác sĩ
  const handleRxFileChange = (e) => {
    const file = e.target.files[0];
    setRxError('');
    if (!file) { setRxFile(null); return; }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setRxError('Chỉ chấp nhận file JPG, PNG, WEBP hoặc PDF');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setRxError(`File không được vượt quá ${MAX_FILE_SIZE_MB}MB`);
      e.target.value = '';
      return;
    }
    setRxFile(file);
  };

  const product = products.find(p => p.slug === slug);
  const relatedProducts = products
    .filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h2>
        <Link to="/san-pham" className="text-primary hover:underline">← Quay lại danh sách sản phẩm</Link>
      </div>
    );
  }

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (product.isRx && !rxFile) {
      // Hiển thị lỗi inline thay vì alert()
      setRxError('Vui lòng upload toa bác sĩ để đặt thuốc kê đơn.');
      return;
    }
    addToCart(product, qty);
  };

  // Disable nút nếu là thuốc kê đơn chưa có toa
  const isAddDisabled = product.isRx && !rxFile;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-500 mb-4">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <span className="mx-1">›</span>
            <Link to="/san-pham" className="hover:text-primary">Sản phẩm</Link>
            <span className="mx-1">›</span>
            <span className="text-primary">{product.name}</span>
          </div>

          {/* Chi tiết sản phẩm */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Ảnh */}
              <div className="md:w-2/5">
                <div className="relative bg-gray-50 rounded-lg overflow-hidden p-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-contain"
                  />
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      -{discount}%
                    </span>
                  )}
                  {product.isRx && (
                    <span className="absolute top-3 right-3 bg-red-700 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                      <AlertCircle size={11} /> Kê đơn (Rx)
                    </span>
                  )}
                </div>
              </div>

              {/* Thông tin */}
              <div className="md:w-3/5">
                <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>

                {/* Đánh giá & thương hiệu */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14}
                        className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{product.rating} ({product.reviews} đánh giá)</span>
                  </div>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-600">Thương hiệu: <strong>{product.brand}</strong></span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-600">Còn <strong>{product.stock}</strong> sản phẩm</span>
                </div>

                {/* Giá */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-3xl font-black text-red-600">{formatPrice(product.price)}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-gray-400 line-through text-lg">{formatPrice(product.originalPrice)}</span>
                      <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded">-{discount}%</span>
                    </>
                  )}
                </div>

                {/* Thông tin nhanh */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    {product.manufacturer && (
                      <div><span className="text-gray-500">Nhà SX:</span> <span className="font-medium">{product.manufacturer}</span></div>
                    )}
                    {product.origin && (
                      <div><span className="text-gray-500">Xuất xứ:</span> <span className="font-medium">{product.origin}</span></div>
                    )}
                    {product.registrationNo && (
                      <div><span className="text-gray-500">SĐK:</span> <span className="font-medium">{product.registrationNo}</span></div>
                    )}
                    {product.donViTinh && (
                      <div><span className="text-gray-500">Đơn vị tính:</span> <span className="font-medium">{product.donViTinh}</span></div>
                    )}
                    {product.duongDung && (
                      <div><span className="text-gray-500">Đường dùng:</span> <span className="font-medium">{product.duongDung}</span></div>
                    )}
                    {product.activeIngredient && (
                      <div className="col-span-2"><span className="text-gray-500">Hoạt chất:</span> <span className="font-medium">{product.activeIngredient}</span></div>
                    )}
                    {product.hamLuong && (
                      <div className="col-span-2"><span className="text-gray-500">Hàm lượng:</span> <span className="font-medium">{product.hamLuong}</span></div>
                    )}
                  </div>
                </div>

                {/* Cảnh báo Rx */}
                {product.isRx && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex gap-2">
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-red-700 font-bold text-sm">Thuốc kê đơn — Yêu cầu toa bác sĩ</div>
                      <div className="text-red-600 text-xs mt-1">Vui lòng upload ảnh toa bác sĩ để đặt mua sản phẩm này.</div>
                    </div>
                  </div>
                )}

                {/* Upload toa (nếu là thuốc kê đơn) */}
                {product.isRx && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Upload toa bác sĩ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,.pdf"
                      onChange={handleRxFileChange}
                      className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary-light file:text-primary file:font-medium hover:file:bg-primary hover:file:text-white file:cursor-pointer"
                    />
                    {rxError && <p className="text-xs text-red-600 mt-1">⚠ {rxError}</p>}
                    {!rxError && rxFile && <p className="text-xs text-green-600 mt-1">✓ Đã chọn: {rxFile.name}</p>}
                  </div>
                )}

                {/* Số lượng + Nút mua */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{qty}</span>
                    <button
                      onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                      className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddDisabled}
                    title={isAddDisabled ? 'Vui lòng upload toa bác sĩ trước' : ''}
                    className={`flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-6 rounded transition-colors ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark'}`}
                  >
                    <ShoppingCart size={16} />
                    Thêm vào giỏ
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isAddDisabled}
                    title={isAddDisabled ? 'Vui lòng upload toa bác sĩ trước' : ''}
                    className={`flex items-center gap-2 bg-secondary text-white font-bold py-2.5 px-6 rounded transition-opacity ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                  >
                    Mua ngay
                  </button>
                </div>

                {/* Cam kết */}
                <div className="flex flex-wrap gap-3 text-xs text-gray-600 border-t pt-3">
                  <span className="flex items-center gap-1"><Shield size={13} className="text-primary" /> Chính hãng 100%</span>
                  <span className="flex items-center gap-1"><Truck size={13} className="text-primary" /> Giao hàng toàn quốc</span>
                  <span className="flex items-center gap-1"><RotateCcw size={13} className="text-primary" /> Đổi trả 7 ngày</span>
                  <span className="flex items-center gap-1"><Phone size={13} className="text-primary" /> Tư vấn miễn phí</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab mô tả */}
          <div ref={tabRef} className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex border-b">
              {[
                { key: 'description', label: 'Mô tả sản phẩm' },
                { key: 'usage', label: 'Hướng dẫn sử dụng' },
                { key: 'reviews', label: `Đánh giá (${product.reviews})` },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-6">
              {activeTab === 'description' && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p>{product.description}</p>
                  {product.isRx && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3">
                      <strong>⚠️ Lưu ý:</strong> Sản phẩm này là thuốc kê đơn. Chỉ sử dụng theo chỉ định và hướng dẫn của bác sĩ hoặc dược sĩ.
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'usage' && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p>Vui lòng đọc kỹ hướng dẫn sử dụng trước khi dùng. Liên hệ dược sĩ để được tư vấn liều dùng phù hợp với tình trạng sức khỏe của bạn.</p>
                  <p className="mt-2 text-gray-500">📞 Hotline tư vấn: <strong className="text-primary">0972.201.843</strong></p>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-black text-primary">{product.rating}</div>
                    <div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={18}
                            className={i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500">{product.reviews} đánh giá</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 italic">Hiển thị đánh giá từ khách hàng thực tế sẽ được tích hợp qua API...</p>
                </div>
              )}
            </div>
          </div>

          {/* Sản phẩm liên quan */}
          {relatedProducts.length > 0 && (
            <div ref={relatedRef}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-lg font-bold text-gray-800 uppercase">Sản phẩm liên quan</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
