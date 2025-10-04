'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Target,
  AlertCircle
} from 'lucide-react'

interface FinancialOverviewReportProps {
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
  filters: any
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function FinancialOverviewReport({ overview, budgetBreakdown, monthlyTrends, filters }: FinancialOverviewReportProps) {
  // Prepare data for charts
  const budgetData = budgetBreakdown.map(item => ({
    name: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
    remaining: item.remaining,
    utilization: item.utilizationRate
  }))

  const categoryData = budgetBreakdown.map(item => ({
    name: item.category,
    value: item.budgeted,
    spent: item.spent,
    color: COLORS[budgetBreakdown.indexOf(item) % COLORS.length]
  }))

  const profitData = monthlyTrends.map(trend => ({
    month: trend.month,
    profit: trend.profit,
    revenue: trend.revenue,
    spent: trend.spent
  }))

  return (
    <div className="space-y-6">
      {/* Financial Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.budgetUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Budget utilization rate
            </p>
            <Progress 
              value={overview.budgetUtilization} 
              className="mt-2"
            />
            <div className="flex items-center mt-2">
              {overview.budgetUtilization > 80 ? (
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              ) : overview.budgetUtilization > 60 ? (
                <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
              ) : (
                <Target className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-xs text-muted-foreground">
                {overview.budgetUtilization > 80 ? 'Over budget' : 
                 overview.budgetUtilization > 60 ? 'Approaching limit' : 'Healthy'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overview.profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Net profit margin
            </p>
            <Progress 
              value={Math.max(0, Math.min(100, overview.profitMargin))} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${overview.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total revenue generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <Badge variant={overview.netProfit >= 0 ? 'default' : 'destructive'}>
              {overview.netProfit >= 0 ? '+' : ''}${overview.netProfit.toLocaleString()}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overview.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${overview.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {overview.netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Breakdown by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget by Category</CardTitle>
            <CardDescription>Budget allocation across different categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: $${value.toLocaleString()} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Budget']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget vs Spent by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Spent by Category</CardTitle>
            <CardDescription>Budget allocation vs actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Bar dataKey="budgeted" fill="#8884d8" name="Budgeted" />
                <Bar dataKey="spent" fill="#82ca9d" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Profit Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Profit Trends</CardTitle>
            <CardDescription>Profit and loss over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.3}
                  name="Profit"
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0088FE" 
                  strokeWidth={2}
                  name="Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Utilization by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization by Category</CardTitle>
            <CardDescription>How much of each budget category has been used</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Budget Breakdown</CardTitle>
          <CardDescription>Comprehensive view of budget allocation and spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetBreakdown.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <h3 className="font-semibold">{category.category}</h3>
                    <Badge variant={category.utilizationRate > 80 ? 'destructive' : 
                                   category.utilizationRate > 60 ? 'default' : 'secondary'}>
                      {category.utilizationRate.toFixed(1)}% used
                    </Badge>
                  </div>
                  <div className="mt-2">
                    <Progress value={category.utilizationRate} className="mb-2" />
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Budgeted: ${category.budgeted.toLocaleString()}</span>
                      <span>Spent: ${category.spent.toLocaleString()}</span>
                      <span>Remaining: ${category.remaining.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
