const express = require('express');
const authRoutes = require('./auth.routes');
const materialRoutes = require('./material.routes');
const movementRoutes = require('./movement.routes');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/materials', authenticate, materialRoutes);
router.use('/movements', authenticate, movementRoutes);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

module.exports = router;
