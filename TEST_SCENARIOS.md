# Test Scenarios

Step-by-step manual test procedures for `@umituz/pruna-provider`. Use these when verifying a release before publishing, when reproducing a customer issue, or when onboarding a new contributor.

## Prerequisites

1. Node.js 18+
2. A Pruna API key (set as `PRUNA_API_KEY` in your shell)
3. For the React scenarios, a fresh `npm create vite@latest` app (or similar) where you can drop in a hook
4. The examples in `/examples` cloned alongside this package

```bash
export PRUNA_API_KEY=pruna_xxx
```

---

## T1 - Text-to-Image (Happy Path)

**Goal:** Confirm the simplest call returns an image URL.

**Setup:** Node 18+ with `tsx` available globally.

**Steps:**

1. From the package root, run:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx examples/01-text-to-image.ts
   ```
2. Wait for the script to log a URL.
3. Copy the URL and open it in a browser.

**Expected:**
- Script logs a single line: `Image URL: https://...`
- The URL returns a JPG/PNG image
- No exception is thrown

**Failure indicators:**
- `Error: 401` -> invalid API key
- `Error: Pruna API returned no result and no polling URL.` -> API response shape changed; check `PrunaPredictionResponse`
- Script hangs -> check network/proxy

---

## T2 - Image-to-Image with Remote URL

**Goal:** Edit an existing image by URL.

**Steps:**

1. Pick any publicly accessible JPG/PNG (e.g. `https://picsum.photos/800/600`).
2. Run:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx examples/02-image-to-image.ts https://picsum.photos/800/600
   ```
3. Inspect the returned URL.

**Expected:**
- The new URL shows the source image edited per the prompt.
- Console log is `Edited image URL: https://...`

**Failure indicators:**
- `Only HTTPS URLs are supported for security.` -> you passed an `http://` URL.
- `Invalid image format...` -> the URL did not return a recognizable image.

---

## T3 - Image-to-Video

**Goal:** Generate a short video from a keyframe.

**Steps:**

1. Run:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx examples/03-image-to-video.ts
   ```
2. Wait. Video generation takes 30-60s.
3. Open the returned URL.

**Expected:**
- Output URL points to an `.mp4` file
- Total runtime is under 120s (3 polls at 3s base interval)
- `onProgress` would have logged `Stage: uploading`, then `predicting`, then multiple `polling` lines (if you ran the example with progress)

**Failure indicators:**
- `TimeoutError` after ~6 minutes -> API is slow or the URL is wrong.
- `AuthenticationError` -> bad key.

---

## T4 - Text-to-Video Pipeline

**Goal:** Run the two-step pipeline with no source image.

**Steps:**

1. Run:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx examples/04-text-to-video-pipeline.ts
   ```
2. The first call uploads a generated keyframe and generates a video from it.
3. Confirm the URL points to an `.mp4` and the first frame matches the prompt.

**Expected:**
- Single URL output (`Generated video URL:`).
- Image generation and video generation both succeeded.

**Failure indicators:**
- First call fails -> the `p-image` model is unreachable.
- Second call fails with `Invalid image format` -> the keyframe URL returned by step 1 was not a valid HTTPS URL.

---

## T5 - Cancellation

**Goal:** Verify an `AbortController` actually stops work in flight.

**Steps:**

1. Open `examples/05-progress-and-cancellation.ts` and lower the cancel timer to `2000` ms.
2. Run:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx examples/05-progress-and-cancellation.ts
   ```
3. Watch the console. After ~2 seconds, "Cancelling generation..." appears.
4. The script should log `Generation was cancelled by the user.` and exit cleanly.

**Expected:**
- The script exits within ~5 seconds total
- No uncaught rejection
- The catch branch handles `CancellationError` correctly

**Failure indicators:**
- Script keeps polling for 6 minutes -> `AbortController` not wired correctly.
- `Error: 400 Cancellation...` -> the API rejected the abort; re-check `signal` propagation.

---

## T6 - React Hook (Direct API Key)

**Goal:** Render a working in-browser generator.

**Setup:** A Vite React app. Install the package locally:
```bash
npm install /absolute/path/to/web-ai-pruna-provider
```

**Steps:**

1. Copy `examples/06-react-hook.tsx` into `src/ImageGenerator.tsx` in your app.
2. Wire it into `App.tsx` with a hardcoded `apiKey` (only for local testing).
3. Run `npm run dev` and open the page.
4. Click `Generate`.

**Expected:**
- Button switches to `Generating...` and disables.
- Console shows `Stage: uploading`, then `predicting`, then `polling` (multiple).
- Within ~30s the image renders.
- No errors in the console.
- `Cancel` button appears during loading and stops the run.
- `Reset` button appears after a run and clears the state.

**Failure indicators:**
- `result` stays `null` and `error` populates -> inspect the message.
- Stuck in `isLoading: true` -> signal/cleanup bug.

---

## T7 - React Hook (Proxy)

**Goal:** Route through your own backend.

**Setup:** A small Node/Express (or similar) endpoint that:
- Accepts `POST /api/pruna` with the `PrunaInput` JSON body
- Forwards the request to `https://api.pruna.ai/v1/predictions` with the same body and the real API key in `apikey` header
- Streams back the result

**Steps:**

1. Start your proxy server on `http://localhost:3001`.
2. Use `examples/07-react-proxy-hook.tsx` with `proxyUrl="/api/pruna"`.
3. Make sure your dev server proxies `/api` to `http://localhost:3001`.
4. Click `Generate` in the UI.

