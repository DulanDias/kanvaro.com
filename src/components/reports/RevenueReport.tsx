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
  Target,
  Award
} from 'lucide-react'

interface RevenueReportProps {
  revenueSources: {
    source: string
    amount: number
    percentage: number
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

export function RevenueReport({ revenueSources, monthlyTrends, filters }: RevenueReportProps) {
  // Calculate revenue metrics
  const totalRevenue = revenueSources.reduce((sum, source) => sum + source.amount, 0)
  const averageRevenue = revenueSources.length > 0 ? totalRevenue / revenueSources.length : 0
  const topSource = revenueSources.length > 0 
    ? revenueSources.reduce((max, source) => source.amount > max.amount ? source : max)
    : null

  // Prepare data for charts
  const sourceData = revenueSources.map((source, index) => ({
    name: source.source,
    amount: source.amount,
    percentage: source.percentage,
    color: COLORS[index % COLORS.length]
  }))

  const monthlyRevenueData = monthlyTrends.map(trend => ({
    month: trend.month,
    revenue: trend.revenue,
    profit: trend.profit,
    margin: trend.revenue > 0 ? (trend.profit / trend.revenue) * 100 : 0
  }))

  const revenueGrowth = calculateRevenueGrowth(monthlyTrends)

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Generated revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${averageRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Per source
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topSource ? topSource.source : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topSource ? `${topSource.percentage.toFixed(1)}% of total` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueGrowth.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Source */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Source</CardTitle>
            <CardDescription>Distribution of revenue across different sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, amount, percentage }) => `${name}: $${amount.toLocaleString()} (${percentage.toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trends</CardTitle>
            <CardDescription>Revenue and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1" 
                  stroke="#00C49F" 
                  fill="#00C49F" 
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="profit" 
                  stackId="2" 
                  stroke="#0088FE" 
                  fill="#0088FE" 
                  fillOpacity={0.6}
                  name="Profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Sources Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Sources Comparison</CardTitle>
            <CardDescription>Revenue amounts by source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="amount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit Margin Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Margin Trends</CardTitle>
            <CardDescription>Profit margin percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${typeof value === 'number' ? value.toFixed(1) : value}%`, 'Margin']} />
                <Line 
                  type="monotone" 
                  dataKey="margin" 
                  stroke="#FFBB28" 
                  strokeWidth={2}
                  name="Profit Margin %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Sources Details */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Sources Analysis</CardTitle>
          <CardDescription>Detailed breakdown of revenue by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueSources.map((source, index) => (
              <div key={source.source} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <h3 className="font-semibold">{source.source}</h3>
                    <Badge variant="outline">{source.percentage.toFixed(1)}%</Badge>
                  </div>
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-green-600">
                      ${source.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Revenue generated
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">
                      {source.percentage.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">of Total</div>
                  </div>
                  <div className="w-32">
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Revenue Details */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Breakdown</CardTitle>
          <CardDescription>Revenue and profit by month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenueData.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{month.month}</h3>
                  <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="font-medium text-green-600">
                        ${month.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Profit</div>
                      <div className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${month.profit.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Margin</div>
                      <div className="font-medium">
                        {month.margin.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-32">
                  <Progress value={Math.max(0, Math.min(100, month.margin))} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function calculateRevenueGrowth(monthlyTrends: any[]): number {
  if (monthlyTrends.length < 2) return 0
  
  const currentMonth = monthlyTrends[monthlyTrends.length - 1]
  const previousMonth = monthlyTrends[monthlyTrends.length - 2]
  
  if (previousMonth.revenue === 0) return 0
  
  return ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100
}
