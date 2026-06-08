/**
 * Example 02: Image-to-Image (Edit)
 * @description Edit an existing image with a text prompt.
 */

import { readFileSync } from 'node:fs';
import { generate } from '@umituz/pruna-provider';

async function main() {
  const apiKey = process.env.PRUNA_API_KEY;
  if (!apiKey) {
    throw new Error('PRUNA_API_KEY is not set');
  }

  // Use either a remote URL or a base64-encoded local file
  const imagePath = process.argv[2] ?? 'https://example.com/source.jpg';
  const image = imagePath.startsWith('http')
    ? imagePath
    : `data:image/jpeg;base64,${readFileSync(imagePath).toString('base64')}`;

  const result = await generate(apiKey, {
    model: 'p-image-edit',
    prompt: 'Add a flock of birds in the sky, golden hour lighting',
    image,
    aspect_ratio: '16:9',
    seed: 42,
  });

  console.log('Edited image URL:', result.url);
}

main().catch(console.error);
