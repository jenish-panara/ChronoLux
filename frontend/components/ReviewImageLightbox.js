'use client';

import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ReviewImageLightbox
 * Props:
 *   images   — array of { url, publicId }
 *   index    — currently open image index
 *   onClose  — called when lightbox should close
 *   onNav    — called with new index when user navigates
 */
export default function ReviewImageLightbox({ images, index, onClose, onNav }) {
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNav(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onNav(index + 1);
    },
    [index, hasPrev, hasNext, onClose, onNav]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.92)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Close lightbox"
        id="review-lightbox-close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index - 1); }}
          className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Previous image"
          id="review-lightbox-prev"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[index]?.url}
          alt={`Review photo ${index + 1}`}
          className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl"
          style={{ userSelect: 'none' }}
        />
        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
            {index + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNav(index + 1); }}
          className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          aria-label="Next image"
          id="review-lightbox-next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((img, i) => (
            <button
              key={img.publicId || i}
              onClick={(e) => { e.stopPropagation(); onNav(i); }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                i === index ? 'border-[var(--clx-gold)] scale-110' : 'border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
