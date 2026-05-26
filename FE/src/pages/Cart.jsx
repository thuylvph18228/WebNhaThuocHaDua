import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { FREE_SHIPPING_THRESHOLD } from '../constants/shipping';

function formatPrice(price) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

export default function Cart() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-gray-500 text-sm mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
        <Link to="/san-pham" className="inline-flex items-center gap-2 bg-primary text-white py-3 px-6 rounded hover:bg-primary-dark transition-colors font-medium">
          <ArrowLeft size={16} />
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Giỏ hàng ({items.length} sản phẩm)</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Danh sách giỏ hàng */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header bảng */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50 px-4 py-3 text-xs font-bold text-gray-600 uppercase border-b">
              <div className="col-span-6">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-center">Thành tiền</div>
            </div>

            {/* Các dòng sản phẩm */}
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 px-4 py-4 border-b items-center hover:bg-gray-50 transition-colors">
                {/* Ảnh + tên */}
                <div className="col-span-12 md:col-span-6 flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-16 h-16 object-contain bg-gray-100 rounded" />
                  <div>
                    <Link to={`/san-pham/${item.slug}`} className="text-sm font-medium text-gray-800 hover:text-primary line-clamp-2">
                      {item.name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-0.5">{item.brand}</div>
                    {item.isRx && (
                      <span className="inline-block bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded mt-1">Kê đơn</span>
                    )}
                  </div>
                </div>

                {/* Đơn giá */}
                <div className="col-span-4 md:col-span-2 text-center">
                  <span className="text-sm font-medium text-red-600">{formatPrice(item.price)}</span>
                </div>

                {/* Số lượng */}
                <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Thành tiền + xóa */}
                <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-2">
                  <span className="text-sm font-bold text-red-600">{formatPrice(item.price * item.qty)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Nút điều hướng */}
          <div className="flex items-center justify-between mt-4">
            <Link to="/san-pham" className="flex items-center gap-1 text-primary text-sm hover:underline">
              <ArrowLeft size={14} />
              Tiếp tục mua sắm
            </Link>
            <button
              onClick={clearCart}
              className="flex items-center gap-1 text-gray-500 text-sm hover:text-red-500 transition-colors"
            >
              <Trash2 size={14} />
              Xóa tất cả
            </button>
          </div>
        </div>

        {/* Tổng đơn hàng */}
        <div className="lg:w-72">
          <div className="bg-white rounded-lg shadow-sm p-5 sticky top-24">
            <h3 className="font-bold text-gray-800 text-base mb-4 border-b pb-3">Tổng đơn hàng</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính ({items.reduce((s, i) => s + i.qty, 0)} sản phẩm)</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển</span>
                <span className="text-primary font-medium">Miễn phí</span>
              </div>
              {totalPrice >= FREE_SHIPPING_THRESHOLD && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  ✓ Bạn được miễn phí vận chuyển!
                </div>
              )}
              {totalPrice < FREE_SHIPPING_THRESHOLD && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Mua thêm {formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)} để được miễn phí vận chuyển
                </div>
              )}
            </div>

            <div className="border-t pt-3 mb-5">
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <Link
              to="/dat-hang"
              className="block w-full bg-primary text-white text-center font-bold py-3 rounded hover:bg-primary-dark transition-colors"
            >
              Tiến hành đặt hàng →
            </Link>

            <div className="mt-3 text-xs text-gray-500 text-center space-y-1">
              <div>🔒 Thanh toán an toàn & bảo mật</div>
              <div>✓ Đổi trả miễn phí trong 7 ngày</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
