const Task = require('../models/Task');
const User = require('../models/User');
const GenericCRUD = require('../utils/genericCRUD');
const { deleteCachePattern } = require('../utils/cache');

const taskCRUD = new GenericCRUD(Task, 'task');

// Use generic CRUD methods
exports.createTask = taskCRUD.create;
exports.getAllTasks = taskCRUD.getAll;
exports.getTask = taskCRUD.getOne;
exports.updateTask = taskCRUD.update;
exports.deleteTask = taskCRUD.delete;

exports.assignTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { assignedTo } = req.body;

        if (!assignedTo) {
            return res.status(400).json({
                success: false,
                message: 'assignedTo field is required',
            });
        }

        const user = await User.findById(assignedTo);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        const task = await Task.findByIdAndUpdate(
            id,
            { assignedTo },
            { new: true, runValidators: true }
        )
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        await deleteCachePattern('task:*');

        const io = req.app.get('io');
        if (io) {
            io.emit('task:assigned', task);
            io.to(`user-${assignedTo}`).emit('task:assigned', task);
            if (task.createdBy) {
                io.to(`user-${task.createdBy._id || task.createdBy}`).emit('task:assigned', task);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Task assigned successfully',
            data: task,
        });
    } catch (error) {
        next(error);
    }
};

exports.getMyTasks = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            status,
            priority,
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = {
            $or: [
                { createdBy: req.user._id },
                { assignedTo: req.user._id },
            ],
        };

        if (status) query.status = status;
        if (priority) query.priority = priority;

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email')
            .lean();

        res.status(200).json({
            success: true,
            data: tasks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getAssignedTasks = async (req, res, next) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
        } = req.query;

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const query = { assignedTo: { $ne: null } };

        if (req.user.role === 'user') {
            query.assignedTo = req.user._id;
        } else if (req.user.role === 'manager') {
            const teamMembers = await User.find({
                team: req.user.team,
            }).select('_id');
            const teamMemberIds = teamMembers.map((m) => m._id);
            query.assignedTo = { $in: teamMemberIds };
        }

        const total = await Task.countDocuments(query);
        const tasks = await Task.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limitNum)
            .populate('createdBy', 'username email')
            .populate('assignedTo', 'username email')
            .lean();

        res.status(200).json({
            success: true,
            data: tasks,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (error) {
        next(error);
    }
};
