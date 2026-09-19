const express = require('express');
const router = express.Router();
const auditController = require('./audit.controller');
const authenticate = require('../../middleware/authenticate');
const { enforceTenant } = require('../../middleware/tenant');

// Strictly read-only audit endpoints; no PUT/POST/DELETE!
router.use(authenticate);
router.use(enforceTenant);

router.get('/documents/:documentId', auditController.getDocumentAuditHistory);
router.get('/clients/:clientId', auditController.getClientAuditHistory);

module.exports = router;
