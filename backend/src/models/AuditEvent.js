const mongoose = require('mongoose');

const auditEventSchema = new mongoose.Schema(
  {
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: [true, 'Firm ID is required'],
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
      index: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      index: true,
      default: null
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor ID is required']
    },
    action: {
      type: String,
      enum: [
        'CLIENT_CREATED',
        'DOCUMENT_ADDED',
        'DOCUMENT_UPLOADED',
        'DOCUMENT_REUPLOADED',
        'REVIEW_STARTED',
        'CORRECTION_REQUESTED',
        'DOCUMENT_APPROVED'
      ],
      required: [true, 'Action is required'],
      index: true
    },
    entityType: {
      type: String,
      enum: ['CLIENT', 'DOCUMENT', 'VERSION'],
      required: [true, 'Entity type is required']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required']
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: false
  }
);

// Compound indexes for performant audit queries
auditEventSchema.index({ documentId: 1, timestamp: -1 });
auditEventSchema.index({ clientId: 1, timestamp: -1 });
auditEventSchema.index({ firmId: 1, timestamp: -1 });

module.exports = mongoose.model('AuditEvent', auditEventSchema);
