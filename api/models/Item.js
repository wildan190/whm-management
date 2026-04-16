import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  category: { type: String },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);
