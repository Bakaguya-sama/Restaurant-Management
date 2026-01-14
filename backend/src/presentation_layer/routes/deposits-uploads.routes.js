const express = require('express');
const multer = require('multer');
const UploadController = require('../controllers/upload/upload.controller');

const router = express.Router();

// Create controller for deposit proof images
const depositsUploadController = new UploadController('deposits');

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for deposit proof images
  }
});

/**
 * Upload deposit proof image endpoint
 * POST /api/v1/uploads/deposits
 * Content-Type: multipart/form-data
 * Field name: 'file'
 */
router.post('/', upload.single('file'), (req, res) => {
  depositsUploadController.uploadImage(req, res);
});

/**
 * Delete deposit proof image endpoint
 * DELETE /api/v1/uploads/deposits/:filename
 */
router.delete('/:filename', (req, res) => {
  depositsUploadController.deleteImage(req, res);
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        data: null,
        message: 'File size exceeds 10MB limit'
      });
    }
    return res.status(400).json({
      success: false,
      data: null,
      message: error.message
    });
  }
  if (error) {
    return res.status(400).json({
      success: false,
      data: null,
      message: error.message
    });
  }
  next();
});

module.exports = router;
