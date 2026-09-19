const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('./review.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const { enforceTenant } = require('../../middleware/tenant');

// All review routes require Authentication, Tenant Enforcement, and REVIEWER role
router.use(authenticate);
router.use(enforceTenant);
router.use(authorize('REVIEWER'));

router.post('/start', reviewController.startReview);
router.post('/approve', reviewController.approveDocument);
router.post('/correction', reviewController.requestCorrection);

module.exports = router;
