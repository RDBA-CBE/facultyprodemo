"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  ZoomIn,
  ZoomOut,
  Minus,
} from "lucide-react";

interface ImageType {
  image_url: string;
  id?: string | number;
  alt?: string;
}

interface LightboxProps {
  images: any;
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  autoSlide?: boolean;
}

const LightboxGallery = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  autoSlide = false,
}: LightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to initial index when lightbox opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, initialIndex]);

  // Auto slide functionality (without interval parameter)
  useEffect(() => {
    if (!isOpen || !autoSlide || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % images.length;
        setScale(1);
        setPosition({ x: 0, y: 0 });
        return newIndex;
      });
    }, 5000); // Fixed 5 second interval

    return () => clearInterval(interval);
  }, [isOpen, autoSlide, images.length]);

  const goNext = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev + 1) % images.length;
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return newIndex;
    });
  };

  const goPrev = () => {
    setCurrentIndex((prev) => {
      const newIndex = (prev - 1 + images.length) % images.length;
      setScale(1);
      setPosition({ x: 0, y: 0 });
      return newIndex;
    });
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Zoom functions
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale - 0.5 <= 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mini zoom on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // Double click to zoom
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale === 1) {
      zoomIn();
    } else {
      resetZoom();
    }
  };

  // Download image
  const downloadImage = async () => {
    try {
      const response = await fetch(images[currentIndex].image_url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `property-image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      zoomIn();
    } else {
      zoomOut();
    }
  };

  // Drag to pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - startPosition.x,
      y: e.clientY - startPosition.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;

    setPosition({
      x: e.touches[0].clientX - startPosition.x,
      y: e.touches[0].clientY - startPosition.y,
    });
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          goPrev();
          break;
        case "ArrowRight":
          goNext();
          break;
        case "Escape":
          onClose();
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "0":
          resetZoom();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, scale]);

  if (!images || images.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          ref={containerRef}
        >
          <div className="relative max-w-7xl max-h-full w-full h-full flex flex-col">
            {/* Header - Controls */}
            <div className="flex justify-between items-center text-white mb-4 px-4">
              <div className="text-lg font-medium text-white">
                {currentIndex + 1} / {images.length}
              </div>

              <div className="flex items-center gap-3">
                {/* Zoom Controls */}
                {scale > 1 && (
                  <button
                    onClick={resetZoom}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                    title="Reset Zoom"
                  >
                    <Minus size={20}  className="text-white" />
                  </button>
                )}

                <button
                  onClick={zoomOut}
                  disabled={scale <= 1}
                  className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                    scale <= 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Zoom Out"
                >
                  <ZoomOut size={20}  className="text-white"/>
                </button>

                <button
                  onClick={zoomIn}
                  disabled={scale >= 3}
                  className={`p-2 hover:bg-white/10 rounded-full transition-colors ${
                    scale >= 3 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  title="Zoom In"
                >
                  <ZoomIn size={20}  className="text-white" />
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={24} className="text-white" />
                </button>
              </div>
            </div>

            {/* Main Image Container */}
            <div className="flex-1 flex items-center justify-center relative">
              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goPrev();
                    }}
                    className="absolute left-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goNext();
                    }}
                    className="absolute right-4 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}

              {/* Main Image with Zoom */}
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full max-w-5xl max-h-[70vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  ref={imageRef}
                  className="w-full h-full flex items-center justify-center cursor-move"
                  style={{
                    transform: `scale(${
                      isHovered && scale === 1 ? 1.05 : scale
                    }) translate(${position.x}px, ${position.y}px)`,
                    transition: isDragging ? "none" : "transform 0.3s ease",
                  }}
                  onDoubleClick={handleDoubleClick}
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => {
                    handleMouseUp();
                    handleMouseLeave();
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleMouseUp}
                >
                  <Image
                    src={images[currentIndex]}
                    alt={
                      images[currentIndex].alt || `Image ${currentIndex + 1}`
                    }
                    width={1200}
                    height={800}
                    className="object-contain max-w-full max-h-full"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  />
                </div>

                {/* Zoom Level Indicator */}
                {scale > 1 && (
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {Math.round(scale * 100)}%
                  </div>
                )}
              </motion.div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="mt-4 px-4 pb-4">
                <div className="flex justify-center gap-2 overflow-x-auto py-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        currentIndex === index
                          ? "border-white scale-110"
                          : "border-transparent opacity-70 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <Image
                        src={img.image_url}
                        alt={`Thumbnail ${index + 1}`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LightboxGallery;
