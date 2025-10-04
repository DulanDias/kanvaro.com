import { useState, useEffect } from 'react'

export interface Currency {
  _id: string
  code: string
  name: string
  symbol: string
  country: string
  isActive: boolean
  isMajor: boolean
  createdAt: string
  updatedAt: string
}

export function useCurrencies(majorOnly: boolean = false) {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const params = new URLSearchParams()
        if (majorOnly) {
          params.append('major', 'true')
        }
        
        const response = await fetch(`/api/currencies?${params.toString()}`)
        const data = await response.json()
        
        if (data.success) {
          setCurrencies(data.data || [])
        } else {
          setError(data.error || 'Failed to fetch currencies')
        }
      } catch (err) {
        console.error('Error fetching currencies:', err)
        setError('Failed to fetch currencies')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrencies()
  }, [majorOnly])

  const formatCurrencyDisplay = (currency: Currency): string => {
    return `${currency.code} - ${currency.name} (${currency.symbol})`
  }

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find(currency => currency.code === code)
  }

  return {
    currencies,
    loading,
    error,
    formatCurrencyDisplay,
    getCurrencyByCode
  }
}
