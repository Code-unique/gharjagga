import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { User } from '@/lib/models/User';
import { auth } from '@clerk/nextjs/server';
import cloudinary from '@/lib/cloudinary';

// Helper function to check if user can modify property
async function canModifyProperty(propertyId: string, userId: string): Promise<boolean> {
  await connectDB();
  
  // Check if user is admin
  const user = await User.findOne({ clerkId: userId }).select('role').lean();
  if (user?.role === 'admin') return true;
  
  // Check if user is the owner
  const property = await Property.findById(propertyId).select('owner').lean();
  return property?.owner?.clerkId === userId;
}

// GET - Public (increments views)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    const property = await Property.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    ).lean();
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }
}

// PUT - Update property (owner or admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // ✅ Check ownership
    const hasPermission = await canModifyProperty(id, userId);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this property' }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    const body = await request.json();
    
    // Find existing property to handle image deletion
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Delete removed images from Cloudinary
    if (body.images && existingProperty.images) {
      const newImagePublicIds = body.images.map((img: any) => img.publicId);
      const imagesToDelete = existingProperty.images.filter(
        (img: any) => !newImagePublicIds.includes(img.publicId) && img.publicId !== 'placeholder'
      );
      
      for (const img of imagesToDelete) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (err) {
          console.error('Failed to delete image:', img.publicId, err);
        }
      }
    }
    
    // Don't allow changing owner through API
    delete body.owner;
    
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { returnDocument: 'after', runValidators: true }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

// DELETE - Delete property (owner or admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // ✅ Check ownership
    const hasPermission = await canModifyProperty(id, userId);
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this property' }, 
        { status: 403 }
      );
    }
    
    await connectDB();
    
    // Soft delete - mark as inactive
    const property = await Property.findByIdAndUpdate(
      id,
      { isActive: false, status: 'sold' },
      { returnDocument: 'after' }
    );
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Property deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}