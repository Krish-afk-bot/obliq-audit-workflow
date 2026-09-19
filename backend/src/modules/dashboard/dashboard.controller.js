const Client = require('../../models/Client');
const Document = require('../../models/Document');
const AuditService = require('../../services/audit.service');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const firmId = req.user.firmId;

    const [totalClients, totalDocs, pendingDocs, uploadedDocs, underReviewDocs, correctionDocs, approvedDocs, recentActivity] =
      await Promise.all([
        Client.countDocuments({ firmId }),
        Document.countDocuments({ firmId }),
        Document.countDocuments({ firmId, status: 'PENDING' }),
        Document.countDocuments({ firmId, status: 'UPLOADED' }),
        Document.countDocuments({ firmId, status: 'UNDER_REVIEW' }),
        Document.countDocuments({ firmId, status: 'CORRECTION_REQUIRED' }),
        Document.countDocuments({ firmId, status: 'APPROVED' }),
        AuditService.getRecentFirmActivity(firmId, 10)
      ]);

    res.status(200).json({
      success: true,
      data: {
        totalClients,
        totalDocs,
        pendingDocs,
        uploadedDocs,
        underReviewDocs,
        correctionDocs,
        approvedDocs,
        recentActivity
      }
    });
  } catch (err) {
    next(err);
  }
};
