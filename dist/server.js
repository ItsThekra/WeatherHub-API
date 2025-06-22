"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const db_1 = __importDefault(require("./config/db"));
const cors_1 = __importDefault(require("cors"));
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const windowMinutes = process.env.RATE_LIMIT_WINDOW_MINUTES ? parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) : 15;
const maxRequests = process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : 100;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: {
            code: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later.'
        }
    }
});
app.use(limiter);
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const weather_routes_1 = __importDefault(require("./routes/weather.routes"));
const history_routes_1 = __importDefault(require("./routes/history.routes"));
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/weather', weather_routes_1.default);
app.use('/api/v1/history', history_routes_1.default);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
process.on('unhandledRejection', (err) => {
    if (err && typeof err === 'object' && 'message' in err) {
        console.log(`Error: ${err.message}`);
    }
    else {
        console.log('Unhandled rejection', err);
    }
});
