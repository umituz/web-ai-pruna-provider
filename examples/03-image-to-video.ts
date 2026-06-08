/**
 * Example 03: Image-to-Video
 * @description Animate a source image into a short video.
 */

import { generate } from '@umituz/pruna-provider';

async function main() {
  const apiKey = process.env.PRUNA_API_KEY;
  if (!apiKey) {
    throw new Error('PRUNA_API_KEY is not set');
  }

  const result = await generate(apiKey, {
    model: 'p-video',
    prompt: 'Gentle camera pan, soft wind through the leaves',
    image: 'https://example.com/keyframes/forest.png',
    duration: 5,
    resolution: '720p',
    aspect_ratio: '16:9',
  });

  console.log('Video URL:', result.url);
}

main().catch(console.error);
