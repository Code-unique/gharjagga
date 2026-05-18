import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { auth } from '@clerk/nextjs/server';
import cloudinary from '@/lib/cloudinary';

// GET single property
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

// PUT - Update property
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    
    // Find existing property to compare images
    const existingProperty = await Property.findById(id);
    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    // Delete removed images from Cloudinary
    if (body.images && existingProperty.images) {
      const newImagePublicIds = body.images.map((img: any) => img.publicId);
      const imagesToDelete = existingProperty.images.filter(
        (img: any) => !newImagePublicIds.includes(img.publicId)
      );
      
      // Delete from Cloudinary
      for (const img of imagesToDelete) {
        if (img.publicId && img.publicId !== 'placeholder') {
          try {
            await cloudinary.uploader.destroy(img.publicId);
          } catch (err) {
            console.error('Failed to delete image:', img.publicId, err);
          }
        }
      }
    }
    
    // Update property
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

// DELETE - Soft delete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await connectDB();
    const { id } = await params;
    
    const property = await Property.findByIdAndUpdate(
      id,
      { isActive: false, status: 'sold' },
      { returnDocument: 'after' }
    );
    
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}