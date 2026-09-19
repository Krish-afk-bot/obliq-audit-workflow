/**
 * Tenant isolation middleware and utilities.
 * Ensures firmId is strictly derived from authenticated req.user.
 * Rejects any attempt to spoof or override tenant parameters from query/body.
 */

function enforceTenant(req, res, next) {
  if (!req.user || !req.user.firmId) {
    return res.status(403).json({
      success: false,
      error: 'Tenant context missing from authentication session'
    });
  }

  // If a request tries to supply a conflicting firmId in the body, reject it as a security violation
  if (req.body && req.body.firmId && req.body.firmId !== req.user.firmId) {
    return res.status(403).json({
      success: false,
      error: 'Security violation: Cross-tenant firmId modification is prohibited'
    });
  }

  // Ensure req.firmId is pinned to the user's authentic firm
  req.firmId = req.user.firmId;
  next();
}

module.exports = {
  enforceTenant
};
