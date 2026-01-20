/**
 * Zustand Store for Dashboard State
 *
 * Manages:
 * - Filters (Ethos, category, stock, flow metrics)
 * - Search query
 * - Sort order
 * - Selected protocols for comparison
 * - Theme (light/dark mode)
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type SortOption = 'ethos-desc' | 'ethos-asc' | 'category' | 'stock-desc' | 'flow-desc'

export interface FilterState {
  ethosMin: number
  ethosMax: number
  category: string | null
  stockMin: number
  stockMax: number
  flowMin: number
  flowMax: number
}

export interface DashboardStore {
  // Filters
  filters: FilterState
  setEthosMin: (value: number) => void
  setEthosMax: (value: number) => void
  setCategory: (category: string | null) => void
  setStockMin: (value: number) => void
  setStockMax: (value: number) => void
  setFlowMin: (value: number) => void
  setFlowMax: (value: number) => void
  clearFilters: () => void

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Sort
  sortBy: SortOption
  setSortBy: (sort: SortOption) => void

  // Comparison
  selectedProtocols: string[] // protocol names
  toggleProtocol: (protocolName: string) => void
  clearSelection: () => void

  // Theme
  isDarkMode: boolean
  toggleTheme: () => void
}

const initialFilters: FilterState = {
  ethosMin: 0,
  ethosMax: Infinity,
  category: null,
  stockMin: 0,
  stockMax: Infinity,
  flowMin: 0,
  flowMax: Infinity,
}

export const useDashboardStore = create<DashboardStore>()(
  devtools(
    (set) => ({
      // Initial state
      filters: initialFilters,
      searchQuery: '',
      sortBy: 'ethos-desc', // Default: highest Ethos score first
      selectedProtocols: [],
      isDarkMode: false,

      // Filter actions
      setEthosMin: (value) =>
        set((state) => ({
          filters: { ...state.filters, ethosMin: value },
        })),
      setEthosMax: (value) =>
        set((state) => ({
          filters: { ...state.filters, ethosMax: value },
        })),
      setCategory: (category) =>
        set((state) => ({
          filters: { ...state.filters, category },
        })),
      setStockMin: (value) =>
        set((state) => ({
          filters: { ...state.filters, stockMin: value },
        })),
      setStockMax: (value) =>
        set((state) => ({
          filters: { ...state.filters, stockMax: value },
        })),
      setFlowMin: (value) =>
        set((state) => ({
          filters: { ...state.filters, flowMin: value },
        })),
      setFlowMax: (value) =>
        set((state) => ({
          filters: { ...state.filters, flowMax: value },
        })),
      clearFilters: () =>
        set(() => ({
          filters: initialFilters,
        })),

      // Search actions
      setSearchQuery: (query) => set(() => ({ searchQuery: query })),

      // Sort actions
      setSortBy: (sort) => set(() => ({ sortBy: sort })),

      // Comparison actions
      toggleProtocol: (protocolName) =>
        set((state) => ({
          selectedProtocols: state.selectedProtocols.includes(protocolName)
            ? state.selectedProtocols.filter((name) => name !== protocolName)
            : [...state.selectedProtocols, protocolName],
        })),
      clearSelection: () => set(() => ({ selectedProtocols: [] })),

      // Theme actions
      toggleTheme: () =>
        set((state) => {
          const newMode = !state.isDarkMode
          // Update DOM class for Tailwind dark mode
          if (typeof window !== 'undefined') {
            if (newMode) {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
          return { isDarkMode: newMode }
        }),
    }),
    { name: 'DashboardStore' }
  )
)
