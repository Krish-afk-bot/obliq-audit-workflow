const fs = require('fs');
const path = require('path');
const Document = require('../../models/Document');
const DocumentVersion = require('../../models/DocumentVersion');
const Client = require('../../models/Client');
const { WorkflowService, DOCUMENT_STATES } = require('../../services/workflow.service');
const AuditService = require('../../services/audit.service');
const StorageService = require('../../services/storage.service');

exports.getClientDocuments = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const firmId = req.user.firmId;

    // Verify client belongs to this firm
    const client = await Client.findOne({ _id: clientId, firmId });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or access denied'
      });
    }

    const documents = await Document.find({ clientId, firmId }).sort({ createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (err) {
    next(err);
  }
};

exports.createClientDocument = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const { name } = req.body;
    const firmId = req.user.firmId;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Document name is required'
      });
    }

    const client = await Client.findOne({ _id: clientId, firmId });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or access denied'
      });
    }

    const doc = new Document({
      firmId,
      clientId,
      name: name.trim(),
      status: DOCUMENT_STATES.PENDING,
      currentVersion: 0
    });

    await doc.save();

    await AuditService.recordEvent({
      firmId,
      clientId,
      documentId: doc._id,
      actorId: userId,
      action: 'DOCUMENT_ADDED',
      entityType: 'DOCUMENT',
      entityId: doc._id,
      metadata: {
        documentName: doc.name,
        initialStatus: DOCUMENT_STATES.PENDING
      }
    });

    res.status(201).json({
      success: true,
      data: doc
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentById = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const firmId = req.user.firmId;

    const document = await Document.findOne({ _id: documentId, firmId })
      .populate('clientId', 'name pan gstin financialYear')
      .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    // Fetch versions
    const versions = await DocumentVersion.find({ documentId, firmId })
      .populate('uploadedBy', 'name email role')
      .sort({ version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        ...document,
        versions
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadDocument = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const firmId = req.user.firmId;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded. Please select a valid file to upload.'
      });
    }

    // Find document scoped to firmId
    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    // State machine check
    if (!WorkflowService.canUpload(document.status)) {
      if (document.status === DOCUMENT_STATES.APPROVED) {
        return res.status(400).json({
          success: false,
          error: 'Document is already APPROVED. Re-uploading is not permitted.'
        });
      }
      if (document.status === DOCUMENT_STATES.UNDER_REVIEW) {
        return res.status(400).json({
          success: false,
          error: 'Document is currently UNDER_REVIEW. Please wait for reviewer decision.'
        });
      }
      if (document.status === DOCUMENT_STATES.UPLOADED) {
        return res.status(400).json({
          success: false,
          error: 'Document has already been uploaded and is waiting for review.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Cannot upload document in status '${document.status}'. Allowed: [PENDING, CORRECTION_REQUIRED].`
      });
    }

    const previousStatus = document.status;
    const isReupload = previousStatus === DOCUMENT_STATES.CORRECTION_REQUIRED;
    const nextVersion = document.currentVersion + 1;

    // Create DocumentVersion
    const fileUrl = StorageService.generateFileUrl(req.file.filename, document._id);
    const docVersion = new DocumentVersion({
      documentId: document._id,
      firmId,
      clientId: document.clientId,
      version: nextVersion,
      fileUrl,
      originalFileName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      storagePath: req.file.filename,
      uploadedBy: userId,
      uploadedAt: new Date()
    });

    await docVersion.save();

    // Transition document state to UPLOADED
    document.status = DOCUMENT_STATES.UPLOADED;
    document.currentVersion = nextVersion;
    // Clear latest correction comment on successful re-upload
    if (isReupload) {
      document.latestCorrectionComment = null;
    }
    await document.save();

    // Append-only audit record
    const auditAction = isReupload ? 'DOCUMENT_REUPLOADED' : 'DOCUMENT_UPLOADED';
    await AuditService.recordEvent({
      firmId,
      clientId: document.clientId,
      documentId: document._id,
      actorId: userId,
      action: auditAction,
      entityType: 'VERSION',
      entityId: docVersion._id,
      metadata: {
        version: nextVersion,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        previousStatus,
        newStatus: DOCUMENT_STATES.UPLOADED
      }
    });

    res.status(200).json({
      success: true,
      message: isReupload ? 'Document re-uploaded successfully' : 'Document uploaded successfully',
      data: {
        document,
        version: docVersion
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentVersions = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const firmId = req.user.firmId;

    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    const versions = await DocumentVersion.find({ documentId, firmId })
      .populate('uploadedBy', 'name email role')
      .sort({ version: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: versions
    });
  } catch (err) {
    next(err);
  }
};

exports.getDocumentVersionByNumber = async (req, res, next) => {
  try {
    const { documentId, version } = req.params;
    const firmId = req.user.firmId;

    const docVersion = await DocumentVersion.findOne({
      documentId,
      firmId,
      version: parseInt(version, 10)
    }).populate('uploadedBy', 'name email role');

    if (!docVersion) {
      return res.status(404).json({
        success: false,
        error: `Version ${version} not found for this document or access denied`
      });
    }

    res.status(200).json({
      success: true,
      data: docVersion
    });
  } catch (err) {
    next(err);
  }
};

exports.serveDocumentFile = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const { file, version } = req.query;
    const firmId = req.user.firmId;

    // Verify document belongs to caller's firm
    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    let targetFilename = file;

    if (!targetFilename && version) {
      const v = await DocumentVersion.findOne({
        documentId,
        firmId,
        version: parseInt(version, 10)
      });
      if (v) targetFilename = v.storagePath;
    }

    if (!targetFilename) {
      // Pick current version file
      const latest = await DocumentVersion.findOne({
        documentId,
        firmId,
        version: document.currentVersion
      });
      if (latest) targetFilename = latest.storagePath;
    }

    if (!targetFilename) {
      return res.status(404).json({
        success: false,
        error: 'No file associated with this document yet'
      });
    }

    const filePath = StorageService.getFilePath(targetFilename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Stored file not found on disk'
      });
    }

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};
