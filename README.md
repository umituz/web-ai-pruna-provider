# @umituz/pruna-provider

> Pruna AI generation client for web applications. Text-to-image, image-to-image, and image-to-video generation with a clean, tree-shakeable API.

## Features

- **Text-to-Image** - Generate images from text prompts (p-image model)
- **Image-to-Image** - Edit images with text prompts (p-image-edit model)
- **Image-to-Video** - Animate images to videos (p-video model)
- **Two-step Pipeline** - Text -> Image -> Video generation helper
- **React Hooks** - First-class integration with React 18+
- **Universal Runtime** - Works in browser and Node.js 18+
- **Tree-shakeable Subpaths** - Import only what you need
- **Cancellation** - First-class AbortSignal/AbortController support
- **Request Deduplication** - Coalesces concurrent in-flight requests
- **Sentinel Errors** - Discriminated error types for control flow

## Installation

```bash
npm install @umituz/pruna-provider
```

Peer dependency: `react >= 18.2.0` (only required for the hooks subpath).

## Quick Start

### Text-to-Image

```typescript
import { generate } from '@umituz/pruna-provider';

const result = await generate(apiKey, {
  model: 'p-image',
  prompt: 'A beautiful sunset over mountains',
  aspect_ratio: '16:9',
});

console.log(result.url);
```

### React Hook

```tsx
import { usePrunaGeneration } from '@umituz/pruna-provider';

function ImageGenerator({ apiKey }: { apiKey: string }) {
  const { result, isLoading, error, generate, cancel } = usePrunaGeneration(apiKey, {
    onSuccess: r => console.log('Generated:', r.url),
    onError: e => console.error('Error:', e.message),
    onProgress: stage => console.log('Stage:', stage),
  });

  return (
    <div>
      <button onClick={() => generate({ model: 'p-image', prompt: 'A serene lake' })}>
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      {error && <p role="alert">{error.message}</p>}
      {result && <img src={result.url} alt="Generated" />}
    </div>
  );
}
```

### Proxy Mode (Server-side API Key)

```tsx
import { usePrunaProxy } from '@umituz/pruna-provider';

function App() {
  const { result, isLoading, error, generate } = usePrunaProxy({
    proxyUrl: '/api/pruna',
    onSuccess: r => console.log(r.url),
  });

  return <button onClick={() => generate({ model: 'p-image', prompt: 'Hi' })}>Go</button>;
}
```

### Two-step Pipeline: Text to Video

```typescript
import { generateImageThenVideo } from '@umituz/pruna-provider';

const video = await generateImageThenVideo(apiKey, {
  prompt: 'A serene lake at dawn',
  aspect_ratio: '16:9',
  duration: 5,
});
```

## Subpath Exports

Use subpath imports for smaller bundles and clearer boundaries:

```typescript
// Anything from the core (types, constants, services, utils)
import { generate, PrunaInput, LRUCache, RequestDeduplicator } from '@umituz/pruna-provider/core';

// Generation-specific entry
import { generate, generateImageThenVideo } from '@umituz/pruna-provider/generation';

// React hooks
import { usePrunaGeneration, usePrunaProxy, useAsyncAction } from '@umituz/pruna-provider/hooks';
```

## API Reference

### Models

| Model ID | Capability |
|----------|------------|
| `p-image` | Text to image |
| `p-image-edit` | Image to image (edit) |
| `p-video` | Image to video |

### Input Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `aspect_ratio` | `'16:9' \| '9:16' \| '1:1' \| '4:3' \| '3:4' \| '3:2' \| '2:3'` | `'16:9'` | Output aspect ratio |
| `resolution` | `'720p' \| '1080p'` | `'720p'` | Video resolution (video only) |
| `duration` | `number` | `5` | Video duration in seconds |
| `seed` | `number` | - | Random seed for reproducibility |
| `draft` | `boolean` | `false` | Draft quality (faster, lower fidelity) |

### Generate Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `signal` | `AbortSignal` | - | Cancellation signal |
| `onProgress` | `(stage, attempt?) => void` | - | Progress callback (`uploading` \| `predicting` \| `polling`) |
| `useCache` | `boolean` | `true` | Coalesce concurrent duplicate requests via the global deduplicator |

### Hook Return Shape

```typescript
interface AsyncActionApi<TResult, TInput> {
  result: TResult | null;
  isLoading: boolean;
  error: Error | null;
  run: (input: TInput) => Promise<TResult | null>;
  cancel: () => void;
  reset: () => void;
}
```

`result` stays `null` until the first successful run, after which it persists across runs. Call `reset()` to clear it.

## Error Handling

The library throws typed errors you can discriminate against:

```typescript
import {
  generate,
  CancellationError,
  AuthenticationError,
  TimeoutError,
} from '@umituz/pruna-provider';

try {
  const result = await generate(apiKey, input);
} catch (err) {
  if (err instanceof AuthenticationError) {
    // Bad API key
  } else if (err instanceof CancellationError) {
    // User cancelled
  } else if (err instanceof TimeoutError) {
    // Polling budget exhausted
  } else {
    // Network, server, or validation error
  }
}
```

In hooks, cancellation is not propagated to `onError` - the `run` promise resolves with `null`. Other errors fire `onError` and populate `error`.

## Cancellation

All public APIs accept an `AbortSignal`:

```typescript
const controller = new AbortController();
const promise = generate(apiKey, input, { signal: controller.signal });

// Later:
controller.abort();
```

Hooks expose `cancel()` for the same purpose.

## Manual Test Scenarios

See [TEST_SCENARIOS.md](./TEST_SCENARIOS.md) for step-by-step manual test procedures.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release notes.

## License

MIT

## Repository

https://github.com/umituz/web-ai-pruna-provider
