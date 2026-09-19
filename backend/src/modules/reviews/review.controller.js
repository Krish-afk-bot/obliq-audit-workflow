const Document = require('../../models/Document');
const { WorkflowService, DOCUMENT_STATES } = require('../../services/workflow.service');
const AuditService = require('../../services/audit.service');

exports.startReview = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const firmId = req.user.firmId;
    const userId = req.user.id;

    // Find document scoped to firmId
    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    // Validate workflow transition
    WorkflowService.validateTransition(
      document.status,
      DOCUMENT_STATES.UNDER_REVIEW,
      'Start Review'
    );

    const previousStatus = document.status;
    document.status = DOCUMENT_STATES.UNDER_REVIEW;
    await document.save();

    // Create append-only audit event
    await AuditService.recordEvent({
      firmId,
      clientId: document.clientId,
      documentId: document._id,
      actorId: userId,
      action: 'REVIEW_STARTED',
      entityType: 'DOCUMENT',
      entityId: document._id,
      metadata: {
        version: document.currentVersion,
        previousStatus,
        newStatus: DOCUMENT_STATES.UNDER_REVIEW
      }
    });

    res.status(200).json({
      success: true,
      message: 'Review started successfully',
      data: document
    });
  } catch (err) {
    next(err);
  }
};

exports.approveDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { note } = req.body;
    const firmId = req.user.firmId;
    const userId = req.user.id;

    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    // Validate workflow transition
    WorkflowService.validateTransition(
      document.status,
      DOCUMENT_STATES.APPROVED,
      'Approve Document'
    );

    const previousStatus = document.status;
    document.status = DOCUMENT_STATES.APPROVED;
    document.latestCorrectionComment = null;
    await document.save();

    // Create append-only audit event
    await AuditService.recordEvent({
      firmId,
      clientId: document.clientId,
      documentId: document._id,
      actorId: userId,
      action: 'DOCUMENT_APPROVED',
      entityType: 'DOCUMENT',
      entityId: document._id,
      metadata: {
        version: document.currentVersion,
        approvalNote: note ? note.trim() : 'Document verified and approved',
        previousStatus,
        newStatus: DOCUMENT_STATES.APPROVED
      }
    });

    res.status(200).json({
      success: true,
      message: 'Document approved successfully',
      data: document
    });
  } catch (err) {
    next(err);
  }
};

exports.requestCorrection = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { comment, reason } = req.body;
    const correctionComment = (comment || reason || '').trim();
    const firmId = req.user.firmId;
    const userId = req.user.id;

    // Comment is mandatory for corrections
    if (!correctionComment) {
      return res.status(400).json({
        success: false,
        error: 'Correction comment/reason is mandatory when requesting corrections'
      });
    }

    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    // Validate workflow transition
    WorkflowService.validateTransition(
      document.status,
      DOCUMENT_STATES.CORRECTION_REQUIRED,
      'Request Correction'
    );

    const previousStatus = document.status;
    document.status = DOCUMENT_STATES.CORRECTION_REQUIRED;
    document.latestCorrectionComment = correctionComment;
    await document.save();

    // Create append-only audit event
    await AuditService.recordEvent({
      firmId,
      clientId: document.clientId,
      documentId: document._id,
      actorId: userId,
      action: 'CORRECTION_REQUESTED',
      entityType: 'DOCUMENT',
      entityId: document._id,
      metadata: {
        version: document.currentVersion,
        reason: correctionComment,
        previousStatus,
        newStatus: DOCUMENT_STATES.CORRECTION_REQUIRED
      }
    });

    res.status(200).json({
      success: true,
      message: 'Correction requested successfully',
      data: document
    });
  } catch (err) {
    next(err);
  }
};
