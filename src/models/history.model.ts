// src/models/history.model.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IHistory extends Document {
  user: mongoose.Types.ObjectId;
  weather: mongoose.Types.ObjectId;
  lat: number;
  lon: number;
  requestedAt: Date;
}

const HistorySchema: Schema<IHistory> = new mongoose.Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  weather: {
    type: Schema.Types.ObjectId,
    ref: 'Weather',
    required: true,
  },
  lat: { type: Number, required: true }, // Original query lat
  lon: { type: Number, required: true }, // Original query lon
  requestedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Compound index for efficient user history queries
HistorySchema.index({ user: 1, requestedAt: -1 });

const History: Model<IHistory> = mongoose.model<IHistory>('History', HistorySchema);
export default History;