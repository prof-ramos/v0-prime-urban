import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * @param inputs - Classes CSS para combinar
 * @returns {string} String de classes combinadas e resolvidas
 * @example
 * cn("px-4 py-2", "bg-primary", someCondition && "text-white")
 * // Returns merged classes with Tailwind conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Formata valor numérico para formato monetário brasileiro (R$)
 * @param value - Valor numérico a ser formatado
 * @returns {string} Valor formatado com R$ e sem casas decimais
 * @example formatCurrency(1500000) // "R$ 1.500.000"
 */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value)
}
