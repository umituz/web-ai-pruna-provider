/**
 * Pruna AI Types - Core entities and type definitions
 * @description Shared types for Pruna AI generation (optimized with readonly)
 */

export type PrunaModelId = 'p-image' | 'p-image-edit' | 'p-video';

export type PrunaAspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '3:4' | '3:2' | '2:3';

export type PrunaResolution = '720p' | '1080p';

export type GenerationStage = 'uploading' | 'predicting' | 'polling';

export interface GenerateOptions {
  readonly signal?: AbortSignal;
  readonly onProgress?: (stage: GenerationStage, attempt?: number) => void;
  readonly useCache?: boolean;
}

// ── Real model inputs ────────────────────────────────────────────────────────

export interface TextToImageInput {
  readonly model: 'p-image';
  readonly prompt: string;
  readonly aspect_ratio?: PrunaAspectRatio;
  readonly seed?: number;
}

export interface ImageToImageInput {
  readonly model: 'p-image-edit';
  readonly prompt: string;
  /** Base64 string or HTTPS URL */
  readonly image: string;
  readonly aspect_ratio?: PrunaAspectRatio;
  readonly seed?: number;
}

export interface ImageToVideoInput {
  readonly model: 'p-video';
  readonly prompt: string;
  /** Base64 string or HTTPS URL. Uploaded to Pruna file storage if base64. */
  readonly image: string;
  readonly duration?: number;
  readonly resolution?: PrunaResolution;
  readonly aspect_ratio?: PrunaAspectRatio;
  readonly draft?: boolean;
}

/** Union of all real Pruna model inputs */
export type PrunaInput = TextToImageInput | ImageToImageInput | ImageToVideoInput;

// ── Two-step pipeline helper input ──────────────────────────────────────────

/** Input for the two-step text→image→video pipeline (not a real Pruna model) */
export interface TextToVideoInput {
  readonly prompt: string;
  readonly duration?: number;
  readonly resolution?: PrunaResolution;
  readonly aspect_ratio?: PrunaAspectRatio;
  readonly draft?: boolean;
}

// ── Result ───────────────────────────────────────────────────────────────────

export interface PrunaResult {
  /** Direct URL to the generated image or video */
  readonly url: string;
  readonly model: PrunaModelId;
}

// ── Raw API response shapes ──────────────────────────────────────────────────

export interface PrunaPredictionResponse {
  readonly generation_url?: string;
  readonly output?: { readonly url: string } | string | readonly string[];
  readonly data?: string;
  readonly video_url?: string;
  readonly get_url?: string;
  readonly status_url?: string;
  readonly status?: 'succeeded' | 'completed' | 'failed' | 'processing' | 'starting';
  readonly error?: string;
}

export interface PrunaFileUploadResponse {
  readonly id?: string;
  readonly urls?: { readonly get: string };
}
