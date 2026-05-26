import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, CheckCircle, Truck, CreditCard, Shield } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import Sidebar from '../components/Sidebar';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { categories, testimonials, newsArticles, brands } from '../data/mockData';
import { useProducts } from '../context/ProductContext';

// Banner slides giống trang mẫu: hình lớn bên phải, text trái
const bannerSlides = [
  {
    id: 1,
    bgFrom: '#e6f7ef',
    bgTo: '#c3edd8',
    accentColor: '#00a651',
    tag: 'Ưu đãi hot',
    title: 'THIẾT BỊ Y TẾ',
    highlight: 'Giảm đến 50%',
    sub: 'Omron • Beurer • Microlife\nGiao hàng toàn quốc — Chính hãng 100%',
    cta: 'Mua ngay',
    link: '/san-pham?category=thiet-bi-y-te',
    emoji: '🩺',
    emojiSize: 'text-[120px]',
  },
  {
    id: 2,
    bgFrom: '#fff7ed',
    bgTo: '#ffe0be',
    accentColor: '#f26522',
    tag: 'Mới về',
    title: 'VITAMIN &',
    highlight: 'Thực phẩm chức năng',
    sub: 'Tăng đề kháng — Bổ sung dinh dưỡng\nAn toàn • Chính hãng • Giá tốt nhất',
    cta: 'Khám phá',
    link: '/san-pham?category=vitamin-thuc-pham-chuc-nang',
    emoji: '💊',
    emojiSize: 'text-[120px]',
  },
  {
    id: 3,
    bgFrom: '#eff6ff',
    bgTo: '#bfdbfe',
    accentColor: '#2563eb',
    tag: 'Nhập khẩu chính hãng',
    title: 'DƯỢC MỸ PHẨM',
    highlight: 'Chăm sóc da',
    sub: 'Bác sĩ da liễu khuyên dùng\nAn toàn cho mọi loại da',
    cta: 'Xem ngay',
    link: '/san-pham?category=duoc-my-pham',
    emoji: '✨',
    emojiSize: 'text-[120px]',
  },
];

