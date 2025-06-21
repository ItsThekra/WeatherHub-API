// src/middleware/error.handler.ts
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = res.statusCode ? res.statusCode : 500;
    
    // Check for Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: 'Resource not found.'
            }
        });
        return;
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'Something went wrong on the server.'
        }
    });
};

export default errorHandler;