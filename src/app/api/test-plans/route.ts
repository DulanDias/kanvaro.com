import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { TestPlan, Project } from '@/models'
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
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query: any = { organization: authResult.user.organization }

    if (projectId) {
      query.project = projectId
    }

    if (status) {
      query.status = status
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    const skip = (page - 1) * limit

    const testPlans = await TestPlan.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('project', 'name')
      .populate('testCases', 'title priority category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await TestPlan.countDocuments(query)

    return NextResponse.json({
      success: true,
      data: testPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching test plans:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test plans' },
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
      name,
      description,
      projectId,
      version,
      assignedTo,
      startDate,
      endDate,
      testCases,
      tags,
      customFields
    } = await req.json()

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
                       ['project_manager', 'project_qa_lead'].includes(role.role)
                     )

    if (!hasAccess) {
      return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
    }

    const testPlan = new TestPlan({
      name,
      description,
      organization: authResult.user.organization,
      project: projectId,
      version,
      createdBy: authResult.user.id,
      assignedTo,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      testCases: testCases || [],
      tags: tags || [],
      customFields: customFields || {}
    })

    await testPlan.save()
    await testPlan.populate('createdBy', 'firstName lastName email')
    await testPlan.populate('assignedTo', 'firstName lastName email')
    await testPlan.populate('project', 'name')
    await testPlan.populate('testCases', 'title priority category')

    return NextResponse.json({
      success: true,
      data: testPlan
    })
  } catch (error) {
    console.error('Error creating test plan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create test plan' },
      { status: 500 }
    )
  }
}
