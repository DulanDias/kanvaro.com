import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(req.url)
    const format = (searchParams.get('format') || 'csv').toLowerCase()
    const type = (searchParams.get('type') || 'overview').toLowerCase()
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const role = searchParams.get('role') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        type,
        filters: { search, department, role, startDate, endDate },
        data: [],
      })
    }

    const headers = [
      'Member',
      'Email',
      'Department',
      'Role',
      'Tasks Completed',
      'Hours Logged',
      'Productivity Score',
      'Workload Score',
    ]

    const bom = '\uFEFF'
    const csv = [headers.join(',')].join('\n') + '\n'
    const body = bom + csv

    const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
    const filename = `team-reports-${type}-${now}.csv`

    return new NextResponse(body, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      }),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
