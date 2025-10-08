'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog'
import { cn } from '@/lib/utils'

interface ResponsiveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ResponsiveDialog({ 
  open, 
  onOpenChange, 
  title, 
  description,
  children, 
  className 
}: ResponsiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          'w-full max-w-4xl max-h-[90vh] overflow-y-auto',
          'sm:max-w-2xl lg:max-w-4xl',
          className
        )}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
