import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { generateGanttData } from '@/lib/gantt'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const sprintId = searchParams.get('sprintId')
    const assigneeId = searchParams.get('assigneeId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await connectDB()

    const ganttData = await generateGanttData(
      projectId || undefined,
      sprintId || undefined,
      assigneeId || undefined,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    )

    return NextResponse.json(ganttData)
  } catch (error) {
    console.error('Gantt data error:', error)
    return NextResponse.json({ error: 'Failed to generate Gantt data' }, { status: 500 })
  }
}
