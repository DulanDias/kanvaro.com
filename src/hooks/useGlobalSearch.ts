import { useState, useEffect, useCallback, useRef } from 'react'
import { useDebounce } from './useDebounce'

export interface SearchResult {
  id: string
  title: string
  description?: string
  type: 'project' | 'task' | 'story' | 'epic' | 'sprint' | 'user'
  url: string
  score: number
  highlights: string[]
  metadata: {
    status?: string
    priority?: string
    assignee?: string
    project?: string
    createdAt: string
    updatedAt: string
  }
}

export interface SearchFilters {
  type?: string[]
  status?: string[]
  priority?: string[]
  assignee?: string[]
  project?: string[]
  dateRange?: {
    start: string
    end: string
  }
}

export interface SearchOptions {
  limit?: number
  offset?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  includeArchived?: boolean
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  aggregations: {
    types: Record<string, number>
    statuses: Record<string, number>
    priorities: Record<string, number>
    projects: Record<string, number>
  }
  suggestions: string[]
  took: number
}

export interface SearchState {
  query: string
  results: SearchResult[]
  isLoading: boolean
  error: string | null
  total: number
  aggregations: SearchResponse['aggregations']
  suggestions: string[]
  filters: SearchFilters
  options: SearchOptions
  isOpen: boolean
  selectedIndex: number
}

export interface SearchActions {
  setQuery: (query: string) => void
  setFilters: (filters: SearchFilters) => void
  setOptions: (options: SearchOptions) => void
  search: (query?: string) => Promise<void>
  clearSearch: () => void
  openSearch: () => void
  closeSearch: () => void
  selectNext: () => void
  selectPrevious: () => void
  selectResult: (index: number) => void
  navigateToResult: (result: SearchResult) => void
}

export function useGlobalSearch(): SearchState & SearchActions {
  const [state, setState] = useState<SearchState>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    total: 0,
    aggregations: {
      types: {},
      statuses: {},
      priorities: {},
      projects: {}
    },
    suggestions: [],
    filters: {},
    options: {
      limit: 20,
      offset: 0,
      sortBy: 'score',
      sortOrder: 'desc',
      includeArchived: false
    },
    isOpen: false,
    selectedIndex: -1
  })

  const debouncedQuery = useDebounce(state.query, 300)
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchCacheRef = useRef<Map<string, SearchResponse>>(new Map())

  // Search function with caching and abort controller
  const search = useCallback(async (query?: string) => {
    const searchQuery = query || state.query
    
    if (searchQuery.length < 2) {
      setState(prev => ({
        ...prev,
        results: [],
        total: 0,
        aggregations: {
          types: {},
          statuses: {},
          priorities: {},
          projects: {}
        },
        suggestions: [],
        error: null
      }))
      return
    }

    // Check cache first
    const cacheKey = `${searchQuery}-${JSON.stringify(state.filters)}-${JSON.stringify(state.options)}`
    const cachedResult = searchCacheRef.current.get(cacheKey)
    
    if (cachedResult) {
      setState(prev => ({
        ...prev,
        results: cachedResult.results,
        total: cachedResult.total,
        aggregations: cachedResult.aggregations,
        suggestions: cachedResult.suggestions,
        isLoading: false,
        error: null
      }))
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: state.options.limit?.toString() || '20',
        offset: state.options.offset?.toString() || '0',
        sortBy: state.options.sortBy || 'score',
        sortOrder: state.options.sortOrder || 'desc',
        includeArchived: state.options.includeArchived?.toString() || 'false'
      })

      // Add filters to params
      if (state.filters.type?.length) {
        params.append('type', state.filters.type.join(','))
      }
      if (state.filters.status?.length) {
        params.append('status', state.filters.status.join(','))
      }
      if (state.filters.priority?.length) {
        params.append('priority', state.filters.priority.join(','))
      }
      if (state.filters.assignee?.length) {
        params.append('assignee', state.filters.assignee.join(','))
      }
      if (state.filters.project?.length) {
        params.append('project', state.filters.project.join(','))
      }

      const response = await fetch(`/api/search?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data: SearchResponse = await response.json()

      // Cache the result
      searchCacheRef.current.set(cacheKey, data)

      setState(prev => ({
        ...prev,
        results: data.results,
        total: data.total,
        aggregations: data.aggregations,
        suggestions: data.suggestions,
        isLoading: false,
        error: null,
        selectedIndex: -1
      }))

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was cancelled, don't update state
        return
      }

      console.error('Search error:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }))
    }
  }, [state.query, state.filters, state.options])

  // Debounced search effect
  useEffect(() => {
    if (debouncedQuery) {
      search(debouncedQuery)
    }
  }, [debouncedQuery, search])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }))
  }, [])

  const setFilters = useCallback((filters: SearchFilters) => {
    setState(prev => ({ ...prev, filters }))
  }, [])

  const setOptions = useCallback((options: SearchOptions) => {
    setState(prev => ({ ...prev, options }))
  }, [])

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      results: [],
      total: 0,
      aggregations: {
        types: {},
        statuses: {},
        priorities: {},
        projects: {}
      },
      suggestions: [],
      error: null,
      selectedIndex: -1
    }))
  }, [])

  const openSearch = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }))
  }, [])

  const closeSearch = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false, selectedIndex: -1 }))
  }, [])

  const selectNext = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: Math.min(prev.selectedIndex + 1, prev.results.length - 1)
    }))
  }, [])

  const selectPrevious = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedIndex: Math.max(prev.selectedIndex - 1, -1)
    }))
  }, [])

  const selectResult = useCallback((index: number) => {
    setState(prev => ({ ...prev, selectedIndex: index }))
  }, [])

  const navigateToResult = useCallback((result: SearchResult) => {
    window.location.href = result.url
    closeSearch()
  }, [closeSearch])

  return {
    ...state,
    setQuery,
    setFilters,
    setOptions,
    search,
    clearSearch,
    openSearch,
    closeSearch,
    selectNext,
    selectPrevious,
    selectResult,
    navigateToResult
  }
}
