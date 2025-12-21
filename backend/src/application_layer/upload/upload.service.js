const UploadRepository = require('../../infrastructure_layer/upload/upload.repository');
const UploadEntity = require('../../domain_layer/upload/upload.entity');

/**
 * Upload Service - Application Layer
 * Business logic for file uploads with support for different upload types
 * Single Responsibility: Orchestrate upload operations
 */
class UploadService {
  constructor(uploadType = 'general') {
    this.uploadType = uploadType;
    this.uploadRepository = new UploadRepository(uploadType);
  }

  /**
   * Upload image file
   * @param {Buffer} fileBuffer - File content
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type
   * @param {string} entityId - Entity ID (dish_id or user_id, optional)
   * @returns {Promise<Object>} Upload response with URL
   */
  async uploadImage(fileBuffer, originalName, mimeType, entityId = null) {
    try {
      // Save file to disk using repository
      const fileMetadata = await this.uploadRepository.saveImage(
        fileBuffer,
        originalName,
        mimeType,
        entityId
      );

      // Create upload entity for validation
      const uploadEntity = new UploadEntity({
        filename: fileMetadata.filename,
        originalName: fileMetadata.originalName,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.size,
        uploadPath: fileMetadata.uploadPath,
        url: fileMetadata.relativePath,
        uploadedAt: fileMetadata.uploadedAt
      });

      // Validate entity
      const validation = uploadEntity.validate();
      if (!validation.isValid) {
        // Cleanup file if validation fails
        await this.uploadRepository.deleteImage(fileMetadata.filename);
        throw new Error(validation.errors.join(', '));
      }

      // Return success response
      return {
        filename: fileMetadata.filename,
        originalName: fileMetadata.originalName,
        size: fileMetadata.size,
        mimeType: fileMetadata.mimeType,
        url: fileMetadata.relativePath,
        uploadedAt: fileMetadata.uploadedAt
      };
    } catch (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  /**
   * Delete uploaded image
   * @param {string} filename - Filename to delete
   * @returns {Promise<boolean>}
   */
  async deleteImage(filename) {
    try {
      return await this.uploadRepository.deleteImage(filename);
    } catch (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Get image file path
   * @param {string} filename - Filename
   * @returns {string} Full file path
   */
  getImagePath(filename) {
    return this.uploadRepository.getImagePath(filename);
  }

  /**
   * Get upload type directory
   * @returns {string} Upload type directory path
   */
  getTypeDir() {
    return this.uploadRepository.getTypeDir();
  }
}

module.exports = UploadService;
