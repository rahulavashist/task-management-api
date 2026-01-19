const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { sendRegistrationEmail } = require('../utils/email');
const { deleteCachePattern } = require('../utils/cache');
const { addToBlacklist } = require('../utils/tokenBlacklist');

exports.register = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists',
            });
        }

        const userData = { username, email, password };
        if (req.user && req.user.role === 'admin' && role) {
            userData.role = role;
        }

        const user = await User.create(userData);

        await sendRegistrationEmail(email, username);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login user
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.logout = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            addToBlacklist(token);

            await deleteCachePattern(`user:${req.user._id}:*`);
        }

        res.status(200).json({
            success: true,
            message: 'Logout successful',
        });
    } catch (error) {
        next(error);
    }
};

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).lean();

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (email) updates.email = email;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        await deleteCachePattern(`user:${req.user._id}:*`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user,
        });
    } catch (error) {
        next(error);
    }
};

