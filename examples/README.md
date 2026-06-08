# Examples

Runnable examples demonstrating the public API. All scripts use `process.env.PRUNA_API_KEY` for the API key. Each file is self-contained.

| # | File | Topic |
|---|------|-------|
| 01 | `01-text-to-image.ts` | Bare-bones text-to-image call |
| 02 | `02-image-to-image.ts` | Image editing with a local or remote image |
| 03 | `03-image-to-video.ts` | Animate an existing image |
| 04 | `04-text-to-video-pipeline.ts` | Two-step text -> image -> video |
| 05 | `05-progress-and-cancellation.ts` | `onProgress` callback and `AbortController` |
| 06 | `06-react-hook.tsx` | React component using `usePrunaGeneration` |
| 07 | `07-react-proxy-hook.tsx` | React component using `usePrunaProxy` (server-side key) |
| 08 | `08-error-handling.ts` | Discriminate between `AuthenticationError`, `TimeoutError`, etc. |
| 09 | `09-custom-cache.ts` | Build your own cache + deduplicator on top of the core |

## Running

```bash
# Node 18+ with tsx
PRUNA_API_KEY=your-key npx tsx examples/01-text-to-image.ts
```

For React examples, copy the component into your app and wire it up in your tree.
