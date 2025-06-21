// src/controllers/weather.controller.ts
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import Weather from '../models/weather.model';
import History from '../models/history.model';

interface AuthRequest extends Request {
  user?: any;
}

// F4: /weather
export const getWeather = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            res.status(400);
            throw new Error('Latitude (lat) and longitude (lon) are required.');
        }

        // Caching Rule: round to 2 decimal places (~1.11km precision)
        const roundedLat = parseFloat(lat as string).toFixed(2);
        const roundedLon = parseFloat(lon as string).toFixed(2);

        // Check for cached data (Mongoose TTL index handles expiration)
        const cachedWeather = await Weather.findOne({ lat: roundedLat, lon: roundedLon });

        let weatherDoc;
        let source = 'cache';

        if (cachedWeather) {
            weatherDoc = cachedWeather;
        } else {
            // Cache miss: call OpenWeather API
            source = 'openweather';
            const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`;

            const response = await axios.get(openWeatherUrl);

            if (response.status !== 200) {
                res.status(response.status);
                throw new Error('Failed to fetch data from OpenWeather API');
            }

            // Store new weather data
            weatherDoc = await Weather.create({
                lat: roundedLat,
                lon: roundedLon,
                data: response.data,
            });
        }

        // Log the request to History
        await History.create({
            user: req.user?._id,
            weather: weatherDoc._id,
            lat: parseFloat(lat as string),
            lon: parseFloat(lon as string),
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

    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status) {
            // Handle OpenWeather API errors
            res.status(error.response.status === 401 ? 503 : error.response.status); // Return 503 if API key is invalid
            error.message = `OpenWeather API error: ${error.response.data.message}`;
        }
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};