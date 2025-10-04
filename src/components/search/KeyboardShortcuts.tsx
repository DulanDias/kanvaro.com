'use client'

import React, { useState, useEffect } from 'react'
import { Command, Search, ArrowUp, ArrowDown, CornerDownLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog'

interface KeyboardShortcut {
  key: string
  description: string
  icon: React.ReactNode
  category: 'navigation' | 'search' | 'general'
}

const shortcuts: KeyboardShortcut[] = [
  {
    key: '⌘K / Ctrl+K',
    description: 'Open global search',
    icon: <Search className="h-4 w-4" />,
    category: 'search'
  },
  {
    key: '↑ / ↓',
    description: 'Navigate search results',
    icon: <ArrowUp className="h-4 w-4" />,
    category: 'navigation'
  },
  {
    key: 'Enter',
    description: 'Select highlighted result',
    icon: <CornerDownLeft className="h-4 w-4" />,
    category: 'navigation'
  },
  {
    key: 'Esc',
    description: 'Close search or dialog',
    icon: <X className="h-4 w-4" />,
    category: 'general'
  },
  {
    key: '⌘/ / Ctrl+/',
    description: 'Show keyboard shortcuts',
    icon: <Command className="h-4 w-4" />,
    category: 'general'
  }
]

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
          <Command className="h-3 w-3 mr-1" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with the application more efficiently.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="font-medium capitalize mb-3">{category}</h4>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <div className="text-muted-foreground">
                        {shortcut.icon}
                      </div>
                      <span className="font-medium">{shortcut.description}</span>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">⌘/</kbd> or <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded">Ctrl+/</kbd> to open this dialog anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
