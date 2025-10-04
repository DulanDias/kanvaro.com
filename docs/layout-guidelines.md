# Layout Guidelines for Kanvaro Application

## Overview
This document outlines the standard layout patterns and theme-aware styling guidelines for all routes in the Kanvaro application.

## Layout Structure

### 1. Main Application Layout
All application pages (except auth pages) MUST use the `MainLayout` component:

```tsx
import { MainLayout } from '@/components/layout/MainLayout'

export default function YourPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Your page content */}
      </div>
    </MainLayout>
  )
}
```

### 2. Page Structure Template
```tsx
'use client'

import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function YourPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Page Title</h1>
            <p className="text-muted-foreground">Page description or subtitle</p>
          </div>
          <Button>Action Button</Button>
        </div>

        {/* Page Content */}
        <Card>
          <CardHeader>
            <CardTitle>Section Title</CardTitle>
            <CardDescription>Section description</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Your content here */}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
```

## Theme-Aware Styling Guidelines

### 1. Text Colors
- **Primary Text**: `text-foreground` (for main headings and important text)
- **Secondary Text**: `text-muted-foreground` (for descriptions, subtitles, and less important text)
- **Destructive Text**: `text-destructive` (for errors and dangerous actions)

### 2. Background Colors
- **Primary Background**: `bg-background` (main page background)
- **Card Background**: `bg-card` (for card components)
- **Muted Background**: `bg-muted` (for subtle backgrounds)

### 3. Border Colors
- **Default Border**: `border` (standard borders)
- **Muted Border**: `border-muted` (subtle borders)

### 4. Interactive Elements
- **Primary Actions**: `bg-primary text-primary-foreground`
- **Secondary Actions**: `bg-secondary text-secondary-foreground`
- **Destructive Actions**: `text-destructive hover:text-destructive`

### 5. Status Colors
- **Success**: `text-green-600 dark:text-green-400`
- **Warning**: `text-yellow-600 dark:text-yellow-400`
- **Error**: `text-red-600 dark:text-red-400`
- **Info**: `text-blue-600 dark:text-blue-400`

## Component Guidelines

### 1. Headers and Titles
```tsx
// Main page title
<h1 className="text-3xl font-bold text-foreground">Page Title</h1>

// Subtitle
<p className="text-muted-foreground">Page description</p>

// Section headers
<h2 className="text-xl font-semibold text-foreground">Section Title</h2>
```

### 2. Cards
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### 3. Form Elements
```tsx
<div className="space-y-2">
  <Label htmlFor="field">Field Label</Label>
  <Input id="field" placeholder="Enter value" />
  <p className="text-sm text-muted-foreground">Helper text</p>
</div>
```

### 4. Alerts
```tsx
// Success alert
<Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
  <AlertDescription className="text-green-800 dark:text-green-200">
    Success message
  </AlertDescription>
</Alert>

// Error alert
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

## Layout Patterns

### 1. List Pages
- Use `MainLayout` wrapper
- Include search and filter controls
- Use cards for individual items
- Include pagination if needed

### 2. Form Pages
- Use `MainLayout` wrapper
- Break complex forms into steps/tabs
- Include progress indicators
- Use proper form validation

### 3. Detail Pages
- Use `MainLayout` wrapper
- Include breadcrumb navigation
- Use cards to organize information
- Include action buttons

## Common Mistakes to Avoid

### ❌ Don't Use Hardcoded Colors
```tsx
// ❌ Wrong
<h1 className="text-3xl font-bold text-gray-900">Title</h1>
<p className="text-gray-600">Description</p>

// ✅ Correct
<h1 className="text-3xl font-bold text-foreground">Title</h1>
<p className="text-muted-foreground">Description</p>
```

### ❌ Don't Skip MainLayout
```tsx
// ❌ Wrong
export default function Page() {
  return (
    <div>
      {/* Content */}
    </div>
  )
}

// ✅ Correct
export default function Page() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Content */}
      </div>
    </MainLayout>
  )
}
```

### ❌ Don't Use Empty String Values in Select
```tsx
// ❌ Wrong
<SelectItem value="">All Items</SelectItem>

// ✅ Correct
<SelectItem value="all">All Items</SelectItem>
```

## Testing Checklist

Before deploying any new page, ensure:

- [ ] Uses `MainLayout` wrapper
- [ ] All text uses theme-aware classes (`text-foreground`, `text-muted-foreground`)
- [ ] No hardcoded colors (`text-gray-900`, `bg-blue-600`, etc.)
- [ ] Select components use non-empty string values
- [ ] Proper spacing with `space-y-6` or similar
- [ ] Responsive design considerations
- [ ] Dark mode compatibility
- [ ] Proper semantic HTML structure

## Examples

### Complete Page Example
```tsx
'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

export default function ExamplePage() {
  const [items, setItems] = useState([])

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Example Page</h1>
            <p className="text-muted-foreground">This is an example page following the guidelines</p>
          </div>
          <Button>Add Item</Button>
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Items List</CardTitle>
            <CardDescription>Manage your items here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Badge variant="outline">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
```

This ensures consistency across all routes and proper theme support.
