'use client';
import { useState, useEffect } from 'react';

export default function ZoomableImage({ 
  src, 
  alt = '', 
  children,
  thumbnailClassName = "cursor-pointer max-w-full rounded hover:opacity-90 transition-opacity",
  modalClassName = "fixed inset-0 bg-black/80 flex items-center justify-center z-50",
  imageClassName = "max-w-[50vw] max-h-[50vh] object-contain rounded-lg shadow-2xl",
  closeButtonClassName = "absolute top-4 right-4 text-red-500 hover:text-red-700 text-4xl font-bold z-10 bg-white/90 rounded-full w-12 h-12 flex items-center justify-center transition-colors border-2 border-red-500 hover:border-red-700",
  enableKeyboardClose = true,
  enableClickOutsideClose = true
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Handle keyboard events
  useEffect(() => {
    if (!enableKeyboardClose || !isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, enableKeyboardClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleModalClick = (e) => {
    if (enableClickOutsideClose && e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Clickable thumbnail image */}
      <img
        src={src}
        alt={alt}
        className={thumbnailClassName}
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Click to zoom ${alt || 'image'}`}
      />

      {/* Zoom Modal */}
      {isOpen && (
        <div
          className={modalClassName}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby="zoom-modal-title"
        >
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className={closeButtonClassName}
              aria-label="Close zoom view"
              type="button"
            >
              ×
            </button>

            {/* Zoomed content */}
            {children ? (
              <div className="relative">
                {children}
              </div>
            ) : (
              <img
                src={src}
                alt={alt}
                className={imageClassName}
                id="zoom-modal-title"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

