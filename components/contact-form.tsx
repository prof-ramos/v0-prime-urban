"use client"

import React from "react"

import { useState } from "react"
import { MessageCircle, Send, Phone, Mail, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { WHATSAPP_CONFIG } from "@/lib/constants"

interface ContactFormProps {
  propertyTitle: string
  propertyId: string
}

export function ContactForm({ propertyTitle, propertyId }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `Olá! Tenho interesse no imóvel: ${propertyTitle}. Gostaria de mais informações.`,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setSubmitted(true)
  }

  const handleWhatsApp = () => {
    if (typeof window === "undefined") return
    const message = `Olá! Tenho interesse no imóvel: ${propertyTitle}. Gostaria de mais informações.`
    const url = `https://wa.me/${WHATSAPP_CONFIG.NUMBER}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  if (submitted) {
    return (
      <Card className="border-[var(--blue-400)]/30">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <Send className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Mensagem enviada!</h3>
          <p className="text-muted-foreground mb-4">
            Em breve entraremos em contato com você.
          </p>
          <Button
            onClick={handleWhatsApp}
            className="bg-[#25D366] hover:bg-[#128C7E] text-white w-full"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Falar pelo WhatsApp agora
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-[var(--blue-400)]/30 sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Agende uma visita</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* WhatsApp Button */}
        <Button
          onClick={handleWhatsApp}
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white h-12"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Chamar no WhatsApp
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou envie uma mensagem</span>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                required
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                required
                placeholder="(61) 99999-9999"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Descreva seu interesse..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[var(--navy-700)] hover:bg-[var(--navy-900)] text-white h-12"
          >
            {isSubmitting ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Ao enviar, você concorda com nossa política de privacidade.
        </p>
      </CardContent>
    </Card>
  )
}
