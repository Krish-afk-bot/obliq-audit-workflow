const express = require('express');
const router = express.Router();

const authRoutes = require('../modules/auth/auth.routes');
const clientRoutes = require('../modules/clients/client.routes');
const documentRoutes = require('../modules/documents/document.routes');
const auditRoutes = require('../modules/audit/audit.routes');
const dashboardRoutes = require('../modules/dashboard/dashboard.routes');

router.use('/auth', authRoutes);
router.use('/clients', clientRoutes);
router.use('/documents', documentRoutes);
router.use('/audit', auditRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'OBLIQ-in Audit Review System API'
  });
});

module.exports = router;
