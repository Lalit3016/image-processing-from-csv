import mongoose, { Document, Schema } from 'mongoose';
import { ProductData } from '../types';

interface ProductDocument extends ProductData, Document {
  requestId: string;
}

const productSchema = new Schema(
  {
    requestId: { type: String, required: true, index: true },
    serialNumber: { type: Number, required: true },
    productName: { type: String, required: true },
    inputImageUrls: [{ type: String, required: true }],
    outputImageUrls: [{ type: String }],
    processed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound index for faster queries
productSchema.index({ requestId: 1, productName: 1 });

export const ProductModel = mongoose.model<ProductDocument>('Product', productSchema);

