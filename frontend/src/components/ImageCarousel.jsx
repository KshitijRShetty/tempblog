import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const ImageCarousel = ({ images, alt = 'Image' }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [loadedImages, setLoadedImages] = useState(new Set())

  if (!images || images.length === 0) return null

  const getImageUrl = (url) => {
    if (!url) return null
    if (url.startsWith('/uploads/')) {
      return `http://localhost:8080${url}`
    }
    return url
  }

  const nextImage = (e) => {
    e?.stopPropagation()
    const nextIdx = (currentIndex + 1) % images.length
    setCurrentIndex(nextIdx)
    if (!loadedImages.has(nextIdx)) {
      setImageLoading(true)
    }
  }

  const prevImage = (e) => {
    e?.stopPropagation()
    const prevIdx = (currentIndex - 1 + images.length) % images.length
    setCurrentIndex(prevIdx)
    if (!loadedImages.has(prevIdx)) {
      setImageLoading(true)
    }
  }

  const goToImage = (index, e) => {
    e?.stopPropagation()
    setCurrentIndex(index)
    if (!loadedImages.has(index)) {
      setImageLoading(true)
    }
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setLoadedImages((prev) => new Set([...prev, currentIndex]))
  }

  const handleImageError = () => {
    setImageLoading(false)
  }

  if (images.length === 1) {
    return (
      <div className="w-full bg-black/20 flex items-center justify-center overflow-hidden relative">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40">
            <Loader2 className="animate-spin text-purple-400" size={32} />
          </div>
        )}
        <img
          src={getImageUrl(images[0])}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="relative w-full bg-black/20 overflow-hidden group h-full">
      {/* Loading Spinner */}
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      )}

      {/* Main Image Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={getImageUrl(images[currentIndex])}
            alt={`${alt} ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Navigation Buttons - Always Visible */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/70 hover:bg-black/90 rounded-full text-white transition-all z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 rounded-full text-white text-sm font-medium z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Dot indicators */}
        {images.length > 1 && images.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => goToImage(index, e)}
                className={`rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-2 h-2'
                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageCarousel
