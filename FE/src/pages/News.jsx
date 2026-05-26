import { Link, useParams } from 'react-router-dom';
import { Calendar, Tag, ArrowLeft } from 'lucide-react';
import { newsArticles } from '../data/mockData';
import Sidebar from '../components/Sidebar';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

// Trang danh sách bài viết
export function NewsList() {
  const gridRef = useScrollAnimation();
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h1 className="text-xl font-bold text-gray-800 uppercase">Tin tức sức khỏe</h1>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {newsArticles.map(article => (
              <Link
                key={article.id}
                to={`/tin-tuc/${article.slug}`}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center gap-1 text-xs bg-primary-light text-primary px-2 py-0.5 rounded font-medium">
                      <Tag size={10} /> {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={10} /> {formatDate(article.date)}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {article.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3">{article.excerpt}</p>
                  <div className="mt-3 text-primary text-sm font-medium">Đọc thêm →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Trang chi tiết bài viết
export function NewsDetail() {
  const { slug } = useParams();
  const article = newsArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Không tìm thấy bài viết</h2>
        <Link to="/tin-tuc" className="text-primary hover:underline">← Quay lại tin tức</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex gap-6">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Link to="/tin-tuc" className="inline-flex items-center gap-1 text-primary text-sm hover:underline mb-4">
            <ArrowLeft size={14} />
            Quay lại tin tức
          </Link>

          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img src={article.image} alt={article.title} className="w-full h-64 object-cover" />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-primary-light text-primary text-xs px-2 py-0.5 rounded font-medium">{article.category}</span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar size={11} /> {formatDate(article.date)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h1>
              <p className="text-gray-600 leading-relaxed mb-4">{article.excerpt}</p>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p>
                  Đây là nội dung chi tiết của bài viết. Trong môi trường thực tế, nội dung bài viết sẽ được lưu trong cơ sở dữ liệu và hiển thị đầy đủ tại đây. Nhà Thuốc Hà Đua cam kết cung cấp thông tin sức khỏe chính xác và hữu ích cho cộng đồng.
                </p>
                <p className="mt-4">
                  Nếu bạn có bất kỳ câu hỏi nào về sức khỏe, hãy liên hệ với dược sĩ của chúng tôi qua hotline <strong className="text-primary">0972.201.843</strong> để được tư vấn miễn phí.
                </p>
              </div>
            </div>
          </article>

          {/* Bài viết liên quan */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-6 bg-primary rounded-full" />
              <h2 className="text-base font-bold text-gray-800">Bài viết liên quan</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newsArticles.filter(a => a.id !== article.id).slice(0, 2).map(a => (
                <Link key={a.id} to={`/tin-tuc/${a.slug}`} className="bg-white rounded-lg shadow-sm overflow-hidden flex hover:shadow-md transition-shadow group">
                  <img src={a.image} alt={a.title} className="w-24 h-20 object-cover flex-shrink-0" />
                  <div className="p-3 flex-1">
                    <div className="text-xs text-gray-400 mb-1">{formatDate(a.date)}</div>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{a.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
