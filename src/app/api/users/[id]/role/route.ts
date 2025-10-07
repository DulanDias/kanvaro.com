import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db-config'
import { authenticateUser } from '@/lib/auth-utils'
import { User } from '@/models/User'
import { CustomRole } from '@/models/CustomRole'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const authResult = await authenticateUser()
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const body = await req.json()
    const { customRoleId } = body

    // Find the user to update
    const user = await User.findOne({
      _id: params.id,
      organization: authResult.user.organization
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }

    // If customRoleId is provided, validate it exists
    if (customRoleId) {
      const customRole = await CustomRole.findOne({
        _id: customRoleId,
        organization: authResult.user.organization,
        isActive: true
      })

      if (!customRole) {
        return NextResponse.json({
          success: false,
          error: 'Custom role not found'
        }, { status: 404 })
      }

      user.customRole = customRole._id
    } else {
      // Remove custom role
      user.customRole = undefined
    }

    await user.save()

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        customRole: user.customRole
      },
      message: 'User role updated successfully'
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
