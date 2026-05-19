import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { User } from '@/lib/models/User';
import { auth } from '@clerk/nextjs/server';

// Helper to check admin
async function requireAdmin(userId: string) {
  await connectDB();
  const user = await User.findOne({ clerkId: userId }).select('role').lean();
  return user?.role === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const isAdmin = await requireAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const showDeleted = searchParams.get('showDeleted') === 'true';

    // ✅ Build query - always exclude soft-deleted by default
    const query: any = {};
    
    // Only show deleted if explicitly requested
    if (!showDeleted) {
      query.isActive = true; // ✅ Only show active properties
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
      ];
    }

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Property.countDocuments(query)
    ]);

    // Get stats separately (including deleted for counts)
    const totalAll = await Property.countDocuments({});
    const totalActive = await Property.countDocuments({ isActive: true });
    const totalDeleted = await Property.countDocuments({ isActive: false });

    return NextResponse.json({
      properties,
      stats: {
        total: totalAll,
        active: totalActive,
        deleted: totalDeleted,
      },
      pagination: { 
        total, 
        page, 
        pages: Math.ceil(total / limit) 
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ 
      properties: [], 
      stats: { total: 0, active: 0, deleted: 0 },
      pagination: { total: 0, page: 1, pages: 0 } 
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Admin check
    const isAdmin = await requireAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await connectDB();
    const { propertyIds, action } = await request.json();

    if (!propertyIds?.length) {
      return NextResponse.json({ error: 'No properties selected' }, { status: 400 });
    }

    let updateData = {};
    let successMessage = '';

    switch (action) {
      case 'delete':
        // ✅ Soft delete
        updateData = { isActive: false, status: 'sold' };
        successMessage = `${propertyIds.length} properties deleted`;
        break;
      case 'restore':
        // ✅ Restore deleted
        updateData = { isActive: true, status: 'for-sale' };
        successMessage = `${propertyIds.length} properties restored`;
        break;
      case 'feature':
        updateData = { featured: true };
        successMessage = `${propertyIds.length} properties featured`;
        break;
      case 'unfeature':
        updateData = { featured: false };
        successMessage = `${propertyIds.length} properties unfeatured`;
        break;
      case 'permanent-delete':
        // ✅ Hard delete
        await Property.deleteMany({ _id: { $in: propertyIds } });
        return NextResponse.json({ 
          success: true, 
          message: `${propertyIds.length} properties permanently deleted` 
        });
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await Property.updateMany({ _id: { $in: propertyIds } }, updateData);

    return NextResponse.json({ success: true, message: successMessage });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}