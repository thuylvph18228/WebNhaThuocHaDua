import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { CatalogProvider } from './context/CatalogContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Account from './pages/Account';
import Stores from './pages/Stores';
import Contact from './pages/Contact';
import POS from './pages/POS';
import POSOrders from './pages/POSOrders';
import Inventory from './pages/Inventory';
import Admin from './pages/Admin';
import ProductCatalog from './pages/ProductCatalog';
import { NewsList, NewsDetail } from './pages/News';

// Guard route — chỉ staff/admin mới vào được, còn lại redirect về login
function StaffRoute({ children }) {
  const { user, canUsePOS } = useAuth();
  if (!user) return <Navigate to="/tai-khoan" replace />;
  if (!canUsePOS) return <Navigate to="/" replace />;
  return children;
}

function Placeholder({ title }) {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-500">Trang đang được phát triển. Vui lòng quay lại sau!</p>
    </div>
  );
}

// Layout chính dùng cho trang khách hàng
function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 py-2">{children}</main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider bao ngoài cùng để Header và POS đều đọc được */}
      <AuthProvider>
        <ProductProvider>
        <CatalogProvider>
        <CartProvider>
          <Routes>
            {/* Tất cả trang dùng MainLayout */}
            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/pos" element={<StaffRoute><POS /></StaffRoute>} />
                  <Route path="/san-pham" element={<Products />} />
                  <Route path="/san-pham/:slug" element={<ProductDetail />} />
                  <Route path="/gio-hang" element={<Cart />} />
                  <Route path="/dat-hang" element={<Checkout />} />
                  <Route path="/tai-khoan" element={<Account />} />
                  <Route path="/he-thong-cua-hang" element={<Stores />} />
                  <Route path="/lien-he" element={<Contact />} />
                  <Route path="/tin-tuc" element={<NewsList />} />
                  <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
                  <Route path="/pos/orders" element={<StaffRoute><POSOrders /></StaffRoute>} />
                  <Route path="/quan-ly-kho" element={<StaffRoute><Inventory /></StaffRoute>} />
                  <Route path="/kho/ton-kho" element={<StaffRoute><Inventory initialTab="stock" /></StaffRoute>} />
                  <Route path="/kho/nhap" element={<StaffRoute><Inventory initialTab="receipts" /></StaffRoute>} />
                  <Route path="/kho/xuat" element={<StaffRoute><Inventory initialTab="exports" /></StaffRoute>} />
                  <Route path="/kho/luan-chuyen" element={<StaffRoute><Inventory initialTab="transfers" /></StaffRoute>} />
                  {/* Danh mục — mỗi mục là URL riêng */}
                  <Route path="/danh-muc" element={<Navigate to="/danh-muc/san-pham" replace />} />
                  <Route path="/danh-muc/san-pham"     element={<ProductCatalog />} />
                  <Route path="/danh-muc/ly-do-nhap"   element={<ProductCatalog />} />
                  <Route path="/danh-muc/ly-do-xuat"   element={<ProductCatalog />} />
                  <Route path="/danh-muc/nha-cung-cap" element={<ProductCatalog />} />
                  <Route path="/danh-muc/kho-hang"     element={<ProductCatalog />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/gioi-thieu" element={<Placeholder title="Giới thiệu" />} />
                  <Route path="/chinh-sach-dai-ly" element={<Placeholder title="Chính sách đại lý" />} />
                  <Route path="/tuyen-dung" element={<Placeholder title="Tuyển dụng" />} />
                  <Route path="*" element={<Placeholder title="404 - Không tìm thấy trang" />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </CartProvider>
        </CatalogProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
