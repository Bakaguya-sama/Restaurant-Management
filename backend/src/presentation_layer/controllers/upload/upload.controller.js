const UploadService = require('../../../application_layer/upload/upload.service');

/**
 * Upload Controller - Presentation Layer
 * Handles HTTP requests and responses for upload operations
 * Single Responsibility: HTTP request/response handling
 */
class UploadController {
  constructor(uploadType = 'general') {
    this.uploadType = uploadType;
    this.uploadService = new UploadService(uploadType);
  }

  /**
   * Upload image handler
   * Expects multipart/form-data with 'file' field and optional 'entityId'
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async uploadImage(req, res) {
    try {
      // Validate file exists
      if (!req.file) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'No file provided. Please upload an image file.'
        });
      }

      // Validate file is an image
      if (!req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Uploaded file must be an image (JPEG, PNG, GIF, or WebP)'
        });
      }

      // Validate file size (max 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (req.file.size > MAX_FILE_SIZE) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'File size exceeds 10MB limit'
        });
      }

      // Get entityId from request body or query
      const entityId = req.body?.entityId || req.query?.entityId || null;

      // Upload image using service
      const uploadResult = await this.uploadService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        entityId
      );

      // Return success response
      res.status(201).json({
        success: true,
        data: {
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: uploadResult.originalName,
          size: uploadResult.size,
          mimeType: uploadResult.mimeType,
          uploadedAt: uploadResult.uploadedAt
        },
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Failed to upload image'
      });
    }
  }

  /**
   * Delete image handler
   * DELETE /api/v1/uploads/:type/:filename
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteImage(req, res) {
    try {
      const { filename } = req.params;

      if (!filename) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Filename is required'
        });
      }

      const deleted = await this.uploadService.deleteImage(filename);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          data: null,
          message: 'Image file not found'
        });
      }

      res.json({
        success: true,
        data: { filename },
        message: 'Image deleted successfully'
      });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Failed to delete image'
      });
    }
  }
}

module.exports = UploadController;
