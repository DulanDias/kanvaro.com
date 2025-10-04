import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { TimeEntry } from '@/models/TimeEntry'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { timeEntryIds, approvedBy, action } = body

    if (!timeEntryIds || !Array.isArray(timeEntryIds) || timeEntryIds.length === 0) {
      return NextResponse.json({ error: 'Time entry IDs are required' }, { status: 400 })
    }

    if (!approvedBy) {
      return NextResponse.json({ error: 'Approver ID is required' }, { status: 400 })
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be "approve" or "reject"' }, { status: 400 })
    }

    const updateData: any = {
      approvedBy,
      approvedAt: new Date()
    }

    if (action === 'approve') {
      updateData.isApproved = true
    } else {
      updateData.isApproved = false
    }

    const result = await TimeEntry.updateMany(
      { _id: { $in: timeEntryIds } },
      updateData
    )

    return NextResponse.json({
      message: `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.modifiedCount} time entries`,
      modifiedCount: result.modifiedCount
    })
  } catch (error) {
    console.error('Error approving/rejecting time entries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
