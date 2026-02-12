import Link from "next/link"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-bold text-primary mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
          Página não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          Desculpe, o imóvel ou página que você procura não existe ou foi removido.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Home className="h-5 w-5" />
            Voltar ao Início
          </Link>
          <Link
            href="/imoveis"
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
          >
            <Search className="h-5 w-5" />
            Ver Imóveis
          </Link>
        </div>

        {/* Additional Help */}
        <p className="text-sm text-muted-foreground mt-8">
          Precisa de ajuda? Entre em contato pelo WhatsApp
        </p>
      </div>
    </div>
  )
}
