import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TestPlan, Project } from '@/models'
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

    const testPlan = await TestPlan.findById(params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('project', 'name')
      .populate('testCases', 'title priority category automationStatus')

    if (!testPlan) {
      return NextResponse.json({ success: false, error: 'Test plan not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testPlan.project)
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
      data: testPlan
    })
  } catch (error) {
    console.error('Error fetching test plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test plan' },
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
      name,
      description,
      version,
      assignedTo,
      status,
      startDate,
      endDate,
      isActive,
      tags,
      customFields
    } = await req.json()

    const testPlan = await TestPlan.findById(params.id)

    if (!testPlan) {
      return NextResponse.json({ success: false, error: 'Test plan not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testPlan.project)
    const hasAccess = project && (
      project.teamMembers.includes(authResult.user.id) || 
      project.createdBy.toString() === authResult.user.id ||
      project.projectRoles.some((role: any) => 
        role.user.toString() === authResult.user.id && 
        ['project_manager', 'project_qa_lead'].includes(role.role)
      )
    )

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Update test plan
    testPlan.name = name || testPlan.name
    testPlan.description = description !== undefined ? description : testPlan.description
    testPlan.version = version !== undefined ? version : testPlan.version
    testPlan.assignedTo = assignedTo !== undefined ? assignedTo : testPlan.assignedTo
    testPlan.status = status || testPlan.status
    testPlan.startDate = startDate ? new Date(startDate) : testPlan.startDate
    testPlan.endDate = endDate ? new Date(endDate) : testPlan.endDate
    testPlan.isActive = isActive !== undefined ? isActive : testPlan.isActive
    testPlan.tags = tags || testPlan.tags
    testPlan.customFields = customFields || testPlan.customFields

    await testPlan.save()
    await testPlan.populate('createdBy', 'firstName lastName email')
    await testPlan.populate('assignedTo', 'firstName lastName email')
    await testPlan.populate('project', 'name')
    await testPlan.populate('testCases', 'title priority category automationStatus')

    return NextResponse.json({
      success: true,
      data: testPlan
    })
  } catch (error) {
    console.error('Error updating test plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update test plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    const authResult = await authenticateUser()
    
    if ('error' in authResult) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
    }

    const testPlan = await TestPlan.findById(params.id)

    if (!testPlan) {
      return NextResponse.json({ success: false, error: 'Test plan not found' }, { status: 404 })
    }

    // Check if user has access to the project
    const project = await Project.findById(testPlan.project)
    const hasAccess = project && (
      project.teamMembers.includes(authResult.user.id) || 
      project.createdBy.toString() === authResult.user.id ||
      project.projectRoles.some((role: any) => 
        role.user.toString() === authResult.user.id && 
        ['project_manager', 'project_qa_lead'].includes(role.role)
      )
    )

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    await TestPlan.findByIdAndDelete(params.id)

    return NextResponse.json({
      success: true,
      message: 'Test plan deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting test plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete test plan' },
      { status: 500 }
    )
  }
}
