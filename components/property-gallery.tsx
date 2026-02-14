"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Expand } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertyGalleryProps {
  images: string[]
  title: string
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Early exit: Guard against empty images array
  const imageCount = images.length
  const hasImages = imageCount > 0

  const goToPrevious = () => {
    if (!hasImages) return // Early exit
    setCurrentIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1))
  }

  const goToNext = () => {
    if (!hasImages) return // Early exit
    setCurrentIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1))
  }

  // Early exit: Fallback to placeholder if no images
  const displayImages = hasImages ? images : ["/placeholder-property.jpg"]

  return (
    <>
      {/* Main Gallery */}
      <div className="relative">
        {/* Main Image */}
        <div className="relative aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden bg-muted">
          <Image
            src={displayImages[currentIndex] || "/placeholder.svg"}
            alt={`${title} - Foto ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority
          />
          
          {/* Navigation Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-6 w-6 text-[var(--navy-900)]" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-6 w-6 text-[var(--navy-900)]" />
              </button>
            </>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white shadow-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Ver em tela cheia"
          >
            <Expand className="h-5 w-5 text-[var(--navy-900)]" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-black/60 text-white text-sm">
            {currentIndex + 1} / {displayImages.length}
          </div>
        </div>

        {/* Thumbnails */}
        {displayImages.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {displayImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden transition-all min-h-[44px] ${
                  currentIndex === index
                    ? "ring-2 ring-[var(--blue-400)] opacity-100"
                    : "opacity-60 hover:opacity-100"
                }`}
                aria-label={`Ver foto ${index + 1}`}
              >
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${title} - Miniatura ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center p-4">
            <Image
              src={displayImages[currentIndex] || "/placeholder.svg"}
              alt={`${title} - Foto ${currentIndex + 1}`}
              fill
              className="object-contain"
            />

            {displayImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-white/10 text-white">
              {currentIndex + 1} / {displayImages.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
