const Task = require('../models/Task');
const User = require('../models/User');
const { getCache, setCache } = require('../utils/cache');


exports.getTaskStats = async (req, res, next) => {
    try {
        const { userId, teamId } = req.query;
        const cacheKey = `analytics:stats:${userId || 'all'}:${teamId || 'all'}`;


        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
            });
        }

        let query = {};

        if (req.user.role === 'user') {
            query = {
                $or: [
                    { createdBy: req.user._id },
                    { assignedTo: req.user._id },
                ],
            };
        } else if (req.user.role === 'manager') {
            const teamMembers = await User.find({
                team: req.user.team,
            }).select('_id');
            const teamMemberIds = teamMembers.map((m) => m._id);
            query = {
                $or: [
                    { createdBy: req.user._id },
                    { assignedTo: { $in: teamMemberIds } },
                ],
            };
        }

        if (userId) {
            query.$or = [
                { createdBy: userId },
                { assignedTo: userId },
            ];
        }

        const now = new Date();

        const [
            total,
            pending,
            inProgress,
            completed,
            cancelled,
            overdue,
        ] = await Promise.all([
            Task.countDocuments(query),
            Task.countDocuments({ ...query, status: 'pending' }),
            Task.countDocuments({ ...query, status: 'in-progress' }),
            Task.countDocuments({ ...query, status: 'completed' }),
            Task.countDocuments({ ...query, status: 'cancelled' }),
            Task.countDocuments({
                ...query,
                status: { $in: ['pending', 'in-progress'] },
                dueDate: { $lt: now },
            }),
        ]);

        const stats = {
            total,
            byStatus: {
                pending,
                inProgress,
                completed,
                cancelled,
            },
            overdue,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
        };

        await setCache(cacheKey, stats, 300);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserStats = async (req, res, next) => {
    try {
        const { userId } = req.params || req.query;
        const targetUserId = userId || req.user._id;

        if (
            req.user.role === 'user' &&
            targetUserId.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message: 'Access denied',
            });
        }

        const cacheKey = `analytics:user:${targetUserId}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
            });
        }

        const now = new Date();

        const [
            created,
            assigned,
            completed,
            pending,
            overdue,
        ] = await Promise.all([
            Task.countDocuments({ createdBy: targetUserId }),
            Task.countDocuments({ assignedTo: targetUserId }),
            Task.countDocuments({
                assignedTo: targetUserId,
                status: 'completed',
            }),
            Task.countDocuments({
                assignedTo: targetUserId,
                status: { $in: ['pending', 'in-progress'] },
            }),
            Task.countDocuments({
                assignedTo: targetUserId,
                status: { $in: ['pending', 'in-progress'] },
                dueDate: { $lt: now },
            }),
        ]);

        const stats = {
            created,
            assigned,
            completed,
            pending,
            overdue,
            completionRate:
                assigned > 0 ? ((completed / assigned) * 100).toFixed(2) : 0,
        };

        await setCache(cacheKey, stats, 300);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};

exports.getTeamStats = async (req, res, next) => {
    try {
        if (req.user.role === 'user') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only managers and admins can view team stats.',
            });
        }

        const { teamId } = req.query;
        const targetTeamId = teamId || req.user.team;

        if (!targetTeamId) {
            return res.status(400).json({
                success: false,
                message: 'Team ID is required',
            });
        }

        const cacheKey = `analytics:team:${targetTeamId}`;
        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json({
                success: true,
                data: cached,
            });
        }

        const teamMembers = await User.find({ team: targetTeamId }).select('_id');
        const teamMemberIds = teamMembers.map((m) => m._id);

        const now = new Date();

        const [
            total,
            completed,
            pending,
            overdue,
        ] = await Promise.all([
            Task.countDocuments({
                assignedTo: { $in: teamMemberIds },
            }),
            Task.countDocuments({
                assignedTo: { $in: teamMemberIds },
                status: 'completed',
            }),
            Task.countDocuments({
                assignedTo: { $in: teamMemberIds },
                status: { $in: ['pending', 'in-progress'] },
            }),
            Task.countDocuments({
                assignedTo: { $in: teamMemberIds },
                status: { $in: ['pending', 'in-progress'] },
                dueDate: { $lt: now },
            }),
        ]);

        const stats = {
            teamId: targetTeamId,
            teamSize: teamMembers.length,
            total,
            completed,
            pending,
            overdue,
            completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0,
        };

        await setCache(cacheKey, stats, 300);

        res.status(200).json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
};
