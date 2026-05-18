import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Connect to database
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }

  const eventType = evt.type;

  try {
    // Handle user creation
    if (eventType === 'user.created') {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
      
      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'User';
      
      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: id });
      
      if (existingUser) {
        console.log('User already exists:', id);
        return NextResponse.json({ message: 'User already exists' });
      }

      // Create new user in MongoDB
      await User.create({
        clerkId: id,
        email: email,
        name: name,
        avatar: image_url,
        role: 'user', // Default role
        phone: '',
        savedProperties: [],
        preferences: {
          propertyTypes: [],
          priceRange: { min: 0, max: 100000000 },
          locations: []
        }
      });

      console.log('User created successfully:', email);
      return NextResponse.json({ message: 'User created successfully' });
    }

    // Handle user updates
    if (eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;
      
      const email = email_addresses?.[0]?.email_address;
      const name = [first_name, last_name].filter(Boolean).join(' ') || username || 'User';
      
      // Update user in MongoDB
      const updatedUser = await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email,
          name: name,
          avatar: image_url,
        },
        { upsert: true, returnDocument: 'after' }
      );

      console.log('User updated:', email);
      return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    }

    // Handle user deletion
    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      
      if (!id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      
      await User.findOneAndDelete({ clerkId: id });
      
      console.log('User deleted:', id);
      return NextResponse.json({ message: 'User deleted successfully' });
    }

    return NextResponse.json({ message: `Event ${eventType} received` });
  } catch (error) {
    console.error(`Error processing ${eventType}:`, error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}