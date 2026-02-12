"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navLinks = [
    { href: "/imoveis", label: "Imóveis" },
    { href: "/bairros", label: "Bairros" },
    { href: "/sobre", label: "Sobre" },
    { href: "/contato", label: "Contato" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      {/* Top Bar - Enhanced with better spacing and contrast */}
      <div className="hidden md:block bg-primary">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-2.5 text-primary-foreground/95 text-sm font-medium tracking-wide">
              <MapPin className="h-4 w-4 text-accent" strokeWidth={2.5} />
              Brasília, DF
            </span>
            <span className="flex items-center gap-2.5 text-primary-foreground/95 text-sm font-medium tracking-wide">
              <Phone className="h-4 w-4 text-accent" strokeWidth={2.5} />
              (61) 99999-9999
            </span>
          </div>
          <span className="text-accent text-sm font-semibold tracking-wide uppercase">
            Curadoria Imobiliária de Alto Padrão
          </span>
        </div>
      </div>

      {/* Main Navigation - Improved spacing and visual hierarchy */}
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo - Enhanced prominence */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="PrimeUrban - Página inicial"
          >
            <div className="flex flex-col">
              <span className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-tight group-hover:transition-all">
                PrimeUrban
              </span>
              <span className="text-xs text-secondary font-semibold tracking-[0.2em] uppercase">
                Brasília
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Improved spacing and contrast */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-foreground/70 hover:text-primary px-4 py-2.5 rounded-lg transition-all duration-200 hover:bg-primary/5 min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-3 pl-3 border-l border-border">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
              >
                Fale Conosco
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Button - Enhanced touch target */}
          <button
            className="md:hidden p-3 min-h-[48px] min-w-[48px] flex items-center justify-center rounded-lg hover:bg-muted/50 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-primary" strokeWidth={2} />
            ) : (
              <Menu className="h-6 w-6 text-primary" strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Mobile Navigation - Improved spacing and organization */}
        {isMenuOpen && (
          <nav
            className="md:hidden py-6 border-t border-border/50 bg-background"
            aria-label="Menu de navegação mobile"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 px-4 py-3.5 rounded-lg transition-all duration-200 flex items-center min-h-[48px]"
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'slideUpFade 0.3s ease-out forwards'
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Contact info in mobile menu */}
              <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                <a
                  href="tel:+5561999999999"
                  className="flex items-center gap-3 text-foreground/70 hover:text-primary px-4 py-2 transition-colors min-h-[44px]"
                >
                  <Phone className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                  <span className="text-sm font-medium">(61) 99999-9999</span>
                </a>
                <div className="flex items-center gap-3 text-muted-foreground px-4 py-2">
                  <MapPin className="h-4 w-4 text-secondary" strokeWidth={2.5} />
                  <span className="text-sm">Brasília, DF</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground w-full shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fale Conosco
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>

      <style jsx>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  )
}
