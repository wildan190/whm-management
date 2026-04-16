import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., A-01-01
  description: { type: String },
  distanceFromDock: { type: Number, default: 0 },
  maxWeight: { type: Number, default: 0 },
  type: { type: String, enum: ['PICKING', 'BULK', 'RECEIVING', 'CROSSDOCK'], default: 'PICKING' }
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);
