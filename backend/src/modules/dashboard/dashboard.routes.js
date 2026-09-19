const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const authenticate = require('../../middleware/authenticate');
const { enforceTenant } = require('../../middleware/tenant');

router.use(authenticate);
router.use(enforceTenant);

router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;
