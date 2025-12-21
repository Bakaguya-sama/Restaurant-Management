/**
 * Upload Entity - Domain Layer
 * Represents the business rules and constraints for file uploads
 */
class UploadEntity {
  constructor(data) {
    this.filename = data.filename;
    this.originalName = data.originalName;
    this.mimeType = data.mimeType;
    this.size = data.size;
    this.uploadPath = data.uploadPath;
    this.url = data.url;
    this.uploadedAt = data.uploadedAt || new Date();
  }

  validate() {
    const errors = [];

    // Validate filename
    if (!this.filename || this.filename.trim() === '') {
      errors.push('Filename is required');
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (this.size > MAX_FILE_SIZE) {
      errors.push('File size exceeds 10MB limit');
    }

    // Validate MIME type
    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!ALLOWED_MIME_TYPES.includes(this.mimeType)) {
      errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
    }

    // Validate URL
    if (!this.url || this.url.trim() === '') {
      errors.push('URL is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isImage() {
    return this.mimeType.startsWith('image/');
  }
}

module.exports = UploadEntity;
