import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { User } from '@/lib/models/User';
import { Contact } from '@/lib/models/Contact';
import { auth } from '@clerk/nextjs/server';
import { isUserAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const admin = await isUserAdmin(userId);
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();

    // Get stats
    const [propertyCount, userCount, inquiryCount] = await Promise.all([
      Property.countDocuments(),
      User.countDocuments(),
      Contact.countDocuments(),
    ]);

    return NextResponse.json({
      properties: { total: propertyCount },
      users: { total: userCount },
      inquiries: { total: inquiryCount },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}