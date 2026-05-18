import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { auth } from '@clerk/nextjs/server';

// GET - Public route, anyone can fetch properties
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const query: any = { isActive: true };
    
    // Build query based on search params
    if (searchParams.get('type')) {
      query.type = searchParams.get('type');
    }
    if (searchParams.get('status')) {
      query.status = searchParams.get('status');
    }
    if (searchParams.get('province')) {
      query['location.province'] = searchParams.get('province');
    }
    if (searchParams.get('district')) {
      query['location.district'] = searchParams.get('district');
    }
    if (searchParams.get('city')) {
      query['location.city'] = searchParams.get('city');
    }
    if (searchParams.get('featured') === 'true') {
      query.featured = true;
    }
    
    // Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Bedrooms filter
    if (searchParams.get('bedrooms')) {
      query.bedrooms = { $gte: parseInt(searchParams.get('bedrooms')!) };
    }
    
    // Search text
    const search = searchParams.get('search');
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { 'location.province': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Sort options
    const sortOption = searchParams.get('sort') || '-createdAt';
    const sortMap: any = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'popular': { views: -1 }
    };
    const sort = sortMap[sortOption] || { createdAt: -1 };
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;
    
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .select('-__v')
        .lean(),
      Property.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      properties,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { 
        success: false,
        properties: [], 
        pagination: { total: 0, page: 1, pages: 0, hasMore: false } 
      },
      { status: 200 }
    );
  }
}

// POST - Protected route, requires authentication
export async function POST(request: NextRequest) {
  try {
    // Get auth session
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please sign in to create properties' }, 
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.area) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, price, area' }, 
        { status: 400 }
      );
    }

    // Create property
    const property = await Property.create({
      title: body.title,
      description: body.description,
      type: body.type || 'house',
      status: body.status || 'for-sale',
      price: parseInt(body.price),
      area: parseInt(body.area),
      areaUnit: body.areaUnit || 'sqft',
      bedrooms: parseInt(body.bedrooms || '0'),
      bathrooms: parseInt(body.bathrooms || '0'),
      floors: parseInt(body.floors || '0'),
      location: {
        province: body.province || body.location?.province || 'Bagmati Province',
        district: body.district || body.location?.district || 'Kathmandu',
        city: body.city || body.location?.city || 'Kathmandu',
        ward: body.ward ? parseInt(body.ward) : body.location?.ward || undefined,
        tole: body.tole || body.location?.tole || undefined,
      },
      features: body.features || [],
      images: body.images || [{ url: '/placeholder.jpg', publicId: 'placeholder' }],
      amenities: body.amenities || [],
      nearby: body.nearby || [],
      agent: {
        name: body.agent?.name || 'Nepal Real Estate',
        phone: body.agent?.phone || '01-4XXXXXX',
        email: body.agent?.email || 'info@nepalrealestate.com',
      },
      featured: body.featured || false,
      views: 0,
      listedDate: new Date(),
      isActive: true,
    });
    
    return NextResponse.json(
      { success: true, message: 'Property created successfully', property }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create property. Please try again.' },
      { status: 500 }
    );
  }
}

// PATCH - Update property (protected)
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' }, 
        { status: 400 }
      );
    }

    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Property updated successfully', property }
    );
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete property (protected)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required' }, 
        { status: 400 }
      );
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Property deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}