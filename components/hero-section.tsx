"use client"

import { useState } from "react"
import { Search, MapPin, Home, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { NEIGHBORHOODS_DF, NEIGHBORHOODS_GO, NEIGHBORHOODS_MG } from "@/lib/constants"

// Total regions: 35 RAs (DF) + 29 GO + 4 MG = 68
const TOTAL_REGIONS = 68

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("")
  const [transactionType, setTransactionType] = useState<string>("")
  const [neighborhood, setNeighborhood] = useState<string>("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (transactionType) params.set("tipo", transactionType)
    if (neighborhood) params.set("bairro", neighborhood)
    window.location.href = `/imoveis?${params.toString()}`
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--secondary-brand) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, var(--secondary-brand) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary via-accent/80 to-primary" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full mb-6">
            <MapPin className="h-4 w-4 text-secondary" />
            <span className="text-sm text-secondary">Especialistas em Brasília, DF</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6 text-balance">
            Encontre o imóvel dos seus sonhos em{" "}
            <span className="text-secondary">Brasília</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto text-pretty">
            Curadoria exclusiva de apartamentos, casas e coberturas nos melhores bairros da capital federal.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar por endereço ou código"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 text-base border-border/50 focus:border-secondary"
                  />
                </div>
              </div>

              {/* Transaction Type */}
              <Select value={transactionType} onValueChange={setTransactionType}>
                <SelectTrigger className="h-12 border-border/50 focus:border-secondary">
                  <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venda">Comprar</SelectItem>
                  <SelectItem value="aluguel">Alugar</SelectItem>
                </SelectContent>
              </Select>

              {/* Neighborhood */}
              <Select value={neighborhood} onValueChange={setNeighborhood}>
                <SelectTrigger className="h-12 border-border/50 focus:border-secondary">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Bairro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Distrito Federal</SelectLabel>
                    {NEIGHBORHOODS_DF.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Entorno - GO</SelectLabel>
                    {NEIGHBORHOODS_GO.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Entorno - MG</SelectLabel>
                    {NEIGHBORHOODS_MG.map((n) => (
                      <SelectItem key={n.value} value={n.value}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSearch}
              className="w-full mt-4 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground text-base font-medium"
            >
              Buscar Imóveis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-secondary">500+</p>
              <p className="text-sm text-primary-foreground/60">Imóveis disponíveis</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-secondary">{TOTAL_REGIONS}</p>
              <p className="text-sm text-primary-foreground/60">Regiões atendidas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-secondary">98%</p>
              <p className="text-sm text-primary-foreground/60">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
