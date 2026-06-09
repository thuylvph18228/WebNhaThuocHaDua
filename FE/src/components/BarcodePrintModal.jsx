import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { X, Printer, Minus, Plus } from 'lucide-react';

function fmtPrice(n) {
  if (!n) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

// Tạo SVG barcode string từ maview — chạy JsBarcode trên element tạm rồi lấy outerHTML
function makeBarcodesvg(maview) {
  if (!maview) return '';
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    JsBarcode(svg, maview, {
      format: 'CODE128', width: 2, height: 48,
      displayValue: true, fontSize: 11, margin: 4,
      background: '#ffffff', lineColor: '#000000',
    });
    const html = svg.outerHTML;
    document.body.removeChild(svg);
    return html;
  } catch {
    return '';
  }
}

// Nhãn barcode để preview trong modal (dùng React ref)
function BarcodeLabel({ product, showPrice, showName }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !product.maview) return;
    try {
      JsBarcode(svgRef.current, product.maview, {
        format: 'CODE128', width: 2, height: 48,
        displayValue: true, fontSize: 11, margin: 4,
        background: '#ffffff', lineColor: '#000000',
      });
    } catch { /* maview không hợp lệ */ }
  }, [product.maview]);

  return (
    <div style={{ width: 180, border: '1px solid #ccc', borderRadius: 4, padding: 6,
                  background: '#fff', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', boxSizing: 'border-box' }}>
      {showName && (
        <div style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', marginBottom: 4,
                      lineHeight: 1.3, maxWidth: 168, wordBreak: 'break-word', color: '#111' }}>
          {product.name}
        </div>
      )}
      {product.maview
        ? <svg ref={svgRef} style={{ width: '100%' }} />
        : <div style={{ fontSize: 11, color: '#e53e3e', padding: '8px 0' }}>Chưa có mã barcode</div>
      }
      {showPrice && product.price && (
        <div style={{ fontSize: 12, fontWeight: 900, color: '#00a651', marginTop: 2 }}>
          {fmtPrice(product.price)}
        </div>
      )}
    </div>
  );
}

// Mở cửa sổ mới để in — tránh xung đột CSS với trang chính
function printInNewWindow(products, copies, showPrice, showName) {
  const labelsHtml = products.flatMap(p =>
    Array.from({ length: copies[p.id] || 1 }, () => {
      const barcodesvg = makeBarcodesvg(p.maview);
      return `
        <div class="label">
          ${showName ? `<div class="name">${p.name}</div>` : ''}
          ${barcodesvg || '<div class="no-code">Chưa có mã barcode</div>'}
          ${showPrice && p.price ? `<div class="price">${fmtPrice(p.price)}</div>` : ''}
        </div>`;
    })
  ).join('');

  const win = window.open('', '_blank', 'width=900,height=600');
  if (!win) { alert('Trình duyệt đã chặn popup — vui lòng cho phép popup rồi thử lại'); return; }

  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>In nhãn barcode — Nhà Thuốc Hà Đua</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: Arial, sans-serif; background: #fff; padding: 8px; }
      .container { display: flex; flex-wrap: wrap; gap: 6px; }
      .label { width: 180px; border: 1px solid #ccc; border-radius: 4px; padding: 6px;
               display: flex; flex-direction: column; align-items: center;
               page-break-inside: avoid; background: #fff; }
      .label svg { width: 100% !important; }
      .name { font-size: 10px; font-weight: 700; text-align: center; margin-bottom: 4px;
              line-height: 1.3; word-break: break-word; color: #111; }
      .price { font-size: 12px; font-weight: 900; color: #00a651; margin-top: 2px; }
      .no-code { font-size: 11px; color: #e53e3e; padding: 8px 0; }
      @media print { @page { margin: 0.5cm; } body { padding: 4px; } }
    </style>
  </head><body>
    <div class="container">${labelsHtml}</div>
    <script>
      window.onload = function() {
        setTimeout(function() { window.print(); }, 300);
      };
    <\/script>
  </body></html>`);
  win.document.close();
}

// ─── Modal chính ─────────────────────────────────────────────────
export default function BarcodePrintModal({ products, onClose }) {
  const [copies, setCopies] = useState(() =>
    Object.fromEntries(products.map(p => [p.id, 1]))
  );
  const [showPrice, setShowPrice] = useState(true);
  const [showName, setShowName] = useState(true);

  const setCopy = (id, delta) =>
    setCopies(prev => ({ ...prev, [id]: Math.max(1, Math.min(99, (prev[id] || 1) + delta)) }));

  const totalLabels = products.reduce((s, p) => s + (copies[p.id] || 1), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-800">In nhãn barcode</h2>
            <p className="text-xs text-gray-500 mt-0.5">{products.length} sản phẩm · {totalLabels} nhãn</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Tùy chọn */}
        <div className="px-5 py-3 border-b flex-shrink-0 flex flex-wrap gap-4 items-center bg-gray-50">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showName} onChange={e => setShowName(e.target.checked)} className="accent-primary" />
            Hiện tên sản phẩm
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} className="accent-primary" />
            Hiện giá bán
          </label>
        </div>

        {/* Danh sách */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {products.map(p => (
            <div key={p.id} className="flex items-start gap-4 border rounded-lg p-3">
              <div className="flex-shrink-0 border rounded overflow-hidden bg-white">
                <BarcodeLabel product={p} showPrice={showPrice} showName={showName} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-sm leading-tight">{p.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Mã: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">{p.maview || '—'}</code>
                  {p.price && <span className="ml-2">· {fmtPrice(p.price)}</span>}
                </div>
                {!p.maview && <div className="text-xs text-red-500 mt-1">⚠ Chưa có mã barcode (maview)</div>}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-600 font-medium">Số bản in:</span>
                  <button onClick={() => setCopy(p.id, -1)}
                    className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                    <Minus size={12} />
                  </button>
                  <span className="w-8 text-center font-bold text-sm">{copies[p.id] || 1}</span>
                  <button onClick={() => setCopy(p.id, +1)}
                    className="w-7 h-7 border border-gray-300 rounded flex items-center justify-center hover:bg-gray-100">
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t bg-gray-50 flex items-center justify-between flex-shrink-0">
          <p className="text-xs text-gray-500">Tổng cộng: <strong>{totalLabels}</strong> nhãn</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm">
              Hủy
            </button>
            <button onClick={() => printInNewWindow(products, copies, showPrice, showName)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary-dark text-sm font-bold">
              <Printer size={15} /> In {totalLabels} nhãn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
