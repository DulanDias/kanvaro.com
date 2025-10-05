'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Target
} from 'lucide-react'

interface BudgetAnalysisReportProps {
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

export function BudgetAnalysisReport({ budgetBreakdown, monthlyTrends, filters }: BudgetAnalysisReportProps) {
  // Calculate budget metrics
  const totalBudgeted = budgetBreakdown.reduce((sum, item) => sum + item.budgeted, 0)
  const totalSpent = budgetBreakdown.reduce((sum, item) => sum + item.spent, 0)
  const totalRemaining = budgetBreakdown.reduce((sum, item) => sum + item.remaining, 0)
  const averageUtilization = budgetBreakdown.length > 0 
    ? budgetBreakdown.reduce((sum, item) => sum + item.utilizationRate, 0) / budgetBreakdown.length 
    : 0

  // Prepare data for charts
  const categoryData = budgetBreakdown.map((item, index) => ({
    name: item.category,
    budgeted: item.budgeted,
    spent: item.spent,
    remaining: item.remaining,
    utilization: item.utilizationRate,
    color: COLORS[index % COLORS.length]
  }))

  const utilizationData = budgetBreakdown.map(item => ({
    category: item.category,
    utilization: item.utilizationRate,
    budgeted: item.budgeted,
    spent: item.spent
  }))

  const monthlyBudgetData = monthlyTrends.map(trend => ({
    month: trend.month,
    budget: trend.budget,
    spent: trend.spent,
    variance: trend.budget - trend.spent,
    utilization: trend.budget > 0 ? (trend.spent / trend.budget) * 100 : 0
  }))

  return (
    <div className="space-y-6">
      {/* Budget Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budgeted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudgeted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all categories
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
              ${totalSpent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget
            </p>
            <Progress value={(totalSpent / totalBudgeted) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRemaining.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageUtilization.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across categories
            </p>
            <Progress value={averageUtilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Spent by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Spent by Category</CardTitle>
            <CardDescription>Budget allocation vs actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
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

        {/* Budget Utilization by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization by Category</CardTitle>
            <CardDescription>Percentage of budget used by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Utilization']} />
                <Bar dataKey="utilization" fill="#FFBB28" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Budget Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budget Trends</CardTitle>
            <CardDescription>Budget and spending over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyBudgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="budget" 
                  stackId="1" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Budget"
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stackId="2" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                  name="Spent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Variance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Variance Analysis</CardTitle>
            <CardDescription>Monthly budget vs actual spending variance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyBudgetData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Variance']} />
                <Line 
                  type="monotone" 
                  dataKey="variance" 
                  stroke="#FF8042" 
                  strokeWidth={2}
                  name="Budget Variance"
                />
                <Line 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Utilization %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Budget Category Details */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Category Analysis</CardTitle>
          <CardDescription>Detailed breakdown of budget performance by category</CardDescription>
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
                    {category.utilizationRate > 100 && (
                      <Badge variant="destructive" className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>Over Budget</span>
                      </Badge>
                    )}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Budget Utilization</span>
                        <span>{category.utilizationRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(100, category.utilizationRate)} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Budgeted</div>
                        <div className="font-medium">${category.budgeted.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Spent</div>
                        <div className="font-medium">${category.spent.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Remaining</div>
                        <div className={`font-medium ${category.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${category.remaining.toLocaleString()}
                        </div>
                      </div>
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
