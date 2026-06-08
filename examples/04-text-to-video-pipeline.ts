/**
 * Example 04: Text to Video (Two-step Pipeline)
 * @description Generate a keyframe image and animate it. No source image required.
 */

import { generateImageThenVideo } from '@umituz/pruna-provider';

async function main() {
  const apiKey = process.env.PRUNA_API_KEY;
  if (!apiKey) {
    throw new Error('PRUNA_API_KEY is not set');
  }

  const result = await generateImageThenVideo(apiKey, {
    prompt: 'A robot painting a self-portrait in a sunlit studio, soft cinematic motion',
    aspect_ratio: '16:9',
    duration: 5,
    resolution: '1080p',
  });

  console.log('Generated video URL:', result.url);
}

main().catch(console.error);
