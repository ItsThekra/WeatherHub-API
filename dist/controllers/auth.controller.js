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
exports.signout = exports.signin = exports.signup = void 0;
// src/controllers/auth.controller.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Generate JWT
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return jsonwebtoken_1.default.sign({ id }, secret, expiresIn ? { expiresIn: expiresIn } : undefined);
};
// F1: /auth/signup
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }
        const userExists = yield user_model_1.default.findOne({ email });
        if (userExists) {
            res.status(409); // Conflict
            throw new Error('User already exists');
        }
        const user = yield user_model_1.default.create({ email, passwordHash: password });
        if (user) {
            res.status(201).json({
                success: true,
                data: { token: generateToken(String(user._id)) },
            });
        }
        else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});
exports.signup = signup;
// F2: /auth/signin
const signin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (user && (yield user.comparePassword(password))) {
            res.status(200).json({
                success: true,
                data: { token: generateToken(String(user._id)) },
            });
        }
        else {
            res.status(401); // Unauthorized
            throw new Error('Invalid email or password');
        }
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});
exports.signin = signin;
// F3: /auth/signout
// Based on the PRD, we rely on short JWT TTL. A blacklist is more complex.
// If a blacklist were implemented, this is where the token would be added to it.
const signout = (req, res) => {
    // With JWT, true sign-out is handled client-side by deleting the token.
    // The server can't force a token to expire. A blacklist is the server-side solution.
    // For this project, we confirm the action and rely on the token's expiration.
    res.status(200).json({
        success: true,
        data: { message: 'Signed out successfully. Please discard the token.' }
    });
};
exports.signout = signout;
//# sourceMappingURL=auth.controller.js.map