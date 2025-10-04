'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Search, 
  Users, 
  FolderOpen, 
  CheckSquare, 
  Clock,
  BarChart,
  Settings,
  UserPlus,
  Shield,
  Zap,
  Play,
  Bell,
  DollarSign
} from 'lucide-react'

const documentationSections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of using Kanvaro',
    icon: BookOpen,
    articles: [
      {
        title: 'Welcome to Kanvaro',
        description: 'Introduction to the platform and its features',
        readTime: '5 min read'
      },
      {
        title: 'Your First Project',
        description: 'Step-by-step guide to creating your first project',
        readTime: '10 min read'
      },
      {
        title: 'Understanding the Dashboard',
        description: 'Navigate the main dashboard and understand key metrics',
        readTime: '8 min read'
      }
    ]
  },
  {
    id: 'team-management',
    title: 'Team Management',
    description: 'Manage your team members and permissions',
    icon: Users,
    articles: [
      {
        title: 'Inviting Team Members',
        description: 'How to invite new members to your organization',
        readTime: '5 min read'
      },
      {
        title: 'Managing Roles and Permissions',
        description: 'Understanding and configuring user roles',
        readTime: '12 min read'
      },
      {
        title: 'User Profiles and Settings',
        description: 'Managing user profiles and personal settings',
        readTime: '7 min read'
      }
    ]
  },
  {
    id: 'project-management',
    title: 'Project Management',
    description: 'Create and manage projects effectively',
    icon: FolderOpen,
    articles: [
      {
        title: 'Creating Projects',
        description: 'Complete guide to project creation and setup',
        readTime: '15 min read'
      },
      {
        title: 'Project Templates',
        description: 'Using and creating project templates',
        readTime: '8 min read'
      },
      {
        title: 'Project Settings and Configuration',
        description: 'Advanced project configuration options',
        readTime: '10 min read'
      },
      {
        title: 'Project Assignment and Team Management',
        description: 'Assigning team members to projects',
        readTime: '6 min read'
      }
    ]
  },
  {
    id: 'task-management',
    title: 'Task Management',
    description: 'Organize and track your work',
    icon: CheckSquare,
    articles: [
      {
        title: 'Creating Tasks and Subtasks',
        description: 'How to create and organize tasks',
        readTime: '8 min read'
      },
      {
        title: 'Epics and Stories',
        description: 'Understanding agile methodology in Kanvaro',
        readTime: '12 min read'
      },
      {
        title: 'Sprint Planning',
        description: 'Setting up and managing sprints',
        readTime: '15 min read'
      },
      {
        title: 'Kanban and List Views',
        description: 'Using different views to manage your work',
        readTime: '10 min read'
      }
    ]
  },
  {
    id: 'time-tracking',
    title: 'Time Tracking',
    description: 'Track time and generate reports',
    icon: Clock,
    articles: [
      {
        title: 'Using the Timer',
        description: 'How to use the built-in timer for time tracking',
        readTime: '5 min read'
      },
      {
        title: 'Manual Time Entry',
        description: 'Adding time entries manually',
        readTime: '6 min read'
      },
      {
        title: 'Time Reports and Analytics',
        description: 'Understanding time tracking reports',
        readTime: '10 min read'
      }
    ]
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    description: 'Generate insights and reports',
    icon: BarChart,
    articles: [
      {
        title: 'Project Reports',
        description: 'Creating and understanding project reports',
        readTime: '12 min read'
      },
      {
        title: 'Team Performance Analytics',
        description: 'Analyzing team productivity and performance',
        readTime: '15 min read'
      },
      {
        title: 'Financial Reports',
        description: 'Budget tracking and financial reporting',
        readTime: '10 min read'
      }
    ]
  },
  {
    id: 'settings-configuration',
    title: 'Settings & Configuration',
    description: 'Configure your organization and preferences',
    icon: Settings,
    articles: [
      {
        title: 'Organization Settings',
        description: 'Configuring your organization details',
        readTime: '8 min read'
      },
      {
        title: 'Email Configuration',
        description: 'Setting up email notifications and SMTP',
        readTime: '12 min read'
      },
      {
        title: 'Database Configuration',
        description: 'Database setup and management',
        readTime: '15 min read'
      },
      {
        title: 'Security Settings',
        description: 'Configuring security and access controls',
        readTime: '10 min read'
      }
    ]
  }
]

export default function InternalDocsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSection, setSelectedSection] = useState('getting-started')

  const filteredSections = documentationSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.articles.length > 0)

  return (
    <MainLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Internal Documentation</h1>
          <p className="text-muted-foreground">Comprehensive guides for using Kanvaro effectively</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {filteredSections.reduce((total, section) => total + section.articles.length, 0)} articles
        </Badge>
      </div>

      <Tabs value={selectedSection} onValueChange={setSelectedSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="team-management">Team</TabsTrigger>
          <TabsTrigger value="project-management">Projects</TabsTrigger>
          <TabsTrigger value="task-management">Tasks</TabsTrigger>
          <TabsTrigger value="time-tracking">Time</TabsTrigger>
          <TabsTrigger value="reports-analytics">Reports</TabsTrigger>
          <TabsTrigger value="settings-configuration">Settings</TabsTrigger>
        </TabsList>

        {filteredSections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <section.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{section.title}</CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.articles.map((article, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-foreground mb-2">{article.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {article.readTime}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            Read More
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Start Guide */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Quick Start Guide</span>
          </CardTitle>
          <CardDescription>
            Get up and running with Kanvaro in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="p-2 bg-green-500/10 rounded-full">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">1. Invite Team</h4>
                <p className="text-xs text-muted-foreground">Add your team members</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <FolderOpen className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">2. Create Project</h4>
                <p className="text-xs text-muted-foreground">Set up your first project</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="p-2 bg-purple-500/10 rounded-full">
                <CheckSquare className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">3. Add Tasks</h4>
                <p className="text-xs text-muted-foreground">Break down your work</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-card rounded-lg">
              <div className="p-2 bg-orange-500/10 rounded-full">
                <Play className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-sm text-foreground">4. Start Tracking</h4>
                <p className="text-xs text-muted-foreground">Track time and progress</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </MainLayout>
  )
}
