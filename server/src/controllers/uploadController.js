const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../utils/asyncHandler');
const Response = require('../utils/response');

const uploadSignature = asyncHandler(async (req, res) => {
  if (!req.file) {
    return Response.error('Signature image is required.', res);
  }

  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return Response.error(
      'Cloudinary is not configured. Set CLOUDINARY_* variables in .env.',
      res,
      Response.code.serverError
    );
  }

  const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'expense-vouchers/signatures',
    resource_type: 'image',
  });

  return Response.success(
    'Signature uploaded successfully.',
    { signatureUrl: result.secure_url },
    res,
    Response.code.created
  );
});

module.exports = { uploadSignature };
