/**
 * Pruna AI Types - Core entities and type definitions
 * @description Shared types for Pruna AI generation
 */

export type PrunaModelId = 'p-image' | 'p-image-edit' | 'p-video';

export type PrunaAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '3:2' | '2:3';

export type PrunaResolution = '720p' | '1080p';

export type GenerationStage = 'uploading' | 'predicting' | 'polling';

export interface GenerateOptions {
  signal?: AbortSignal;
  onProgress?: (stage: GenerationStage, attempt?: number) => void;
}

// ── Real model inputs ────────────────────────────────────────────────────────

export interface TextToImageInput {
  model: 'p-image';
  prompt: string;
  aspect_ratio?: PrunaAspectRatio;
  seed?: number;
}

export interface ImageToImageInput {
  model: 'p-image-edit';
  prompt: string;
  /** Base64 string or HTTPS URL */
  image: string;
  aspect_ratio?: PrunaAspectRatio;
  seed?: number;
}

export interface ImageToVideoInput {
  model: 'p-video';
  prompt: string;
  /** Base64 string or HTTPS URL. Uploaded to Pruna file storage if base64. */
  image: string;
  duration?: number;
  resolution?: PrunaResolution;
  aspect_ratio?: PrunaAspectRatio;
  draft?: boolean;
}

/** Union of all real Pruna model inputs */
export type PrunaInput = TextToImageInput | ImageToImageInput | ImageToVideoInput;

// ── Two-step pipeline helper input ──────────────────────────────────────────

/** Input for the two-step text→image→video pipeline (not a real Pruna model) */
export interface TextToVideoInput {
  prompt: string;
  duration?: number;
  resolution?: PrunaResolution;
  aspect_ratio?: PrunaAspectRatio;
  draft?: boolean;
}

// ── Result ───────────────────────────────────────────────────────────────────

export interface PrunaResult {
  /** Direct URL to the generated image or video */
  url: string;
  model: PrunaModelId;
}

// ── Raw API response shapes ──────────────────────────────────────────────────

export interface PrunaPredictionResponse {
  readonly generation_url?: string;
  readonly output?: { readonly url: string } | string | readonly string[];
  readonly data?: string;
  readonly video_url?: string;
  readonly get_url?: string;
  readonly status_url?: string;
  readonly status?: 'succeeded' | 'completed' | 'failed';
  readonly error?: string;
}

export interface PrunaFileUploadResponse {
  readonly id?: string;
  readonly urls?: { readonly get: string };
}
