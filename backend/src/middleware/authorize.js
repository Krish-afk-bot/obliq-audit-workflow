/**
 * Middleware to restrict route access to specific roles.
 * e.g. authorize('REVIEWER') or authorize('STAFF', 'REVIEWER')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required before authorization check'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Role '${req.user.role}' is not authorized to perform this action. Required: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = authorize;
