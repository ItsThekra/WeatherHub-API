// src/models/weather.model.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWeather extends Document {
  lat: number;
  lon: number;
  data: any;
  fetchedAt: Date;
}

const WeatherSchema: Schema<IWeather> = new mongoose.Schema({
  lat: { type: Number, required: true }, // rounded to 2 decimal places
  lon: { type: Number, required: true }, // rounded to 2 decimal places
  data: { type: Schema.Types.Mixed, required: true }, // raw OpenWeather JSON
  fetchedAt: {
    type: Date,
    default: Date.now,
    // TTL index to automatically delete documents after cache period
    expires: `${process.env.WEATHER_CACHE_MINUTES}m`,
  },
});

// Unique compound index to prevent duplicate entries for the same location
WeatherSchema.index({ lat: 1, lon: 1 }, { unique: true });

const Weather: Model<IWeather> = mongoose.model<IWeather>('Weather', WeatherSchema);
export default Weather;