const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const { canAccessTask, canAssignTasks } = require('../middleware/rbac');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');
const { taskCreationLimiter } = require('../middleware/rateLimiter');

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks with filtering and pagination
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: -createdAt
 *         description: Sort field and order
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and description
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, taskController.getAllTasks);

/**
 * @swagger
 * /api/tasks/my-tasks:
 *   get:
 *     summary: Get current user's tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in-progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: User tasks retrieved successfully
 */
router.get('/my-tasks', authenticate, taskController.getMyTasks);

/**
 * @swagger
 * /api/tasks/assigned:
 *   get:
 *     summary: Get assigned tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Assigned tasks retrieved successfully
 */
router.get('/assigned', authenticate, taskController.getAssignedTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *       404:
 *         description: Task not found
 */
router.get('/:id', authenticate, canAccessTask, taskController.getTask);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *                 example: Complete project documentation
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: Write comprehensive documentation
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-31T23:59:59Z
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *                 default: pending
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign task to
 *     responses:
 *       201:
 *         description: Task created successfully
 *       400:
 *         description: Validation error
 */
router.post(
    '/',
    authenticate,
    taskCreationLimiter,
    validateTask,
    canAssignTasks,
    taskController.createTask
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               status:
 *                 type: string
 *                 enum: [pending, in-progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       404:
 *         description: Task not found
 */
router.put(
    '/:id',
    authenticate,
    canAccessTask,
    validateTaskUpdate,
    taskController.updateTask
);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       404:
 *         description: Task not found
 */
router.delete('/:id', authenticate, canAccessTask, taskController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   post:
 *     summary: Assign task to a user (Admin/Manager only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 description: User ID to assign task to
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task or user not found
 */
router.post(
    '/:id/assign',
    authenticate,
    authorize('admin', 'manager'),
    canAssignTasks,
    taskController.assignTask
);

module.exports = router;
