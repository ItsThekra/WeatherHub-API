"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/signup', auth_controller_1.signup);
router.post('/signin', auth_controller_1.signin);
router.post('/signout', auth_middleware_1.protect, auth_controller_1.signout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map