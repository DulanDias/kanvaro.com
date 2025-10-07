import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db-config'
import { TestSuite, Project } from '@/models'
// import { getServerSession } from 'next-auth'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const testSuite = await TestSuite.findById(params.id)

    if (!testSuite) {
      return NextResponse.json({ success: false, error: 'Test suite not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testSuite.project)
    const hasAccess = project && (
      project.teamMembers.includes(authResult.user.id) || 
      project.createdBy.toString() === authResult.user.id ||
      project.projectRoles.some((role: any) => 
        role.user.toString() === authResult.user.id && 
        ['project_manager', 'project_qa_lead', 'project_tester'].includes(role.role)
      )
    )

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const childSuites = await TestSuite.find({ parentSuite: params.id })
      .populate('createdBy', 'firstName lastName email')
      .sort({ order: 1, createdAt: 1 })

    return NextResponse.json({
      success: true,
      data: childSuites
    })
  } catch (error) {
    console.error('Error fetching child test suites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch child test suites' },
      { status: 500 }
    )
  }
}
