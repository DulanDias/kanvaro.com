import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response with cleared cookies
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully'
    })
    
    // Clear authentication cookies
    response.cookies.set('accessToken', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    response.cookies.set('refreshToken', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })
    
    return response
  } catch (error) {
    console.error('Logout failed:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
