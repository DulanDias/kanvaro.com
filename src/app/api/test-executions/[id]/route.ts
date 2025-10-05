import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TestExecution, TestCase, Project } from '@/models'
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

    const testExecution = await TestExecution.findById(params.id)
      .populate('executedBy', 'firstName lastName email')
      .populate('testCase', 'title priority category description steps expectedResult')
      .populate('testPlan', 'name')
      .populate('project', 'name')
      .populate('bugs', 'title status priority')

    if (!testExecution) {
      return NextResponse.json({ success: false, error: 'Test execution not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testExecution.project)
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

    return NextResponse.json({
      success: true,
      data: testExecution
    })
  } catch (error) {
    console.error('Error fetching test execution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test execution' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const {
      status,
      actualResult,
      comments,
      executionTime,
      environment,
      version,
      attachments
    } = await req.json()

    const testExecution = await TestExecution.findById(params.id)

    if (!testExecution) {
      return NextResponse.json({ success: false, error: 'Test execution not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testExecution.project)
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

    // Update test execution
    testExecution.status = status || testExecution.status
    testExecution.actualResult = actualResult !== undefined ? actualResult : testExecution.actualResult
    testExecution.comments = comments !== undefined ? comments : testExecution.comments
    testExecution.executionTime = executionTime !== undefined ? executionTime : testExecution.executionTime
    testExecution.environment = environment !== undefined ? environment : testExecution.environment
    testExecution.version = version !== undefined ? version : testExecution.version
    testExecution.attachments = attachments !== undefined ? attachments : testExecution.attachments

    await testExecution.save()
    await testExecution.populate('executedBy', 'firstName lastName email')
    await testExecution.populate('testCase', 'title priority category')
    await testExecution.populate('testPlan', 'name')
    await testExecution.populate('project', 'name')

    return NextResponse.json({
      success: true,
      data: testExecution
    })
  } catch (error) {
    console.error('Error updating test execution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update test execution' },
      { status: 500 }
    )
  }
}
