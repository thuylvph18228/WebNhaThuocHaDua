import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { X, Camera, RefreshCw } from 'lucide-react';

// Modal quét mã vạch qua camera — chỉ dùng trên di động/máy tính bảng
// Khi quét được mã hợp lệ, gọi onDetected(code) rồi tự đóng
export default function BarcodeScanner({ onDetected, onClose }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [camIdx, setCamIdx] = useState(0);   // index camera đang dùng
  const [status, setStatus] = useState('starting'); // 'starting' | 'scanning' | 'error'
  const [errMsg, setErrMsg] = useState('');
  const [lastCode, setLastCode] = useState('');
  const cooldownRef = useRef(false);          // tránh trigger nhiều lần cùng 1 mã

  // Khởi tạo reader và liệt kê camera
  useEffect(() => {
    let mounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    BrowserMultiFormatReader.listVideoInputDevices()
      .then(devices => {
        if (!mounted) return;
        if (devices.length === 0) {
          setStatus('error');
          setErrMsg('Không tìm thấy camera. Vui lòng cấp quyền camera cho trình duyệt.');
          return;
        }
        setCameras(devices);
        // Ưu tiên camera sau (back) — thường có index cao hơn trên di động
        const backIdx = devices.findIndex(d => /back|rear|environment/i.test(d.label));
        setCamIdx(backIdx >= 0 ? backIdx : devices.length - 1);
      })
      .catch(() => {
        if (!mounted) return;
        setStatus('error');
        setErrMsg('Trình duyệt từ chối truy cập camera. Vui lòng cho phép camera và tải lại trang.');
      });

    return () => { mounted = false; };
  }, []);

  // Bắt đầu quét khi có camera và camIdx thay đổi
  useEffect(() => {
    if (cameras.length === 0 || !videoRef.current) return;

    const reader = readerRef.current;
    const deviceId = cameras[camIdx]?.deviceId;
    setStatus('starting');
    cooldownRef.current = false;

    const ctrl = { stop: () => { } };

    reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err, controls) => {
      ctrl.stop = () => controls?.stop();

      if (result) {
        const code = result.getText();
        if (cooldownRef.current || code === lastCode) return;
        cooldownRef.current = true;
        setLastCode(code);
        setTimeout(() => { cooldownRef.current = false; }, 1500);
        onDetected(code);
        onClose();
      }
      if (err && err.name !== 'NotFoundException') {
        // Lỗi nghiêm trọng (không phải "chưa tìm thấy mã" thông thường)
        setStatus('error');
        setErrMsg('Lỗi camera: ' + err.message);
      }
      if (videoRef.current?.readyState >= 2) setStatus('scanning');
    }).catch(e => {
      setStatus('error');
      setErrMsg('Không thể khởi động camera: ' + e.message);
    });

    return () => { ctrl.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameras, camIdx]);

  const switchCamera = () => {
    setCamIdx(i => (i + 1) % cameras.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 flex-shrink-0">
        <div className="flex items-center gap-2 text-white">
          <Camera size={18} />
          <span className="font-semibold text-sm">Quét mã vạch</span>
          {status === 'scanning' && (
            <span className="text-xs text-green-400 animate-pulse">● Đang quét...</span>
          )}
          {status === 'starting' && (
            <span className="text-xs text-yellow-400">Đang khởi động...</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cameras.length > 1 && (
            <button onClick={switchCamera}
              className="flex items-center gap-1 text-xs text-white/80 hover:text-white border border-white/30 rounded px-2 py-1">
              <RefreshCw size={13} /> Đổi camera
            </button>
          )}
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Vùng camera */}
      <div className="flex-1 relative overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />

        {/* Khung ngắm */}
        {status === 'scanning' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-64 h-40">
              {/* 4 góc khung */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br" />
              {/* Vạch quét chạy */}
              <div className="absolute left-2 right-2 h-0.5 bg-green-400 opacity-80 animate-scan" />
            </div>
          </div>
        )}

        {/* Trạng thái lỗi */}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center px-6">
              <Camera size={48} className="text-white/30 mx-auto mb-3" />
              <p className="text-white text-sm">{errMsg}</p>
              <button onClick={onClose}
                className="mt-4 px-6 py-2 bg-white text-black rounded-lg text-sm font-medium">
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hướng dẫn */}
      <div className="bg-black/80 text-white/60 text-xs text-center py-3 px-4 flex-shrink-0">
        Hướng camera vào mã vạch trên vỏ hộp thuốc · Giữ ổn định và đủ sáng
      </div>
    </div>
  );
}
