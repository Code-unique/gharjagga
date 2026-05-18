import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { Contact } from '@/lib/models/Contact';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({
        total: 0, active: 0, sold: 0, inquiries: 0
      });
    }

    await connectDB();

    // ✅ Only count THIS user's properties
    const [propertyStats, inquiryCount] = await Promise.all([
      Property.aggregate([
        { $match: { 'owner.clerkId': userId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: {
                $cond: [{ $in: ['$status', ['for-sale', 'for-rent']] }, 1, 0]
              }
            },
            sold: {
              $sum: {
                $cond: [{ $in: ['$status', ['sold', 'rented']] }, 1, 0]
              }
            }
          }
        }
      ]),
      Contact.countDocuments({
        propertyId: { 
          $in: (await Property.find({ 'owner.clerkId': userId }).select('_id')).map(p => p._id) 
        }
      })
    ]);

    return NextResponse.json({
      total: propertyStats[0]?.total || 0,
      active: propertyStats[0]?.active || 0,
      sold: propertyStats[0]?.sold || 0,
      inquiries: inquiryCount || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      total: 0, active: 0, sold: 0, inquiries: 0
    });
  }
}