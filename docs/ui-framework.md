# Kanvaro - UI Framework & Design System

## Overview

Kanvaro uses [shadcn/ui](https://ui.shadcn.com/) - a modern, accessible, and highly customizable component library built on top of Radix UI primitives and Tailwind CSS. This ensures professional-quality components with built-in accessibility, faster development, and seamless Next.js integration.

## Technology Stack

### Core Framework
- **[shadcn/ui](https://ui.shadcn.com/)**: Modern component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable SVG icons
- **React**: Component-based UI library
- **TypeScript**: Type-safe development

### Additional Libraries
- **Radix UI**: Unstyled, accessible UI primitives (used by shadcn/ui)
- **React Hook Form**: Performant forms with validation
- **Zod**: TypeScript-first schema validation
- **Framer Motion**: Animation library (optional)
- **Class Variance Authority**: Component variant management

## Design System

### Color Palette
```typescript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main brand color
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        }
      }
    }
  }
}
```

### Typography
```css
/* Custom font classes */
.font-display {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 600;
  line-height: 1.2;
}

.font-body {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  line-height: 1.5;
}

.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
```

## shadcn/ui Component Library

### Installation & Setup
```bash
# Install shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add toast
```

### Available Components
Based on the [shadcn/ui components](https://ui.shadcn.com/docs/components), we have access to:

#### Form Components
- **Button**: Multiple variants (primary, secondary, outline, ghost, destructive)
- **Input**: Text input with validation support
- **Input Group**: Grouped inputs with labels
- **Input OTP**: One-time password input
- **Textarea**: Multi-line text input
- **Select**: Dropdown selection
- **Checkbox**: Checkbox input
- **Radio Group**: Radio button groups
- **Switch**: Toggle switches
- **Slider**: Range sliders
- **Date Picker**: Date selection
- **Field**: Form field wrapper

#### Layout Components
- **Card**: Content containers
- **Sheet**: Slide-out panels
- **Dialog**: Modal dialogs
- **Drawer**: Mobile-friendly drawers
- **Popover**: Floating content
- **Hover Card**: Hover-triggered content
- **Tooltip**: Contextual information
- **Alert**: Status messages
- **Alert Dialog**: Confirmation dialogs

#### Navigation Components
- **Navigation Menu**: Main navigation
- **Menubar**: Application menu bar
- **Breadcrumb**: Navigation breadcrumbs
- **Pagination**: Page navigation
- **Tabs**: Tabbed content
- **Sidebar**: Application sidebar

#### Data Display
- **Table**: Data tables
- **Data Table**: Advanced data tables with sorting/filtering
- **Avatar**: User avatars
- **Badge**: Status badges
- **Progress**: Progress indicators
- **Skeleton**: Loading placeholders
- **Chart**: Data visualization
- **Calendar**: Calendar component

#### Feedback Components
- **Toast**: Notification toasts
- **Sonner**: Advanced toast system
- **Spinner**: Loading spinners
- **Empty**: Empty state displays
- **Alert**: Status alerts

#### Interactive Components
- **Command**: Command palette
- **Combobox**: Searchable select
- **Context Menu**: Right-click menus
- **Dropdown Menu**: Dropdown menus
- **Toggle**: Toggle buttons
- **Toggle Group**: Toggle button groups
- **Resizable**: Resizable panels
- **Scroll Area**: Custom scrollbars
- **Separator**: Visual separators
- **Aspect Ratio**: Maintained aspect ratios
- **Carousel**: Image/content carousels
- **Accordion**: Collapsible content
- **Collapsible**: Collapsible sections

#### Input Component
```typescript
// components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helper?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, helper, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        {helper && !error && <p className="text-sm text-muted-foreground">{helper}</p>}
      </div>
    );
  }
);
```

#### Card Component
```typescript
// components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
```

### Setup Wizard Components

#### Progress Steps
```typescript
// components/setup/ProgressSteps.tsx
import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface ProgressStepsProps {
  steps: Step[];
  currentStep: string;
}

export const ProgressSteps = ({ steps, currentStep }: ProgressStepsProps) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-center space-x-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="flex items-center">
            <div className="flex items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2',
                  {
                    'border-primary bg-primary text-white': step.status === 'completed',
                    'border-primary bg-white text-primary': step.status === 'current',
                    'border-gray-300 bg-white text-gray-500': step.status === 'upcoming',
                  }
                )}
              >
                {step.status === 'completed' ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  'ml-4 text-sm font-medium',
                  {
                    'text-primary': step.status === 'current',
                    'text-gray-500': step.status === 'upcoming',
                    'text-gray-900': step.status === 'completed',
                  }
                )}
              >
                {step.title}
              </span>
            </div>
            {stepIdx < steps.length - 1 && (
              <div className="ml-8 h-0.5 w-8 bg-gray-300" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

#### Setup Form Layout
```typescript
// components/setup/SetupForm.tsx
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SetupFormProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  isLastStep?: boolean;
  isLoading?: boolean;
}

export const SetupForm = ({
  title,
  description,
  children,
  onBack,
  onNext,
  onComplete,
  isLastStep = false,
  isLoading = false
}: SetupFormProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{description}</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          {onBack && (
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          
          <div className="ml-auto">
            {isLastStep ? (
              <Button
                onClick={onComplete}
                loading={isLoading}
                className="flex items-center"
              >
                Complete Setup
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={onNext}
                loading={isLoading}
                className="flex items-center"
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Icon System

### Lucide React Integration
```typescript
// lib/icons.ts
export {
  // Navigation
  Home,
  Settings,
  Users,
  Projects,
  Calendar,
  Clock,
  
  // Actions
  Plus,
  Edit,
  Trash2,
  Save,
  Send,
  Download,
  Upload,
  
  // Status
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  
  // Communication
  Mail,
  MessageSquare,
  Bell,
  Phone,
  
  // Files
  File,
  Folder,
  Image,
  FileText,
  
  // UI
  Menu,
  Search,
  Filter,
  Sort,
  Grid,
  List,
  
  // Setup
  Database,
  Cloud,
  Shield,
  Zap,
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
```

### Icon Usage Examples
```typescript
// Usage in components
import { Mail, Database, Cloud, CheckCircle } from '@/lib/icons';

// In setup wizard
<Mail className="h-5 w-5 text-blue-500" />
<Database className="h-6 w-6" />
<Cloud className="h-4 w-4 mr-2" />
<CheckCircle className="h-5 w-5 text-green-500" />
```

## Responsive Design

### Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Responsive Components
```typescript
// components/layout/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid = ({ 
  children, 
  cols = { sm: 1, md: 2, lg: 3, xl: 4 } 
}: ResponsiveGridProps) => {
  return (
    <div className={cn(
      'grid gap-4',
      `grid-cols-${cols.sm}`,
      `md:grid-cols-${cols.md}`,
      `lg:grid-cols-${cols.lg}`,
      `xl:grid-cols-${cols.xl}`
    )}>
      {children}
    </div>
  );
};
```

## Animation & Transitions

### Framer Motion Integration
```typescript
// components/ui/AnimatedCard.tsx
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedCard = ({ children, delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="rounded-lg border bg-card p-6 shadow-sm"
    >
      {children}
    </motion.div>
  );
};
```

### CSS Transitions
```css
/* Custom transition classes */
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-bounce {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Accessibility

### ARIA Support
```typescript
// components/ui/AccessibleButton.tsx
interface AccessibleButtonProps extends ButtonProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleButton = ({ 
  ariaLabel, 
  ariaDescribedBy, 
  ...props 
}: AccessibleButtonProps) => {
  return (
    <Button
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    />
  );
};
```

### Focus Management
```typescript
// hooks/useFocusManagement.ts
import { useEffect, useRef } from 'react';

export const useFocusManagement = (isOpen: boolean) => {
  const focusRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    if (isOpen && focusRef.current) {
      focusRef.current.focus();
    }
  }, [isOpen]);
  
  return focusRef;
};
```

## Theme Customization

### Dark Mode Support
```typescript
// lib/theme.ts
export const themeConfig = {
  light: {
    background: 'hsl(0 0% 100%)',
    foreground: 'hsl(222.2 84% 4.9%)',
    card: 'hsl(0 0% 100%)',
    cardForeground: 'hsl(222.2 84% 4.9%)',
    primary: 'hsl(221.2 83.2% 53.3%)',
    primaryForeground: 'hsl(210 40% 98%)',
  },
  dark: {
    background: 'hsl(222.2 84% 4.9%)',
    foreground: 'hsl(210 40% 98%)',
    card: 'hsl(222.2 84% 4.9%)',
    cardForeground: 'hsl(210 40% 98%)',
    primary: 'hsl(217.2 91.2% 59.8%)',
    primaryForeground: 'hsl(222.2 84% 4.9%)',
  }
};
```

## Utility Functions

### Class Name Utilities
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
```

---

*This UI framework documentation will be updated as new components are added and existing ones are enhanced.*
