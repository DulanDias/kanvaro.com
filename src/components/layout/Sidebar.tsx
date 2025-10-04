'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { OrganizationLogo } from '@/components/ui/OrganizationLogo'
import { useOrganization } from '@/hooks/useOrganization'
import { 
  ChevronLeft, 
  ChevronRight,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  Clock,
  BarChart,
  Settings,
  List,
  Columns,
  Calendar,
  User,
  Zap,
  Shield,
  Play,
  Bell,
  DollarSign,
  Sliders,
  LogOut
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    permission: 'dashboard:read'
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: FolderOpen,
    path: '/projects',
    permission: 'project:read',
    children: [
      {
        id: 'projects-list',
        label: 'All Projects',
        icon: List,
        path: '/projects',
        permission: 'project:read'
      },
      {
        id: 'projects-kanban',
        label: 'Kanban Board',
        icon: Columns,
        path: '/projects/kanban',
        permission: 'project:read'
      },
      {
        id: 'projects-calendar',
        label: 'Calendar View',
        icon: Calendar,
        path: '/projects/calendar',
        permission: 'project:read'
      }
    ]
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    path: '/tasks',
    permission: 'task:read',
    children: [
      {
        id: 'tasks-my',
        label: 'My Tasks',
        icon: User,
        path: '/tasks/my',
        permission: 'task:read'
      },
      {
        id: 'tasks-backlog',
        label: 'Backlog',
        icon: List,
        path: '/tasks/backlog',
        permission: 'task:read'
      },
      {
        id: 'tasks-sprints',
        label: 'Sprints',
        icon: Zap,
        path: '/tasks/sprints',
        permission: 'task:read'
      }
    ]
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    path: '/team',
    permission: 'team:read',
    children: [
      {
        id: 'team-members',
        label: 'Members',
        icon: Users,
        path: '/team/members',
        permission: 'team:read'
      },
      {
        id: 'team-roles',
        label: 'Roles & Permissions',
        icon: Shield,
        path: '/team/roles',
        permission: 'user:manage_roles'
      }
    ]
  },
  {
    id: 'time',
    label: 'Time Tracking',
    icon: Clock,
    path: '/time-tracking',
    permission: 'time_tracking:read',
    children: [
      {
        id: 'time-tracker',
        label: 'Timer',
        icon: Play,
        path: '/time-tracking/timer',
        permission: 'time_tracking:create'
      },
      {
        id: 'time-logs',
        label: 'Time Logs',
        icon: Clock,
        path: '/time-tracking/logs',
        permission: 'time_tracking:read'
      },
      {
        id: 'time-reports',
        label: 'Reports',
        icon: BarChart,
        path: '/time-tracking/reports',
        permission: 'time_tracking:read'
      }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: BarChart,
    path: '/reports',
    permission: 'reporting:read',
    children: [
      {
        id: 'reports-project',
        label: 'Project Reports',
        icon: FolderOpen,
        path: '/reports/projects',
        permission: 'reporting:read'
      },
      {
        id: 'reports-financial',
        label: 'Financial Reports',
        icon: DollarSign,
        path: '/reports/financial',
        permission: 'financial:read'
      },
      {
        id: 'reports-team',
        label: 'Team Reports',
        icon: Users,
        path: '/reports/team',
        permission: 'reporting:read'
      }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    permission: 'settings:read'
  }
]

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const pathname = usePathname()
  const { organization, loading } = useOrganization()
  const { theme, resolvedTheme } = useTheme()

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        // Clear any client-side state if needed
        window.location.href = '/login'
      } else {
        console.error('Logout failed:', await response.text())
        // Still redirect to login even if logout API fails
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Still redirect to login even if logout API fails
      window.location.href = '/login'
    }
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center space-x-3">
            {loading ? (
              <div className="h-8 w-8 rounded bg-primary/10 animate-pulse" />
            ) : (
              <OrganizationLogo 
                lightLogo={organization?.logo} 
                darkLogo={organization?.darkLogo}
                logoMode={organization?.logoMode}
                fallbackText={organization?.name?.charAt(0) || 'K'}
                size="sm"
                className="rounded"
              />
            )}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="border-t" />

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.id}
              item={item}
              collapsed={collapsed}
              pathname={pathname}
              expandedItems={expandedItems}
              onToggleExpanded={toggleExpanded}
            />
          ))}
        </nav>
      </div>

      {/* Sticky Sign Out */}
      <div className="border-t p-2">
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start text-muted-foreground hover:text-foreground',
            collapsed ? 'px-2' : 'px-3'
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn('h-4 w-4', collapsed ? 'mx-auto' : 'mr-2')} />
          {!collapsed && 'Sign Out'}
        </Button>
      </div>
    </div>
  )
}

interface NavigationItemProps {
  item: any
  collapsed: boolean
  pathname: string
  expandedItems: string[]
  onToggleExpanded: (itemId: string) => void
}

function NavigationItem({ item, collapsed, pathname, expandedItems, onToggleExpanded }: NavigationItemProps) {
  const isActive = pathname === item.path
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedItems.includes(item.id)
  const Icon = item.icon

  return (
    <div className="space-y-1">
      <Button
        variant={isActive ? 'secondary' : 'ghost'}
        className={cn(
          'w-full justify-start',
          collapsed ? 'px-2' : 'px-3',
          isActive && 'bg-secondary text-secondary-foreground'
        )}
        onClick={() => {
          if (hasChildren) {
            onToggleExpanded(item.id)
          } else {
            window.location.href = item.path
          }
        }}
      >
        <Icon className={cn('h-4 w-4', collapsed ? 'mx-auto' : 'mr-2')} />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            {hasChildren && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </>
        )}
      </Button>

      {/* Sub-navigation */}
      {hasChildren && isExpanded && !collapsed && (
        <div className="ml-4 space-y-1">
          {item.children.map((child: any) => (
            <Button
              key={child.id}
              variant={pathname === child.path ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => {
                window.location.href = child.path
              }}
            >
              <child.icon className="mr-2 h-4 w-4" />
              {child.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
