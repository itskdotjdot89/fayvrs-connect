// File validation constants and utilities

// 100 MB in bytes
export const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed image types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg', 'image/gif', 'image/webp'];

// Allowed video types
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates file size (max 100 MB)
 */
export function validateFileSize(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than 100 MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)} MB.`
    };
  }
  return { isValid: true };
}

/**
 * Validates file type (images only)
 */
export function validateFileType(file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): FileValidationResult {
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: `Invalid file type. Only ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} files are allowed.`
    };
  }
  return { isValid: true };
}

/**
 * Validates both file size and type for image uploads
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file type first
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}

/**
 * Validates both file size and type for video uploads
 */
export function validateVideoFile(file: File): FileValidationResult {
  // Check file type first
  const typeValidation = validateFileType(file, ALLOWED_VIDEO_TYPES);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}

/**
 * Validates media file (image or video)
 */
export function validateMediaFile(file: File): FileValidationResult {
  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase());
  const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase());

  if (!isImage && !isVideo) {
    return {
      isValid: false,
      error: 'Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and videos (MP4, MOV, AVI, MKV, WEBM) are allowed.'
    };
  }

  // Check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
}

/**
 * Get media type from file
 */
export function getMediaType(file: File): 'image' | 'video' | null {
  if (ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    return 'image';
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.type.toLowerCase())) {
    return 'video';
  }
  return null;
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
