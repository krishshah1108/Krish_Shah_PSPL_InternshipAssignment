const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const started = Date.now();

  res.on('finish', () => {
    const timeMs = Date.now() - started;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${timeMs}ms`);
  });

  next();
}

module.exports = requestLogger;
