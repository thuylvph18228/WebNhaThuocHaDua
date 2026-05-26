import { createContext, useContext, useState, useMemo } from 'react';
import { products as initialProducts } from '../data/mockData';

const ProductContext = createContext(null);

// Chuyển tên tiếng Việt thành slug URL-safe
function makeSlug(name) {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState(() =>
    initialProducts.map(p => ({ ...p, active: p.active ?? true }))
  );

  // Sản phẩm hiện thị trên storefront/POS (chỉ active)
  const activeProducts = useMemo(() => products.filter(p => p.active !== false), [products]);

  // Sản phẩm nổi bật cho trang chủ
  const featuredProducts = useMemo(
    () => activeProducts.filter(p => ['Bán chạy', 'Mới', 'Khuyến mãi'].includes(p.badge)),
    [activeProducts]
  );

  const addProduct = (data) => {
    const id = Math.max(0, ...products.map(p => p.id)) + 1;
    const slug = makeSlug(data.name) || `san-pham-${id}`;
    setProducts(prev => [...prev, {
      rating: 5.0, reviews: 0, stock: 100, badge: '',
      ...data,
      id, slug, active: true,
    }]);
    return id;
  };

  const updateProduct = (id, data) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const slug = data.name !== p.name ? (makeSlug(data.name) || p.slug) : p.slug;
      return { ...p, ...data, id, slug };
    }));
  };

  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  const toggleProductActive = (id) =>
    setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));

  return (
    <ProductContext.Provider value={{
      products,
      activeProducts,
      featuredProducts,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductActive,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
