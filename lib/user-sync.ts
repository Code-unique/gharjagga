import { connectDB } from './db';
import { User } from './models/User';

interface SyncUserParams {
  clerkId: string;
  email: string;
  name?: string;
  avatar?: string;
}

export async function syncUserFromClerk(params: SyncUserParams) {
  const { clerkId, email, name, avatar } = params;

  await connectDB();

  // Check if user exists
  let user = await User.findOne({ clerkId });

  if (user) {
    // Update existing user
    user = await User.findOneAndUpdate(
      { clerkId },
      {
        email,
        name: name || user.name,
        avatar: avatar || user.avatar,
        lastLoginAt: new Date(),
      },
      { returnDocument: 'after' }
    );
    console.log('User updated:', email);
  } else {
    // Create new user
    user = await User.create({
      clerkId,
      email,
      name: name || 'User',
      avatar: avatar || '',
      role: 'user',
      phone: '',
      savedProperties: [],
      preferences: {
        propertyTypes: [],
        priceRange: { min: 0, max: 100000000 },
        locations: [],
      },
    });
    console.log('User created:', email);
  }

  return user;
}

export async function getUserByClerkId(clerkId: string) {
  await connectDB();
  return User.findOne({ clerkId }).lean();
}

export async function isAdmin(clerkId: string): Promise<boolean> {
  await connectDB();
  const user = await User.findOne({ clerkId }).select('role').lean();
  return user?.role === 'admin';
}