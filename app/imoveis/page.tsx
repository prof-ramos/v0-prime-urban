"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import type { FilterState } from "@/lib/types"
import { mockProperties } from "@/lib/mock-data"
import { LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const initialFilters: FilterState = {
  search: "",
  transactionType: "",
  propertyType: "",
  neighborhood: "",
  minPrice: 0,
  maxPrice: 10000000,
  bedrooms: "",
  parkingSpaces: "",
}

// Helper to normalize neighborhood names for comparison
// Converts "Águas Claras" -> "aguas-claras" (removes accents, spaces to hyphens)
const normalizeNeighborhood = (name: string) =>
  name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/ /g, "-")

// Dynamically import filters to reduce initial bundle size
const PropertyFilters = dynamic(() => import("@/components/property-filters").then(m => ({ default: m.PropertyFilters })), {
  loading: () => <div role="status" className="bg-card border border-border/50 rounded-xl p-4 mb-6 animate-pulse h-32" aria-label="Carregando filtros..." />,
})

export default function PropertiesPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [sortBy, setSortBy] = useState("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredProperties = useMemo(() => {
    // Early exit: Return all properties if no filters are active
    const hasActiveFilters =
      filters.transactionType ||
      filters.propertyType ||
      filters.neighborhood ||
      filters.bedrooms ||
      filters.parkingSpaces ||
      filters.search ||
      filters.minPrice > 0 ||
      filters.maxPrice < 10000000

    if (!hasActiveFilters && sortBy === "recent") {
      return mockProperties
    }

    // Pre-compute search term lowercase once
    const searchLower = filters.search ? filters.search.toLowerCase() : ""

    // Combine iterations: Single pass filtering and sorting
    const results = mockProperties.filter((p) => {
      // Transaction type filter
      if (filters.transactionType && p.transactionType !== filters.transactionType) {
        return false
      }

      // Property type filter
      if (filters.propertyType && p.type !== filters.propertyType) {
        return false
      }

      // Neighborhood filter
      if (filters.neighborhood && normalizeNeighborhood(p.neighborhood) !== filters.neighborhood) {
        return false
      }

      // Bedrooms filter
      if (filters.bedrooms && p.bedrooms < parseInt(filters.bedrooms)) {
        return false
      }

      // Parking spaces filter
      if (filters.parkingSpaces && p.parkingSpaces < parseInt(filters.parkingSpaces)) {
        return false
      }

      // Price range filter
      if (p.price < filters.minPrice || p.price > filters.maxPrice) {
        return false
      }

      // Search filter (most expensive, last check)
      if (searchLower) {
        const titleLower = p.title.toLowerCase()
        const addressLower = p.address.toLowerCase()
        const neighborhoodLower = p.neighborhood.toLowerCase()

        if (!titleLower.includes(searchLower) &&
            !addressLower.includes(searchLower) &&
            !neighborhoodLower.includes(searchLower)) {
          return false
        }
      }

      return true
    })

    // Sorting (separate pass as it requires the full filtered array)
    if (sortBy === "price-asc") {
      return results.slice().sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      return results.slice().sort((a, b) => b.price - a.price)
    } else if (sortBy === "area-desc") {
      return results.slice().sort((a, b) => b.privateArea - a.privateArea)
    }

    return results
  }, [filters, sortBy])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        {/* Page Header */}
        <div className="bg-[var(--navy-900)] py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-2 text-balance">
              Imóveis em Brasília
            </h1>
            <p className="text-white/70">
              Encontre apartamentos, casas e coberturas nos melhores bairros da capital
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Filters */}
          <PropertyFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={() => setFilters(initialFilters)}
          />

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{filteredProperties.length}</span>{" "}
              {filteredProperties.length === 1 ? "imóvel encontrado" : "imóveis encontrados"}
            </p>

            <div className="flex items-center gap-3">
              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Mais recentes</SelectItem>
                  <SelectItem value="price-asc">Menor preço</SelectItem>
                  <SelectItem value="price-desc">Maior preço</SelectItem>
                  <SelectItem value="area-desc">Maior área</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="hidden sm:flex border border-border/50 rounded-lg overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-none ${
                    viewMode === "grid" ? "bg-[var(--navy-700)] text-white" : ""
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`rounded-none ${
                    viewMode === "list" ? "bg-[var(--navy-700)] text-white" : ""
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {filteredProperties.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 [content-visibility:auto]"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <LayoutGrid className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum imóvel encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros para ver mais resultados.
              </p>
              <Button
                variant="outline"
                onClick={() => setFilters(initialFilters)}
                className="border-[var(--navy-700)] text-[var(--navy-700)]"
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
