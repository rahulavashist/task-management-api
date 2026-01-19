const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const taskRoutes = require('./taskRoutes');
const analyticsRoutes = require('./analyticsRoutes');

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/analytics', analyticsRoutes);

module.exports = router;
