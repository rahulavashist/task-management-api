const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};

exports.validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage(
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        ),
    handleValidationErrors,
];

exports.validateLogin = [
    body('email')
        .trim()
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors,
];

exports.validateTask = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Task title is required')
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('dueDate')
        .notEmpty()
        .withMessage('Due date is required')
        .isISO8601()
        .withMessage('Due date must be a valid date')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Due date cannot be in the past');
            }
            return true;
        }),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Status must be one of: pending, in-progress, completed, cancelled'),
    handleValidationErrors,
];

exports.validateTaskUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Title cannot exceed 200 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Priority must be one of: low, medium, high, urgent'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Status must be one of: pending, in-progress, completed, cancelled'),
    handleValidationErrors,
];
