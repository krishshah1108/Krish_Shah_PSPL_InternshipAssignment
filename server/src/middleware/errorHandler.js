const logger = require('../utils/logger');
const Response = require('../utils/response');

function errorHandler(err, req, res, _next) {
  logger.error(err.message || 'Unhandled error', {
    path: req.originalUrl,
    method: req.method,
    stack: err.stack,
  });

  if (err.name === 'MulterError') {
    return Response.error(err.message, res);
  }

  if (err.status) {
    return Response.error(err.message, res, err.status);
  }

  return Response.error(
    'Something went wrong. Please try again.',
    res,
    Response.code.serverError
  );
}

module.exports = errorHandler;
