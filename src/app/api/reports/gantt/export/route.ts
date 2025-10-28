import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Read filters (optional)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || ''
    const sprintId = searchParams.get('sprintId') || ''
    const assigneeId = searchParams.get('assigneeId') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const format = (searchParams.get('format') || 'csv').toLowerCase()

    const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

    if (format === 'json') {
      // Placeholder structure mirroring Gantt payload shape
      return NextResponse.json({
        success: true,
        filters: { projectId, sprintId, assigneeId, startDate, endDate },
        data: { tasks: [], startDate, endDate },
      })
    }

    // CSV export (basic header; fill with real rows as needed)
    const headers = [
      'Task ID',
      'Task Name',
      'Project',
      'Sprint',
      'Assignee',
      'Start Date',
      'End Date',
      'Progress (%)',
      'Dependencies',
    ]

    const bom = '\uFEFF'
    const csv = [headers.join(',')].join('\n') + '\n'
    const body = bom + csv

    return new NextResponse(body, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="gantt-export-${now}.csv"`,
        'Cache-Control': 'no-store',
      }),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
