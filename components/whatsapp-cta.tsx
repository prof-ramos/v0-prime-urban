"use client"

import { MessageCircle, Phone, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const WHATSAPP_NUMBER = "5561999999999"
const WHATSAPP_MESSAGE = "Olá! Gostaria de mais informações sobre imóveis em Brasília."

export function WhatsAppCTA() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="py-16 md:py-24 bg-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] mb-6">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>

          <h2 className="font-serif text-3xl md:text-4xl font-bold text-accent-foreground mb-4 text-balance">
            Fale com um especialista agora
          </h2>
          <p className="text-lg text-accent-foreground/70 mb-8 max-w-2xl mx-auto text-pretty">
            Nossa equipe está pronta para ajudá-lo a encontrar o imóvel perfeito. Atendimento personalizado via WhatsApp.
          </p>

          <div className="flex flex-wrap justify-center gap-6 mb-10">
            <div className="flex items-center gap-2 text-accent-foreground/80">
              <CheckCircle className="h-5 w-5 text-[var(--whatsapp)]" />
              <span>Resposta imediata</span>
            </div>
            <div className="flex items-center gap-2 text-accent-foreground/80">
              <Clock className="h-5 w-5 text-[var(--whatsapp)]" />
              <span>Seg-Sáb 8h-20h</span>
            </div>
            <div className="flex items-center gap-2 text-accent-foreground/80">
              <Phone className="h-5 w-5 text-[var(--whatsapp)]" />
              <span>Sem compromisso</span>
            </div>
          </div>

          <Button 
            asChild
            size="lg"
            className="bg-[#25D366] hover:bg-[#128C7E] text-white text-lg px-8 py-6 h-auto min-h-[56px]"
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-6 w-6" />
              Chamar no WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
