import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Property } from '@/lib/models/Property';
import { Contact } from '@/lib/models/Contact';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Return empty stats if not authenticated
    if (!userId) {
      return NextResponse.json({
        total: 0,
        active: 0,
        sold: 0,
        inquiries: 0
      });
    }

    await connectDB();

    // Get property stats
    const propertyStats = await Property.aggregate([
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
    ]);

    // Get inquiry count
    const inquiryCount = await Contact.countDocuments();

    const stats = {
      total: propertyStats[0]?.total || 0,
      active: propertyStats[0]?.active || 0,
      sold: propertyStats[0]?.sold || 0,
      inquiries: inquiryCount || 0,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({
      total: 0,
      active: 0,
      sold: 0,
      inquiries: 0
    });
  }
}