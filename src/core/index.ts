/**
 * @umituz/pruna-provider/core
 * Core utilities, types, and API client services
 * @description Subpath export for core functionality
 */

// Types
export type {
  PrunaModelId,
  PrunaAspectRatio,
  PrunaResolution,
  GenerationStage,
  GenerateOptions,
  TextToImageInput,
  ImageToImageInput,
  ImageToVideoInput,
  PrunaInput,
  TextToVideoInput,
  PrunaResult,
  PrunaPredictionResponse,
  PrunaFileUploadResponse,
} from './entities/types';

// Constants
export {
  PRUNA_BASE_URL,
  PRUNA_PREDICTIONS_URL,
  PRUNA_FILES_URL,
  DEFAULT_ASPECT_RATIO,
  P_VIDEO_DEFAULTS,
  POLL_DEFAULTS,
} from './constants';

// Utils
export {
  stripBase64Prefix,
  base64ToBytes,
  extractUri,
  resolveUri,
} from './utils/helpers';

// Advanced utils (tree-shakeable, optional imports)
export {
  shallowEqual,
  hashObject,
  memoHash,
} from './utils/compare';

export {
  cleanupAbortController,
  cleanupRefs,
  createCleanupFn,
} from './utils/cleanup';

export {
  LRUCache,
  createCache,
} from './utils/cache';

export {
  RequestDeduplicator,
  globalDeduplicator,
} from './utils/request-deduplicator';

export {
  getPerformanceMonitor,
  measurePerformance,
  withPerformanceMonitoring,
} from './utils/performance';

// Services
export { uploadImage, submitPrediction, pollForResult } from './services/pruna-client.service';
