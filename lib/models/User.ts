import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name: string;
  role: 'user' | 'agent' | 'admin';
  phone?: string;
  avatar?: string;
  savedProperties: mongoose.Types.ObjectId[];
  preferences: {
    propertyTypes: string[];
    priceRange: {
      min: number;
      max: number;
    };
    locations: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'agent', 'admin'], 
    default: 'user' 
  },
  phone: String,
  avatar: String,
  savedProperties: [{ type: Schema.Types.ObjectId, ref: 'Property' }],
  preferences: {
    propertyTypes: [String],
    priceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 100000000 }
    },
    locations: [String]
  }
}, {
  timestamps: true
});

export const User = (mongoose.models.User || mongoose.model<IUser>('User', UserSchema)) as Model<IUser>;