const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
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
    name: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'CORRECTION_REQUIRED'],
      default: 'PENDING',
      index: true
    },
    currentVersion: {
      type: Number,
      default: 0
    },
    latestCorrectionComment: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

documentSchema.index({ firmId: 1, clientId: 1 });

module.exports = mongoose.model('Document', documentSchema);
