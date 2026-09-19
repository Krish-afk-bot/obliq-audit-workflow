const AuditEvent = require('../models/AuditEvent');

class AuditService {
  /**
   * Append-only event logging
   */
  static async recordEvent({
    firmId,
    clientId,
    documentId = null,
    actorId,
    action,
    entityType,
    entityId,
    metadata = {}
  }) {
    if (!firmId || !actorId || !action || !entityType || !entityId) {
      throw new Error('Missing required fields for audit event recording');
    }

    const event = new AuditEvent({
      firmId,
      clientId,
      documentId,
      actorId,
      action,
      entityType,
      entityId,
      timestamp: new Date(),
      metadata
    });

    return await event.save();
  }

  /**
   * Retrieve audit history for a document, strictly scoped to firmId
   */
  static async getDocumentAuditHistory(documentId, firmId) {
    return await AuditEvent.find({ documentId, firmId })
      .populate('actorId', 'name email role')
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Retrieve audit history for a client, strictly scoped to firmId
   */
  static async getClientAuditHistory(clientId, firmId) {
    return await AuditEvent.find({ clientId, firmId })
      .populate('actorId', 'name email role')
      .populate('documentId', 'name status currentVersion')
      .sort({ timestamp: -1 })
      .lean();
  }

  /**
   * Retrieve recent firm audit events (for dashboard activity feed)
   */
  static async getRecentFirmActivity(firmId, limit = 15) {
    return await AuditEvent.find({ firmId })
      .populate('actorId', 'name email role')
      .populate('clientId', 'name')
      .populate('documentId', 'name status')
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
}

module.exports = AuditService;
