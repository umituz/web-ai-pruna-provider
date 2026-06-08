/**
 * Example 08: Error Handling
 * @description Discriminate between error types and react accordingly.
 */

import {
  generate,
  AuthenticationError,
  CancellationError,
  TimeoutError,
  GenerationFailedError,
} from '@umituz/pruna-provider';

async function generateWithFriendlyErrors(apiKey: string) {
  const controller = new AbortController();

  try {
    return await generate(
      apiKey,
      { model: 'p-image', prompt: 'A snowy mountain at sunrise' },
      { signal: controller.signal },
    );
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return { kind: 'auth' as const, message: 'Please verify your API key in settings.' };
    }
    if (err instanceof CancellationError) {
      return { kind: 'cancelled' as const, message: 'You cancelled the generation.' };
    }
    if (err instanceof TimeoutError) {
      return { kind: 'timeout' as const, message: 'Generation is taking too long. Please retry.' };
    }
    if (err instanceof GenerationFailedError) {
      return { kind: 'rejected' as const, message: err.message };
    }
    return { kind: 'unknown' as const, message: 'Something went wrong. Please retry.' };
  }
}

(async () => {
  const result = await generateWithFriendlyErrors(process.env.PRUNA_API_KEY ?? '');
  console.log(result);
})();
