import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  quantity: { type: Number, required: true, default: 0 },
}, { timestamps: true });

// Ensure unique item-location combination
stockSchema.index({ item: 1, location: 1 }, { unique: true });

export default mongoose.model('Stock', stockSchema);
