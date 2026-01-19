const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: {
        success: false,
        message: 'Too many login attempts, please try again after 1 minute.',
    },
    skipSuccessfulRequests: true,
});

const taskCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 50,
    message: {
        success: false,
        message: 'Too many task creation requests, please try again later.',
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    taskCreationLimiter,
};
