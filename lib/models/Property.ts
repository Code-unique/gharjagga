import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  description: string;
  type: 'house' | 'apartment' | 'land' | 'commercial' | 'villa';
  status: 'for-sale' | 'for-rent' | 'sold' | 'rented';
  price: number;
  area: number;
  areaUnit: 'sqft' | 'aana' | 'dhur' | 'ropani' | 'bigha' | 'kattha';
  bedrooms: number;
  bathrooms: number;
  floors: number;
  location: {
    province: string;
    district: string;
    city: string;
    ward?: number;
    tole?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  features: string[];
  images: Array<{
    url: string;
    publicId: string;
  }>;
  amenities: Array<{
    name: string;
    icon: string;
  }>;
  nearby: Array<{
    name: string;
    distance: string;
    type: string;
  }>;
  agent: {
    name: string;
    phone: string;
    email: string;
    photo?: string;
  };
  featured: boolean;
  views: number;
  listedDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  type: { 
    type: String, 
    enum: ['house', 'apartment', 'land', 'commercial', 'villa'],
    required: true 
  },
  status: {
    type: String,
    enum: ['for-sale', 'for-rent', 'sold', 'rented'],
    default: 'for-sale'
  },
  price: { type: Number, required: true },
  area: { type: Number, required: true },
  areaUnit: { 
    type: String, 
    enum: ['sqft', 'aana', 'dhur', 'ropani', 'bigha', 'kattha'], 
    default: 'sqft' 
  },
  bedrooms: { type: Number, default: 0 },
  bathrooms: { type: Number, default: 0 },
  floors: { type: Number, default: 0 },
  location: {
    province: { type: String, required: true },
    district: { type: String, required: true },
    city: { type: String, required: true },
    ward: Number,
    tole: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  features: [{ type: String }],
  images: [{ 
    url: String,
    publicId: String
  }],
  amenities: [{
    name: String,
    icon: String
  }],
  nearby: [{
    name: String,
    distance: String,
    type: String
  }],
  agent: {
    name: { type: String, default: 'Nepal Real Estate' },
    phone: { type: String, default: '01-4XXXXXX' },
    email: { type: String, default: 'info@nepalrealestate.com' },
    photo: String
  },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  listedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Index for better search performance
PropertySchema.index({ 'location.province': 1, 'location.district': 1, 'location.city': 1 });
PropertySchema.index({ type: 1, status: 1 });
PropertySchema.index({ price: 1 });
PropertySchema.index({ featured: 1 });
PropertySchema.index({ createdAt: -1 });

export const Property = (mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema)) as Model<IProperty>;