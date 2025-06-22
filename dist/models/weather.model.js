"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/weather.model.ts
const mongoose_1 = __importStar(require("mongoose"));
const WeatherSchema = new mongoose_1.default.Schema({
    lat: { type: Number, required: true }, // rounded to 2 decimal places
    lon: { type: Number, required: true }, // rounded to 2 decimal places
    data: { type: mongoose_1.Schema.Types.Mixed, required: true }, // raw OpenWeather JSON
    fetchedAt: {
        type: Date,
        default: Date.now,
        // TTL index to automatically delete documents after cache period
        expires: `${process.env.WEATHER_CACHE_MINUTES}m`,
    },
});
// Unique compound index to prevent duplicate entries for the same location
WeatherSchema.index({ lat: 1, lon: 1 }, { unique: true });
const Weather = mongoose_1.default.model('Weather', WeatherSchema);
exports.default = Weather;
