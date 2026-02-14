"use client"

import { useState, useEffect } from "react"
import { MessageCircle, X } from "lucide-react"
import { WHATSAPP_CONFIG } from "@/lib/constants"

export function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    // Show button after scrolling
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200)
    }

    // Show tooltip after a delay
    const tooltipTimer = setTimeout(() => {
      setShowTooltip(true)
    }, 5000)

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(tooltipTimer)
    }
  }, [])

  const handleClick = () => {
    if (typeof window === "undefined") return
    const url = `https://wa.me/${WHATSAPP_CONFIG.NUMBER}?text=${encodeURIComponent(WHATSAPP_CONFIG.DEFAULT_MESSAGE)}`
    window.open(url, "_blank")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip */}
      {showTooltip && (
        <div className="relative animate-in slide-in-from-right-5 fade-in duration-300">
          <div className="bg-white rounded-lg shadow-lg p-3 pr-8 max-w-[200px] border border-border/50">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-sm text-foreground font-medium">Precisa de ajuda?</p>
            <p className="text-xs text-muted-foreground">Fale conosco pelo WhatsApp</p>
          </div>
          {/* Arrow */}
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white" />
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        className="group relative w-14 h-14 md:w-16 md:h-16 bg-[#25D366] hover:bg-[#128C7E] rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
        aria-label="Falar pelo WhatsApp"
      >
        <MessageCircle className="h-7 w-7 md:h-8 md:w-8 text-white" />
        
        {/* Pulse Animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
      </button>
    </div>
  )
}
