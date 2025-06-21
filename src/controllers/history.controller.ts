// src/controllers/history.controller.ts
import { Request, Response, NextFunction } from 'express';
import History from '../models/history.model';
import { Types } from 'mongoose';

// F5: /history
export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { count, skip = 0, limit = 10, sort = '-requestedAt', from, to, lat, lon } = req.query;

        // Build the query object
        const query: any = { user: (req as any).user._id };

        if (from || to) {
            query.requestedAt = {};
            if (from) query.requestedAt.$gte = new Date(from as string);
            if (to) query.requestedAt.$lte = new Date(to as string);
        }
        if (lat) query.lat = parseFloat(lat as string);
        if (lon) query.lon = parseFloat(lon as string);

        // Handle count-only request
        if (count === 'true') {
            const total = await History.countDocuments(query);
            res.status(200).json({ success: true, data: { total } });
            return;
        }

        // Handle data retrieval request
        const historyLogs = await History.find(query)
            .populate({
                path: 'weather',
                select: 'data fetchedAt -_id' // Select specific fields from weather doc
            })
            .sort(sort as string)
            .skip(parseInt(skip as string))
            .limit(parseInt(limit as string));

        // Type guard for populated weather
        function isPopulatedWeather(weather: any): weather is { data: any } {
            return weather && typeof weather === 'object' && 'data' in weather;
        }

        // Format response to match PRD example
        const formattedHistory = historyLogs.map(log => ({
            lat: log.lat,
            lon: log.lon,
            requestedAt: log.requestedAt,
            weather: isPopulatedWeather(log.weather)
                ? {
                    source: 'cache',
                    tempC: log.weather.data.main.temp,
                    description: log.weather.data.weather[0].description,
                }
                : {
                    source: 'source-unavailable',
                    tempC: undefined,
                    description: undefined,
                }
        }));

        res.status(200).json({ success: true, data: formattedHistory });
        return;
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
        return;
    }
};