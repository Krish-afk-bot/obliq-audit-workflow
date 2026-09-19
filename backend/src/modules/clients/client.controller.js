const Client = require('../../models/Client');
const Document = require('../../models/Document');
const AuditService = require('../../services/audit.service');

const REQUIRED_DOCUMENTS = [
  'Bank Statement',
  'Sales Register',
  'Purchase Register',
  'GST Return',
  'Expense Summary'
];

exports.getClients = async (req, res, next) => {
  try {
    const firmId = req.user.firmId;
    const clients = await Client.find({ firmId })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    // Attach document progress counts for each client
    const clientIds = clients.map((c) => c._id);
    const documents = await Document.find({ clientId: { $in: clientIds }, firmId }).lean();

    const clientDocsMap = {};
    for (const doc of documents) {
      const cId = doc.clientId.toString();
      if (!clientDocsMap[cId]) {
        clientDocsMap[cId] = { total: 0, approved: 0, pending: 0, underReview: 0, correction: 0, uploaded: 0 };
      }
      clientDocsMap[cId].total += 1;
      if (doc.status === 'APPROVED') clientDocsMap[cId].approved += 1;
      else if (doc.status === 'PENDING') clientDocsMap[cId].pending += 1;
      else if (doc.status === 'UNDER_REVIEW') clientDocsMap[cId].underReview += 1;
      else if (doc.status === 'CORRECTION_REQUIRED') clientDocsMap[cId].correction += 1;
      else if (doc.status === 'UPLOADED') clientDocsMap[cId].uploaded += 1;
    }

    const enhancedClients = clients.map((client) => ({
      ...client,
      stats: clientDocsMap[client._id.toString()] || {
        total: 0,
        approved: 0,
        pending: 0,
        underReview: 0,
        correction: 0,
        uploaded: 0
      }
    }));

    res.status(200).json({
      success: true,
      data: enhancedClients
    });
  } catch (err) {
    next(err);
  }
};

exports.getClientById = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const firmId = req.user.firmId;

    const client = await Client.findOne({ _id: clientId, firmId })
      .populate('createdBy', 'name email role')
      .lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        error: 'Client not found or belongs to another firm'
      });
    }

    const documents = await Document.find({ clientId, firmId }).sort({ createdAt: 1 }).lean();

    res.status(200).json({
      success: true,
      data: {
        ...client,
        documents
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    const { name, pan, gstin, financialYear } = req.body;
    const firmId = req.user.firmId;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Client name is required'
      });
    }

    // 1. Create client scoped strictly to authenticated firmId
    const client = new Client({
      name: name.trim(),
      pan: pan ? pan.trim().toUpperCase() : undefined,
      gstin: gstin ? gstin.trim().toUpperCase() : undefined,
      financialYear: financialYear || 'FY 2024-25',
      firmId,
      createdBy: userId
    });

    await client.save();

    // 2. Create CLIENT_CREATED audit event
    await AuditService.recordEvent({
      firmId,
      clientId: client._id,
      actorId: userId,
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: client._id,
      metadata: {
        clientName: client.name,
        pan: client.pan,
        gstin: client.gstin,
        financialYear: client.financialYear
      }
    });

    // 3. Initialize Required Documents in PENDING state
    const createdDocuments = [];
    for (const docName of REQUIRED_DOCUMENTS) {
      const doc = new Document({
        firmId,
        clientId: client._id,
        name: docName,
        status: 'PENDING',
        currentVersion: 0
      });
      await doc.save();
      createdDocuments.push(doc);

      // Record DOCUMENT_ADDED audit event
      await AuditService.recordEvent({
        firmId,
        clientId: client._id,
        documentId: doc._id,
        actorId: userId,
        action: 'DOCUMENT_ADDED',
        entityType: 'DOCUMENT',
        entityId: doc._id,
        metadata: {
          documentName: doc.name,
          initialStatus: 'PENDING'
        }
      });
    }

    res.status(201).json({
      success: true,
      data: {
        ...client.toObject(),
        documents: createdDocuments
      }
    });
  } catch (err) {
    next(err);
  }
};
