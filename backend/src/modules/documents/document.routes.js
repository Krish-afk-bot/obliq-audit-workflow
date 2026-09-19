const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const reviewController = require('../reviews/review.controller');
const auditController = require('../audit/audit.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { enforceTenant } = require('../../middleware/tenant');
const upload = require('../../middleware/upload');

// Base middleware for all document operations
router.use(authenticate);
router.use(enforceTenant);

// Document view and upload
router.get('/:documentId', documentController.getDocumentById);
router.post('/:documentId/upload', upload.single('file'), documentController.uploadDocument);
router.get('/:documentId/file', documentController.serveDocumentFile);

// Versions
router.get('/:documentId/versions', documentController.getDocumentVersions);
router.get('/:documentId/versions/:version', documentController.getDocumentVersionByNumber);

// Audit history
router.get('/:documentId/audit-history', auditController.getDocumentAuditHistory);

// Review Workflow (strictly REVIEWER role)
router.post('/:documentId/review/start', authorize('REVIEWER'), reviewController.startReview);
router.post('/:documentId/review/approve', authorize('REVIEWER'), reviewController.approveDocument);
router.post('/:documentId/review/correction', authorize('REVIEWER'), reviewController.requestCorrection);

module.exports = router;
