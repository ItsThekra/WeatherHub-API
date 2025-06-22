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
exports.getHistory = void 0;
const history_model_1 = __importDefault(require("../models/history.model"));
// F5: /history
const getHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { count, skip = 0, limit = 10, sort = '-requestedAt', from, to, lat, lon } = req.query;
        // Build the query object
        const query = { user: req.user._id };
        if (from || to) {
            query.requestedAt = {};
            if (from)
                query.requestedAt.$gte = new Date(from);
            if (to)
                query.requestedAt.$lte = new Date(to);
        }
        if (lat)
            query.lat = parseFloat(lat);
        if (lon)
            query.lon = parseFloat(lon);
        // Handle count-only request
        if (count === 'true') {
            const total = yield history_model_1.default.countDocuments(query);
            res.status(200).json({ success: true, data: { total } });
            return;
        }
        // Handle data retrieval request
        const historyLogs = yield history_model_1.default.find(query)
            .populate({
            path: 'weather',
            select: 'data fetchedAt -_id' // Select specific fields from weather doc
        })
            .sort(sort)
            .skip(parseInt(skip))
            .limit(parseInt(limit));
        // Type guard for populated weather
        function isPopulatedWeather(weather) {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
        return;
    }
});
exports.getHistory = getHistory;
//# sourceMappingURL=history.controller.js.map