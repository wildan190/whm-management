import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
  abcClass: { type: String, enum: ['A', 'B', 'C'], default: 'B' },
  weight: { type: Number, default: 0 },
  dimensions: {
    length: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