**Expected:**
- The browser never sees your real Pruna API key.
- The hook behaves exactly like the direct API key hook.

**Failure indicators:**
- CORS error -> your proxy must set `Access-Control-Allow-Origin`.
- 502 from the proxy -> the proxy did not forward the `apikey` header.

---

## T8 - Error Discrimination

**Goal:** Verify that all four error classes are reachable and discriminated correctly.

### T8.1 - AuthenticationError

1. Set `PRUNA_API_KEY=invalid-key`.
2. Run any generation example.
3. The catch in `examples/08-error-handling.ts` should report `kind: 'auth'`.

### T8.2 - CancellationError

1. Trigger the cancellation scenario (T5) inside the error-handling wrapper.
2. Expect `kind: 'cancelled'`.

### T8.3 - TimeoutError

1. Temporarily lower the polling budget: pass `{ maxAttempts: 1, intervalMs: 1 }` via... actually, these are internal. The easiest way to trigger a timeout is to point the package at a poll URL that always returns `processing`.
2. Alternative: spin up a local mock server that always returns `{ status: "processing" }` and run:
   ```ts
   await pollForResult('http://localhost:9999/poll', 'k', 2, 1);
   ```
3. Expect a `TimeoutError`.

### T8.4 - GenerationFailedError

1. Use a prompt that the API explicitly rejects (e.g. one that triggers Pruna's content filter).
2. Expect the script to throw a `GenerationFailedError` whose `.message` is the API's reported reason.
3. The wrapper in `examples/08-error-handling.ts` should report `kind: 'rejected'`.

**Expected for all four:**
- The wrapper's `kind` matches the scenario.
- The `message` is human-readable.

---

## T9 - Deduplication

**Goal:** Confirm concurrent identical calls share one network request.

**Steps:**

1. Open a Node REPL with the package:
   ```bash
   PRUNA_API_KEY=$PRUNA_API_KEY npx tsx
   ```
2. Paste:
   ```ts
   import { generate } from '@umituz/pruna-provider';
   const input = { model: 'p-image' as const, prompt: 'A cat' };
   const [a, b] = await Promise.all([
     generate(process.env.PRUNA_API_KEY!, input),
     generate(process.env.PRUNA_API_KEY!, input),
   ]);
   console.log(a.url === b.url ? 'DEDUPED' : 'NOT DEDUPED');
   ```
3. Inspect the Pruna dashboard for that minute - you should see **one** prediction, not two.

**Expected:**
- Console prints `DEDUPED`.
- Pruna dashboard shows a single prediction.

**Failure indicators:**
- Two predictions visible -> the global deduplicator is not honoring the same key. Check `createCacheKey` output stability (key ordering).

---

## T10 - Unmount Safety (React)

**Goal:** Make sure unmounting the component during a fetch does not throw or call setState on an unmounted component.

**Steps:**

1. In your Vite dev app, replace the body of `examples/06-react-hook.tsx` so the component navigates away 1 second after clicking `Generate`.
2. Click `Generate` and immediately trigger a route change (e.g. via `react-router` `navigate('/')`).
3. Inspect the console.

**Expected:**
- No "state update on an unmounted component" warning.
- No uncaught promise rejection.
- The Promise returned by `run` resolves with `null` (or rejects with a `CancellationError` swallowed internally).

**Failure indicators:**
- React warning -> the `mountedRef` check in `useAsyncAction` is not working.
- An HTTP request is still in flight after unmount -> the `AbortController` is not being aborted.

---

## T11 - Tree-Shaking

**Goal:** Verify the subpath exports actually keep unused code out of the bundle.

**Setup:** A Vite app with `vite build` and `rollup-plugin-visualizer`.

**Steps:**

1. In a sample app, import ONLY from `@umituz/pruna-provider/hooks`.
2. Build: `npm run build`.
3. Open the visualizer HTML report.

**Expected:**
- `core/services/pruna-client.service.ts` upload/polling code is excluded.
- `core/utils/lru-cache.ts` is excluded (it is not used by the hooks path).
- The `useAsyncAction` core is included.

**Failure indicators:**
- Full `pruna-client.service.ts` is bundled -> the hooks path is pulling from the service. Check that `usePrunaProxy` does not import the file upload code.

---

## T12 - Type-Check & Lint

**Goal:** Sanity check the package itself.

**Steps:**

1. From the package root:
   ```bash
   npm run typecheck
   npm run lint
   npm test
   ```

**Expected:**
- All three commands exit `0`.
- Test report shows `135 passed (135)` (or higher if new tests were added).

**Failure indicators:**
- `npm run lint` reports any `error` -> fix before publishing.
- Tests report failures -> `npm test -- <file>` to drill in.

---

## Regression Checklist

Run this before tagging a release:

- [ ] T1 - Text-to-Image happy path
- [ ] T2 - Image-to-Image with remote URL
- [ ] T3 - Image-to-Video
- [ ] T4 - Text-to-Video pipeline
- [ ] T5 - Cancellation (script)
- [ ] T6 - React hook (direct key)
- [ ] T7 - React hook (proxy)
- [ ] T8 - All four error classes
- [ ] T9 - Deduplication
- [ ] T10 - Unmount safety
- [ ] T11 - Tree-shaking
- [ ] T12 - typecheck + lint + tests

If any scenario fails, open a bug with the scenario ID (e.g. `T5 failed: signal not propagated to fetch`).
