const jwt = require('jsonwebtoken');
const Response = require('../utils/response');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return Response.error('Authentication required.', res, Response.code.unauthorized);
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.userId,
      role: payload.role,
      name: payload.name,
    };
    return next();
  } catch {
    return Response.error('Invalid or expired token.', res, Response.code.unauthorized);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return Response.error(
        'You do not have permission for this action.',
        res,
        Response.code.forbidden
      );
    }
    return next();
  };
}

module.exports = { authenticate, authorize };
