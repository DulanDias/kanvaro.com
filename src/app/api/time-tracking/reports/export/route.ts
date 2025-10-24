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

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const organizationId = searchParams.get('organizationId') || ''
    const reportType = searchParams.get('reportType') || 'summary'
    const format = (searchParams.get('format') || 'csv').toLowerCase()

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    if (user.organization?.toString && user.organization.toString() !== organizationId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')

    if (format === 'json') {
      const data = {
        organizationId,
        reportType,
        generatedAt: new Date().toISOString(),
        rows: [],
      }
      return NextResponse.json({ success: true, data })
    }

    const headers = ['User','Project','Task','Date','Start','End','Duration(h)','Notes']
    const bom = '\uFEFF'
    const csv = [headers.join(','),].join('\n') + '\n'
    const body = bom + csv

    return new NextResponse(body, {
      status: 200,
      headers: new Headers({
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="time-report-${reportType}-${now}.csv"`,
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
