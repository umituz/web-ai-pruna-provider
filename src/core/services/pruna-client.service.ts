/**
 * Pruna API Client Service
 * @description Core service for Pruna API communication
 */

import type {
  PrunaModelId,
  PrunaPredictionResponse,
  PrunaFileUploadResponse,
  GenerationStage,
} from '../entities/types';
import { PRUNA_BASE_URL, PRUNA_PREDICTIONS_URL, PRUNA_FILES_URL } from '../constants';
import { base64ToBytes, stripBase64Prefix, extractUri, resolveUri } from '../utils/helpers';

// ── File upload ───────────────────────────────────────────────────────────────

/**
 * Upload a base64 image (or pass-through HTTPS URL) to Pruna file storage.
 * Required for p-video since it only accepts file URLs, not raw base64.
 */
export async function uploadImage(
  base64OrUrl: string,
  apiKey: string,
  onProgress?: (stage: GenerationStage) => void,
): Promise<string> {
  if (base64OrUrl.startsWith('http')) return base64OrUrl;

  onProgress?.('uploading');

  const raw = stripBase64Prefix(base64OrUrl);

  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(raw);
  } catch {
    throw new Error('Invalid image format. Provide base64 or a valid HTTPS URL.');
  }

  let mime = 'image/png';
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) mime = 'image/jpeg';
  else if (bytes[0] === 0x52 && bytes[1] === 0x49) mime = 'image/webp';

  const arrayBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(arrayBuffer).set(bytes);
  const blob = new Blob([arrayBuffer], { type: mime });
  const ext = mime.split('/')[1];
  const formData = new FormData();
  formData.append('content', blob, `upload.${ext}`);

  const res = await fetch(PRUNA_FILES_URL, {
    method: 'POST',
    headers: { apikey: apiKey },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error((err as { message?: string }).message ?? `File upload error: ${res.status}`);
  }

  const data: PrunaFileUploadResponse = await res.json();
  return data.urls?.get ?? `${PRUNA_FILES_URL}/${data.id}`;
}

// ── Prediction ────────────────────────────────────────────────────────────────

/**
 * Submit a prediction. Uses Try-Sync header — may return result immediately
 * or include a polling URL for async results.
 */
export async function submitPrediction(
  model: PrunaModelId,
  input: Record<string, unknown>,
  apiKey: string,
  signal?: AbortSignal,
  onProgress?: (stage: GenerationStage) => void,
): Promise<PrunaPredictionResponse> {
  onProgress?.('predicting');

  const res = await fetch(PRUNA_PREDICTIONS_URL, {
    method: 'POST',
    headers: {
      apikey: apiKey,
      Model: model,
      'Try-Sync': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const msg = (err as { message?: string }).message ?? `API error: ${res.status}`;
    const error = new Error(msg);
    (error as Error & { statusCode?: number }).statusCode = res.status;
    throw error;
  }

  return res.json();
}

// ── Polling ───────────────────────────────────────────────────────────────────

/**
 * Poll async prediction until succeeded/failed or timeout.
 * Polls every `intervalMs` ms, up to `maxAttempts` (~6 min at defaults).
 */
export async function pollForResult(
  pollUrl: string,
  apiKey: string,
  maxAttempts: number,
  intervalMs: number,
  signal?: AbortSignal,
  onProgress?: (stage: GenerationStage, attempt: number) => void,
): Promise<string> {
  const fullUrl = pollUrl.startsWith('http') ? pollUrl : `${PRUNA_BASE_URL}${pollUrl}`;

  for (let i = 0; i < maxAttempts; i++) {
    if (signal?.aborted) throw new Error('Request cancelled by user');

    await new Promise<void>(resolve => setTimeout(resolve, intervalMs));

    if (signal?.aborted) throw new Error('Request cancelled by user');

    onProgress?.('polling', i + 1);

    try {
      const res = await fetch(fullUrl, { headers: { apikey: apiKey }, signal });
      if (!res.ok) continue;

      const data: PrunaPredictionResponse = await res.json();

      if (data.status === 'succeeded' || data.status === 'completed') {
        const uri = extractUri(data);
        if (uri) return resolveUri(uri);
      } else if (data.status === 'failed') {
        throw new Error(data.error ?? 'Generation failed during processing.');
      }
    } catch (err) {
      if (err instanceof Error && (err.message.includes('cancelled') || err.message.includes('failed'))) {
        throw err;
      }
      // Non-fatal poll error — continue polling
    }
  }

  throw new Error('Generation timed out. Maximum polling attempts reached.');
}
