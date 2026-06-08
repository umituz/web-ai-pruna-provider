/**
 * MIME Type Catalog
 * @description All MIME types and their corresponding file extensions used by the package.
 */

export const MIME_PNG = 'image/png';
export const MIME_JPEG = 'image/jpeg';
export const MIME_WEBP = 'image/webp';

/** Default MIME used when detection fails. */
export const DEFAULT_IMAGE_MIME = MIME_PNG;

/** Map of MIME type -> file extension (no leading dot). */
export const MIME_FILE_EXTENSION: Readonly<Record<string, string>> = {
  [MIME_PNG]: 'png',
  [MIME_JPEG]: 'jpg',
  [MIME_WEBP]: 'webp',
};

/** Magic-number signatures for supported image formats. */
export const IMAGE_SIGNATURES = {
  PNG: [0x89, 0x50],
  JPEG: [0xff, 0xd8],
  WEBP_RIFF: [0x52, 0x49], // 'RI'
} as const;
