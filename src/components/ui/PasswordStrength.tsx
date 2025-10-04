'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const [strength, setStrength] = useState(0)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const calculateStrength = (pwd: string) => {
      let score = 0
      const feedback = []

      // Length check
      if (pwd.length >= 8) score += 1
      else feedback.push('At least 8 characters')

      // Lowercase check
      if (/[a-z]/.test(pwd)) score += 1
      else feedback.push('Lowercase letter')

      // Uppercase check
      if (/[A-Z]/.test(pwd)) score += 1
      else feedback.push('Uppercase letter')

      // Number check
      if (/\d/.test(pwd)) score += 1
      else feedback.push('Number')

      // Special character check
      if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) score += 1
      else feedback.push('Special character')

      // Very strong (12+ characters with all requirements)
      if (pwd.length >= 12 && score >= 4) score = 5

      return { score, feedback: feedback.join(', ') }
    }

    const { score, feedback } = calculateStrength(password)
    setStrength(score)
    setFeedback(feedback)
  }, [password])

  const getStrengthLabel = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'Very Weak'
      case 2:
        return 'Weak'
      case 3:
        return 'Fair'
      case 4:
        return 'Good'
      case 5:
        return 'Very Strong'
      default:
        return 'Very Weak'
    }
  }

  const getStrengthColor = (score: number) => {
    switch (score) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-orange-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-blue-500'
      case 5:
        return 'bg-green-500'
      default:
        return 'bg-red-500'
    }
  }

  if (!password) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={cn(
          'font-medium',
          strength <= 1 && 'text-red-600 dark:text-red-400',
          strength === 2 && 'text-orange-600 dark:text-orange-400',
          strength === 3 && 'text-yellow-600 dark:text-yellow-400',
          strength === 4 && 'text-blue-600 dark:text-blue-400',
          strength >= 5 && 'text-green-600 dark:text-green-400'
        )}>
          {getStrengthLabel(strength)}
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all duration-300',
            getStrengthColor(strength)
          )}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      
      {feedback && (
        <p className="text-xs text-muted-foreground">
          Missing: {feedback}
        </p>
      )}
    </div>
  )
}
