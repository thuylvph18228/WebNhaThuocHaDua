import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { categories } from '../data/mockData';

function CategoryItem({ category }) {
  const [open, setOpen] = useState(false);
  const hasChildren = category.children?.length > 0;

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <Link
          to={`/san-pham?category=${category.slug}`}
          className="flex-1 flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-primary hover:bg-green-50 transition-colors"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
          <span>{category.name}</span>
        </Link>
        {hasChildren && (
          <button
            onClick={() => setOpen(!open)}
            className="px-2 py-2 text-gray-400 hover:text-primary"
          >
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}
      </div>

      {hasChildren && open && (
        <div className="pl-6 bg-gray-50">
          {category.children.map(sub => (
            <Link
              key={sub.id}
              to={`/san-pham?category=${sub.slug}`}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-primary border-b border-gray-100 last:border-0 transition-colors"
            >
              <ChevronRight size={11} className="text-gray-400" />
              {sub.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      {/* Danh mục sản phẩm */}
      <div className="bg-white rounded shadow-sm mb-3 overflow-hidden">
        <div className="bg-primary text-white font-bold py-2.5 px-3 flex items-center gap-2 text-sm">
          <span className="text-base">☰</span>
          <span>DANH MỤC SẢN PHẨM</span>
        </div>
        <div>
          {categories.map(cat => (
            <CategoryItem key={cat.id} category={cat} />
          ))}
        </div>
      </div>

      {/* Nút liên hệ nhanh */}
      <div className="bg-white rounded shadow-sm mb-3 overflow-hidden">
        <div className="bg-primary text-white font-bold py-2.5 px-3 text-sm">Liên hệ tư vấn</div>
        <div className="p-3 flex flex-col gap-2">
          <a href="https://zalo.me/0986989626" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-500 text-white p-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors">
            <span className="w-7 h-7 bg-white/20 rounded flex items-center justify-center font-bold text-sm flex-shrink-0">Z</span>
            <span>Chat Zalo</span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-blue-700 text-white p-2 rounded text-sm font-medium hover:bg-blue-800 transition-colors">
            <span className="w-7 h-7 bg-white/20 rounded flex items-center justify-center font-bold text-sm flex-shrink-0">f</span>
            <span>Facebook</span>
          </a>
          <a href="tel:0972201843"
            className="flex items-center gap-2 bg-red-500 text-white p-2 rounded text-sm font-medium hover:bg-red-600 transition-colors">
            <span className="w-7 h-7 bg-white/20 rounded flex items-center justify-center font-bold text-xs flex-shrink-0">📞</span>
            <span>Hotline: 0972.201.843</span>
          </a>
        </div>
      </div>

      {/* Hotline banner đỏ */}
      <div className="bg-red-600 text-white rounded shadow-sm p-3 text-center">
        <div className="text-xs font-medium mb-0.5">Hotline tư vấn miễn phí</div>
        <a href="tel:0972201843" className="text-xl font-black hover:underline">0972.201.843</a>
        <div className="text-xs opacity-80 mt-0.5">8:00 - 22:00 hàng ngày</div>
      </div>
    </aside>
  );
}
