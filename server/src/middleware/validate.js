const { validationResult } = require('express-validator');
const Response = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return Response.error(errors.array()[0].msg, res);
  }
  return next();
}

module.exports = validate;
