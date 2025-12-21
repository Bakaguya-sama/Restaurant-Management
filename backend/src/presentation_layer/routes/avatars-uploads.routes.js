const express = require('express');
const multer = require('multer');
const UploadController = require('../controllers/upload/upload.controller');

const router = express.Router();

// Create controller for user avatar images
const avatarsUploadController = new UploadController('avatars');

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
    fileSize: 5 * 1024 * 1024 // 5MB limit for avatars (smaller than dishes)
  }
});

/**
 * Upload user avatar endpoint
 * POST /api/v1/uploads/avatars
 * Content-Type: multipart/form-data
 * Field name: 'file'
 */
router.post('/', upload.single('file'), (req, res) => {
  avatarsUploadController.uploadImage(req, res);
});

/**
 * Delete user avatar endpoint
 * DELETE /api/v1/uploads/avatars/:filename
 */
router.delete('/:filename', (req, res) => {
  avatarsUploadController.deleteImage(req, res);
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        data: null,
        message: 'File size exceeds 5MB limit for avatars'
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
