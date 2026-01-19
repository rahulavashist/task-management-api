const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/analytics/stats:
 *   get:
 *     summary: Get task statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter stats by user ID
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Filter stats by team ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     byStatus:
 *                       type: object
 *                     overdue:
 *                       type: integer
 *                     completionRate:
 *                       type: string
 */
router.get('/stats', authenticate, analyticsController.getTaskStats);

/**
 * @swagger
 * /api/analytics/user/{userId}:
 *   get:
 *     summary: Get user statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       403:
 *         description: Access denied
 */
router.get('/user/:userId', authenticate, analyticsController.getUserStats);

/**
 * @swagger
 * /api/analytics/user:
 *   get:
 *     summary: Get current user statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 */
router.get('/user', authenticate, analyticsController.getUserStats);

/**
 * @swagger
 * /api/analytics/team:
 *   get:
 *     summary: Get team statistics (Manager/Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: Team ID (defaults to user's team)
 *     responses:
 *       200:
 *         description: Team statistics retrieved successfully
 *       403:
 *         description: Access denied - Only managers and admins can view team stats
 */
router.get('/team', authenticate, authorize('admin', 'manager'), analyticsController.getTeamStats);

module.exports = router;
