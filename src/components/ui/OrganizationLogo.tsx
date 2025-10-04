'use client'

import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'

interface OrganizationLogoProps {
  lightLogo?: string
  darkLogo?: string
  fallbackText?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const OrganizationLogo = ({ 
  lightLogo, 
  darkLogo, 
  fallbackText = 'K', 
  className = '',
  size = 'md'
}: OrganizationLogoProps) => {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`flex items-center justify-center bg-primary/10 text-primary font-bold ${className}`}>
        {fallbackText}
      </div>
    )
  }

  const currentTheme = resolvedTheme || theme
  const logoSrc = currentTheme === 'dark' && darkLogo ? darkLogo : lightLogo

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-12 w-12 text-lg',
    lg: 'h-16 w-16 text-xl'
  }

  if (logoSrc) {
    return (
      <img
        src={logoSrc}
        alt="Organization logo"
        className={`object-contain ${sizeClasses[size]} ${className}`}
      />
    )
  }

  return (
    <div className={`flex items-center justify-center bg-primary/10 text-primary font-bold rounded ${sizeClasses[size]} ${className}`}>
      {fallbackText}
    </div>
  )
}
