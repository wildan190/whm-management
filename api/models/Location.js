import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., A-01-01
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('Location', locationSchema);
