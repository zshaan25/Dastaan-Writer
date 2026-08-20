import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Camera,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Trash2,
  AlertCircle,
  ImageIcon,
} from 'lucide-react';

export function AvatarCropperModal({
  isOpen,
  onClose,
  currentAvatar,
  onSaveAvatar,
  userName = 'User',
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(null);
  const [isDropActive, setIsDropActive] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setImageSrc(currentAvatar || null);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setError(null);
    }
  }, [isOpen, currentAvatar]);

  // Load and draw image onto canvas
  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      drawCanvas();
    };
    img.onerror = () => {
      setError('Failed to load image format. Please try PNG, JPEG, or WebP.');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Redraw when zoom or offset changes
  useEffect(() => {
    if (imageRef.current) {
      drawCanvas();
    }
  }, [zoom, offset]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Draw circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Fill background
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, size, size);

    // Calculate dimensions with aspect ratio preservation
    const aspect = img.width / img.height;
    let drawWidth = size * zoom;
    let drawHeight = size * zoom;

    if (aspect > 1) {
      drawHeight = (size / aspect) * zoom;
    } else {
      drawWidth = size * aspect * zoom;
    }

    const drawX = (size - drawWidth) / 2 + offset.x;
    const drawY = (size - drawHeight) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }, [zoom, offset]);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB limit.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDropActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDropActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Canvas Mouse / Touch drag to pan
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc || !imageRef.current) return;

    // Create a clean offscreen export canvas
    const exportCanvas = document.createElement('canvas');
    const size = 300;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext('2d');
    const img = imageRef.current;

    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, size, size);

    const aspect = img.width / img.height;
    let drawWidth = size * zoom;
    let drawHeight = size * zoom;
    if (aspect > 1) {
      drawHeight = (size / aspect) * zoom;
    } else {
      drawWidth = size * aspect * zoom;
    }

    const drawX = (size - drawWidth) / 2 + offset.x;
    const drawY = (size - drawHeight) / 2 + offset.y;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    const croppedDataUrl = exportCanvas.toDataURL('image/jpeg', 0.92);
    onSaveAvatar(croppedDataUrl);
    onClose();
  };

  const handleRemove = () => {
    setImageSrc(null);
    onSaveAvatar('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Edit Profile Photo</h3>
              <p className="text-xs text-zinc-500 font-mono">Upload, crop, and reposition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-zinc-900 border border-rose-500/30 rounded-lg text-rose-300 text-xs font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropzone & Interactive Cropper Canvas */}
        {!imageSrc ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDropActive
                ? 'border-emerald-400 bg-emerald-500/10'
                : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60'
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition">
              <Upload className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Click or drag & drop to upload photo
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                PNG, JPEG, WebP (up to 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Canvas */}
            <div className="flex justify-center">
              <div
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="cursor-move select-none p-1 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner"
              >
                <canvas
                  ref={canvasRef}
                  className="rounded-full w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]"
                />
              </div>
            </div>

            {/* Zoom Slider Controls */}
            <div className="space-y-1.5 px-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <ZoomOut className="w-3.5 h-3.5" /> Zoom
                </span>
                <span>{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Reset / Change Photo Action Bar */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setOffset({ x: 0, y: 0 });
                }}
                className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset View</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-emerald-400 hover:underline font-medium"
              >
                Choose different image
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0]);
            }
          }}
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
          {currentAvatar ? (
            <button
              type="button"
              onClick={handleRemove}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!imageSrc}
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 text-black transition shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Photo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AvatarCropperModal;
