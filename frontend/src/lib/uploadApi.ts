

/**
 * Upload response from backend
 */
export interface UploadResponse {
  success: boolean;
  data: {
    filename: string;
    url: string;
    uploadType: 'dishes' | 'avatars';
    size: number;
  };
  message: string;
}

/**
 * Upload constraints per type
 */
const UPLOAD_CONSTRAINTS = {
  dishes: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    errorMessage: 'File size exceeds 10MB limit for dish images'
  },
  avatars: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    errorMessage: 'File size exceeds 5MB limit for avatars'
  }
};

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const BASE_URL =
  (import.meta as any).env?.VITE_BASE_URL ||
  "http://localhost:5000";



/**
 * Validate file before upload
 * Checks file size and MIME type according to upload type constraints
 */
export function validateFileForUpload(
  file: File,
  uploadType: 'dishes' | 'avatars'
): { valid: boolean; error?: string } {
  const constraints = UPLOAD_CONSTRAINTS[uploadType];

  if (!constraints) {
    return { valid: false, error: `Unknown upload type: ${uploadType}` };
  }

  if (file.size > constraints.maxSize) {
    return {
      valid: false,
      error: constraints.errorMessage
    };
  }

  if (!constraints.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${constraints.allowedMimeTypes.join(', ')}`
    };
  }

  return { valid: true };
}



/**
 * Upload dish image to the server
 * Route: POST /api/v1/uploads/dishes
 * Max size: 10MB
 *
 * @param {File} file - Image file to upload
 * @param {string} dishId - Dish ID for filename (optional)
 * @returns {Promise<string>} Image URL
 */
export async function uploadDishImage(file: File, dishId?: string): Promise<string> {
  const validation = validateFileForUpload(file, 'dishes');
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);
  if (dishId) {
    formData.append('entityId', dishId);
  }

  const response = await fetch(`${API_BASE}/uploads/dishes`, {
    method: 'POST',
    body: formData,
  });

  const data: UploadResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to upload dish image (${response.status})`);
  }

  const imagePath = data.data.url;
  const fullUrl = imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
  return fullUrl;
}

/**
 * Upload user avatar image to the server
 * Route: POST /api/v1/uploads/avatars
 * Max size: 5MB
 *
 * @param {File} file - Avatar image file to upload
 * @param {string} userId - User ID for filename (optional)
 * @returns {Promise<string>} Avatar URL
 */
export async function uploadAvatarImage(file: File, userId?: string): Promise<string> {
  const validation = validateFileForUpload(file, 'avatars');
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);
  if (userId) {
    formData.append('entityId', userId);
  }

  const response = await fetch(`${API_BASE}/uploads/avatars`, {
    method: 'POST',
    body: formData,
  });

  const data: UploadResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to upload avatar (${response.status})`);
  }

  const imagePath = data.data.url;
  const fullUrl = imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
  return fullUrl;
}

/**
 * Upload an image file to the server with specified type
 * Route: POST /api/v1/uploads/{uploadType}
 *
 * @param {File} file - Image file to upload
 * @param {string} uploadType - Type of upload ('dishes' or 'avatars')
 * @param {string} entityId - Entity ID for filename (dish_id or user_id, optional)
 * @returns {Promise<string>} Image URL
 */
export async function uploadImage(
  file: File,
  uploadType: 'dishes' | 'avatars',
  entityId?: string
): Promise<string> {
  const validation = validateFileForUpload(file, uploadType);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append('file', file);
  if (entityId) {
    formData.append('entityId', entityId);
  }

  const response = await fetch(`${API_BASE}/uploads/${uploadType}`, {
    method: 'POST',
    body: formData,
  });

  const data: UploadResponse = await response.json();

  if (!response.ok) {
    if (response.status === 413) {
      throw new Error(UPLOAD_CONSTRAINTS[uploadType].errorMessage);
    }
    throw new Error(data.message || `Failed to upload image (${response.status})`);
  }

  const imagePath = data.data.url;
  const fullUrl = imagePath.startsWith('http') ? imagePath : `${BASE_URL}${imagePath}`;
  return fullUrl;
}



/**
 * Delete an uploaded image from the server
 * Route: DELETE /api/v1/uploads/{uploadType}/{filename}
 *
 * @param {string} filename - Filename to delete
 * @param {string} uploadType - Type of upload ('dishes' or 'avatars')
 * @returns {Promise<void>}
 */
export async function deleteImage(
  filename: string,
  uploadType: 'dishes' | 'avatars'
): Promise<void> {
  const response = await fetch(`${API_BASE}/uploads/${uploadType}/${filename}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `Failed to delete image (${response.status})`);
  }
}

/**
 * Delete a dish image from the server
 * Route: DELETE /api/v1/uploads/dishes/{filename}
 *
 * @param {string} filename - Dish image filename to delete
 * @returns {Promise<void>}
 */
export async function deleteDishImage(filename: string): Promise<void> {
  await deleteImage(filename, 'dishes');
}

/**
 * Delete a user avatar image from the server
 * Route: DELETE /api/v1/uploads/avatars/{filename}
 *
 * @param {string} filename - Avatar image filename to delete
 * @returns {Promise<void>}
 */
export async function deleteAvatarImage(filename: string): Promise<void> {
  await deleteImage(filename, 'avatars');
}


/**
 * Extract filename from URL
 * Handles URLs like /uploads/dishes/filename.jpg -> filename.jpg
 *
 * @param {string} url - Image URL
 * @returns {string} Filename
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const parts = url.split('/');
    return parts[parts.length - 1];
  } catch {
    return '';
  }
}

/**
 * Validate if an image URL is loadable
 * Performs a HEAD request to check if URL is accessible
 *
 * @param {string} url - Image URL to validate
 * @returns {Promise<boolean>} True if URL is loadable, false otherwise
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
