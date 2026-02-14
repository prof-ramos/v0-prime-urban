"use client"

import { useState, useEffect, useMemo } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import type { FilterState } from "@/lib/types"
import { NEIGHBORHOODS, PROPERTY_TYPE_LABELS, PRICE_LIMITS } from "@/lib/constants"

interface PropertyFiltersProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
}

const propertyTypes = Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => ({ value, label }))

interface FilterContentProps {
  localFilters: FilterState
  updateFilter: (key: keyof FilterState, value: string) => void
  onFilterChange: (filters: FilterState) => void
  onReset: () => void
  hasActiveFilters: boolean
  setLocalFilters: React.Dispatch<React.SetStateAction<FilterState>>
}

function FilterContent({ localFilters, updateFilter, onFilterChange, onReset, hasActiveFilters, setLocalFilters }: FilterContentProps) {
  return (
    <div className="space-y-6">
      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Tipo de negócio</Label>
        <Select
          value={localFilters.transactionType}
          onValueChange={(value) => updateFilter("transactionType", value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Comprar ou Alugar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="venda">Comprar</SelectItem>
            <SelectItem value="aluguel">Alugar</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label>Tipo de imóvel</Label>
        <Select
          value={localFilters.propertyType}
          onValueChange={(value) => updateFilter("propertyType", value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Neighborhood */}
      <div className="space-y-2">
        <Label>Bairro</Label>
        <Select
          value={localFilters.neighborhood}
          onValueChange={(value) => updateFilter("neighborhood", value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Todos os bairros" />
          </SelectTrigger>
          <SelectContent>
            {NEIGHBORHOODS.map((n) => (
              <SelectItem key={n.value} value={n.value}>
                {n.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <Label>Faixa de preço</Label>
        <div className="pt-2">
          <Slider
            value={[localFilters.minPrice, localFilters.maxPrice]}
            min={PRICE_LIMITS.MIN}
            max={PRICE_LIMITS.MAX}
            step={50000}
            onValueChange={([min, max]) => {
              const newFilters = { ...localFilters, minPrice: min, maxPrice: max }
              setLocalFilters(newFilters)
              // Price sliders need immediate feedback for UX
              onFilterChange(newFilters)
            }}
            className="[&_[role=slider]]:bg-secondary"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatCurrency(localFilters.minPrice)}</span>
          <span>{formatCurrency(localFilters.maxPrice)}</span>
        </div>
      </div>

      {/* Bedrooms */}
      <div className="space-y-2">
        <Label>Quartos</Label>
        <Select
          value={localFilters.bedrooms}
          onValueChange={(value) => updateFilter("bedrooms", value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Qualquer quantidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+ quarto</SelectItem>
            <SelectItem value="2">2+ quartos</SelectItem>
            <SelectItem value="3">3+ quartos</SelectItem>
            <SelectItem value="4">4+ quartos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Parking Spaces */}
      <div className="space-y-2">
        <Label>Vagas de garagem</Label>
        <Select
          value={localFilters.parkingSpaces}
          onValueChange={(value) => updateFilter("parkingSpaces", value)}
        >
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Qualquer quantidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1+ vaga</SelectItem>
            <SelectItem value="2">2+ vagas</SelectItem>
            <SelectItem value="3">3+ vagas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={() => {
            onReset()
            setLocalFilters({
              search: "",
              transactionType: "",
              propertyType: "",
              neighborhood: "",
              minPrice: PRICE_LIMITS.MIN,
              maxPrice: PRICE_LIMITS.MAX,
              bedrooms: "",
              parkingSpaces: "",
            })
          }}
          className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white"
        >
          <X className="mr-2 h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  )
}

export function PropertyFilters({ filters, onFilterChange, onReset }: PropertyFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // Create debounced callback (300ms delay)
  const debouncedOnFilterChange = useDebouncedCallback(
    (newFilters: FilterState) => {
      onFilterChange(newFilters)
    },
    300,
    { leading: false }
  )

  useEffect(() => {
    return () => {
      debouncedOnFilterChange.cancel()
    }
  }, [debouncedOnFilterChange])

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K] | string) => {
    const newFilters = { ...localFilters, [key]: value as FilterState[K] }
    setLocalFilters(newFilters)

    // Use debounced for non-critical, immediate for critical
    if (key === 'search' || key === 'minPrice' || key === 'maxPrice') {
      // Critical filters - immediate update
      onFilterChange(newFilters)
    } else {
      // Non-critical - use debounced (300ms delay)
      debouncedOnFilterChange.callback(newFilters)
    }
  }

  const hasActiveFilters = useMemo(
    () => Boolean(
      filters.transactionType ||
      filters.propertyType ||
      filters.neighborhood ||
      filters.bedrooms ||
      filters.parkingSpaces ||
      filters.minPrice > PRICE_LIMITS.MIN ||
      filters.maxPrice < PRICE_LIMITS.MAX
    ),
    [filters]
  )

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por endereço, bairro ou código..."
            value={localFilters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:flex gap-3">
          <Select
            value={localFilters.transactionType}
            onValueChange={(value) => updateFilter("transactionType", value)}
          >
            <SelectTrigger className="w-[140px] h-12">
              <SelectValue placeholder="Comprar/Alugar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Comprar</SelectItem>
              <SelectItem value="aluguel">Alugar</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={localFilters.propertyType}
            onValueChange={(value) => updateFilter("propertyType", value)}
          >
            <SelectTrigger className="w-[160px] h-12">
              <SelectValue placeholder="Tipo de imóvel" />
            </SelectTrigger>
            <SelectContent>
              {propertyTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={localFilters.neighborhood}
            onValueChange={(value) => updateFilter("neighborhood", value)}
          >
            <SelectTrigger className="w-[160px] h-12">
              <SelectValue placeholder="Bairro" />
            </SelectTrigger>
            <SelectContent>
              {NEIGHBORHOODS.map((n) => (
                <SelectItem key={n.value} value={n.value}>
                  {n.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Mobile Filter Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="lg:hidden h-12 border-secondary text-secondary bg-transparent"
            >
              <SlidersHorizontal className="mr-2 h-5 w-5" />
              Filtros
              {hasActiveFilters && (
                <span className="ml-2 w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtrar imóveis</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent
                localFilters={localFilters}
                updateFilter={updateFilter}
                onFilterChange={onFilterChange}
                onReset={onReset}
                hasActiveFilters={hasActiveFilters}
                setLocalFilters={setLocalFilters}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
