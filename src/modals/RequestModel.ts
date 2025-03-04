import mongoose, { Document, Schema } from 'mongoose';
import { ProcessingRequest } from '../types';
 

interface RequestDocument extends ProcessingRequest, Document {}

const requestSchema = new Schema(
  {
    requestId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    totalItems: { type: Number, required: true },
    processedItems: { type: Number, default: 0 },
    csvFileName: { type: String, required: true },
    webhookUrl: { type: String },
    error: { type: String }
  },
  { timestamps: true }
);

export const RequestModel = mongoose.model<RequestDocument>('Request', requestSchema);

