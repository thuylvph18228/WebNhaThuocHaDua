import { useEffect, useRef } from 'react';

// Hook thêm animation fade-in khi phần tử vào viewport
export function useScrollAnimation() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.05 }
    );

    // Khởi tạo trạng thái ẩn
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
