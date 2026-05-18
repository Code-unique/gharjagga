import { auth, currentUser } from '@clerk/nextjs/server';
import { connectDB } from './db';
import { User } from './models/User';

export async function getCurrentUserRole(): Promise<string | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) return null;

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).select('role').lean();
    
    return user?.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}

export async function requireAdmin() {
  const role = await getCurrentUserRole();
  
  if (role !== 'admin') {
    throw new Error('Admin access required');
  }
  
  return true;
}

export async function isUserAdmin(clerkId: string): Promise<boolean> {
  try {
    await connectDB();
    const user = await User.findOne({ clerkId }).select('role').lean();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}