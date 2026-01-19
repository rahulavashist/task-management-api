const Task = require('../models/Task');
const User = require('../models/User');

// Check if user can access a task
const canAccessTask = async (req, res, next) => {
    try {
        const taskId = req.params.id || req.body.taskId;
        if (!taskId) return next();

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found',
            });
        }

        const user = req.user;

        // Admin has full access
        if (user.role === 'admin') {
            req.task = task;
            return next();
        }

        // Manager can access tasks assigned to their team members
        if (user.role === 'manager') {
            if (task.assignedTo) {
                const assignedUser = await User.findById(task.assignedTo);
                if (assignedUser && assignedUser.team?.toString() === user.team?.toString()) {
                    req.task = task;
                    return next();
                }
            }
            if (task.createdBy.toString() === user._id.toString()) {
                req.task = task;
                return next();
            }
        }

        if (
            task.createdBy.toString() === user._id.toString() ||
            task.assignedTo?.toString() === user._id.toString()
        ) {
            req.task = task;
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Access denied. You do not have permission to access this task.',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking task access',
            error: error.message,
        });
    }
};

const canManageUsers = (req, res, next) => {
    const user = req.user;
    if (user.role === 'admin' || user.role === 'manager') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins and managers can manage users.',
    });
};

const canAssignTasks = async (req, res, next) => {
    const user = req.user;

    // Admin can assign to anyone
    if (user.role === 'admin') {
        return next();
    }

    // Manager can only assign to team members
    if (user.role === 'manager') {
        const { assignedTo } = req.body;
        if (assignedTo) {
            const assignedUser = await User.findById(assignedTo);
            if (!assignedUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User to assign not found',
                });
            }
            if (assignedUser.team?.toString() !== user.team?.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only assign tasks to members of your team.',
                });
            }
        }
        return next();
    }

    // Regular users can only assign to themselves
    if (user.role === 'user') {
        const { assignedTo } = req.body;
        if (assignedTo && assignedTo.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You can only assign tasks to yourself.',
            });
        }
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied.',
    });
};

module.exports = { canAccessTask, canManageUsers, canAssignTasks };
