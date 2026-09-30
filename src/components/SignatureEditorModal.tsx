import React, { useRef, useState, useEffect } from 'react';
import { X, Check, Trash2, RotateCcw, Upload, Edit3, Image as ImageIcon } from 'lucide-react';
import { CertificateSignatory, Language } from '../types';

interface SignatureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  signatory: CertificateSignatory | null;
  onSaveSignature: (signatoryId: string, signatureDataUrl?: string) => void;
}

export const SignatureEditorModal: React.FC<SignatureEditorModalProps> = ({
  isOpen,
  onClose,
  lang,
  signatory,
  onSaveSignature
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [penColor, setPenColor] = useState<'#1e3a8a' | '#0f172a' | '#064e3b'>('#1e3a8a');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [previewImage, setPreviewImage] = useState<string | undefined>(signatory?.signatureImage);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize or reset canvas
  useEffect(() => {
    if (!isOpen) return;
    setPreviewImage(signatory?.signatureImage);
    setHasDrawn(false);
    
    // Setup canvas
    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // If signatory already has a signature image, draw it
      if (signatory?.signatureImage) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setHasDrawn(true);
        };
        img.src = signatory.signatureImage;
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, signatory]);

  if (!isOpen || !signatory) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (canvasRef.current) {
      setPreviewImage(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setPreviewImage(undefined);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw image keeping aspect ratio
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.9;
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        ctx.drawImage(img, x, y, w, h);
        const dataUrl = canvas.toDataURL('image/png');
        setPreviewImage(dataUrl);
        setHasDrawn(true);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveSignature(signatory.id, previewImage);
    onClose();
  };

  const handleResetToProcedural = () => {
    onSaveSignature(signatory.id, undefined);
    setPreviewImage(undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {lang === 'kn' ? 'ಡಿಜಿಟಲ್ ಸಹಿ ಸೇರಿಸಿ / ಬದಲಾಯಿಸಿ' : 'Insert / Edit Signature'}
            </div>
            <h3 className="text-lg font-bold text-stone-900 font-serif-kannada">
              {signatory.nameKn} ({signatory.designationKn})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls: Draw vs Upload */}
        <div className="flex items-center justify-between bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => setMode('draw')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'draw' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Edit3 className="w-4 h-4 text-amber-700" />
            <span>{lang === 'kn' ? 'ಸಹಿ ಬರೆಯಿರಿ (ಕ್ಯಾನ್ವಾಸ್)' : 'Draw Signature'}</span>
          </button>

          <button
            onClick={() => setMode('upload')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              mode === 'upload' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-4 h-4 text-amber-700" />
            <span>{lang === 'kn' ? 'ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' : 'Upload Image'}</span>
          </button>
        </div>

        {/* Mode 1: Drawing Canvas */}
        <div className="space-y-3">
          <div className="relative border-2 border-dashed border-stone-300 rounded-2xl bg-stone-50 p-2 overflow-hidden flex flex-col items-center justify-center">
            <canvas
              ref={canvasRef}
              width={600}
              height={220}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-44 bg-white rounded-xl shadow-inner cursor-crosshair touch-none"
            />
            
            {/* Guide line inside canvas */}
            <div className="w-4/5 h-[1.5px] bg-stone-300/80 -mt-8 pointer-events-none mb-4" />

            {!hasDrawn && !previewImage && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-stone-400">
                <Edit3 className="w-8 h-8 mb-1 stroke-1 opacity-60" />
                <span className="text-xs font-medium">
                  {lang === 'kn' ? 'ಇಲ್ಲಿ ಮೌಸ್ ಅಥವಾ ಬೆರಳಿನಿಂದ ಸಹಿ ಮಾಡಿ' : 'Sign here with mouse or touch'}
                </span>
              </div>
            )}
          </div>

          {/* Drawing Tools (Pen color, stroke, clear) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-600">
                {lang === 'kn' ? 'ಮಸಿ ಬಣ್ಣ:' : 'Ink:'}
              </span>
              <button
                type="button"
                onClick={() => setPenColor('#1e3a8a')}
                className={`w-6 h-6 rounded-full bg-blue-900 border-2 transition ${penColor === '#1e3a8a' ? 'scale-110 border-amber-500 shadow-sm' : 'border-transparent'}`}
                title="Navy Blue"
              />
              <button
                type="button"
                onClick={() => setPenColor('#0f172a')}
                className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition ${penColor === '#0f172a' ? 'scale-110 border-amber-500 shadow-sm' : 'border-transparent'}`}
                title="Black"
              />
              <button
                type="button"
                onClick={() => setPenColor('#064e3b')}
                className={`w-6 h-6 rounded-full bg-emerald-900 border-2 transition ${penColor === '#064e3b' ? 'scale-110 border-amber-500 shadow-sm' : 'border-transparent'}`}
                title="Emerald"
              />

              <div className="h-4 w-[1px] bg-stone-300 mx-1" />

              <span className="text-xs font-semibold text-stone-600">
                {lang === 'kn' ? 'ದಪ್ಪ:' : 'Width:'}
              </span>
              <button
                type="button"
                onClick={() => setStrokeWidth(2)}
                className={`px-2 py-0.5 rounded text-xs font-bold ${strokeWidth === 2 ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                1x
              </button>
              <button
                type="button"
                onClick={() => setStrokeWidth(3.5)}
                className={`px-2 py-0.5 rounded text-xs font-bold ${strokeWidth === 3.5 ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:bg-stone-100'}`}
              >
                2x
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5 text-stone-500" />
                <span>{lang === 'kn' ? 'ಅಳಿಸಿ' : 'Clear'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Upload Trigger Input */}
        {mode === 'upload' && (
          <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-2 text-center">
            <p className="text-xs text-stone-600">
              {lang === 'kn'
                ? 'ಸಹಿಯ ಫೋಟೋ (PNG / JPG) ಆಯ್ಕೆಮಾಡಿ. ಪಾರದರ್ಶಕ (Transparent) ಹಿನ್ನೆಲೆ ಉತ್ತಮ.'
                : 'Upload signature photo (PNG / JPG). Transparent background recommended.'}
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 mx-auto shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (Select File)' : 'Select Signature File'}</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-stone-200 pt-4">
          <button
            type="button"
            onClick={handleResetToProcedural}
            className="px-3 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'kn' ? 'ಮೂಲ ಹ್ಯಾಂಡ್‌ರೈಟಿಂಗ್ ಶೈಲಿಗೆ ಮರುಹೊಂದಿಸಿ' : 'Reset to Default Script'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition"
            >
              {lang === 'kn' ? 'ರದ್ದುಮಾಡಿ' : 'Cancel'}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'kn' ? 'ಸಹಿ ಉಳಿಸಿ & ಅನ್ವಯಿಸಿ' : 'Save & Apply'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
