import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db-config';
import { authenticateUser } from '@/lib/auth-utils';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const authResult = await authenticateUser();
    if ('error' in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Get users from the same organization
    const users = await User.find({
      organization: authResult.user.organization,
      isActive: true
    })
    .select('_id firstName lastName email role')
    .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
