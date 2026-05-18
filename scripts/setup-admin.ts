import { connectDB } from '../lib/db';
import { User } from '../lib/models/User';

async function setupAdmin() {
  const adminEmail = process.argv[2]; // Get email from command line
  
  if (!adminEmail) {
    console.error('Please provide an admin email');
    console.log('Usage: npx tsx scripts/setup-admin.ts admin@example.com');
    process.exit(1);
  }

  try {
    await connectDB();
    
    const user = await User.findOneAndUpdate(
      { email: adminEmail },
      { role: 'admin' },
      { returnDocument: 'after' }
    );

    if (user) {
      console.log(`✅ User ${adminEmail} is now an ADMIN`);
      console.log('User details:', {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      console.log(`❌ User with email ${adminEmail} not found in database`);
      console.log('Make sure the user has signed in at least once first.');
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
  } finally {
    process.exit(0);
  }
}

setupAdmin();