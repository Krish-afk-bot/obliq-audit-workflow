const AuditService = require('../../services/audit.service');
const Document = require('../../models/Document');
const Client = require('../../models/Client');

exports.getDocumentAuditHistory = async (req, res, next) => {
  try {
    const { documentId } = req.params;
    const firmId = req.user.firmId;

    // Verify document exists and belongs to this firm
    const document = await Document.findOne({ _id: documentId, firmId });
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or access denied'
      });
    }

    const history = await AuditService.getDocumentAuditHistory(documentId, firmId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientAuditHistory = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const firmId = req.user.firmId;

    const client = await Client.findOne({ _id: clientId, firmId });
    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or access denied'
      });
    }

    const history = await AuditService.getClientAuditHistory(clientId, firmId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    next(err);
  }
};
