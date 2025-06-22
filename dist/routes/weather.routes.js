"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/weather.routes.ts
const express_1 = require("express");
const weather_controller_1 = require("../controllers/weather.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.protect, weather_controller_1.getWeather);
exports.default = router;
//# sourceMappingURL=weather.routes.js.map