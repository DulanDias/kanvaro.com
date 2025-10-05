import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TestExecution, TestCase, TestPlan, Project } from '@/models'
// import { getServerSession } from 'next-auth'
import { authenticateUser } from '@/lib/auth-utils'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')
    const testCaseId = searchParams.get('testCaseId')
    const testPlanId = searchParams.get('testPlanId')
    const status = searchParams.get('status')
    const version = searchParams.get('version')
    const executedBy = searchParams.get('executedBy')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query: any = { organization: authResult.user.organization }

    if (projectId) {
      query.project = projectId
    }

    if (testCaseId) {
      query.testCase = testCaseId
    }

    if (testPlanId) {
      query.testPlan = testPlanId
    }

    if (status) {
      query.status = status
    }

    if (version) {
      query.version = version
    }

    if (executedBy) {
      query.executedBy = executedBy
    }

    const skip = (page - 1) * limit

    const testExecutions = await TestExecution.find(query)
      .populate('executedBy', 'firstName lastName email')
      .populate('testCase', 'title priority category')
      .populate('testPlan', 'name')
      .populate('project', 'name')
      .sort({ executedAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await TestExecution.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: testExecutions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching test executions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test executions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const {
      testCaseId,
      testPlanId,
      status,
      actualResult,
      comments,
      executionTime,
      environment,
      version,
      attachments
    } = await req.json()

    if (!testCaseId || !status) {
      return NextResponse.json(
        { success: false, error: 'testCaseId and status are required' },
        { status: 400 }
      )
    }

    // Check if test case exists and user has access
    const testCase = await TestCase.findById(testCaseId)
    if (!testCase) {
      return NextResponse.json({ success: false, error: 'Test case not found' }, { status: 404 })
    }

    const project = await Project.findById(testCase.project)
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

    // Check if test plan exists and belongs to the same project
    if (testPlanId) {
      const testPlan = await TestPlan.findById(testPlanId)
      if (!testPlan || testPlan.project.toString() !== testCase.project.toString()) {
        return NextResponse.json(
          { success: false, error: 'Invalid test plan' },
          { status: 400 }
        )
      }
    }

    const testExecution = new TestExecution({
      testCase: testCaseId,
      testPlan: testPlanId,
      organization: authResult.user.organization,
      project: testCase.project,
      executedBy: authResult.user.id,
      status,
      actualResult,
      comments,
      executionTime: executionTime || 0,
      environment: environment || 'Unknown',
      version: version || 'Unknown',
      attachments: attachments || [],
      executedAt: new Date()
    })

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
    console.error('Error creating test execution:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create test execution' },
      { status: 500 }
    )
  }
}
