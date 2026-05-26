import { Link } from 'react-router-dom';
import { ShoppingCart, Star, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

// Format giá tiền VND
function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Tính % giảm giá
function discountPercent(price, original) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const discount = discountPercent(product.price, product.originalPrice);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Link
      to={`/san-pham/${product.slug}`}
      className="product-card group block"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          {product.badge && product.badge !== 'Rx' && (
            <span className="bg-secondary text-white text-xs font-medium px-2 py-0.5 rounded">
              {product.badge}
            </span>
          )}
          {product.isRx && (
            <span className="bg-red-700 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
              <AlertCircle size={10} /> Rx
            </span>
          )}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-3">
        {/* Tên */}
        <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors min-h-[40px]">
          {product.name}
        </h3>

        {/* Đánh giá */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={12}
                className={i <= Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>

        {/* Giá */}
        <div className="flex items-center gap-2 mb-3">
          <span className="price-tag">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 text-xs line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Nút thêm giỏ hàng */}
        {product.isRx ? (
          <button
            onClick={e => e.preventDefault()}
            className="w-full flex items-center justify-center gap-1 border border-red-500 text-red-600 text-xs py-2 rounded hover:bg-red-50 transition-colors"
          >
            <AlertCircle size={13} />
            Yêu cầu toa bác sĩ
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-1 bg-primary text-white text-xs py-2 rounded hover:bg-primary-dark transition-colors"
          >
            <ShoppingCart size={13} />
            Thêm vào giỏ
          </button>
        )}
      </div>
    </Link>
  );
}
