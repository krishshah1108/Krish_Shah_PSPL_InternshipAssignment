const Response = {
  code: {
    success: 200,
    created: 201,
    badRequest: 400,
    unauthorized: 401,
    forbidden: 403,
    notFound: 404,
    serverError: 500,
  },

  success(message, result, res, statusCode = Response.code.success) {
    return res.status(statusCode).json({
      status: statusCode,
      message: message || 'Your request is successfully executed',
      data: result ?? null,
    });
  },

  error(message, res, statusCode = Response.code.badRequest) {
    return res.status(statusCode).json({
      status: statusCode,
      message: message || 'Something went wrong. Please try again.',
      data: null,
    });
  },

  download(res, content, filename, contentType = 'application/pdf') {
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(content);
  },
};

module.exports = Response;
