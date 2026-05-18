import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContact extends Document {
  propertyId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>({
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'] },
  phone: { type: String, required: [true, 'Phone is required'] },
  message: { type: String, required: [true, 'Message is required'] },
  status: { 
    type: String, 
    enum: ['new', 'read', 'replied'], 
    default: 'new' 
  }
}, {
  timestamps: true
});

export const Contact = (mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema)) as Model<IContact>;