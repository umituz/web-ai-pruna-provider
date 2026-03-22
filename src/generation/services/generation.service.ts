/**
 * Pruna Generation Service
 * @description High-level generation orchestration
 */

import type { PrunaInput, PrunaResult, TextToVideoInput, GenerateOptions } from '../../core/entities/types';
import { DEFAULT_ASPECT_RATIO, P_VIDEO_DEFAULTS, POLL_DEFAULTS } from '../../core/constants';
import { uploadImage, submitPrediction, pollForResult } from '../../core/services/pruna-client.service';
import { stripBase64Prefix, extractUri } from '../../core/utils/helpers';

// ── generate ─────────────────────────────────────────────────────────────────

/**
 * Generate an image or video using a real Pruna model.
 *
 * @param apiKey  Your Pruna API key
 * @param input   Discriminated union: TextToImageInput | ImageToImageInput | ImageToVideoInput
 * @param options Optional: signal for cancellation, onProgress callback
 */
export async function generate(
  apiKey: string,
  input: PrunaInput,
  options?: GenerateOptions,
): Promise<PrunaResult> {
  const { signal, onProgress } = options ?? {};
  const modelInput = await buildModelInput(apiKey, input, signal, onProgress);

  const response = await submitPrediction(input.model, modelInput, apiKey, signal, onProgress);

  const syncUri = extractUri(response);
  if (syncUri) {
    const url = syncUri.startsWith('/') ? `https://api.pruna.ai${syncUri}` : syncUri;
    return { url, model: input.model };
  }

  const pollUrl = response.get_url ?? response.status_url;
  if (!pollUrl) throw new Error('Pruna API returned no result and no polling URL.');

  const url = await pollForResult(
    pollUrl,
    apiKey,
    POLL_DEFAULTS.maxAttempts,
    POLL_DEFAULTS.intervalMs,
    signal,
    onProgress,
  );

  return { url, model: input.model };
}

// ── generateImageThenVideo ────────────────────────────────────────────────────

/**
 * Two-step pipeline: text → p-image → p-video.
 * Use when you want to animate a concept without providing a source image.
 *
 * @param apiKey  Your Pruna API key
 * @param input   Prompt + optional video settings (no image needed)
 * @param options Optional: signal for cancellation, onProgress callback
 */
export async function generateImageThenVideo(
  apiKey: string,
  input: TextToVideoInput,
  options?: GenerateOptions,
): Promise<PrunaResult> {
  const { signal, onProgress } = options ?? {};
  const aspectRatio = input.aspect_ratio ?? DEFAULT_ASPECT_RATIO;

  // Step 1: Generate keyframe image
  onProgress?.('predicting', 1);
  const imageResult = await generate(apiKey, {
    model: 'p-image',
    prompt: input.prompt,
    aspect_ratio: aspectRatio,
  }, { signal });

  if (signal?.aborted) throw new Error('Request cancelled by user');

  // Step 2: Animate image to video
  onProgress?.('predicting', 2);
  return generate(apiKey, {
    model: 'p-video',
    prompt: input.prompt,
    image: imageResult.url,
    duration: input.duration ?? P_VIDEO_DEFAULTS.duration,
    resolution: input.resolution ?? P_VIDEO_DEFAULTS.resolution,
    aspect_ratio: aspectRatio,
    draft: input.draft ?? P_VIDEO_DEFAULTS.draft,
  }, { signal, onProgress });
}

// ── Internal ──────────────────────────────────────────────────────────────────

async function buildModelInput(
  apiKey: string,
  input: PrunaInput,
  signal?: AbortSignal,
  onProgress?: GenerateOptions['onProgress'],
): Promise<Record<string, unknown>> {
  const aspectRatio = input.aspect_ratio ?? DEFAULT_ASPECT_RATIO;

  if (input.model === 'p-image') {
    const payload: Record<string, unknown> = { prompt: input.prompt, aspect_ratio: aspectRatio };
    if (input.seed !== undefined) payload.seed = input.seed;
    return payload;
  }

  if (input.model === 'p-image-edit') {
    const payload: Record<string, unknown> = {
      images: [stripBase64Prefix(input.image)],
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
    };
    if (input.seed !== undefined) payload.seed = input.seed;
    return payload;
  }

  // p-video: image required — upload if base64
  if (signal?.aborted) throw new Error('Request cancelled by user');
  const fileUrl = await uploadImage(input.image, apiKey, onProgress);

  return {
    image: fileUrl,
    prompt: input.prompt,
    duration: input.duration ?? P_VIDEO_DEFAULTS.duration,
    resolution: input.resolution ?? P_VIDEO_DEFAULTS.resolution,
    fps: P_VIDEO_DEFAULTS.fps,
    draft: input.draft ?? P_VIDEO_DEFAULTS.draft,
    aspect_ratio: aspectRatio,
    prompt_upsampling: P_VIDEO_DEFAULTS.promptUpsampling,
  };
}
