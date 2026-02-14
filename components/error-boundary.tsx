"use client"

import React from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Error Boundary para capturar erros de renderização em componentes React
 * Previne que erros em componentes individuais quebrem a página inteira
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center p-8 max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                Algo deu errado
              </h2>
              <p className="text-muted-foreground mb-6">
                Pedimos desculpas pelo inconveniente. Por favor, recarregue a página.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--navy-900)] text-white rounded-lg hover:bg-[var(--navy-700)] transition-colors font-medium"
              >
                Recarregar página
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
