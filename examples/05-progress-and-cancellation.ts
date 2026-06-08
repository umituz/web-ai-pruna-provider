/**
 * Example 05: Progress and Cancellation
 * @description Track progress and cancel a long-running generation.
 */

import { generate, CancellationError } from '@umituz/pruna-provider';

async function main() {
  const apiKey = process.env.PRUNA_API_KEY;
  if (!apiKey) {
    throw new Error('PRUNA_API_KEY is not set');
  }

  const controller = new AbortController();

  // Cancel after 30 seconds
  const cancelTimer = setTimeout(() => {
    console.log('Cancelling generation...');
    controller.abort();
  }, 30_000);

  try {
    const result = await generate(
      apiKey,
      {
        model: 'p-video',
        prompt: 'Slow dolly shot through a futuristic city',
        image: 'https://example.com/keyframes/city.jpg',
        duration: 5,
      },
      {
        signal: controller.signal,
        onProgress: (stage, attempt) => {
          const attemptLabel = attempt !== undefined ? ` (attempt ${attempt})` : '';
          console.log(`Stage: ${stage}${attemptLabel}`);
        },
      },
    );
    console.log('Video URL:', result.url);
  } catch (err) {
    if (err instanceof CancellationError) {
      console.log('Generation was cancelled by the user.');
    } else {
      throw err;
    }
  } finally {
    clearTimeout(cancelTimer);
  }
}

main().catch(console.error);
