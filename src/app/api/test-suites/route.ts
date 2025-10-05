import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TestSuite, Project } from '@/models'
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
    const parentSuiteId = searchParams.get('parentSuiteId')

    let query: any = { organization: authResult.user.organization }

    if (projectId) {
      query.project = projectId
    }

    if (parentSuiteId) {
      query.parentSuite = parentSuiteId
    } else if (parentSuiteId === '') {
      // Get root level suites (no parent)
      query.parentSuite = { $exists: false }
    }

    const testSuites = await TestSuite.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('parentSuite', 'name')
      .sort({ order: 1, createdAt: 1 })

    return NextResponse.json({
      success: true,
      data: testSuites
    })
  } catch (error) {
    console.error('Error fetching test suites:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test suites' },
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

    const { name, description, projectId, parentSuiteId, order, tags, customFields } = await req.json()

    if (!name || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Name and projectId are required' },
        { status: 400 }
      )
    }

    // Check if user has access to the project
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 })
    }

    const hasAccess = project.teamMembers.includes(authResult.user.id) || 
                     project.createdBy.toString() === authResult.user.id ||
                     project.projectRoles.some((role: any) => 
                       role.user.toString() === authResult.user.id && 
                       ['project_manager', 'project_qa_lead', 'project_tester'].includes(role.role)
                     )

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    // Check if parent suite exists and belongs to the same project
    if (parentSuiteId) {
      const parentSuite = await TestSuite.findById(parentSuiteId)
      if (!parentSuite || parentSuite.project.toString() !== projectId) {
        return NextResponse.json(
          { success: false, error: 'Invalid parent suite' },
          { status: 400 }
        )
      }
    }

    const testSuite = new TestSuite({
      name,
      description,
      organization: authResult.user.organization,
      project: projectId,
      parentSuite: parentSuiteId || undefined,
      createdBy: authResult.user.id,
      order: order || 0,
      tags: tags || [],
      customFields: customFields || {}
    })

    await testSuite.save()
    await testSuite.populate('createdBy', 'firstName lastName email')
    await testSuite.populate('parentSuite', 'name')

    return NextResponse.json({
      success: true,
      data: testSuite
    })
  } catch (error) {
    console.error('Error creating test suite:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create test suite' },
      { status: 500 }
    )
  }
}
