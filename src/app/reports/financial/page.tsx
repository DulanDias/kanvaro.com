'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { CalendarIcon, Download, Filter, RefreshCw, Search, TrendingUp, TrendingDown } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { FinancialOverviewReport } from '@/components/reports/FinancialOverviewReport'
import { BudgetAnalysisReport } from '@/components/reports/BudgetAnalysisReport'
import { ExpenseReport } from '@/components/reports/ExpenseReport'
import { RevenueReport } from '@/components/reports/RevenueReport'

interface FinancialReportData {
  overview: {
    totalBudget: number
    totalSpent: number
    totalRevenue: number
    netProfit: number
    budgetUtilization: number
    profitMargin: number
  }
  budgetBreakdown: {
    category: string
    budgeted: number
    spent: number
    remaining: number
    utilizationRate: number
  }[]
  monthlyTrends: {
    month: string
    budget: number
    spent: number
    revenue: number
    profit: number
  }[]
  topExpenses: {
    description: string
    amount: number
    category: string
    project: string
    date: string
  }[]
  revenueSources: {
    source: string
    amount: number
    percentage: number
  }[]
}

interface FilterState {
  search: string
  category: string
  project: string
  dateRange: {
    from: Date | undefined
    to: Date | undefined
  }
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export default function FinancialReportsPage() {
  const [reportData, setReportData] = useState<FinancialReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    project: 'all',
    dateRange: {
      from: undefined,
      to: undefined
    },
    sortBy: 'date',
    sortOrder: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchFinancialReports()
  }, [filters])

  const fetchFinancialReports = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters.project !== 'all') queryParams.append('project', filters.project)
      if (filters.dateRange.from) queryParams.append('startDate', filters.dateRange.from.toISOString())
      if (filters.dateRange.to) queryParams.append('endDate', filters.dateRange.to.toISOString())
      queryParams.append('sortBy', filters.sortBy)
      queryParams.append('sortOrder', filters.sortOrder)

      const response = await fetch(`/api/reports/financial?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReportData(data)
      }
    } catch (error) {
      console.error('Error fetching financial reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleDateRangeChange = (key: 'from' | 'to', date: Date | undefined) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: date
      }
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      project: 'all',
      dateRange: {
        from: undefined,
        to: undefined
      },
      sortBy: 'date',
      sortOrder: 'desc'
    })
  }

  const exportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      const queryParams = new URLSearchParams()
      queryParams.append('format', format)
      queryParams.append('type', activeTab)
      
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.category !== 'all') queryParams.append('category', filters.category)
      if (filters.project !== 'all') queryParams.append('project', filters.project)
      if (filters.dateRange.from) queryParams.append('startDate', filters.dateRange.from.toISOString())
      if (filters.dateRange.to) queryParams.append('endDate', filters.dateRange.to.toISOString())

      const response = await fetch(`/api/reports/financial/export?${queryParams.toString()}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-reports-${format}-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    )
  }

  if (!reportData) {
    return (
      <MainLayout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No financial data available</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <PageWrapper>
        <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and budget insights
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFinancialReports}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter and sort financial reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={filters.project} onValueChange={(value) => handleFilterChange('project', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {/* Project options would be populated from API */}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateRange.from && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from ? format(filters.dateRange.from, "PPP") : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) => handleDateRangeChange('from', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filters.dateRange.to && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to ? format(filters.dateRange.to, "PPP") : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) => handleDateRangeChange('to', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <div className="flex items-center space-x-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filters.sortOrder} onValueChange={(value: 'asc' | 'desc') => handleFilterChange('sortOrder', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.overview.totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${reportData.overview.totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.overview.budgetUtilization.toFixed(1)}% of budget
            </p>
            <Progress value={reportData.overview.budgetUtilization} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${reportData.overview.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Badge variant={reportData.overview.netProfit >= 0 ? 'default' : 'destructive'}>
              {reportData.overview.netProfit >= 0 ? '+' : ''}${reportData.overview.netProfit.toLocaleString()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${reportData.overview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${reportData.overview.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.overview.profitMargin.toFixed(1)}% profit margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <FinancialOverviewReport 
            overview={reportData.overview}
            budgetBreakdown={reportData.budgetBreakdown}
            monthlyTrends={reportData.monthlyTrends}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetAnalysisReport 
            budgetBreakdown={reportData.budgetBreakdown}
            monthlyTrends={reportData.monthlyTrends}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseReport 
            topExpenses={reportData.topExpenses}
            budgetBreakdown={reportData.budgetBreakdown}
            filters={filters}
          />
        </TabsContent>

        <TabsContent value="revenue">
          <RevenueReport 
            revenueSources={reportData.revenueSources}
            monthlyTrends={reportData.monthlyTrends}
            filters={filters}
          />
        </TabsContent>
      </Tabs>
        </div>
      </PageWrapper>
    </MainLayout>
  )
}
