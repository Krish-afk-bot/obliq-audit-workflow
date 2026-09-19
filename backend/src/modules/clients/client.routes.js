const express = require('express');
const router = express.Router();
const clientController = require('./client.controller');
const documentController = require('../documents/document.controller');
const auditController = require('../audit/audit.controller');
const authenticate = require('../../middleware/authenticate');
const { enforceTenant } = require('../../middleware/tenant');

router.use(authenticate);
router.use(enforceTenant);

// Clients
router.get('/', clientController.getClients);
router.post('/', clientController.createClient);
router.get('/:clientId', clientController.getClientById);

// Sub-resources under client
router.get('/:clientId/documents', documentController.getClientDocuments);
router.post('/:clientId/documents', documentController.createClientDocument);
router.get('/:clientId/audit-history', auditController.getClientAuditHistory);

module.exports = router;
