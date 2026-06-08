/**
 * Example 01: Text-to-Image
 * @description Simplest usage. Generate an image from a text prompt.
 */

import { generate } from '@umituz/pruna-provider';

async function main() {
  const apiKey = process.env.PRUNA_API_KEY;
  if (!apiKey) {
    throw new Error('PRUNA_API_KEY is not set');
  }

  const result = await generate(apiKey, {
    model: 'p-image',
    prompt: 'A cinematic shot of a lighthouse in a storm, painted in the style of Van Gogh',
    aspect_ratio: '16:9',
  });

  console.log('Image URL:', result.url);
}

main().catch(console.error);
