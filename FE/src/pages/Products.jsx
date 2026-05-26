import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Grid, List } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { categories } from '../data/mockData';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useProducts } from '../context/ProductContext';

const SORT_OPTIONS = [
  { value: 'default', label: 'Sắp xếp mặc định' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'name-asc', label: 'Tên A-Z' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
];

const PAGE_SIZE = 12;

export default function Products() {
  const contentRef = useScrollAnimation();
  const { activeProducts: products } = useProducts();
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('default');
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [isRxFilter, setIsRxFilter] = useState('all');

  const categorySlug = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  // Tên danh mục hiện tại
  const currentCategory = useMemo(() => {
    for (const cat of categories) {
      if (cat.slug === categorySlug) return cat;
      const sub = cat.children?.find(s => s.slug === categorySlug);
      if (sub) return sub;
    }
    return null;
  }, [categorySlug]);

  // Lọc và sort sản phẩm
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Lọc theo danh mục
    if (categorySlug) {
      list = list.filter(p =>
        p.category === categorySlug ||
        categories.find(c => c.children?.some(sub => sub.slug === p.category) && c.slug === categorySlug)
      );
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q) ||
        p.activeIngredient?.toLowerCase().includes(q)
      );
    }

    // Lọc giá
    list = list.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Lọc kê đơn
    if (isRxFilter === 'rx') list = list.filter(p => p.isRx);
    if (isRxFilter === 'otc') list = list.filter(p => !p.isRx);

    // Sort
    switch (sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name-asc': list.sort((a, b) => a.name.localeCompare(b.name, 'vi')); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
    }

    return list;
  }, [categorySlug, searchQuery, sort, priceRange, isRxFilter]);

  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const pageTitle = searchQuery
    ? `Tìm kiếm: "${searchQuery}"`
    : currentCategory?.name || 'Tất cả sản phẩm';

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        {/* Sidebar */}
        <Sidebar />

        {/* Nội dung chính */}
        <div ref={contentRef} className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="text-xs text-gray-500 mb-3">
            <span>Trang chủ</span>
            <span className="mx-1">›</span>
            {currentCategory ? (
              <>
                <span>Sản phẩm</span>
                <span className="mx-1">›</span>
                <span className="text-primary font-medium">{currentCategory.name}</span>
              </>
            ) : (
              <span className="text-primary font-medium">Sản phẩm</span>
            )}
          </div>

          {/* Header danh sách */}
          <div className="bg-white rounded shadow-sm p-3 mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-base font-bold text-gray-800">{pageTitle}</h1>
              <p className="text-xs text-gray-500">Hiển thị {filteredProducts.length} sản phẩm</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Lọc Rx/OTC */}
              <select
                value={isRxFilter}
                onChange={e => { setIsRxFilter(e.target.value); setPage(1); }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 outline-none focus:border-primary"
              >
                <option value="all">Tất cả loại</option>
                <option value="otc">Không kê đơn (OTC)</option>
                <option value="rx">Kê đơn (Rx)</option>
              </select>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => { setSort(e.target.value); setPage(1); }}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 pr-7 outline-none focus:border-primary appearance-none"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Bộ lọc giá nhanh */}
          <div className="bg-white rounded shadow-sm p-3 mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-gray-600">Lọc nhanh:</span>
            {[
              { label: 'Dưới 100.000đ', range: [0, 100000] },
              { label: '100k - 500k', range: [100000, 500000] },
              { label: '500k - 1 triệu', range: [500000, 1000000] },
              { label: 'Trên 1 triệu', range: [1000000, 10000000] },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => { setPriceRange(opt.range); setPage(1); }}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  priceRange[0] === opt.range[0] && priceRange[1] === opt.range[1]
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => { setPriceRange([0, 10000000]); setPage(1); }}
              className="text-xs text-gray-400 hover:text-primary"
            >
              Xóa lọc
            </button>
          </div>

          {/* Grid sản phẩm */}
          {pagedProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded shadow-sm">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-700 mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc tìm kiếm từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {pagedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                ‹ Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 border rounded text-sm transition-colors ${
                    p === page ? 'bg-primary text-white border-primary' : 'hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border rounded text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Tiếp ›
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
