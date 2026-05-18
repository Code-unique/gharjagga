import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { auth, currentUser } from '@clerk/nextjs/server';

// GET - Public route, anyone can fetch active properties
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const query: any = { isActive: true };
    
    // Only show active properties to public
    if (searchParams.get('type')) query.type = searchParams.get('type');
    if (searchParams.get('status')) query.status = searchParams.get('status');
    if (searchParams.get('province')) query['location.province'] = searchParams.get('province');
    if (searchParams.get('district')) query['location.district'] = searchParams.get('district');
    if (searchParams.get('city')) query['location.city'] = searchParams.get('city');
    if (searchParams.get('featured') === 'true') query.featured = true;
    
    // Price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    
    // Bedrooms
    if (searchParams.get('bedrooms')) {
      query.bedrooms = { $gte: parseInt(searchParams.get('bedrooms')!) };
    }
    
    // Search
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
    
    // Owner filter - for dashboard
    const ownerId = searchParams.get('ownerId');
    if (ownerId) {
      query['owner.clerkId'] = ownerId;
    }
    
    const sortOption = searchParams.get('sort') || '-createdAt';
    const sortMap: any = {
      'newest': { createdAt: -1 },
      'oldest': { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      'popular': { views: -1 }
    };
    const sort = sortMap[sortOption] || { createdAt: -1 };
    
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
      { success: false, properties: [], pagination: { total: 0, page: 1, pages: 0, hasMore: false } },
      { status: 200 }
    );
  }
}

// POST - Create property (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to create properties' }, 
        { status: 401 }
      );
    }

    // Get user info from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'User not found' }, 
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.description || !body.price || !body.area) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    // Create property with owner info
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
        ward: body.ward ? parseInt(body.ward) : undefined,
        tole: body.tole || undefined,
      },
      features: body.features || [],
      images: body.images || [{ url: '/placeholder.svg', publicId: 'placeholder' }],
      amenities: body.amenities || [],
      nearby: body.nearby || [],
      agent: {
        name: body.agent?.name || clerkUser.fullName || 'Agent',
        phone: body.agent?.phone || clerkUser.phoneNumbers?.[0]?.phoneNumber || '',
        email: body.agent?.email || clerkUser.emailAddresses?.[0]?.emailAddress || '',
      },
      // ✅ Set owner
      owner: {
        clerkId: userId,
        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
        name: clerkUser.fullName || 'User',
      },
      featured: false,
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
      { success: false, error: 'Failed to create property' },
      { status: 500 }
    );
  }
}