"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeather = void 0;
// src/controllers/weather.controller.ts
const axios_1 = __importDefault(require("axios"));
const weather_model_1 = __importDefault(require("../models/weather.model"));
const history_model_1 = __importDefault(require("../models/history.model"));
// F4: /weather
const getWeather = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            res.status(400);
            throw new Error('Latitude (lat) and longitude (lon) are required.');
        }
        // Caching Rule: round to 2 decimal places (~1.11km precision)
        const roundedLat = parseFloat(lat).toFixed(2);
        const roundedLon = parseFloat(lon).toFixed(2);
        // Check for cached data (Mongoose TTL index handles expiration)
        const cachedWeather = yield weather_model_1.default.findOne({ lat: roundedLat, lon: roundedLon });
        let weatherDoc;
        let source = 'cache';
        if (cachedWeather) {
            weatherDoc = cachedWeather;
        }
        else {
            // Cache miss: call OpenWeather API
            source = 'openweather';
            const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;
            const response = yield axios_1.default.get(openWeatherUrl);
            if (response.status !== 200) {
                res.status(response.status);
                throw new Error('Failed to fetch data from OpenWeather API');
            }
            // Store new weather data
            weatherDoc = yield weather_model_1.default.create({
                lat: roundedLat,
                lon: roundedLon,
                data: response.data,
            });
        }
        // Log the request to History
        yield history_model_1.default.create({
            user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            weather: weatherDoc._id,
            lat: parseFloat(lat),
            lon: parseFloat(lon),
        });
        // Format the response as per PRD
        const formattedResponse = {
            source: source,
            coordinates: { lat: weatherDoc.data.coord.lat, lon: weatherDoc.data.coord.lon },
            tempC: weatherDoc.data.main.temp,
            humidity: weatherDoc.data.main.humidity,
            description: weatherDoc.data.weather[0].description,
            fetchedAt: weatherDoc.fetchedAt,
        };
        res.status(200).json({ success: true, data: formattedResponse });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status)) {
            // Handle OpenWeather API errors
            res.status(error.response.status === 401 ? 503 : error.response.status); // Return 503 if API key is invalid
            error.message = `OpenWeather API error: ${error.response.data.message}`;
        }
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});
exports.getWeather = getWeather;
