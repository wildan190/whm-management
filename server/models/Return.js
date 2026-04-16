import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  orderReference: { type: String, required: true },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    condition: { type: String, enum: ['GOOD', 'DAMAGED', 'REFURBISH'], default: 'GOOD' }
  }],
  status: { type: String, enum: ['RECEIVED', 'INSPECTED', 'RESTOCKED', 'REJECTED'], default: 'RECEIVED' },
  customerName: { type: String },
  notes: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Return', returnSchema);
