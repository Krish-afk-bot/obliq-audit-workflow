const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Document ID is required'],
      index: true
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: [true, 'Firm ID is required'],
      index: true
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required']
    },
    version: {
      type: Number,
      required: [true, 'Version number is required']
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required']
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required']
    },
    mimeType: {
      type: String,
      default: 'application/octet-stream'
    },
    fileSize: {
      type: Number,
      default: 0
    },
    storagePath: {
      type: String,
      required: [true, 'Storage path is required']
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader user is required']
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: false }
);

documentVersionSchema.index({ documentId: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
