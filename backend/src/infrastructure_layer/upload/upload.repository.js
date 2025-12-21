const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Upload Repository - Infrastructure Layer
 * Handles file system operations and storage logic for different upload types
 * Single Responsibility: File storage persistence
 */
class UploadRepository {
  constructor(uploadType = 'general') {
    this.uploadType = uploadType; // 'dishes', 'avatars', or 'general'
    this.uploadsDir = path.join(__dirname, '../../..', 'uploads');
    this.typeDir = path.join(this.uploadsDir, uploadType);
    
    // Ensure directories exist
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure upload directories exist
   * @private
   */
  ensureDirectoriesExist() {
    [this.uploadsDir, this.typeDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * Generate unique filename based on entity ID
   * @private
   * @param {string} originalName - Original filename
   * @param {string} entityId - Entity ID (dish_id or user_id)
   * @returns {string} Unique filename
   */
  generateUniqueFilename(originalName, entityId) {
    const ext = path.extname(originalName);
    
    if (entityId) {
      return `${entityId}${ext}`;
    }
    
    const timestamp = Date.now();
    const random = crypto.randomBytes(6).toString('hex');
    const nameWithoutExt = path.basename(originalName, ext);
    
    return `${nameWithoutExt}-${timestamp}-${random}${ext}`;
  }

  /**
   * Save image file to disk
   * @param {Buffer} fileBuffer - File content buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type
   * @param {string} entityId - Entity ID (dish_id or user_id, optional)
   * @returns {Promise<Object>} File metadata
   */
  async saveImage(fileBuffer, originalName, mimeType, entityId = null) {
    try {
      const filename = this.generateUniqueFilename(originalName, entityId);
      const filepath = path.join(this.typeDir, filename);
      
      // Write file to disk
      await fs.promises.writeFile(filepath, fileBuffer);
      
      // Return file metadata
      return {
        filename,
        originalName,
        mimeType,
        size: fileBuffer.length,
        uploadPath: filepath,
        relativePath: `/uploads/${this.uploadType}/${filename}`,
        uploadedAt: new Date()
      };
    } catch (error) {
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  /**
   * Delete image file from disk
   * @param {string} filename - Filename to delete
   * @returns {Promise<boolean>}
   */
  async deleteImage(filename) {
    try {
      const filepath = path.join(this.typeDir, filename);
      
      if (fs.existsSync(filepath)) {
        await fs.promises.unlink(filepath);
        return true;
      }
      
      return false;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Check if image file exists
   * @param {string} filename - Filename to check
   * @returns {boolean}
   */
  imageExists(filename) {
    const filepath = path.join(this.typeDir, filename);
    return fs.existsSync(filepath);
  }

  /**
   * Rename image file
   * @param {string} oldFilename - Current filename
   * @param {string} newFilename - New filename
   * @returns {Promise<boolean>}
   */
  async renameImage(oldFilename, newFilename) {
    try {
      const oldPath = path.join(this.typeDir, oldFilename);
      const newPath = path.join(this.typeDir, newFilename);

      if (!fs.existsSync(oldPath)) {
        return false;
      }

      await fs.promises.rename(oldPath, newPath);
      return true;
    } catch (error) {
      throw new Error(`Failed to rename image: ${error.message}`);
    }
  }

  /**
   * Get image file path
   * @param {string} filename - Filename
   * @returns {string} Full file path
   */
  getImagePath(filename) {
    return path.join(this.typeDir, filename);
  }

  /**
   * Get upload type directory
   * @returns {string} Upload type directory path
   */
  getTypeDir() {
    return this.typeDir;
  }
}

module.exports = UploadRepository;