function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % bannerSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = bannerSlides[current];

  return (
    <div
      className="relative rounded-lg overflow-hidden h-56 md:h-64 transition-all duration-700"
      style={{ background: `linear-gradient(135deg, ${slide.bgFrom}, ${slide.bgTo})` }}
    >
      <div className="flex items-center h-full px-8 md:px-12 gap-4">
        {/* Text bên trái */}
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-white text-xs font-bold px-3 py-1 rounded-full mb-2"
            style={{ backgroundColor: slide.accentColor }}
          >
            {slide.tag}
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-800 leading-tight">
            {slide.title}
          </h2>
          <h3
            className="text-xl md:text-2xl font-black leading-tight mt-0.5"
            style={{ color: slide.accentColor }}
          >
            {slide.highlight}
          </h3>
          <p className="text-gray-500 text-xs md:text-sm mt-2 whitespace-pre-line leading-relaxed hidden sm:block">
            {slide.sub}
          </p>
          <Link
            to={slide.link}
            className="inline-block mt-3 text-white font-bold py-2 px-5 rounded-full text-sm transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: slide.accentColor }}
          >
            {slide.cta} →
          </Link>
        </div>
        {/* Emoji / icon bên phải */}
        <div className={`${slide.emojiSize} opacity-25 select-none hidden sm:block flex-shrink-0`}>
          {slide.emoji}
        </div>
      </div>

      {/* Nút prev/next */}
      <button
        onClick={() => setCurrent(p => (p - 1 + bannerSlides.length) % bannerSlides.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white rounded-full p-1.5 shadow transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={() => setCurrent(p => (p + 1) % bannerSlides.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/60 hover:bg-white rounded-full p-1.5 shadow transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {bannerSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current ? 'bg-primary w-5 h-2' : 'bg-white/60 w-2 h-2'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Header cho mỗi section
function SectionHeader({ title, viewAllLink }) {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className="flex items-center justify-between mb-3 pb-2 border-b-2 border-primary">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-primary rounded" />
        <h2 className="text-sm font-bold text-white bg-primary px-3 py-1 rounded-sm uppercase tracking-wide">
          {title}
        </h2>
      </div>
      {viewAllLink && (
        <Link to={viewAllLink} className="text-primary text-xs font-medium hover:underline border border-primary px-2 py-0.5 rounded hover:bg-primary hover:text-white transition-colors">
          Xem tất cả »
        </Link>
      )}
    </div>
  );
}

// Danh mục nhanh dạng icon grid
function QuickCategories() {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3">
      {categories.map(cat => (
        <Link
          key={cat.id}
          to={`/san-pham?category=${cat.slug}`}
          className="flex flex-col items-center gap-1 py-3 px-1 bg-white rounded shadow-sm hover:shadow-md hover:border-primary border border-gray-100 transition-all group text-center"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">{cat.icon}</span>
          <span className="text-[11px] text-gray-600 font-medium leading-tight group-hover:text-primary line-clamp-2">
            {cat.name.split('(')[0].trim()}
          </span>
        </Link>
      ))}
    </div>
  );
}

// 3 cam kết chính — giống reference
function Commitments() {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
      {[
        {
          icon: <Shield size={28} className="text-primary" />,
          title: 'Sản phẩm chính hãng',
          desc: '100% thuốc & thiết bị có nguồn gốc, số đăng ký lưu hành đầy đủ',
        },
        {
          icon: <Truck size={28} className="text-primary" />,
          title: 'Đổi trả miễn phí',
          desc: 'Đổi trả 7 ngày nếu lỗi, sai mô tả. Hoàn tiền 100% không câu hỏi',
        },
        {
          icon: <CreditCard size={28} className="text-primary" />,
          title: 'Thanh toán linh hoạt',
          desc: 'COD, chuyển khoản, VNPAY, MoMo — nhiều ưu đãi thanh toán online',
        },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded shadow-sm border border-gray-100">
          <div className="flex-shrink-0 w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
            {item.icon}
          </div>
          <div>
            <div className="font-bold text-sm text-gray-800">{item.title}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Testimonials
function Testimonials() {
  const ref = useScrollAnimation();
  return (
    <div ref={ref} className="my-6 bg-white rounded shadow-sm p-5">
      <div className="text-center mb-5">
        <h2 className="text-base font-bold text-gray-800 uppercase">Khách hàng nói gì về chúng tôi</h2>
        <div className="flex justify-center mt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
          ))}
          <span className="text-xs text-gray-500 ml-1">4.9/5 từ 1.200+ đánh giá</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map(t => (
          <div key={t.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border-2 border-primary" />
              <div>
                <div className="font-semibold text-sm text-gray-800">{t.name}</div>
                <div className="text-xs text-gray-400">{t.location}</div>
              </div>
            </div>
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12}
                  className={i < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}
                />
              ))}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed italic">"{t.content}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { activeProducts, featuredProducts } = useProducts();
  // Nhóm sản phẩm theo danh mục (lấy 5 sản phẩm đầu mỗi nhóm có đủ sản phẩm)
  const productGroups = categories.slice(0, 4).map(cat => ({
    category: cat,
    items: activeProducts.filter(p =>
      p.category === cat.slug ||
      cat.children?.some(sub => sub.slug === p.category)
    ).slice(0, 5),
  })).filter(g => g.items.length >= 2);

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="flex gap-4">
        {/* Sidebar trái */}
        <Sidebar />

        {/* Nội dung chính */}
        <div className="flex-1 min-w-0">
          {/* Banner slider */}
          <BannerSlider />

          {/* Danh mục nhanh */}
          <QuickCategories />

          {/* Cam kết */}
          <Commitments />

          {/* Sản phẩm nổi bật */}
          <section className="mb-5">
            <SectionHeader title="Sản phẩm nổi bật" viewAllLink="/san-pham" />
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {featuredProducts.slice(0, 5).map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          {/* Banner giữa trang */}
          <div className="mb-5 bg-gradient-to-r from-primary to-green-700 text-white rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs opacity-80 mb-0.5">💡 Dịch vụ đặc biệt</div>
              <h3 className="text-xl font-black">Có toa bác sĩ?</h3>
              <p className="text-sm opacity-90 mt-0.5">Upload toa — đặt thuốc đúng đơn — giao tận nhà nhanh chóng</p>
            </div>
            <Link
              to="/dat-hang"
              className="bg-white text-primary font-bold py-2.5 px-6 rounded-full hover:bg-gray-100 transition-colors text-sm flex-shrink-0"
            >
              Đặt ngay →
            </Link>
          </div>

          {/* Sản phẩm theo từng danh mục */}
          {productGroups.map(group => (
            <section key={group.category.id} className="mb-5">
              <SectionHeader
                title={`${group.category.icon} ${group.category.name.split('(')[0].trim()}`}
                viewAllLink={`/san-pham?category=${group.category.slug}`}
              />
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                {group.items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}

          {/* Thương hiệu đối tác */}
          <section className="mb-5">
            <SectionHeader title="Đối tác thương hiệu" />
            <div className="bg-white rounded shadow-sm p-4">
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {brands.map(b => (
                  <div key={b.id}
                    className="flex items-center justify-center h-14 border border-gray-200 rounded hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                  >
                    <span className="text-gray-600 font-bold text-sm">{b.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <Testimonials />

          {/* Tin tức sức khỏe */}
          <section className="mb-5">
            <SectionHeader title="📰 Tin tức sức khỏe" viewAllLink="/tin-tuc" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {newsArticles.map(article => (
                <Link
                  key={article.id}
                  to={`/tin-tuc/${article.slug}`}
                  className="bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="p-3">
                    <span className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded font-medium">
                      {article.category}
                    </span>
                    <h3 className="font-semibold text-sm text-gray-800 mt-1.5 mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
                    <div className="text-xs text-gray-400 mt-1.5">{article.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
